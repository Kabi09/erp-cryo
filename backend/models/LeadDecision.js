const mongoose = require('mongoose');

const leadDecisionSchema = new mongoose.Schema(
  {
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      required: true
    },
    enquiryNumber: {
      type: String,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerName: {
      type: String,
      required: true
    },
    expectedOrderValue: {
      type: Number,
      default: 0
    },
    decisionDate: {
      type: Date,
      default: Date.now
    },
    leadStatus: {
      type: String,
      enum: ['Won', 'Lost', 'On Hold', 'In Progress'],
      required: true,
      default: 'In Progress'
    },
    reason: {
      type: String,
      enum: [
        'None',
        'Competitive Pricing Won',
        'Technical Superiority Won',
        'Existing Customer Relationship',
        'Price Too High',
        'Competitor Selected',
        'Technical Issues',
        'Budget Not Available',
        'Project Cancelled',
        'Delivery Delay',
        'Customer Not Responding',
        'Specifications Mismatch',
        'Other'
      ],
      default: 'None'
    },
    remarks: {
      type: String
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeadDecision', leadDecisionSchema);
