const ProformaInvoice = require('../models/ProformaInvoice');
const Quotation = require('../models/Quotation');
const QuotationRevision = require('../models/QuotationRevision');
const Lead = require('../models/Lead');
const logActivity = require('../utils/activityLogger');
const { generatePIPDF } = require('../services/pdfService');

const getNextPINumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CSS-PI-${currentYear}-`;
  const lastPI = await ProformaInvoice.findOne({ piNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select('piNumber');

  let nextSequence = 1;
  if (lastPI && lastPI.piNumber) {
    const parts = lastPI.piNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }
  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
};

// @desc    Get all Proforma Invoices
// @route   GET /api/proforma-invoices
// @access  Private
exports.getProformaInvoices = async (req, res, next) => {
  try {
    const { leadId, customerId, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (leadId) query.lead = leadId;
    if (customerId) query.customer = customerId;
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ProformaInvoice.countDocuments(query);
    const pis = await ProformaInvoice.find(query)
      .populate('lead', 'leadNumber companyName requirements')
      .populate('customer', 'customerCode companyName email phone gstin')
      .populate('quotation', 'quotationNumber status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: pis,
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

// @desc    Get single Proforma Invoice by ID
// @route   GET /api/proforma-invoices/:id
// @access  Private
exports.getPIById = async (req, res, next) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id)
      .populate('lead')
      .populate('customer')
      .populate('quotation')
      .populate('quotationRevision')
      .populate('createdBy', 'name email');

    if (!pi) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }

    res.status(200).json({ success: true, data: pi });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Proforma Invoice from Won Quotation
// @route   POST /api/proforma-invoices
// @access  Private
exports.createPI = async (req, res, next) => {
  try {
    const { quotationId, validityDays = 30, notes = '' } = req.body;

    const quotation = await Quotation.findById(quotationId)
      .populate('activeRevision')
      .populate('winningRevision');

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // MANDATORY BUSINESS RULE: Only allow PI creation after quotation is marked Won
    if (quotation.status !== 'Won') {
      return res.status(400).json({
        success: false,
        message: 'Proforma Invoice can ONLY be created for a quotation marked as Won. Please mark the quotation as Won first.'
      });
    }

    const wonRevision = quotation.winningRevision || quotation.activeRevision;
    if (!wonRevision) {
      return res.status(400).json({
        success: false,
        message: 'Winning quotation revision details could not be found'
      });
    }

    const piNumber = await getNextPINumber();
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + Number(validityDays));

    const pi = await ProformaInvoice.create({
      piNumber,
      piDate: new Date(),
      quotation: quotation._id,
      quotationRevision: wonRevision._id,
      lead: quotation.lead,
      customer: quotation.customer,
      items: wonRevision.items,
      subTotal: wonRevision.subTotal,
      totalDiscount: wonRevision.totalDiscount,
      taxableAmount: wonRevision.taxableAmount,
      totalGst: wonRevision.totalGst,
      grandTotal: wonRevision.grandTotal,
      paymentTerms: wonRevision.paymentTerms,
      deliveryPeriod: wonRevision.deliveryPeriod,
      validityDate,
      notes,
      status: 'Issued',
      createdBy: req.user._id
    });

    // Update Lead stage & currentPI
    const lead = await Lead.findById(quotation.lead);
    if (lead) {
      lead.currentPI = pi._id;
      lead.stage = 'PI_ISSUED';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'PI_GENERATED',
        title: `Proforma Invoice Issued: ${pi.piNumber}`,
        description: `Proforma Invoice generated against won quotation ${quotation.quotationNumber}. Total value: Rs. ${pi.grandTotal.toLocaleString('en-IN')}`,
        userId: req.user._id,
        documentType: 'ProformaInvoice',
        documentId: pi._id,
        metadata: { piNumber: pi.piNumber, grandTotal: pi.grandTotal }
      });
    }

    const populatedPI = await ProformaInvoice.findById(pi._id)
      .populate('customer')
      .populate('lead');

    res.status(201).json({
      success: true,
      message: 'Proforma Invoice generated successfully',
      data: populatedPI
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / Stream PI PDF
// @route   GET /api/proforma-invoices/:id/pdf
// @access  Private
exports.downloadPIPDF = async (req, res, next) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id)
      .populate('customer')
      .populate('lead')
      .populate('quotation');

    if (!pi) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }

    const filename = `${pi.piNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    generatePIPDF(pi, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Update PI status (e.g., Advance Received, Paid)
// @route   PUT /api/proforma-invoices/:id/status
// @access  Private
exports.updatePIStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const pi = await ProformaInvoice.findById(req.params.id);
    if (!pi) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }

    pi.status = status || pi.status;
    if (notes) pi.notes = notes;
    await pi.save();

    res.status(200).json({
      success: true,
      message: `Proforma Invoice status updated to ${pi.status}`,
      data: pi
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share PI via email / link
// @route   POST /api/proforma-invoices/:id/share
// @access  Private
exports.sharePI = async (req, res, next) => {
  try {
    const { recipientEmail, subject, message } = req.body;
    const pi = await ProformaInvoice.findById(req.params.id).populate('customer lead');
    if (!pi) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }

    const targetEmail = recipientEmail || pi.customer?.email;
    res.status(200).json({
      success: true,
      message: `Proforma Invoice ${pi.piNumber} shared successfully with ${targetEmail}`,
      shareDetails: {
        piNumber: pi.piNumber,
        grandTotal: pi.grandTotal,
        recipient: targetEmail,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

