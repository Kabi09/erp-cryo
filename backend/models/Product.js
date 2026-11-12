const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Ultra-Low Temperature Freezers (-86°C)',
        'Blood Bank Refrigerators (4°C)',
        'Plasma Freezers (-40°C)',
        'Cryo Chambers & Storage',
        'Liquid Nitrogen Containers & Dewars',
        'Laboratory Freeze Dryers / Lyophilizers',
        'Mortuary Chambers & Cabinets',
        'Biological & BOD Incubators',
        'Walk-in Cold Rooms',
        'Custom Cryogenic Systems'
      ],
      default: 'Ultra-Low Temperature Freezers (-86°C)'
    },
    modelNumber: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    technicalSpecifications: {
      temperatureRange: { type: String, default: '-50°C to -86°C' },
      capacityLitres: { type: Number, default: 400 },
      chamberDimensions: { type: String, default: '600 x 600 x 1100 mm' },
      externalDimensions: { type: String, default: '850 x 950 x 1950 mm' },
      powerSupply: { type: String, default: '230V AC, 50Hz, 1 Phase' },
      refrigerant: { type: String, default: 'CFC-Free Eco Friendly Cascade Refrigerant' },
      sensorType: { type: String, default: 'PT-100 RTD Class A' },
      controllerType: { type: String, default: 'Microprocessor with 7" Colour Touchscreen PLC' },
      interiorMaterial: { type: String, default: 'Stainless Steel AISI 304 Grade' },
      exteriorMaterial: { type: String, default: 'Heavy Gauge Mild Steel Powder Coated' },
      batteryBackup: { type: String, default: '72 Hours Controller & Alarm Battery Backup' }
    },
    unit: {
      type: String,
      default: 'Nos'
    },
    standardCost: {
      type: Number,
      default: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      default: 0
    },
    gstRate: {
      type: Number,
      default: 18
    },
    warrantyMonths: {
      type: Number,
      default: 12
    },
    imageUrl: {
      type: String
    },
    drawingUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['Active', 'Discontinued', 'Under Development'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
