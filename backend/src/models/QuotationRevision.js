const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, default: '' },
    productName: { type: String, required: true },
    specification: { type: String, default: '' },
    hsnCode: { type: String, default: '841869' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'Nos' },
    unitPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  },
  { _id: true }
);

const quotationRevisionSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    revisionNumber: {
      type: Number,
      required: true,
      default: 0
    },
    revisionLabel: {
      type: String,
      required: true,
      default: 'Rev 0'
    },
    revisionReason: {
      type: String,
      default: 'Initial Quotation'
    },
    items: [quotationItemSchema],
    subTotal: { type: Number, required: true, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true, default: 0 },
    totalGst: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paymentTerms: {
      type: String,
      required: true,
      default: '30% Advance with PO, 70% against Proforma Invoice prior to dispatch'
    },
    deliveryPeriod: {
      type: String,
      required: true,
      default: '4 to 6 Weeks from receipt of technically and commercially clear PO'
    },
    validityDays: {
      type: Number,
      default: 30
    },
    warranty: {
      type: String,
      default: '12 Months warranty from date of commissioning or 15 months from dispatch'
    },
    freightTerms: {
      type: String,
      default: 'Ex-works Chennai / Packing & Forwarding extra at actuals'
    },
    specialTerms: {
      type: String,
      default: 'Standard testing and inspection at our works prior to dispatch.'
    },
    pdfUrl: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

quotationRevisionSchema.index({ quotation: 1, revisionNumber: 1 }, { unique: true });

module.exports = mongoose.model('QuotationRevision', quotationRevisionSchema);

