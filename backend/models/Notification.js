const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetRoles: [
      {
        type: String
      }
    ],
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String
    },
    type: {
      type: String,
      enum: ['Enquiry', 'Estimation', 'Quotation', 'Negotiation', 'PO', 'Payment', 'SalesOrder', 'Approval', 'System'],
      default: 'System'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
