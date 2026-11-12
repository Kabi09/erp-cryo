const Quotation = require('../models/Quotation');
const QuotationRevision = require('../models/QuotationRevision');
const Lead = require('../models/Lead');
const logActivity = require('../utils/activityLogger');
const { generateQuotationPDF } = require('../services/pdfService');

// Helper to calculate totals from item lines
const computeQuotationTotals = (rawItems) => {
  let subTotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalGst = 0;

  const processedItems = rawItems.map((item) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unitPrice) || 0;
    const discountPct = Number(item.discountPercent) || 0;
    const gstRate = Number(item.gstRate) !== undefined ? Number(item.gstRate) : 18;

    const lineGross = qty * rate;
    const discountAmt = (lineGross * discountPct) / 100;
    const lineTaxable = lineGross - discountAmt;
    const gstAmt = (lineTaxable * gstRate) / 100;
    const lineTotal = lineTaxable + gstAmt;

    subTotal += lineGross;
    totalDiscount += discountAmt;
    taxableAmount += lineTaxable;
    totalGst += gstAmt;

    return {
      itemCode: item.itemCode || '',
      productName: item.productName,
      specification: item.specification || '',
      hsnCode: item.hsnCode || '841869',
      quantity: qty,
      unit: item.unit || 'Nos',
      unitPrice: rate,
      discountPercent: discountPct,
      discountAmount: discountAmt,
      taxableAmount: lineTaxable,
      gstRate: gstRate,
      gstAmount: gstAmt,
      totalAmount: lineTotal
    };
  });

  return {
    items: processedItems,
    subTotal: Math.round(subTotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    totalGst: Math.round(totalGst * 100) / 100,
    grandTotal: Math.round((taxableAmount + totalGst) * 100) / 100
  };
};

const getNextQuotationNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CSS-QT-${currentYear}-`;
  const lastQuote = await Quotation.findOne({ quotationNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select('quotationNumber');

  let nextSequence = 1;
  if (lastQuote && lastQuote.quotationNumber) {
    const parts = lastQuote.quotationNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }
  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
};

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res, next) => {
  try {
    const { leadId, customerId, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (leadId) query.lead = leadId;
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (search) {
      query.quotationNumber = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .populate('lead', 'leadNumber companyName requirements')
      .populate('customer', 'customerCode companyName email phone')
      .populate('activeRevision')
      .populate('winningRevision')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: quotations,
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

// @desc    Get single quotation with all revisions
// @route   GET /api/quotations/:id
// @access  Private
exports.getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('lead')
      .populate('customer')
      .populate('activeRevision')
      .populate('winningRevision')
      .populate({
        path: 'revisions',
        populate: { path: 'createdBy', select: 'name email' },
        options: { sort: { revisionNumber: -1 } }
      })
      .populate('customerFeedback.recordedBy', 'name email')
      .populate('createdBy', 'name email');

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    next(error);
  }
};

// @desc    Create initial quotation (Rev 0)
// @route   POST /api/quotations
// @access  Private
exports.createQuotation = async (req, res, next) => {
  try {
    const {
      leadId,
      customerId,
      items,
      paymentTerms,
      deliveryPeriod,
      validityDays,
      warranty,
      freightTerms,
      specialTerms
    } = req.body;

    // Rule: Check lead exists and is qualified
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (!lead.qualification || lead.qualification.isQualified !== true) {
      return res.status(400).json({
        success: false,
        message: 'Lead must be qualified before creating a quotation. Please qualify this lead first.'
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one line item is required in the quotation'
      });
    }

    const calc = computeQuotationTotals(items);
    const quotationNumber = await getNextQuotationNumber();

    // Create Quotation document placeholder
    const quotation = new Quotation({
      quotationNumber,
      lead: lead._id,
      customer: customerId || lead.customer,
      currentRevisionNumber: 0,
      status: 'Draft',
      createdBy: req.user._id
    });

    // Create Revision 0
    const revision0 = await QuotationRevision.create({
      quotation: quotation._id,
      revisionNumber: 0,
      revisionLabel: 'Rev 0',
      revisionReason: 'Initial Commercial Quotation',
      items: calc.items,
      subTotal: calc.subTotal,
      totalDiscount: calc.totalDiscount,
      taxableAmount: calc.taxableAmount,
      totalGst: calc.totalGst,
      grandTotal: calc.grandTotal,
      paymentTerms: paymentTerms || '30% Advance with PO, 70% against Proforma Invoice prior to dispatch',
      deliveryPeriod: deliveryPeriod || '4 to 6 Weeks from receipt of PO',
      validityDays: validityDays || 30,
      warranty: warranty || '12 Months warranty from commissioning against manufacturing defects',
      freightTerms: freightTerms || 'Ex-works Chennai / Freight extra at actuals',
      specialTerms: specialTerms || 'Standard factory inspection included.',
      createdBy: req.user._id
    });

    quotation.activeRevision = revision0._id;
    quotation.revisions = [revision0._id];
    await quotation.save();

    // Update Lead stage & currentQuotation
    lead.currentQuotation = quotation._id;
    lead.stage = 'QUOTATION_DRAFTED';
    lead.status = 'Quoted';
    if (!lead.customer && customerId) {
      lead.customer = customerId;
    }
    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'QUOTATION_CREATED',
      title: `Quotation Rev 0 Created: ${quotation.quotationNumber}`,
      description: `Initial quotation (Rev 0) created with Grand Total Rs. ${calc.grandTotal.toLocaleString('en-IN')}`,
      userId: req.user._id,
      documentType: 'Quotation',
      documentId: quotation._id,
      metadata: { quotationNumber, grandTotal: calc.grandTotal }
    });

    const populatedQuote = await Quotation.findById(quotation._id)
      .populate('activeRevision')
      .populate('customer');

    res.status(201).json({
      success: true,
      message: 'Quotation (Rev 0) created successfully',
      data: populatedQuote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Quotation Revision (Rev 1, Rev 2, etc.)
// @route   POST /api/quotations/:id/revise
// @access  Private
exports.createRevision = async (req, res, next) => {
  try {
    const {
      revisionReason,
      items,
      paymentTerms,
      deliveryPeriod,
      validityDays,
      warranty,
      freightTerms,
      specialTerms
    } = req.body;

    const quotation = await Quotation.findById(req.params.id).populate('activeRevision');
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.status === 'Won') {
      return res.status(400).json({
        success: false,
        message: 'Cannot revise a quotation that is already marked Won'
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Items are required for revision' });
    }

    const nextRevNum = quotation.currentRevisionNumber + 1;
    const revLabel = `Rev ${nextRevNum}`;
    const calc = computeQuotationTotals(items);

    const newRevision = await QuotationRevision.create({
      quotation: quotation._id,
      revisionNumber: nextRevNum,
      revisionLabel: revLabel,
      revisionReason: revisionReason || `Revision ${revLabel} after customer negotiation`,
      items: calc.items,
      subTotal: calc.subTotal,
      totalDiscount: calc.totalDiscount,
      taxableAmount: calc.taxableAmount,
      totalGst: calc.totalGst,
      grandTotal: calc.grandTotal,
      paymentTerms: paymentTerms || quotation.activeRevision.paymentTerms,
      deliveryPeriod: deliveryPeriod || quotation.activeRevision.deliveryPeriod,
      validityDays: validityDays || quotation.activeRevision.validityDays,
      warranty: warranty || quotation.activeRevision.warranty,
      freightTerms: freightTerms || quotation.activeRevision.freightTerms,
      specialTerms: specialTerms || quotation.activeRevision.specialTerms,
      createdBy: req.user._id
    });

    quotation.currentRevisionNumber = nextRevNum;
    quotation.activeRevision = newRevision._id;
    quotation.revisions.push(newRevision._id);
    quotation.status = 'Under Negotiation';
    await quotation.save();

    // Update lead stage
    const lead = await Lead.findById(quotation.lead);
    if (lead) {
      lead.stage = 'QUOTATION_NEGOTIATION';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'QUOTATION_REVISED',
        title: `Quotation Revised to ${revLabel}`,
        description: `New revision ${revLabel} created for ${quotation.quotationNumber}. Reason: ${revisionReason || 'Customer negotiation'}. New Grand Total: Rs. ${calc.grandTotal.toLocaleString('en-IN')}`,
        userId: req.user._id,
        documentType: 'QuotationRevision',
        documentId: newRevision._id,
        metadata: { revisionNumber: nextRevNum, revLabel, grandTotal: calc.grandTotal }
      });
    }

    const updatedQuote = await Quotation.findById(quotation._id)
      .populate('activeRevision')
      .populate('revisions');

    res.status(201).json({
      success: true,
      message: `Quotation revised to ${revLabel} successfully`,
      data: updatedQuote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record customer review & feedback
// @route   POST /api/quotations/:id/feedback
// @access  Private
exports.addFeedback = async (req, res, next) => {
  try {
    const { feedbackType, notes } = req.body;
    if (!notes) {
      return res.status(400).json({ success: false, message: 'Feedback notes are required' });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    quotation.customerFeedback.push({
      date: new Date(),
      feedbackType: feedbackType || 'Other',
      notes,
      recordedBy: req.user._id
    });

    quotation.status = 'Customer Review';
    await quotation.save();

    const lead = await Lead.findById(quotation.lead);
    if (lead) {
      lead.stage = 'CUSTOMER_REVIEW';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'CUSTOMER_FEEDBACK',
        title: `Customer Review Feedback: ${feedbackType || 'Notes'}`,
        description: `Feedback received on ${quotation.quotationNumber}: ${notes}`,
        userId: req.user._id,
        documentType: 'Quotation',
        documentId: quotation._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully',
      data: quotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Quotation as Won
// @route   POST /api/quotations/:id/mark-won
// @access  Private
exports.markWon = async (req, res, next) => {
  try {
    const { wonRemarks, winningRevisionId } = req.body;

    const quotation = await Quotation.findById(req.params.id).populate('activeRevision');
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const winRevId = winningRevisionId || quotation.activeRevision._id;

    quotation.status = 'Won';
    quotation.winningRevision = winRevId;
    quotation.wonDate = new Date();
    quotation.wonRemarks = wonRemarks || 'Quotation accepted and finalized by customer';
    await quotation.save();

    const winningRev = await QuotationRevision.findById(winRevId);

    const lead = await Lead.findById(quotation.lead);
    if (lead) {
      lead.stage = 'QUOTATION_WON';
      lead.status = 'Won';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'QUOTATION_WON',
        title: `Quotation Won: ${quotation.quotationNumber} (${winningRev?.revisionLabel || 'Rev 0'})`,
        description: `Quotation marked as WON with winning revision ${winningRev?.revisionLabel || 'Rev 0'}. Total: Rs. ${winningRev?.grandTotal.toLocaleString('en-IN')}. Remarks: ${wonRemarks || 'Deal won'}`,
        userId: req.user._id,
        documentType: 'Quotation',
        documentId: quotation._id,
        metadata: { winningRevision: winningRev?.revisionLabel, grandTotal: winningRev?.grandTotal }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quotation marked as WON successfully',
      data: quotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Quotation as Lost
// @route   POST /api/quotations/:id/mark-lost
// @access  Private
exports.markLost = async (req, res, next) => {
  try {
    const { lostReason } = req.body;
    if (!lostReason) {
      return res.status(400).json({ success: false, message: 'Please provide reason for lost quotation' });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    quotation.status = 'Lost';
    quotation.lostDate = new Date();
    quotation.lostReason = lostReason;
    await quotation.save();

    const lead = await Lead.findById(quotation.lead);
    if (lead) {
      lead.stage = 'QUOTATION_LOST';
      lead.status = 'Lost';
      await lead.save();

      await logActivity({
        leadId: lead._id,
        activityType: 'QUOTATION_LOST',
        title: `Quotation Lost: ${quotation.quotationNumber}`,
        description: `Quotation marked Lost. Reason: ${lostReason}`,
        userId: req.user._id,
        documentType: 'Quotation',
        documentId: quotation._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quotation marked as Lost',
      data: quotation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / Stream Quotation PDF
// @route   GET /api/quotations/:id/pdf
// @access  Private
exports.downloadQuotationPDF = async (req, res, next) => {
  try {
    const { revisionId } = req.query;
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer')
      .populate('lead')
      .populate('activeRevision')
      .populate('winningRevision');

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    let revision;
    if (revisionId) {
      revision = await QuotationRevision.findById(revisionId);
    } else {
      revision = quotation.winningRevision || quotation.activeRevision;
    }

    if (!revision) {
      return res.status(404).json({ success: false, message: 'Quotation revision not found' });
    }

    const filename = `${quotation.quotationNumber}_${revision.revisionLabel.replace(' ', '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    generateQuotationPDF(quotation, revision, res);
  } catch (error) {
    next(error);
  }
};

