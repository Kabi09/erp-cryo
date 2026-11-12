const Quotation = require('../models/Quotation');
const Enquiry = require('../models/Enquiry');
const { getNextSequence } = require('../utils/generateDocNumber');
const { generateQuotationPDF } = require('../services/pdfService');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

// @desc Get all quotations
// @route GET /api/quotations
exports.getQuotations = async (req, res) => {
  try {
    const { enquiryId, customerId, status, quotationNumber } = req.query;
    let query = {};

    if (enquiryId) query.enquiry = enquiryId;
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (quotationNumber) query.quotationNumber = quotationNumber;

    const quotations = await Quotation.find(query)
      .populate('enquiry', 'enquiryNumber companyName status')
      .populate('customer', 'companyName customerCode')
      .populate('preparedBy', 'name role')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quotations.length, data: quotations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single quotation by ID
// @route GET /api/quotations/:id
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('enquiry')
      .populate('customer')
      .populate('estimateReference')
      .populate('preparedBy', 'name role department')
      .populate('approvedBy', 'name role department');

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Quotation (V1)
// @route POST /api/quotations
exports.createQuotation = async (req, res) => {
  try {
    const { enquiry: enquiryId, customer: customerId, customerName, estimateReference, estimateNumber, products, commercialTerms, validUntil } = req.body;

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const quotationNumber = await getNextSequence('QUO');

    // Calculate line totals
    let subtotal = 0;
    let discountTotal = 0;
    let taxableAmount = 0;
    let gstTotal = 0;
    let grandTotal = 0;

    const processedProducts = (products || []).map((item) => {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      const discPct = Number(item.discountPercent) || 0;
      const gross = qty * unitPrice;
      const discAmt = (gross * discPct) / 100;
      const taxable = gross - discAmt;
      const gstPct = Number(item.gstPercent) || 18;
      const gstAmt = (taxable * gstPct) / 100;
      const lineTotal = taxable + gstAmt;

      subtotal += gross;
      discountTotal += discAmt;
      taxableAmount += taxable;
      gstTotal += gstAmt;
      grandTotal += lineTotal;

      return {
        ...item,
        quantity: qty,
        unitPrice,
        discountPercent: discPct,
        discountAmount: discAmt,
        taxableAmount: taxable,
        gstPercent: gstPct,
        gstAmount: gstAmt,
        lineTotal
      };
    });

    const quotation = await Quotation.create({
      quotationNumber,
      version: 1,
      versionLabel: 'V1',
      quotationDate: new Date(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      enquiry: enquiry._id,
      enquiryNumber: enquiry.enquiryNumber,
      customer: customerId || enquiry.customer,
      customerName: customerName || enquiry.companyName,
      billingAddress: req.body.billingAddress || enquiry.billingAddress,
      shippingAddress: req.body.shippingAddress || enquiry.shippingAddress,
      estimateReference,
      estimateNumber,
      products: processedProducts,
      subtotal,
      discountTotal,
      taxableAmount,
      gstTotal,
      grandTotal,
      commercialTerms: commercialTerms || {},
      status: 'Pending Approval',
      preparedBy: req.user?._id
    });

    // Generate Initial PDF
    try {
      const pdfPath = await generateQuotationPDF(quotation);
      quotation.pdfUrl = pdfPath;
      await quotation.save();
    } catch (pdfErr) {
      console.error('[PDF Gen Error]', pdfErr);
    }

    await logAudit(req, 'CREATE', 'Quotation', quotation._id.toString(), {
      quotationNumber,
      version: 'V1',
      grandTotal
    });

    await Notification.create({
      title: 'New Quotation Pending Approval',
      message: `Quotation ${quotationNumber} (V1) for ${enquiry.companyName} awaits manager approval.`,
      link: `/quotations/${quotation._id}`,
      type: 'Quotation',
      targetRoles: ['Sales Manager', 'MD / Director']
    });

    res.status(201).json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Revised Quotation (V2, V3...) without overwriting existing version
// @route POST /api/quotations/:id/revise
exports.reviseQuotation = async (req, res) => {
  try {
    const prevQuotation = await Quotation.findById(req.params.id);
    if (!prevQuotation) {
      return res.status(404).json({ success: false, message: 'Source quotation not found' });
    }

    // Lock previous quotation so it cannot be edited
    prevQuotation.status = 'Revised';
    prevQuotation.isLocked = true;
    await prevQuotation.save();

    const newVersion = prevQuotation.version + 1;
    const versionLabel = `V${newVersion}`;

    const { products, commercialTerms, validUntil } = req.body;
    const itemsToProcess = products || prevQuotation.products;

    let subtotal = 0;
    let discountTotal = 0;
    let taxableAmount = 0;
    let gstTotal = 0;
    let grandTotal = 0;

    const processedProducts = itemsToProcess.map((item) => {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      const discPct = Number(item.discountPercent) || 0;
      const gross = qty * unitPrice;
      const discAmt = (gross * discPct) / 100;
      const taxable = gross - discAmt;
      const gstPct = Number(item.gstPercent) || 18;
      const gstAmt = (taxable * gstPct) / 100;
      const lineTotal = taxable + gstAmt;

      subtotal += gross;
      discountTotal += discAmt;
      taxableAmount += taxable;
      gstTotal += gstAmt;
      grandTotal += lineTotal;

      return {
        ...item,
        quantity: qty,
        unitPrice,
        discountPercent: discPct,
        discountAmount: discAmt,
        taxableAmount: taxable,
        gstPercent: gstPct,
        gstAmount: gstAmt,
        lineTotal
      };
    });

    const newQuotation = await Quotation.create({
      quotationNumber: prevQuotation.quotationNumber,
      version: newVersion,
      versionLabel,
      quotationDate: new Date(),
      validUntil: validUntil || prevQuotation.validUntil,
      enquiry: prevQuotation.enquiry,
      enquiryNumber: prevQuotation.enquiryNumber,
      customer: prevQuotation.customer,
      customerName: prevQuotation.customerName,
      billingAddress: prevQuotation.billingAddress,
      shippingAddress: prevQuotation.shippingAddress,
      estimateReference: prevQuotation.estimateReference,
      estimateNumber: prevQuotation.estimateNumber,
      products: processedProducts,
      subtotal,
      discountTotal,
      taxableAmount,
      gstTotal,
      grandTotal,
      commercialTerms: commercialTerms || prevQuotation.commercialTerms,
      status: 'Pending Approval',
      preparedBy: req.user?._id
    });

    try {
      const pdfPath = await generateQuotationPDF(newQuotation);
      newQuotation.pdfUrl = pdfPath;
      await newQuotation.save();
    } catch (pdfErr) {
      console.error('[PDF Gen Error]', pdfErr);
    }

    await logAudit(req, 'REVISE', 'Quotation', newQuotation._id.toString(), {
      quotationNumber: prevQuotation.quotationNumber,
      version: versionLabel,
      grandTotal
    });

    res.status(201).json({ success: true, data: newQuotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Approve Quotation
// @route PATCH /api/quotations/:id/approve
exports.approveQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    quotation.status = 'Approved';
    quotation.approvedBy = req.user?._id;
    quotation.approvedAt = new Date();
    await quotation.save();

    await logAudit(req, 'APPROVE', 'Quotation', quotation._id.toString(), {
      quotationNumber: quotation.quotationNumber,
      version: quotation.versionLabel
    });

    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Mark Quotation as Sent to Customer
// @route PATCH /api/quotations/:id/send
exports.markQuotationSent = async (req, res) => {
  try {
    const { sentChannel, customerResponseRemarks } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    quotation.status = 'Sent';
    quotation.sentDate = new Date();
    quotation.sentChannel = sentChannel || 'Email';
    if (customerResponseRemarks) quotation.customerResponseRemarks = customerResponseRemarks;
    quotation.isLocked = true; // Sent quotations cannot be directly edited
    await quotation.save();

    // Update enquiry status
    await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'Quotation Sent' });

    await logAudit(req, 'SEND', 'Quotation', quotation._id.toString(), {
      quotationNumber: quotation.quotationNumber,
      version: quotation.versionLabel,
      sentChannel
    });

    res.json({ success: true, data: quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Generate & Download Quotation PDF
// @route GET /api/quotations/:id/pdf
exports.downloadQuotationPdf = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const pdfRelativePath = await generateQuotationPDF(quotation);
    quotation.pdfUrl = pdfRelativePath;
    await quotation.save();

    const fullFilePath = path.join(__dirname, '..', pdfRelativePath);
    res.download(fullFilePath);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
