const mongoose = require('mongoose');

const verificationCheckSchema = new mongoose.Schema(
  {
    pointNumber: { type: Number, required: true },
    pointName: { type: String, required: true },
    expectedValue: { type: String, required: true },
    actualValue: { type: String, required: true },
    status: {
      type: String,
      enum: ['MATCH', 'MISMATCH'],
      required: true
    },
    remarks: { type: String, default: '' }
  },
  { _id: false }
);

const poVerificationSchema = new mongoose.Schema(
  {
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
    customerPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerPurchaseOrder',
      required: true
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
    verificationRound: {
      type: Number,
      default: 1
    },
    checks: {
      itemSpecification: { type: verificationCheckSchema, required: true },
      quantity: { type: verificationCheckSchema, required: true },
      pricingValue: { type: verificationCheckSchema, required: true },
      deliveryDate: { type: verificationCheckSchema, required: true },
      paymentTerms: { type: verificationCheckSchema, required: true }
    },
    allMatched: {
      type: Boolean,
      required: true
    },
    overallStatus: {
      type: String,
      enum: ['PASSED', 'FAILED_MISMATCH'],
      required: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    generalRemarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

poVerificationSchema.index({ lead: 1, customerPO: 1, overallStatus: 1 });

module.exports = mongoose.model('POVerification', poVerificationSchema);

