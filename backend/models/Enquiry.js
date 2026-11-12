const mongoose = require('mongoose');

const enquiryProductItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: { type: String, required: true },
  category: { type: String },
  modelNumber: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unit: { type: String, default: 'Nos' },
  application: { type: String },
  technicalRequirements: { type: String },
  temperatureRequirements: { type: String },
  sensorRequirements: { type: String },
  heatingRequirements: { type: String },
  electricalRequirements: { type: String },
  dimensions: { type: String },
  installationRequired: { type: Boolean, default: true },
  requiredDeliveryDate: { type: Date },
  expectedBudget: { type: Number, default: 0 },
  customerRemarks: { type: String }
});

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

const enquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
    enquiryDate: {
      type: Date,
      default: Date.now
    },
    enquirySource: {
      type: String,
      enum: ['Website', 'Phone', 'Email', 'WhatsApp', 'Referral', 'Direct Visit', 'Exhibition / Expo', 'Tender / Portal', 'Other'],
      default: 'Email'
    },
    enquiryType: {
      type: String,
      enum: ['New Customer', 'Existing Customer'],
      default: 'New Customer'
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true
    },
    designation: {
      type: String
    },
    mobileNumber: {
      type: String,
      required: true
    },
    alternateMobile: {
      type: String
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    website: {
      type: String
    },
    gstin: {
      type: String
    },
    pan: {
      type: String
    },
    country: {
      type: String,
      default: 'India'
    },
    state: {
      type: String,
      default: 'Tamil Nadu'
    },
    city: {
      type: String,
      default: 'Chennai'
    },
    pinCode: {
      type: String
    },
    billingAddress: {
      type: String
    },
    shippingAddress: {
      type: String
    },
    products: [enquiryProductItemSchema],
    attachments: [attachmentSchema],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: {
      type: String,
      default: 'Sales & Marketing'
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Estimation',
        'Estimation Completed',
        'Follow-up',
        'Won',
        'Lost',
        'Quotation Sent',
        'Negotiation',
        'PO Received',
        'Sales Order Created',
        'Closed'
      ],
      default: 'Submitted'
    },
    remarks: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
