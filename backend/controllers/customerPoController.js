const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const Quotation = require('../models/Quotation');
const ProformaInvoice = require('../models/ProformaInvoice');
const Enquiry = require('../models/Enquiry');
const { getNextSequence } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc Get all Customer POs
// @route GET /api/customer-pos
exports.getCustomerPOs = async (req, res) => {
  try {
    const { customerId, status, search } = req.query;
    let query = {};

    if (customerId) query.customer = customerId;
    if (status) query.verificationStatus = status;
    if (search) {
      query.$or = [
        { customerPoNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { receiptId: { $regex: search, $options: 'i' } }
      ];
    }

    const pos = await CustomerPurchaseOrder.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('quotation', 'quotationNumber versionLabel grandTotal')
      .populate('proformaInvoice', 'piNumber totalPiAmount')
      .populate('receivedBy', 'name role')
      .populate('verificationChecks.verifiedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pos.length, data: pos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single Customer PO
// @route GET /api/customer-pos/:id
exports.getCustomerPOById = async (req, res) => {
  try {
    const po = await CustomerPurchaseOrder.findById(req.params.id)
      .populate('customer')
      .populate('quotation')
      .populate('proformaInvoice')
      .populate('enquiry')
      .populate('receivedBy', 'name role department')
      .populate('verificationChecks.verifiedBy', 'name role department');

    if (!po) {
      return res.status(404).json({ success: false, message: 'Customer PO record not found' });
    }
    res.json({ success: true, data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create / Receive Customer PO
// @route POST /api/customer-pos
exports.createCustomerPO = async (req, res) => {
  try {
    const {
      customerPoNumber,
      customerPoDate,
      quotation: quotationId,
      proformaInvoice: piId,
      poValue,
      currency,
      deliveryDate,
      paymentTerms,
      billingAddress,
      shippingAddress,
      originalPoFileUrl,
      remarks
    } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Referenced Quotation not found' });
    }

    let pi = null;
    if (piId) {
      pi = await ProformaInvoice.findById(piId);
    }

    const receiptId = await getNextSequence('CPO');

    // Perform initial 3-way check heuristics
    const numericPoValue = Number(poValue) || 0;
    const quoteValue = quotation.grandTotal || 0;
    const valueMatch = Math.abs(numericPoValue - quoteValue) < 1; // within 1 rupee

    const customerPO = await CustomerPurchaseOrder.create({
      receiptId,
      customerPoNumber,
      customerPoDate: customerPoDate || new Date(),
      receivedDate: new Date(),
      customer: quotation.customer,
      customerName: quotation.customerName,
      enquiry: quotation.enquiry,
      enquiryNumber: quotation.enquiryNumber,
      quotation: quotation._id,
      quotationNumber: quotation.quotationNumber,
      proformaInvoice: pi?._id,
      piNumber: pi?.piNumber,
      poValue: numericPoValue,
      currency: currency || 'INR',
      deliveryDate,
      paymentTerms: paymentTerms || quotation.commercialTerms?.paymentTerms,
      billingAddress: billingAddress || quotation.billingAddress,
      shippingAddress: shippingAddress || quotation.shippingAddress,
      originalPoFileUrl,
      remarks,
      verificationStatus: 'Pending',
      verificationChecks: {
        totalValueMatch: valueMatch,
        mismatchNotes: valueMatch ? '' : `PO Value (₹${numericPoValue.toLocaleString('en-IN')}) differs from Quotation Grand Total (₹${quoteValue.toLocaleString('en-IN')})`
      },
      receivedBy: req.user?._id
    });

    if (quotation.enquiry) {
      await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'PO Received' });
    }

    await logAudit(req, 'CREATE', 'CustomerPO', customerPO._id.toString(), {
      receiptId,
      customerPoNumber,
      poValue: numericPoValue
    });

    await Notification.create({
      title: 'Customer PO Received - 3-Way Match Required',
      message: `PO ${customerPoNumber} received from ${quotation.customerName}. Verification required before SO generation.`,
      link: `/customer-pos/${customerPO._id}`,
      type: 'PO',
      targetRoles: ['Sales Manager', 'Accounts Manager', 'Engineering Manager']
    });

    res.status(201).json({ success: true, data: customerPO });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Verify Customer PO against Accepted Quotation and PI
// @route PATCH /api/customer-pos/:id/verify
exports.verifyCustomerPO = async (req, res) => {
  try {
    const {
      productModelMatch,
      quantityMatch,
      unitPriceMatch,
      totalValueMatch,
      gstRateMatch,
      deliveryPeriodMatch,
      paymentTermsMatch,
      technicalSpecsMatch,
      mismatchNotes,
      verificationStatus // 'Verified', 'Mismatch', 'Clarification Required', 'Rejected'
    } = req.body;

    const po = await CustomerPurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Customer PO not found' });
    }

    po.verificationStatus = verificationStatus;
    po.verificationChecks = {
      productModelMatch: Boolean(productModelMatch),
      quantityMatch: Boolean(quantityMatch),
      unitPriceMatch: Boolean(unitPriceMatch),
      totalValueMatch: Boolean(totalValueMatch),
      gstRateMatch: Boolean(gstRateMatch),
      deliveryPeriodMatch: Boolean(deliveryPeriodMatch),
      paymentTermsMatch: Boolean(paymentTermsMatch),
      technicalSpecsMatch: Boolean(technicalSpecsMatch),
      mismatchNotes: mismatchNotes || '',
      verifiedBy: req.user?._id,
      verifiedAt: new Date()
    };

    await po.save();

    await logAudit(req, 'VERIFY', 'CustomerPO', po._id.toString(), {
      customerPoNumber: po.customerPoNumber,
      verificationStatus,
      mismatchNotes
    });

    res.json({ success: true, data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
