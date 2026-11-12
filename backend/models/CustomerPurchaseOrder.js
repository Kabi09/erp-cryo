const mongoose = require('mongoose');

const customerPurchaseOrderSchema = new mongoose.Schema(
  {
    receiptId: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
    customerPoNumber: {
      type: String,
      required: [true, 'Customer PO Number is required'],
      trim: true,
      index: true
    },
    customerPoDate: {
      type: Date,
      required: true
    },
    receivedDate: {
      type: Date,
      default: Date.now
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
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice'
    },
    piNumber: {
      type: String
    },
    poValue: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    deliveryDate: {
      type: Date
    },
    paymentTerms: {
      type: String
    },
    billingAddress: {
      type: String
    },
    shippingAddress: {
      type: String
    },
    originalPoFileUrl: {
      type: String
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Mismatch', 'Clarification Required', 'Rejected'],
      default: 'Pending'
    },
    verificationChecks: {
      productModelMatch: { type: Boolean, default: false },
      quantityMatch: { type: Boolean, default: false },
      unitPriceMatch: { type: Boolean, default: false },
      totalValueMatch: { type: Boolean, default: false },
      gstRateMatch: { type: Boolean, default: false },
      deliveryPeriodMatch: { type: Boolean, default: false },
      paymentTermsMatch: { type: Boolean, default: false },
      technicalSpecsMatch: { type: Boolean, default: false },
      mismatchNotes: { type: String, default: '' },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: { type: Date }
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomerPurchaseOrder', customerPurchaseOrderSchema);
