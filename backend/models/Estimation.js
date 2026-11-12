const mongoose = require('mongoose');

const costingLineItemSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'Raw Materials',
      'Sensors',
      'Heating Elements',
      'Controllers',
      'Electrical Components',
      'Labour',
      'Manufacturing',
      'Testing & Calibration',
      'Packing',
      'Transportation',
      'Other Expenses'
    ],
    required: true
  },
  itemName: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'Nos' },
  unitPrice: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 }
});

const estimationProductItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  modelNumber: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  costingLines: [costingLineItemSchema],
  materialCost: { type: Number, default: 0 },
  sensorsCost: { type: Number, default: 0 },
  heatingCost: { type: Number, default: 0 },
  controllersCost: { type: Number, default: 0 },
  electricalCost: { type: Number, default: 0 },
  labourCost: { type: Number, default: 0 },
  manufacturingCost: { type: Number, default: 0 },
  testingCost: { type: Number, default: 0 },
  packingCost: { type: Number, default: 0 },
  transportationCost: { type: Number, default: 0 },
  otherCost: { type: Number, default: 0 },
  totalEstimatedCost: { type: Number, default: 0 },
  profitMarginPercent: { type: Number, default: 25 },
  profitAmount: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  finalEstimatedAmount: { type: Number, default: 0 }
});

const estimationSchema = new mongoose.Schema(
  {
    estimateNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      index: true
    },
    estimateDate: {
      type: Date,
      default: Date.now
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
    items: [estimationProductItemSchema],
    totalCost: {
      type: Number,
      default: 0
    },
    totalProfit: {
      type: Number,
      default: 0
    },
    totalSellingPrice: {
      type: Number,
      default: 0
    },
    totalGst: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    revisionNumber: {
      type: Number,
      default: 1
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Revised'],
      default: 'Pending Approval'
    },
    reviewRemarks: {
      type: String
    },
    revisionHistory: [
      {
        revisionNumber: Number,
        totalCost: Number,
        grandTotal: Number,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
        reason: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Estimation', estimationSchema);
