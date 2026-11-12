const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema(
  {
    soNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    soDate: {
      type: Date,
      default: Date.now
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true
    },
    quotationRevision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuotationRevision',
      required: true
    },
    proformaInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProformaInvoice',
      default: null
    },
    customerPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerPurchaseOrder',
      required: true
    },
    poVerification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'POVerification',
      required: true
    },
    items: [
      {
        itemCode: { type: String, default: '' },
        productName: { type: String, required: true },
        specification: { type: String, default: '' },
        hsnCode: { type: String, default: '841869' },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'Nos' },
        unitPrice: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        taxableAmount: { type: Number, required: true },
        gstRate: { type: Number, default: 18 },
        gstAmount: { type: Number, required: true },
        totalAmount: { type: Number, required: true }
      }
    ],
    subTotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    totalGst: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    deliverySchedule: {
      type: String,
      required: true
    },
    committedDispatchDate: {
      type: Date,
      required: true
    },
    paymentTerms: {
      type: String,
      required: true
    },
    warranty: {
      type: String,
      default: '12 Months warranty from commissioning'
    },
    specialInstructions: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Handed Over to Production', 'In Production', 'Ready for Dispatch', 'Cancelled'],
      default: 'Confirmed'
    },
    productionHandover: {
      isHandedOver: {
        type: Boolean,
        default: false
      },
      handoverDate: {
        type: Date,
        default: null
      },
      handedOverBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      handoverRemarks: {
        type: String,
        default: ''
      },
      targetCompletionDate: {
        type: Date,
        default: null
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

salesOrderSchema.index({ soNumber: 1, customer: 1, lead: 1, status: 1 });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);

