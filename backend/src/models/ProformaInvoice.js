const mongoose = require('mongoose');

const proformaInvoiceSchema = new mongoose.Schema(
  {
    piNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    piDate: {
      type: Date,
      default: Date.now
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    quotationRevision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuotationRevision',
      required: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    items: [
      {
        itemCode: { type: String, default: '' },
        productName: { type: String, required: true },
        specification: { type: String, default: '' },
        hsnCode: { type: String, default: '841869' },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'Nos' },
        unitPrice: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        taxableAmount: { type: Number, required: true },
        gstRate: { type: Number, default: 18 },
        gstAmount: { type: Number, required: true },
        totalAmount: { type: Number, required: true }
      }
    ],
    subTotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    totalGst: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentTerms: { type: String, required: true },
    deliveryPeriod: { type: String, required: true },
    validityDate: { type: Date },
    bankDetails: {
      bankName: { type: String, default: 'State Bank of India' },
      accountName: { type: String, default: 'Cryo Scientific Systems Pvt Ltd' },
      accountNumber: { type: String, default: '382910482019' },
      ifscCode: { type: String, default: 'SBIN0004128' },
      branch: { type: String, default: 'Guindy Industrial Estate, Chennai' }
    },
    notes: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Issued', 'Payment Pending', 'Advance Received', 'Cancelled'],
      default: 'Issued'
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

proformaInvoiceSchema.index({ piNumber: 1, lead: 1, quotation: 1 });

module.exports = mongoose.model('ProformaInvoice', proformaInvoiceSchema);

