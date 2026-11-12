const SalesOrder = require('../models/SalesOrder');
const Quotation = require('../models/Quotation');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const ProformaInvoice = require('../models/ProformaInvoice');
const Enquiry = require('../models/Enquiry');
const { getNextSequence } = require('../utils/generateDocNumber');
const { generateSalesOrderPDF } = require('../services/pdfService');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');
const path = require('path');

// @desc Get all Sales Orders
// @route GET /api/sales-orders
exports.getSalesOrders = async (req, res) => {
  try {
    const { status, customerId, search, priority } = req.query;
    let query = {};

    if (status) query.soStatus = status;
    if (customerId) query.customer = customerId;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { soNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPoNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await SalesOrder.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('quotation', 'quotationNumber versionLabel')
      .populate('salesPerson', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single Sales Order
// @route GET /api/sales-orders/:id
exports.getSalesOrderById = async (req, res) => {
  try {
    const so = await SalesOrder.findById(req.params.id)
      .populate('customer')
      .populate('quotation')
      .populate('proformaInvoice')
      .populate('customerPurchaseOrder')
      .populate('enquiry')
      .populate('salesPerson', 'name role department')
      .populate('approvals.salesApproval.approvedBy', 'name role')
      .populate('approvals.accountsApproval.approvedBy', 'name role')
      .populate('approvals.technicalApproval.approvedBy', 'name role')
      .populate('approvals.productionFeasibilityApproval.approvedBy', 'name role')
      .populate('approvals.managementApproval.approvedBy', 'name role');

    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }
    res.json({ success: true, data: so });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Sales Order
// @route POST /api/sales-orders
exports.createSalesOrder = async (req, res) => {
  try {
    const {
      quotation: quotationId,
      customerPurchaseOrder: poId,
      customerPoNumber,
      customerPoDate,
      deliveryDate,
      orderType,
      priority,
      billingAddress,
      shippingAddress,
      projectLocation,
      advanceRequired,
      paymentTerms
    } = req.body;

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Referenced Quotation not found' });
    }

    let po = null;
    if (poId) {
      po = await CustomerPurchaseOrder.findById(poId);
    }

    // Check if PO was verified
    if (po && po.verificationStatus !== 'Verified') {
      // allow creation as draft, but warn
    }

    const soNumber = await getNextSequence('SO');
    const soValue = quotation.grandTotal || 0;
    const advReq = advanceRequired !== undefined ? Number(advanceRequired) : (soValue * 0.3);

    const soProducts = (quotation.products || []).map((p) => ({
      product: p.product,
      productCode: p.productCode,
      productName: p.productName,
      model: p.model,
      description: p.description,
      technicalSpecification: p.technicalSpecifications || 'Standard Scientific Refrigeration Spec',
      quantity: p.quantity,
      unit: p.unit,
      unitPrice: p.unitPrice,
      discount: p.discountAmount,
      taxableAmount: p.taxableAmount,
      gstPercent: p.gstPercent,
      gstAmount: p.gstAmount,
      totalAmount: p.lineTotal,
      deliverySchedule: `${deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-GB') : '4-6 weeks'}`,
      installationRequired: true,
      warranty: quotation.commercialTerms?.warranty || '12 Months'
    }));

    const salesOrder = await SalesOrder.create({
      soNumber,
      soDate: new Date(),
      enquiry: quotation.enquiry,
      enquiryNumber: quotation.enquiryNumber,
      customer: quotation.customer,
      customerName: quotation.customerName,
      quotation: quotation._id,
      quotationNumber: quotation.quotationNumber,
      quotationVersion: quotation.versionLabel,
      customerPurchaseOrder: po?._id,
      customerPoNumber: customerPoNumber || po?.customerPoNumber || 'PO-PENDING',
      customerPoDate: customerPoDate || po?.customerPoDate || new Date(),
      salesPerson: req.user?._id,
      salesPersonName: req.user?.name,
      orderType: orderType || 'Standard Equipment',
      priority: priority || 'Normal',
      deliveryDate: deliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billingAddress: billingAddress || quotation.billingAddress,
      shippingAddress: shippingAddress || quotation.shippingAddress,
      projectLocation: projectLocation || '',
      products: soProducts,
      soValue,
      advanceRequired: advReq,
      advanceReceived: 0,
      balanceAmount: soValue,
      paymentTerms: paymentTerms || quotation.commercialTerms?.paymentTerms,
      soStatus: 'Pending Approvals',
      createdBy: req.user?._id,
      orderHistory: [
        {
          action: 'Sales Order Created',
          timestamp: new Date(),
          performedBy: req.user?._id,
          performedByName: req.user?.name,
          details: `Generated SO ${soNumber} for ${quotation.customerName} (Value: ₹${soValue.toLocaleString('en-IN')})`
        }
      ]
    });

    try {
      const pdfPath = await generateSalesOrderPDF(salesOrder);
      salesOrder.pdfUrl = pdfPath;
      await salesOrder.save();
    } catch (pdfErr) {
      console.error('[SO PDF Error]', pdfErr);
    }

    if (quotation.enquiry) {
      await Enquiry.findByIdAndUpdate(quotation.enquiry, { status: 'Sales Order Created' });
    }

    await logAudit(req, 'CREATE', 'SalesOrder', salesOrder._id.toString(), {
      soNumber,
      customerName: quotation.customerName,
      soValue
    });

    await Notification.create({
      title: 'Sales Order Generated - Multi-Dept Approvals Required',
      message: `Sales Order ${soNumber} for ₹${soValue.toLocaleString('en-IN')} created. Clearances needed from Sales, Accounts, Technical, Production, and Management.`,
      link: `/sales-orders/${salesOrder._id}`,
      type: 'SalesOrder',
      targetRoles: ['Sales Manager', 'Accounts Manager', 'Engineering Manager', 'Production Manager', 'MD / Director']
    });

    res.status(201).json({ success: true, data: salesOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update specific departmental approval stage
// @route PATCH /api/sales-orders/:id/approve-stage
exports.updateApprovalStage = async (req, res) => {
  try {
    const { stage, status, remarks } = req.body;
    // stage can be: 'salesApproval', 'accountsApproval', 'technicalApproval', 'productionFeasibilityApproval', 'managementApproval'
    const validStages = ['salesApproval', 'accountsApproval', 'technicalApproval', 'productionFeasibilityApproval', 'managementApproval'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid approval stage' });
    }

    const so = await SalesOrder.findById(req.params.id);
    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    so.approvals[stage] = {
      status, // 'Approved' or 'Rejected'
      approvedBy: req.user?._id,
      approvedByName: req.user?.name,
      approvedAt: new Date(),
      remarks: remarks || ''
    };

    so.orderHistory.push({
      action: `${stage.replace('Approval', '')} Approval: ${status}`,
      timestamp: new Date(),
      performedBy: req.user?._id,
      performedByName: req.user?.name,
      details: remarks || ''
    });

    // Check if all 5 approvals are granted
    const allApproved = validStages.every((s) => so.approvals[s]?.status === 'Approved');
    if (allApproved) {
      so.soStatus = 'Confirmed';
    } else if (Object.values(so.approvals).some((v) => v?.status === 'Rejected')) {
      so.soStatus = 'Pending Approvals';
    }

    await so.save();

    // Re-generate updated PDF with current clearances
    try {
      const pdfPath = await generateSalesOrderPDF(so);
      so.pdfUrl = pdfPath;
      await so.save();
    } catch (pdfErr) {
      console.error('[SO PDF Update Error]', pdfErr);
    }

    await logAudit(req, 'APPROVAL_STAGE_UPDATE', 'SalesOrder', so._id.toString(), {
      soNumber: so.soNumber,
      stage,
      status
    });

    res.json({ success: true, data: so });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Release Sales Order to Production / Manufacturing
// @route PATCH /api/sales-orders/:id/release
exports.releaseToProduction = async (req, res) => {
  try {
    const { releaseNotes } = req.body;
    const so = await SalesOrder.findById(req.params.id);

    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    // Business Logic Check: Do not release if approvals incomplete
    const validStages = ['salesApproval', 'accountsApproval', 'technicalApproval', 'productionFeasibilityApproval', 'managementApproval'];
    const pendingStages = validStages.filter((s) => so.approvals[s]?.status !== 'Approved');

    if (pendingStages.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot release to production. Pending departmental approvals: ${pendingStages.join(', ')}`
      });
    }

    so.soStatus = 'Released to Production';
    so.releaseForExecution = {
      isReleased: true,
      releasedBy: req.user?._id,
      releasedAt: new Date(),
      productionNotificationSent: true,
      purchaseNotificationSent: true,
      releaseNotes: releaseNotes || 'All clearances satisfied. Released to plant execution.'
    };

    so.orderHistory.push({
      action: 'Released for Production Execution',
      timestamp: new Date(),
      performedBy: req.user?._id,
      performedByName: req.user?.name,
      details: releaseNotes || 'Official plant release triggered'
    });

    await so.save();

    // Regenerate PDF
    try {
      const pdfPath = await generateSalesOrderPDF(so);
      so.pdfUrl = pdfPath;
      await so.save();
    } catch (pdfErr) {
      console.error('[SO PDF Update Error]', pdfErr);
    }

    // Notify Production Manager & Purchase Manager
    await Notification.create({
      title: '🚨 New Confirmed Sales Order Released to Production',
      message: `Sales Order ${so.soNumber} (${so.customerName}) has been released for manufacturing. Please initiate BOM purchase and fabrication schedule.`,
      link: `/sales-orders/${so._id}`,
      type: 'SalesOrder',
      targetRoles: ['Production Manager', 'Purchase Manager', 'Engineering Manager']
    });

    await logAudit(req, 'RELEASE_PRODUCTION', 'SalesOrder', so._id.toString(), {
      soNumber: so.soNumber
    });

    res.json({ success: true, message: 'Sales Order released to Production successfully', data: so });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Download Sales Order PDF
// @route GET /api/sales-orders/:id/pdf
exports.downloadSOPdf = async (req, res) => {
  try {
    const so = await SalesOrder.findById(req.params.id);
    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    const pdfRelativePath = await generateSalesOrderPDF(so);
    so.pdfUrl = pdfRelativePath;
    await so.save();

    const fullFilePath = path.join(__dirname, '..', pdfRelativePath);
    res.download(fullFilePath);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
