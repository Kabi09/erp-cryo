const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const POVerification = require('../models/POVerification');
const logActivity = require('../utils/activityLogger');
const path = require('path');

// @desc    Get all Customer Purchase Orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = async (req, res, next) => {
  try {
    const { leadId, customerId, verificationStatus, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (leadId) query.lead = leadId;
    if (customerId) query.customer = customerId;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (search) {
      query.$or = [
        { poNumber: { $regex: search, $options: 'i' } },
        { itemSummary: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await CustomerPurchaseOrder.countDocuments(query);
    const pos = await CustomerPurchaseOrder.find(query)
      .populate('lead', 'leadNumber companyName')
      .populate('customer', 'customerCode companyName email phone')
      .populate('quotation', 'quotationNumber status')
      .populate('proformaInvoice', 'piNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: pos,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Customer Purchase Order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPOById = async (req, res, next) => {
  try {
    const po = await CustomerPurchaseOrder.findById(req.params.id)
      .populate('lead')
      .populate('customer')
      .populate({
        path: 'quotation',
        populate: [
          { path: 'activeRevision' },
          { path: 'winningRevision' }
        ]
      })
      .populate('proformaInvoice')
      .populate('createdBy', 'name email');

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    const latestVerification = await POVerification.findOne({ customerPO: po._id })
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    const poObj = po.toObject();
    poObj.latestVerification = latestVerification;

    res.status(200).json({ success: true, data: poObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload customer PO and create record
// @route   POST /api/purchase-orders
// @access  Private
exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const {
      leadId,
      customerId,
      quotationId,
      proformaInvoiceId,
      poNumber,
      poDate,
      poValue,
      deliveryDate,
      deliveryPeriodText,
      paymentTerms,
      itemSummary,
      quantity,
      unitPrice,
      notes
    } = req.body;

    if (!poNumber || !poDate || !poValue || !leadId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide PO number, PO date, PO value, and Lead reference'
      });
    }

    // Verify lead and quotation
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    let filePath = '';
    let originalName = '';
    let fileSize = 0;
    let mimeType = '';

    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      originalName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    }

    const customerPO = await CustomerPurchaseOrder.create({
      poNumber,
      poDate: new Date(poDate),
      lead: lead._id,
      customer: customerId || lead.customer,
      quotation: quotationId || lead.currentQuotation,
      proformaInvoice: proformaInvoiceId || lead.currentPI || null,
      poValue: Number(poValue),
      deliveryDate: new Date(deliveryDate || Date.now()),
      deliveryPeriodText: deliveryPeriodText || '',
      paymentTerms,
      itemSummary,
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      documentPath: filePath,
      originalFileName: originalName,
      fileSize,
      mimeType,
      amendmentVersion: 1,
      verificationStatus: 'Unverified',
      notes: notes || '',
      createdBy: req.user._id
    });

    // Update lead
    lead.currentPO = customerPO._id;
    lead.stage = 'PO_RECEIVED';
    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'PO_UPLOADED',
      title: `Customer PO Uploaded: ${poNumber}`,
      description: `Customer PO ${poNumber} dated ${new Date(poDate).toLocaleDateString('en-IN')} uploaded. Value: Rs. ${Number(poValue).toLocaleString('en-IN')}`,
      userId: req.user._id,
      documentType: 'CustomerPurchaseOrder',
      documentId: customerPO._id,
      metadata: { poNumber, poValue: Number(poValue) }
    });

    const populatedPO = await CustomerPurchaseOrder.findById(customerPO._id)
      .populate('customer')
      .populate('quotation');

    res.status(201).json({
      success: true,
      message: 'Customer Purchase Order uploaded and recorded successfully',
      data: populatedPO
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record PO Amendment (after verification mismatch or customer amendment)
// @route   POST /api/purchase-orders/:id/amendment
// @access  Private
exports.amendPurchaseOrder = async (req, res, next) => {
  try {
    const {
      poNumber,
      poDate,
      poValue,
      deliveryDate,
      paymentTerms,
      itemSummary,
      quantity,
      reasonForAmendment,
      notes
    } = req.body;

    const po = await CustomerPurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    if (!reasonForAmendment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the reason for PO amendment'
      });
    }

    // Push existing PO details into amendment history
    po.amendmentHistory.push({
      amendmentVersion: po.amendmentVersion,
      poNumber: po.poNumber,
      poDate: po.poDate,
      poValue: po.poValue,
      deliveryDate: po.deliveryDate,
      paymentTerms: po.paymentTerms,
      itemSummary: po.itemSummary,
      quantity: po.quantity,
      documentPath: po.documentPath,
      originalFileName: po.originalFileName,
      reasonForAmendment,
      createdAt: new Date(),
      createdBy: req.user._id
    });

    // Update with amended details
    po.amendmentVersion += 1;
    if (poNumber) po.poNumber = poNumber;
    if (poDate) po.poDate = new Date(poDate);
    if (poValue !== undefined) po.poValue = Number(poValue);
    if (deliveryDate) po.deliveryDate = new Date(deliveryDate);
    if (paymentTerms) po.paymentTerms = paymentTerms;
    if (itemSummary) po.itemSummary = itemSummary;
    if (quantity !== undefined) po.quantity = Number(quantity);
    if (notes) po.notes = notes;

    // If new file attached
    if (req.file) {
      po.documentPath = `/uploads/${req.file.filename}`;
      po.originalFileName = req.file.originalname;
      po.fileSize = req.file.size;
      po.mimeType = req.file.mimetype;
    }

    // Reset verification status so it must be verified again!
    po.verificationStatus = 'Unverified';
    await po.save();

    // Update lead stage
    const lead = await Lead.findById(po.lead);
    if (lead) {
      lead.stage = 'PO_RECEIVED';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'PO_AMENDMENT_SUBMITTED',
        title: `PO Amended (Rev ${po.amendmentVersion}): ${po.poNumber}`,
        description: `Customer PO amended to version ${po.amendmentVersion}. Reason: ${reasonForAmendment}. New PO Value: Rs. ${po.poValue.toLocaleString('en-IN')}`,
        userId: req.user._id,
        documentType: 'CustomerPurchaseOrder',
        documentId: po._id,
        metadata: { amendmentVersion: po.amendmentVersion, reasonForAmendment }
      });
    }

    res.status(200).json({
      success: true,
      message: `PO amendment v${po.amendmentVersion} recorded successfully. Ready for Five-Point Verification.`,
      data: po
    });
  } catch (error) {
    next(error);
  }
};

