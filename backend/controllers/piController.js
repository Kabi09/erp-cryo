const ProformaInvoice = require('../models/ProformaInvoice');
const Quotation = require('../models/Quotation');
const { getNextSequence } = require('../utils/generateDocNumber');
const { generateProformaInvoicePDF } = require('../services/pdfService');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');
const path = require('path');

// @desc Get all Proforma Invoices
// @route GET /api/proforma-invoices
exports.getPIs = async (req, res) => {
  try {
    const { customerId, quotationId, status } = req.query;
    let query = {};
    if (customerId) query.customer = customerId;
    if (quotationId) query.quotation = quotationId;
    if (status) query.status = status;

    const pis = await ProformaInvoice.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('quotation', 'quotationNumber versionLabel')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pis.length, data: pis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single PI
// @route GET /api/proforma-invoices/:id
exports.getPIById = async (req, res) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id)
      .populate('customer')
      .populate('quotation')
      .populate('approvedBy', 'name role department');

    if (!pi) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }
    res.json({ success: true, data: pi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Proforma Invoice
// @route POST /api/proforma-invoices
exports.createPI = async (req, res) => {
  try {
    const { quotation: quotationId, advancePercentage, validityDays } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Referenced Quotation not found' });
    }

    const piNumber = await getNextSequence('PI');
    const advPct = Number(advancePercentage) || 30;
    const totalAmount = quotation.grandTotal || 0;
    const advAmt = (totalAmount * advPct) / 100;
    const balPct = 100 - advPct;
    const balAmt = totalAmount - advAmt;

    const piProducts = (quotation.products || []).map((p) => ({
      product: p.product,
      productCode: p.productCode,
      productName: p.productName,
      model: p.model,
      description: p.description,
      quantity: p.quantity,
      unit: p.unit,
      unitPrice: p.unitPrice,
      discountPercent: p.discountPercent,
      taxableAmount: p.taxableAmount,
      gstPercent: p.gstPercent,
      gstAmount: p.gstAmount,
      lineTotal: p.lineTotal
    }));

    const pi = await ProformaInvoice.create({
      piNumber,
      piDate: new Date(),
      validityDate: new Date(Date.now() + (Number(validityDays) || 30) * 24 * 60 * 60 * 1000),
      customer: quotation.customer,
      customerName: quotation.customerName,
      billingAddress: quotation.billingAddress,
      shippingAddress: quotation.shippingAddress,
      enquiry: quotation.enquiry,
      enquiryNumber: quotation.enquiryNumber,
      quotation: quotation._id,
      quotationNumber: quotation.quotationNumber,
      quotationVersion: quotation.versionLabel,
      products: piProducts,
      totalTaxableAmount: quotation.taxableAmount,
      totalGstAmount: quotation.gstTotal,
      totalPiAmount: totalAmount,
      advancePercentage: advPct,
      advanceAmount: advAmt,
      balancePercentage: balPct,
      balanceAmount: balAmt,
      paymentTerms: quotation.commercialTerms?.paymentTerms || `${advPct}% Advance, ${balPct}% against delivery`,
      bankDetails: quotation.commercialTerms?.bankDetails,
      status: 'Pending Approval',
      createdBy: req.user?._id
    });

    try {
      const pdfPath = await generateProformaInvoicePDF(pi);
      pi.pdfUrl = pdfPath;
      await pi.save();
    } catch (pdfErr) {
      console.error('[PI PDF Error]', pdfErr);
    }

    await logAudit(req, 'CREATE', 'ProformaInvoice', pi._id.toString(), {
      piNumber,
      quotationNumber: quotation.quotationNumber,
      totalPiAmount: totalAmount
    });

    await Notification.create({
      title: 'New Proforma Invoice Created',
      message: `Proforma Invoice ${piNumber} generated for ${quotation.customerName} awaiting clearance.`,
      link: `/proforma-invoices/${pi._id}`,
      type: 'Approval',
      targetRoles: ['Accounts Manager', 'Sales Manager']
    });

    res.status(201).json({ success: true, data: pi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Approve Proforma Invoice
// @route PATCH /api/proforma-invoices/:id/approve
exports.approvePI = async (req, res) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id);
    if (!pi) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }

    pi.status = 'Approved';
    pi.approvedBy = req.user?._id;
    pi.approvedAt = new Date();
    await pi.save();

    await logAudit(req, 'APPROVE', 'ProformaInvoice', pi._id.toString(), { piNumber: pi.piNumber });

    res.json({ success: true, data: pi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Download PI PDF
// @route GET /api/proforma-invoices/:id/pdf
exports.downloadPIPdf = async (req, res) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id);
    if (!pi) {
      return res.status(404).json({ success: false, message: 'PI not found' });
    }

    const pdfRelativePath = await generateProformaInvoicePDF(pi);
    pi.pdfUrl = pdfRelativePath;
    await pi.save();

    const fullFilePath = path.join(__dirname, '..', pdfRelativePath);
    res.download(fullFilePath);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
