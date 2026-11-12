const mongoose = require('mongoose');

const paymentReceiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice'
    },
    piNumber: {
      type: String
    },
    customerPurchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerPurchaseOrder'
    },
    customerPoNumber: {
      type: String
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    paymentMode: {
      type: String,
      enum: ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'Demand Draft', 'Wire Transfer / Swift', 'Other'],
      required: true,
      default: 'NEFT'
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction reference/UTR/Cheque number is required'],
      trim: true
    },
    bankAccount: {
      type: String,
      default: 'State Bank of India (A/C: 382910482910)'
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 1
    },
    tdsDeduction: {
      type: Number,
      default: 0
    },
    netCreditAmount: {
      type: Number,
      required: true,
      default: 0
    },
    paymentProofUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending Verification', 'Verified', 'Partially Received', 'Rejected', 'Cheque Bounced'],
      default: 'Pending Verification'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    verificationNotes: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentReceipt', paymentReceiptSchema);
