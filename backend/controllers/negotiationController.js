const Negotiation = require('../models/Negotiation');
const Quotation = require('../models/Quotation');
const Enquiry = require('../models/Enquiry');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc Get all negotiations
// @route GET /api/negotiations
exports.getNegotiations = async (req, res) => {
  try {
    const { quotationId, status } = req.query;
    let query = {};
    if (quotationId) query.quotation = quotationId;
    if (status) query.customerResponse = status;

    const negotiations = await Negotiation.find(query)
      .populate('quotation', 'quotationNumber versionLabel grandTotal status')
      .populate('customer', 'companyName customerCode')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: negotiations.length, data: negotiations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Record Customer Response & Negotiation Request
// @route POST /api/negotiations
exports.createNegotiation = async (req, res) => {
  try {
    const {
      quotation: quotationId,
      customerResponse,
      customerRemarks,
      requestedDiscountPercent,
      requestedDiscountAmount,
      revisedTargetPrice,
      technicalChanges,
      deliveryChanges,
      paymentChanges
    } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const negotiation = await Negotiation.create({
      quotation: quotation._id,
      quotationNumber: quotation.quotationNumber,
      version: quotation.version,
      versionLabel: quotation.versionLabel,
      customer: quotation.customer,
      customerName: quotation.customerName,
      enquiry: quotation.enquiry,
      customerResponse,
      customerRemarks,
      requestedDiscountPercent: requestedDiscountPercent || 0,
      requestedDiscountAmount: requestedDiscountAmount || 0,
      revisedTargetPrice: revisedTargetPrice || 0,
      technicalChanges,
      deliveryChanges,
      paymentChanges,
      managerApprovalStatus: customerResponse === 'Negotiation' ? 'Pending' : 'Approved'
    });

    if (customerResponse === 'Accepted') {
      quotation.status = 'Accepted';
      quotation.isLocked = true;
      await quotation.save();
      await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'Won' });
    } else if (customerResponse === 'Rejected') {
      quotation.status = 'Rejected';
      await quotation.save();
    } else if (customerResponse === 'Negotiation') {
      quotation.status = 'Under Negotiation';
      await quotation.save();
      await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'Negotiation' });

      // Notify Sales Manager
      await Notification.create({
        title: 'Quotation Negotiation Submitted',
        message: `${quotation.customerName} submitted a counter-offer on ${quotation.quotationNumber} (${quotation.versionLabel}).`,
        link: `/negotiations/${negotiation._id}`,
        type: 'Negotiation',
        targetRoles: ['Sales Manager', 'MD / Director']
      });
    }

    await logAudit(req, 'RECORD_RESPONSE', 'Negotiation', negotiation._id.toString(), {
      quotationNumber: quotation.quotationNumber,
      version: quotation.versionLabel,
      customerResponse
    });

    res.status(201).json({ success: true, data: negotiation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Review & Approve Negotiation Changes (Sales Manager / Director)
// @route PATCH /api/negotiations/:id/review
exports.reviewNegotiation = async (req, res) => {
  try {
    const { managerApprovalStatus, managerRemarks } = req.body;
    const negotiation = await Negotiation.findById(req.params.id);

    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation record not found' });
    }

    negotiation.managerApprovalStatus = managerApprovalStatus; // 'Approved' or 'Rejected'
    negotiation.managerRemarks = managerRemarks;
    negotiation.approvedBy = req.user?._id;
    negotiation.approvedAt = new Date();
    await negotiation.save();

    await logAudit(req, 'REVIEW', 'Negotiation', negotiation._id.toString(), {
      quotationNumber: negotiation.quotationNumber,
      managerApprovalStatus,
      managerRemarks
    });

    res.json({ success: true, data: negotiation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
