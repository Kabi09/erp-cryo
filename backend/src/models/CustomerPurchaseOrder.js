const mongoose = require('mongoose');

const customerPurchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: [true, 'Customer PO Number is required'],
      trim: true
    },
    poDate: {
      type: Date,
      required: [true, 'Customer PO Date is required']
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
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice',
      default: null
    },
    poValue: {
      type: Number,
      required: [true, 'PO Value is required'],
      min: 0
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Expected delivery date in PO is required']
    },
    deliveryPeriodText: {
      type: String,
      default: ''
    },
    paymentTerms: {
      type: String,
      required: [true, 'Payment terms in PO are required']
    },
    itemSummary: {
      type: String,
      required: [true, 'Item and specification summary is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity in PO is required'],
      min: 1
    },
    unitPrice: {
      type: Number,
      default: 0
    },
    documentPath: {
      type: String,
      default: ''
    },
    originalFileName: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: ''
    },
    amendmentVersion: {
      type: Number,
      default: 1
    },
    amendmentHistory: [
      {
        amendmentVersion: Number,
        poNumber: String,
        poDate: Date,
        poValue: Number,
        deliveryDate: Date,
        paymentTerms: String,
        itemSummary: String,
        quantity: Number,
        documentPath: String,
        originalFileName: String,
        reasonForAmendment: String,
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    verificationStatus: {
      type: String,
      enum: ['Unverified', 'Passed', 'Failed_Mismatch', 'Amendment_Requested'],
      default: 'Unverified'
    },
    notes: {
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

customerPurchaseOrderSchema.index({ poNumber: 1, customer: 1, lead: 1 });

module.exports = mongoose.model('CustomerPurchaseOrder', customerPurchaseOrderSchema);

