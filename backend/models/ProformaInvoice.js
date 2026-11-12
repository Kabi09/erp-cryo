const mongoose = require('mongoose');

const piProductItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productCode: { type: String },
  productName: { type: String, required: true },
  model: { type: String },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'Nos' },
  unitPrice: { type: Number, required: true, default: 0 },
  discountPercent: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true, default: 0 }
});

const proformaInvoiceSchema = new mongoose.Schema(
  {
    piNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
    piDate: {
      type: Date,
      default: Date.now
    },
    validityDate: {
      type: Date
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
    billingAddress: {
      type: String
    },
    shippingAddress: {
      type: String
    },
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry'
    },
    enquiryNumber: {
      type: String
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    quotationNumber: {
      type: String,
      required: true
    },
    quotationVersion: {
      type: String,
      default: 'V1'
    },
    products: [piProductItemSchema],
    totalTaxableAmount: {
      type: Number,
      required: true,
      default: 0
    },
    totalGstAmount: {
      type: Number,
      required: true,
      default: 0
    },
    totalPiAmount: {
      type: Number,
      required: true,
      default: 0
    },
    advancePercentage: {
      type: Number,
      default: 30
    },
    advanceAmount: {
      type: Number,
      default: 0
    },
    balancePercentage: {
      type: Number,
      default: 70
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    bankDetails: {
      bankName: { type: String, default: 'State Bank of India' },
      accountName: { type: String, default: 'Cryo Scientific Systems Pvt. Ltd.' },
      accountNumber: { type: String, default: '382910482910' },
      ifscCode: { type: String, default: 'SBIN0001824' },
      branch: { type: String, default: 'Ambattur Industrial Estate, Chennai' }
    },
    paymentTerms: {
      type: String,
      default: '30% Advance with Purchase Order, 70% against dispatch.'
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Sent', 'Partially Paid', 'Fully Paid', 'Cancelled'],
      default: 'Draft'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    pdfUrl: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProformaInvoice', proformaInvoiceSchema);
