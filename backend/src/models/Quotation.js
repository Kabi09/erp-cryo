const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
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
    currentRevisionNumber: {
      type: Number,
      default: 0
    },
    activeRevision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuotationRevision'
    },
    revisions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuotationRevision'
      }
    ],
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Customer Review', 'Under Negotiation', 'Won', 'Lost'],
      default: 'Draft'
    },
    winningRevision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuotationRevision',
      default: null
    },
    wonDate: {
      type: Date,
      default: null
    },
    wonRemarks: {
      type: String,
      default: ''
    },
    lostDate: {
      type: Date,
      default: null
    },
    lostReason: {
      type: String,
      default: ''
    },
    customerFeedback: [
      {
        date: { type: Date, default: Date.now },
        feedbackType: { type: String, enum: ['Price High', 'Delivery Lead Time Long', 'Specs Clarification', 'Approved In Principle', 'Budget Constraints', 'Other'] },
        notes: { type: String, required: true },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

quotationSchema.index({ quotationNumber: 1, lead: 1, customer: 1, status: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);

