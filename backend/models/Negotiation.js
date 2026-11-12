const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    quotationNumber: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    versionLabel: {
      type: String,
      default: 'V1'
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
    customerResponse: {
      type: String,
      enum: ['Accepted', 'Rejected', 'Negotiation', 'Pending'],
      required: true,
      default: 'Negotiation'
    },
    customerRemarks: {
      type: String,
      required: true
    },
    requestedDiscountPercent: {
      type: Number,
      default: 0
    },
    requestedDiscountAmount: {
      type: Number,
      default: 0
    },
    revisedTargetPrice: {
      type: Number,
      default: 0
    },
    technicalChanges: {
      type: String
    },
    deliveryChanges: {
      type: String
    },
    paymentChanges: {
      type: String
    },
    managerApprovalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    managerRemarks: {
      type: String
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    resultQuotationVersion: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Negotiation', negotiationSchema);
