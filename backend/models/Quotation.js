const mongoose = require('mongoose');

const quotationProductItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productCode: { type: String },
  productName: { type: String, required: true },
  model: { type: String },
  description: { type: String },
  technicalSpecifications: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'Nos' },
  unitPrice: { type: Number, required: true, default: 0 },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true, default: 0 }
});

const commercialTermsSchema = new mongoose.Schema({
  paymentTerms: { type: String, default: '30% advance with Purchase Order, 70% before dispatch against Proforma Invoice.' },
  deliveryPeriod: { type: String, default: '4 to 6 weeks from receipt of technically and commercially clear PO with advance.' },
  warranty: { type: String, default: '12 months from the date of installation or 15 months from dispatch, whichever is earlier.' },
  installationCharges: { type: String, default: 'Free of charge within India by Cryo certified service engineers.' },
  packingCharges: { type: String, default: 'Inclusive in unit price (Standard Export Sea/Air-worthy wooden packing).' },
  transportationCharges: { type: String, default: 'Extra at actuals / To Pay basis by customer.' },
  freightTerms: { type: String, default: 'Ex-Works Chennai Factory' },
  quotationValidity: { type: String, default: '30 days from the date of this quotation.' },
  bankDetails: {
    bankName: { type: String, default: 'State Bank of India' },
    accountName: { type: String, default: 'Cryo Scientific Systems Pvt. Ltd.' },
    accountNumber: { type: String, default: '382910482910' },
    ifscCode: { type: String, default: 'SBIN0001824' },
    branch: { type: String, default: 'Ambattur Industrial Estate, Chennai' }
  },
  termsAndConditions: {
    type: [String],
    default: [
      'Taxes: GST as applicable at the time of supply (Present rate 18%).',
      'Delivery schedule starts upon receipt of advance and technical freeze.',
      'Site readiness including electrical points and ventilation must be ensured prior to installation.',
      'Disputes subject to Chennai jurisdiction only.'
    ]
  }
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    version: {
      type: Number,
      default: 1
    },
    versionLabel: {
      type: String,
      default: 'V1'
    },
    quotationDate: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date
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
      ref: 'Customer',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    billingAddress: {
      type: String
    },
    shippingAddress: {
      type: String
    },
    estimateReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estimation'
    },
    estimateNumber: {
      type: String
    },
    products: [quotationProductItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    discountTotal: {
      type: Number,
      default: 0
    },
    taxableAmount: {
      type: Number,
      required: true,
      default: 0
    },
    gstTotal: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0
    },
    commercialTerms: {
      type: commercialTermsSchema,
      default: () => ({})
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Pending Approval',
        'Approved',
        'Sent',
        'Under Negotiation',
        'Accepted',
        'Rejected',
        'Revised',
        'Expired'
      ],
      default: 'Draft'
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    sentDate: {
      type: Date
    },
    sentChannel: {
      type: String,
      enum: ['Email', 'WhatsApp', 'Hand Delivered', 'Portal', 'Other'],
      default: 'Email'
    },
    customerResponseRemarks: {
      type: String
    },
    pdfUrl: {
      type: String
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound index on quotationNumber and version
quotationSchema.index({ quotationNumber: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);
