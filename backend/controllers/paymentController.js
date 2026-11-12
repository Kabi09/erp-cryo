const PaymentReceipt = require('../models/PaymentReceipt');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const SalesOrder = require('../models/SalesOrder');
const { getNextSequence } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc Get all payment receipts
// @route GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const { customerId, piId, status } = req.query;
    let query = {};
    if (customerId) query.customer = customerId;
    if (piId) query.proformaInvoice = piId;
    if (status) query.status = status;

    const receipts = await PaymentReceipt.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('proformaInvoice', 'piNumber totalPiAmount advanceAmount')
      .populate('verifiedBy', 'name role')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: receipts.length, data: receipts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Payment Receipt
// @route POST /api/payments
exports.createPayment = async (req, res) => {
  try {
    const {
      customer: customerId,
      customerName,
      proformaInvoice: piId,
      customerPurchaseOrder: poId,
      customerPoNumber,
      paymentDate,
      paymentMode,
      transactionId,
      bankAccount,
      amountReceived,
      tdsDeduction,
      paymentProofUrl,
      remarks
    } = req.body;

    const receiptNumber = await getNextSequence('REC');
    const amount = Number(amountReceived) || 0;
    const tds = Number(tdsDeduction) || 0;
    const netCredit = amount - tds;

    let piNumber = '';
    if (piId) {
      const pi = await ProformaInvoice.findById(piId);
      if (pi) piNumber = pi.piNumber;
    }

    const receipt = await PaymentReceipt.create({
      receiptNumber,
      customer: customerId,
      customerName,
      proformaInvoice: piId,
      piNumber,
      customerPurchaseOrder: poId,
      customerPoNumber,
      paymentDate: paymentDate || new Date(),
      paymentMode: paymentMode || 'NEFT',
      transactionId,
      bankAccount: bankAccount || 'State Bank of India (A/C: 382910482910)',
      amountReceived: amount,
      tdsDeduction: tds,
      netCreditAmount: netCredit,
      paymentProofUrl,
      remarks,
      status: 'Pending Verification',
      createdBy: req.user?._id
    });

    await logAudit(req, 'CREATE', 'PaymentReceipt', receipt._id.toString(), {
      receiptNumber,
      customerName,
      amountReceived: amount,
      transactionId
    });

    await Notification.create({
      title: 'Payment Receipt Logged - Accounts Clearance Needed',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} logged for ${customerName} (Ref: ${transactionId}).`,
      link: `/payments/${receipt._id}`,
      type: 'Payment',
      targetRoles: ['Accounts Manager', 'Accounts Executive']
    });

    res.status(201).json({ success: true, data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Verify Payment (Accounts only)
// @route PATCH /api/payments/:id/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;
    const receipt = await PaymentReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Payment receipt not found' });
    }

    receipt.status = status; // 'Verified' or 'Rejected'
    receipt.verifiedBy = req.user?._id;
    receipt.verifiedAt = new Date();
    if (verificationNotes) receipt.verificationNotes = verificationNotes;
    await receipt.save();

    // If verified, update corresponding Proforma Invoice and Sales Order if linked
    if (status === 'Verified' && receipt.proformaInvoice) {
      const allVerifiedForPI = await PaymentReceipt.find({
        proformaInvoice: receipt.proformaInvoice,
        status: 'Verified'
      });

      const totalPaid = allVerifiedForPI.reduce((acc, curr) => acc + curr.amountReceived, 0);
      const pi = await ProformaInvoice.findById(receipt.proformaInvoice);
      if (pi) {
        if (totalPaid >= pi.totalPiAmount) {
          pi.status = 'Fully Paid';
        } else if (totalPaid > 0) {
          pi.status = 'Partially Paid';
        }
        await pi.save();
      }
    }

    // Update Sales Order advance received if linked
    if (status === 'Verified' && receipt.customerPoNumber) {
      const so = await SalesOrder.findOne({ customerPoNumber: receipt.customerPoNumber });
      if (so) {
        so.advanceReceived = (so.advanceReceived || 0) + receipt.amountReceived;
        so.balanceAmount = Math.max(0, so.soValue - so.advanceReceived);
        if (so.advanceReceived >= so.soValue) {
          so.paymentStatus = 'Fully Paid';
        } else if (so.advanceReceived > 0) {
          so.paymentStatus = 'Partially Paid';
        }
        await so.save();
      }
    }

    await logAudit(req, 'VERIFY', 'PaymentReceipt', receipt._id.toString(), {
      receiptNumber: receipt.receiptNumber,
      status,
      verificationNotes
    });

    res.json({ success: true, data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
