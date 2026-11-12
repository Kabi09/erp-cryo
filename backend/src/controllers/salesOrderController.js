const SalesOrder = require('../models/SalesOrder');
const POVerification = require('../models/POVerification');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const Quotation = require('../models/Quotation');
const QuotationRevision = require('../models/QuotationRevision');
const Lead = require('../models/Lead');
const logActivity = require('../utils/activityLogger');

const getNextSONumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CSS-SO-${currentYear}-`;
  const lastSO = await SalesOrder.findOne({ soNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select('soNumber');

  let nextSequence = 1;
  if (lastSO && lastSO.soNumber) {
    const parts = lastSO.soNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }
  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
};

// @desc    Get all Sales Orders with search, filters, pagination
// @route   GET /api/sales-orders
// @access  Private
exports.getSalesOrders = async (req, res, next) => {
  try {
    const { leadId, customerId, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (leadId) query.lead = leadId;
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (search) {
      query.soNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await SalesOrder.countDocuments(query);
    const sos = await SalesOrder.find(query)
      .populate('lead', 'leadNumber companyName')
      .populate('customer', 'customerCode companyName email phone gstin')
      .populate('customerPO', 'poNumber poDate poValue')
      .populate('createdBy', 'name email')
      .populate('productionHandover.handedOverBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: sos,
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

// @desc    Get single Sales Order by ID with full references
// @route   GET /api/sales-orders/:id
// @access  Private
exports.getSalesOrderById = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id)
      .populate('lead')
      .populate('customer')
      .populate({
        path: 'quotation',
        populate: [
          { path: 'activeRevision' },
          { path: 'winningRevision' }
        ]
      })
      .populate('quotationRevision')
      .populate('proformaInvoice')
      .populate('customerPO')
      .populate('poVerification')
      .populate('createdBy', 'name email')
      .populate('productionHandover.handedOverBy', 'name email');

    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    res.status(200).json({ success: true, data: so });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Sales Order (ONLY if 5-point verification passed)
// @route   POST /api/sales-orders
// @access  Private
exports.createSalesOrder = async (req, res, next) => {
  try {
    const {
      leadId,
      customerPOId,
      poVerificationId,
      committedDispatchDate,
      deliverySchedule,
      specialInstructions,
      notes
    } = req.body;

    if (!leadId || !customerPOId || !poVerificationId) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID, Customer PO ID, and PO Verification reference are required'
      });
    }

    // MANDATORY BUSINESS RULE: Check 5-point verification
    const verification = await POVerification.findById(poVerificationId);
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Verification record not found. 5-Point PO Verification must be performed first.'
      });
    }

    if (!verification.allMatched || verification.overallStatus !== 'PASSED') {
      return res.status(400).json({
        success: false,
        message: 'CRITICAL ENFORCEMENT: Sales Order cannot be created! All five points in the Customer PO Verification must MATCH. Please resolve mismatches or submit a PO Amendment before proceeding.'
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const po = await CustomerPurchaseOrder.findById(customerPOId);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Customer PO not found' });
    }

    const quote = await Quotation.findById(po.quotation).populate('winningRevision activeRevision');
    const winningRev = quote?.winningRevision || quote?.activeRevision;

    if (!winningRev) {
      return res.status(400).json({
        success: false,
        message: 'Winning quotation revision not found'
      });
    }

    const soNumber = await getNextSONumber();
    const dispatchDate = committedDispatchDate ? new Date(committedDispatchDate) : new Date(po.deliveryDate || Date.now());

    const salesOrder = await SalesOrder.create({
      soNumber,
      soDate: new Date(),
      lead: lead._id,
      customer: po.customer,
      quotation: quote._id,
      quotationRevision: winningRev._id,
      proformaInvoice: lead.currentPI || po.proformaInvoice || null,
      customerPO: po._id,
      poVerification: verification._id,
      items: winningRev.items,
      subTotal: winningRev.subTotal,
      totalDiscount: winningRev.totalDiscount,
      taxableAmount: winningRev.taxableAmount,
      totalGst: winningRev.totalGst,
      grandTotal: winningRev.grandTotal,
      deliverySchedule: deliverySchedule || winningRev.deliveryPeriod,
      committedDispatchDate: dispatchDate,
      paymentTerms: po.paymentTerms || winningRev.paymentTerms,
      warranty: winningRev.warranty,
      specialInstructions: specialInstructions || notes || '',
      status: 'Confirmed',
      productionHandover: {
        isHandedOver: false,
        handoverDate: null,
        handedOverBy: null,
        handoverRemarks: ''
      },
      createdBy: req.user._id
    });

    // Update lead
    lead.currentSO = salesOrder._id;
    lead.stage = 'SO_CREATED';
    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'SO_CREATED',
      title: `Sales Order Generated: ${salesOrder.soNumber}`,
      description: `Sales Order created successfully following verified 5-point PO match. Total value: Rs. ${salesOrder.grandTotal.toLocaleString('en-IN')}`,
      userId: req.user._id,
      documentType: 'SalesOrder',
      documentId: salesOrder._id,
      metadata: { soNumber: salesOrder.soNumber, grandTotal: salesOrder.grandTotal }
    });

    const populatedSO = await SalesOrder.findById(salesOrder._id)
      .populate('customer')
      .populate('customerPO')
      .populate('lead');

    res.status(201).json({
      success: true,
      message: `Sales Order ${salesOrder.soNumber} generated successfully!`,
      data: populatedSO
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handover Sales Order to Production
// @route   PUT /api/sales-orders/:id/handover
// @access  Private
exports.handoverToProduction = async (req, res, next) => {
  try {
    const { handoverRemarks, targetCompletionDate } = req.body;

    const so = await SalesOrder.findById(req.params.id);
    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    if (so.productionHandover?.isHandedOver) {
      return res.status(400).json({
        success: false,
        message: 'This Sales Order has already been handed over to Production'
      });
    }

    so.status = 'Handed Over to Production';
    so.productionHandover = {
      isHandedOver: true,
      handoverDate: new Date(),
      handedOverBy: req.user._id,
      handoverRemarks: handoverRemarks || 'Commercial and technical terms verified and approved. Handed over to production.',
      targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null
    };

    await so.save();

    // Update lead stage
    const lead = await Lead.findById(so.lead);
    if (lead) {
      lead.stage = 'PRODUCTION_HANDOVER';
      lead.status = 'Closed';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'PRODUCTION_HANDOVER',
        title: `Sales Order Handed Over to Production: ${so.soNumber}`,
        description: `Order successfully handed over to Production department by ${req.user.name}. Remarks: ${handoverRemarks || 'Standard handover'}`,
        userId: req.user._id,
        documentType: 'SalesOrder',
        documentId: so._id,
        metadata: { soNumber: so.soNumber, handoverDate: new Date() }
      });
    }

    res.status(200).json({
      success: true,
      message: `Sales Order ${so.soNumber} successfully handed over to Production`,
      data: so
    });
  } catch (error) {
    next(error);
  }
};

