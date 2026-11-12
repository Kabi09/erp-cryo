const mongoose = require('mongoose');

const soProductItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productCode: { type: String },
  productName: { type: String, required: true },
  model: { type: String },
  description: { type: String },
  technicalSpecification: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'Nos' },
  unitPrice: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  deliverySchedule: { type: String },
  installationRequired: { type: Boolean, default: true },
  warranty: { type: String, default: '12 Months' }
});

const approvalStageSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedByName: { type: String },
  approvedAt: { type: Date },
  remarks: { type: String, default: '' }
});

const salesOrderSchema = new mongoose.Schema(
  {
    soNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
    soDate: {
      type: Date,
      default: Date.now
    },
    enquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry'
    },
    enquiryNumber: {
      type: String
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
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    quotationNumber: {
      type: String,
      required: true
    },
    quotationVersion: {
      type: String,
      default: 'V1'
    },
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice'
    },
    piNumber: {
      type: String
    },
    customerPurchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerPurchaseOrder'
    },
    customerPoNumber: {
      type: String,
      required: true
    },
    customerPoDate: {
      type: Date
    },
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    salesPersonName: {
      type: String
    },
    orderType: {
      type: String,
      enum: ['Standard Equipment', 'Custom Engineering', 'Turnkey Cold Room Project', 'AMC / Service Contract'],
      default: 'Standard Equipment'
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent / VIP'],
      default: 'Normal'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    deliveryDate: {
      type: Date,
      required: true
    },
    billingAddress: {
      type: String
    },
    shippingAddress: {
      type: String
    },
    projectLocation: {
      type: String
    },
    products: [soProductItemSchema],
    soValue: {
      type: Number,
      required: true,
      default: 0
    },
    advanceRequired: {
      type: Number,
      default: 0
    },
    advanceReceived: {
      type: Number,
      default: 0
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    paymentTerms: {
      type: String,
      default: '30% advance, 70% against delivery/PI'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Advance Received', 'Partially Paid', 'Fully Paid'],
      default: 'Pending'
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileCategory: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    approvals: {
      salesApproval: { type: approvalStageSchema, default: () => ({ status: 'Pending' }) },
      accountsApproval: { type: approvalStageSchema, default: () => ({ status: 'Pending' }) },
      technicalApproval: { type: approvalStageSchema, default: () => ({ status: 'Pending' }) },
      productionFeasibilityApproval: { type: approvalStageSchema, default: () => ({ status: 'Pending' }) },
      managementApproval: { type: approvalStageSchema, default: () => ({ status: 'Pending' }) }
    },
    soStatus: {
      type: String,
      enum: [
        'Draft',
        'Pending Approvals',
        'Approved',
        'Confirmed',
        'Released to Production',
        'In Manufacturing',
        'Quality Inspection',
        'Dispatched',
        'Completed',
        'Cancelled'
      ],
      default: 'Draft'
    },
    releaseForExecution: {
      isReleased: { type: Boolean, default: false },
      releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      releasedAt: { type: Date },
      productionNotificationSent: { type: Boolean, default: false },
      purchaseNotificationSent: { type: Boolean, default: false },
      releaseNotes: { type: String }
    },
    orderHistory: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performedByName: String,
        details: String
      }
    ],
    pdfUrl: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
