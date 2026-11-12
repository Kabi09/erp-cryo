const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadNumber: {
      type: String,
      unique: true,
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    contactPerson: {
      name: { type: String, required: [true, 'Contact person name is required'] },
      designation: { type: String, default: '' },
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      default: 'Email Enquiry',
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    requirements: {
      equipmentType: { type: String, required: true },
      capacity: { type: String, default: '' },
      specificationDetails: { type: String, default: '' },
      estimatedBudget: { type: Number, default: 0 },
      quantity: { type: Number, default: 1 },
      expectedDeliveryTime: { type: String, default: '4-6 Weeks' }
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    followUps: [
      {
        followUpDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['INTERESTED', 'NOT INTERESTED', 'NO RESPONSE', 'FOLLOW UP LATER', 'BUSY', 'MEETING SCHEDULED'],
          default: 'INTERESTED'
        },
        notes: { type: String, required: true },
        nextFollowUpDate: { type: Date, default: null },
        conductedByName: { type: String, default: 'Ananya Sharma' },
        conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    qualification: {
      isQualified: { type: Boolean, default: null }, // null: unreviewed, true: qualified, false: disqualified
      status: {
        type: String,
        enum: ['Pending', 'Qualified', 'Disqualified'],
        default: 'Pending'
      },
      qualifiedAt: { type: Date },
      qualifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      qualificationNotes: { type: String, default: '' },
      budgetConfirmed: { type: Boolean, default: false },
      decisionMakerIdentified: { type: Boolean, default: false },
      requirementClarity: {
        type: String,
        enum: ['High', 'Medium', 'Low', 'Custom Specification Required'],
        default: 'High'
      }
    },
    stage: {
      type: String,
      enum: [
        'ENQUIRY_RECEIVED',
        'QUALIFICATION',
        'CUSTOMER_MAPPED',
        'QUOTATION_DRAFTED',
        'QUOTATION_SENT',
        'CUSTOMER_REVIEW',
        'QUOTATION_NEGOTIATION',
        'QUOTATION_WON',
        'QUOTATION_LOST',
        'PI_ISSUED',
        'PO_RECEIVED',
        'PO_VERIFICATION',
        'PO_AMENDMENT_PENDING',
        'SO_CREATED',
        'PRODUCTION_HANDOVER'
      ],
      default: 'ENQUIRY_RECEIVED'
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Qualified', 'Disqualified', 'Quoted', 'Won', 'Lost', 'Closed'],
      default: 'New'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    currentQuotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      default: null
    },
    currentPI: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice',
      default: null
    },
    currentPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerPurchaseOrder',
      default: null
    },
    currentSO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      default: null
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ leadNumber: 1, companyName: 'text', email: 1, stage: 1, status: 1 });

module.exports = mongoose.model('Lead', leadSchema);

