const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
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
      name: { type: String, required: true },
      designation: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
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
    gstin: {
      type: String,
      trim: true,
      default: ''
    },
    pan: {
      type: String,
      trim: true,
      default: ''
    },
    billingAddress: {
      type: addressSchema,
      default: () => ({})
    },
    shippingAddress: {
      type: addressSchema,
      default: () => ({})
    },
    industry: {
      type: String,
      default: 'Cryogenics / Research & Industrial'
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

customerSchema.index({ companyName: 'text', customerCode: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);

