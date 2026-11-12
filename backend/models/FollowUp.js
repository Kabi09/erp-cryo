const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    followUpId: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
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
    contactPerson: {
      type: String
    },
    followUpDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    followUpTime: {
      type: String,
      default: '10:30 AM'
    },
    followUpType: {
      type: String,
      enum: ['Call', 'Email', 'WhatsApp', 'Meeting', 'Direct Visit', 'Online Demo', 'Other'],
      default: 'Call'
    },
    discussionDetails: {
      type: String,
      required: true
    },
    customerResponse: {
      type: String,
      enum: ['Positive / High Interest', 'Interested / Needs Time', 'Price Negotiation Requested', 'Technical Clarification Needed', 'Budget Constraint', 'Competitor Comparison', 'Not Interested / Dropped', 'Pending Decision'],
      default: 'Interested / Needs Time'
    },
    requirementChanges: {
      type: String
    },
    nextFollowUpDate: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: {
      type: String
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Completed'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
