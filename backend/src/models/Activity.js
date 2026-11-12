const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'LEAD_CREATED',
        'LEAD_UPDATED',
        'LEAD_QUALIFIED',
        'LEAD_DISQUALIFIED',
        'CUSTOMER_CREATED',
        'CUSTOMER_LINKED',
        'QUOTATION_CREATED',
        'QUOTATION_REVISED',
        'CUSTOMER_FEEDBACK',
        'NEGOTIATION_NOTE',
        'QUOTATION_WON',
        'QUOTATION_LOST',
        'PI_GENERATED',
        'PO_UPLOADED',
        'PO_VERIFICATION_PASSED',
        'PO_VERIFICATION_FAILED',
        'PO_AMENDMENT_REQUESTED',
        'PO_AMENDMENT_SUBMITTED',
        'SO_CREATED',
        'PRODUCTION_HANDOVER',
        'QUOTATION_SHARED',
        'REVISION_REVERTED',
        'QUOTATION_REOPENED',
        'LEAD_FOLLOW_UP',
        'GENERAL_NOTE'
      ]
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    documentType: {
      type: String,
      enum: ['Lead', 'Customer', 'Quotation', 'QuotationRevision', 'ProformaInvoice', 'CustomerPurchaseOrder', 'POVerification', 'SalesOrder', 'None'],
      default: 'None'
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ lead: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

