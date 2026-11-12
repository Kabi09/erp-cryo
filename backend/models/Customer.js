const mongoose = require('mongoose');

const contactPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String },
  email: { type: String, lowercase: true, trim: true },
  mobile: { type: String, required: true },
  alternateMobile: { type: String },
  isPrimary: { type: Boolean, default: false }
});

const addressSchema = new mongoose.Schema({
  addressType: { type: String, enum: ['Billing', 'Shipping', 'Both'], default: 'Both' },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    customerCategory: {
      type: String,
      enum: ['Hospital & Healthcare', 'Pharmaceutical', 'Research & Biotech', 'Blood Bank', 'Educational / University', 'Industrial', 'Government', 'OEM / Dealer', 'Other'],
      default: 'Hospital & Healthcare'
    },
    industry: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    gstin: {
      type: String,
      uppercase: true,
      trim: true
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true
    },
    paymentTerms: {
      type: String,
      default: '30% Advance, 70% against delivery / Proforma Invoice'
    },
    contacts: [contactPersonSchema],
    billingAddresses: [addressSchema],
    shippingAddresses: [addressSchema],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    notes: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
