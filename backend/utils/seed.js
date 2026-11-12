const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const Estimation = require('../models/Estimation');
const FollowUp = require('../models/FollowUp');
const LeadDecision = require('../models/LeadDecision');
const Quotation = require('../models/Quotation');
const Negotiation = require('../models/Negotiation');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const PaymentReceipt = require('../models/PaymentReceipt');
const SalesOrder = require('../models/SalesOrder');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Counter = require('../models/Counter');
const { generateQuotationPDF, generateProformaInvoicePDF, generateSalesOrderPDF } = require('../services/pdfService');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cryo_scientific_erp';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Customer.deleteMany(),
      Product.deleteMany(),
      Enquiry.deleteMany(),
      Estimation.deleteMany(),
      FollowUp.deleteMany(),
      LeadDecision.deleteMany(),
      Quotation.deleteMany(),
      Negotiation.deleteMany(),
      ProformaInvoice.deleteMany(),
      CustomerPurchaseOrder.deleteMany(),
      PaymentReceipt.deleteMany(),
      SalesOrder.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
      Counter.deleteMany()
    ]);
    console.log('[Seed] Cleared old collections');

    // 1. Create Users for all 10 Roles
    const password = 'Password@123';
    const usersData = [
      { name: 'Dr. K. Ramanathan', email: 'admin@cryoscientific.com', role: 'Super Admin', department: 'Administration', phone: '+91 98400 11001' },
      { name: 'V. Sundaram', email: 'director@cryoscientific.com', role: 'MD / Director', department: 'Executive Management', phone: '+91 98400 11002' },
      { name: 'Karthik Narayanan', email: 'sales.manager@cryoscientific.com', role: 'Sales Manager', department: 'Sales & Marketing', phone: '+91 98400 11003' },
      { name: 'Rajesh Kumar', email: 'sales.rajesh@cryoscientific.com', role: 'Sales Executive', department: 'Sales & Marketing', phone: '+91 98400 11004' },
      { name: 'Arun Balaji', email: 'estimate.arun@cryoscientific.com', role: 'Estimation Engineer', department: 'Engineering & Estimation', phone: '+91 98400 11005' },
      { name: 'Dr. M. Sridhar', email: 'engg.manager@cryoscientific.com', role: 'Engineering Manager', department: 'Engineering & Estimation', phone: '+91 98400 11006' },
      { name: 'Venkatachalam R', email: 'accounts.manager@cryoscientific.com', role: 'Accounts Manager', department: 'Finance & Accounts', phone: '+91 98400 11007' },
      { name: 'Priya Dharshini', email: 'accounts.priya@cryoscientific.com', role: 'Accounts Executive', department: 'Finance & Accounts', phone: '+91 98400 11008' },
      { name: 'G. Natarajan', email: 'prod.manager@cryoscientific.com', role: 'Production Manager', department: 'Production & Manufacturing', phone: '+91 98400 11009' },
      { name: 'Anand Mohan', email: 'purchase.manager@cryoscientific.com', role: 'Purchase Manager', department: 'Purchase & Supply Chain', phone: '+91 98400 11010' }
    ];

    const users = await User.create(usersData.map(u => ({ ...u, password })));
    console.log(`[Seed] Created ${users.length} staff users`);

    const adminUser = users[0];
    const salesExec = users[3];
    const salesMgr = users[2];
    const enggMgr = users[5];
    const accMgr = users[6];
    const mdUser = users[1];

    // 2. Create Products
    const productsData = [
      {
        productId: 'CRY-0001',
        productName: 'Ultra-Low Temperature Freezer (-86°C) 400L',
        category: 'Ultra-Low Temperature Freezers (-86°C)',
        modelNumber: 'CRYO-ULT-400V',
        description: 'Upright Ultra-Low Temperature Freezer with Dual Cascade Hermetic Refrigeration System and 7" Smart Touchscreen Controller.',
        standardCost: 280000,
        sellingPrice: 425000,
        gstRate: 18,
        warrantyMonths: 24,
        technicalSpecifications: {
          temperatureRange: '-50°C to -86°C',
          capacityLitres: 400,
          chamberDimensions: '600 x 600 x 1110 mm',
          externalDimensions: '890 x 980 x 1980 mm',
          powerSupply: '230V AC, 50Hz, 1 Phase, 16A',
          refrigerant: 'Hydrocarbon Eco Refrigerants R290 / R170',
          sensorType: 'Dual Class A PT-100 RTD Sensors',
          controllerType: 'PLC 7" High-Resolution Touchscreen with Data Logger',
          interiorMaterial: 'AISI 304 Electro-polished Stainless Steel',
          exteriorMaterial: 'Heavy Gauge Corrosion-resistant Galvanized Steel'
        }
      },
      {
        productId: 'CRY-0002',
        productName: 'Ultra-Low Temperature Freezer (-86°C) 700L',
        category: 'Ultra-Low Temperature Freezers (-86°C)',
        modelNumber: 'CRYO-ULT-700V',
        description: 'High Capacity Upright Deep Freezer for Pharma and Vaccine Storage with VIP Insulation.',
        standardCost: 410000,
        sellingPrice: 620000,
        gstRate: 18,
        warrantyMonths: 24,
        technicalSpecifications: {
          temperatureRange: '-50°C to -86°C',
          capacityLitres: 700,
          chamberDimensions: '760 x 750 x 1230 mm',
          externalDimensions: '1050 x 1030 x 1990 mm',
          powerSupply: '230V AC, 50Hz, 1 Phase, 20A',
          refrigerant: 'Green Cascade Refrigerants',
          sensorType: 'Dual PT-100 RTD',
          controllerType: 'Microprocessor PLC Controller'
        }
      },
      {
        productId: 'CRY-0003',
        productName: 'Blood Bank Refrigerator (4°C) 300 Bags',
        category: 'Blood Bank Refrigerators (4°C)',
        modelNumber: 'CRYO-BBR-300',
        description: 'Certified Medical Blood Bank Storage Refrigerator conforming to WHO / DGHS Standards with 7-Day Chart Recorder.',
        standardCost: 160000,
        sellingPrice: 245000,
        gstRate: 18,
        warrantyMonths: 24,
        technicalSpecifications: {
          temperatureRange: '+2°C to +6°C (Factory set at +4°C)',
          capacityLitres: 350,
          chamberDimensions: '580 x 600 x 1000 mm',
          externalDimensions: '750 x 850 x 1850 mm',
          powerSupply: '230V AC, 50Hz',
          refrigerant: 'R134a CFC Free',
          sensorType: 'Simulated Blood Bag Sensor & Air Sensor',
          controllerType: 'Microprocessor PID with Dual Temperature Sensors'
        }
      },
      {
        productId: 'CRY-0004',
        productName: 'Fresh Frozen Plasma Freezer (-40°C) 350L',
        category: 'Plasma Freezers (-40°C)',
        modelNumber: 'CRYO-FFP-350',
        description: 'Rapid Blast Plasma Freezer for Blood Component Separation Centers with pull-down time under 120 mins.',
        standardCost: 195000,
        sellingPrice: 310000,
        gstRate: 18,
        warrantyMonths: 24,
        technicalSpecifications: {
          temperatureRange: '-20°C to -40°C',
          capacityLitres: 350,
          chamberDimensions: '600 x 620 x 950 mm',
          externalDimensions: '800 x 900 x 1850 mm',
          powerSupply: '230V AC, 50Hz',
          refrigerant: 'R404a Eco Blend',
          sensorType: 'PT-100 RTD',
          controllerType: 'Digital Touch Controller with USB Data Export'
        }
      },
      {
        productId: 'CRY-0005',
        productName: 'Liquid Nitrogen Cryogenic Storage Dewar (50L)',
        category: 'Liquid Nitrogen Containers & Dewars',
        modelNumber: 'CRYO-LN2-50L',
        description: 'Super-insulated Aluminum Biological Cryo Container with Rack and Cryobox canisters.',
        standardCost: 55000,
        sellingPrice: 95000,
        gstRate: 18,
        warrantyMonths: 36,
        technicalSpecifications: {
          temperatureRange: '-196°C',
          capacityLitres: 50,
          chamberDimensions: 'Neck Diameter 125 mm',
          externalDimensions: '500 x 500 x 850 mm',
          powerSupply: 'Passive Vacuum Cryogenic Vessel',
          refrigerant: 'Liquid Nitrogen LN2',
          sensorType: 'Low Level Alarm Sensor',
          controllerType: 'Autonomous Battery-powered Level Monitor'
        }
      },
      {
        productId: 'CRY-0006',
        productName: 'Laboratory Freeze Dryer (Lyophilizer) 6 Kg',
        category: 'Laboratory Freeze Dryers / Lyophilizers',
        modelNumber: 'CRYO-LYO-6K',
        description: 'Benchtop Vacuum Lyophilizer with -80°C Condenser for Bio-samples and Pharmaceutical Formulations.',
        standardCost: 350000,
        sellingPrice: 540000,
        gstRate: 18,
        warrantyMonths: 12,
        technicalSpecifications: {
          temperatureRange: 'Condenser -85°C, Ultimate Vacuum < 0.05 mbar',
          capacityLitres: 6,
          chamberDimensions: 'Acrylic Chamber 300 mm Dia x 400 mm H',
          externalDimensions: '750 x 700 x 600 mm',
          powerSupply: '230V AC, 50Hz',
          refrigerant: 'Cascade CFC-free',
          sensorType: 'Pirani Vacuum Gauge & Temp Probes',
          controllerType: 'PLC Touch Interface with Freeze-Drying Recipes'
        }
      }
    ];

    const products = await Product.create(productsData);
    console.log(`[Seed] Created ${products.length} catalog products`);

    // 3. Create Customers
    const customersData = [
      {
        customerCode: 'CUST-0001',
        companyName: 'Apex Super Specialty Hospital & Research Institute',
        customerCategory: 'Hospital & Healthcare',
        industry: 'Healthcare & Clinical Research',
        website: 'https://www.apexhealth.org',
        gstin: '33AAACA1122B1Z8',
        pan: 'AAACA1122B',
        paymentTerms: '30% Advance, 70% against delivery/PI',
        contacts: [
          { name: 'Dr. Anand Raman', designation: 'Medical Director', email: 'anand.raman@apexhealth.org', mobile: '+91 94440 22001', isPrimary: true },
          { name: 'K. Sridhar', designation: 'Purchase Officer', email: 'purchase@apexhealth.org', mobile: '+91 94440 22002', isPrimary: false }
        ],
        billingAddresses: [{ addressLine1: '45, Grand Southern Trunk Road', city: 'Chennai', state: 'Tamil Nadu', pinCode: '600043', country: 'India', isDefault: true }],
        shippingAddresses: [{ addressLine1: 'Apex Hospital Biomedical Stores, Block B', city: 'Chennai', state: 'Tamil Nadu', pinCode: '600043', country: 'India', isDefault: true }],
        createdBy: adminUser._id
      },
      {
        customerCode: 'CUST-0002',
        companyName: 'BioGen Therapeutics India Pvt. Ltd.',
        customerCategory: 'Pharmaceutical',
        industry: 'Biopharmaceuticals & Vaccines',
        website: 'https://www.biogentherapeutics.in',
        gstin: '36AAACB9988C1Z2',
        pan: 'AAACB9988C',
        paymentTerms: '30% Advance with PO, 70% before dispatch',
        contacts: [
          { name: 'P. Meenakshi', designation: 'Head of Quality & Storage', email: 'meenakshi@biogentherapeutics.in', mobile: '+91 98840 33001', isPrimary: true }
        ],
        billingAddresses: [{ addressLine1: 'Plot 18, Genome Valley, Shamirpet', city: 'Hyderabad', state: 'Telangana', pinCode: '500078', country: 'India', isDefault: true }],
        shippingAddresses: [{ addressLine1: 'Plot 18, Genome Valley, Shamirpet', city: 'Hyderabad', state: 'Telangana', pinCode: '500078', country: 'India', isDefault: true }],
        createdBy: adminUser._id
      },
      {
        customerCode: 'CUST-0003',
        companyName: 'Apollo Regional Blood Bank Services',
        customerCategory: 'Blood Bank',
        industry: 'Transfusion Medicine',
        website: 'https://www.apollohospitals.com',
        gstin: '29AAACC7766D1Z5',
        pan: 'AAACC7766D',
        paymentTerms: '50% Advance, balance against installation',
        contacts: [
          { name: 'Dr. Kavitha Menon', designation: 'Senior Blood Transfusion Officer', email: 'kavitha.m@apolloblood.org', mobile: '+91 97400 44001', isPrimary: true }
        ],
        billingAddresses: [{ addressLine1: '21/2, Bannerghatta Road', city: 'Bengaluru', state: 'Karnataka', pinCode: '560076', country: 'India', isDefault: true }],
        shippingAddresses: [{ addressLine1: 'Apollo Central Blood Center, Bannerghatta Road', city: 'Bengaluru', state: 'Karnataka', pinCode: '560076', country: 'India', isDefault: true }],
        createdBy: adminUser._id
      },
      {
        customerCode: 'CUST-0004',
        companyName: 'National Institute of Virology (NIV)',
        customerCategory: 'Research & Biotech',
        industry: 'Virology & Government Research',
        website: 'https://www.niv.co.in',
        gstin: '27AAACN5544E1Z3',
        pan: 'AAACN5544E',
        paymentTerms: '100% against delivery and satisfactory installation (Govt PO)',
        contacts: [
          { name: 'Dr. Vivek Deshmukh', designation: 'Principal Scientist - Cryo Biobank', email: 'v.deshmukh@niv.res.in', mobile: '+91 98220 55001', isPrimary: true }
        ],
        billingAddresses: [{ addressLine1: '20-A, Dr. Ambedkar Road', city: 'Pune', state: 'Maharashtra', pinCode: '411001', country: 'India', isDefault: true }],
        shippingAddresses: [{ addressLine1: 'NIV Biobank Facility, Pashan Campus', city: 'Pune', state: 'Maharashtra', pinCode: '411008', country: 'India', isDefault: true }],
        createdBy: adminUser._id
      }
    ];

    const customers = await Customer.create(customersData);
    console.log(`[Seed] Created ${customers.length} business customers`);

    // 4. Create Enquiries
    const enquiry1 = await Enquiry.create({
      enquiryNumber: 'ENQ-2026-0001',
      enquiryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      enquirySource: 'Email',
      enquiryType: 'Existing Customer',
      priority: 'High',
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      companyName: customers[0].companyName,
      contactPerson: 'Dr. Anand Raman',
      designation: 'Medical Director',
      mobileNumber: '+91 94440 22001',
      email: 'anand.raman@apexhealth.org',
      gstin: customers[0].gstin,
      pan: customers[0].pan,
      city: 'Chennai',
      state: 'Tamil Nadu',
      billingAddress: '45, Grand Southern Trunk Road, Chennai - 600043',
      shippingAddress: 'Apex Hospital Biomedical Stores, Block B, Chennai - 600043',
      assignedTo: salesExec._id,
      department: 'Sales & Marketing',
      status: 'Sales Order Created',
      products: [
        {
          product: products[0]._id,
          productName: products[0].productName,
          category: products[0].category,
          modelNumber: products[0].modelNumber,
          quantity: 2,
          unit: 'Nos',
          application: 'Clinical Trial Biological Sample Storage at -80°C',
          technicalRequirements: 'Dual cascade refrigeration, 7-inch touch controller with USB logging, PT-100 class A sensor, battery backup',
          temperatureRequirements: '-86°C setpoint',
          installationRequired: true,
          requiredDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          expectedBudget: 900000,
          customerRemarks: 'Urgent requirement for NABL accredited storage facility.'
        }
      ],
      createdBy: salesExec._id
    });

    const enquiry2 = await Enquiry.create({
      enquiryNumber: 'ENQ-2026-0002',
      enquiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      enquirySource: 'Direct Visit',
      enquiryType: 'New Customer',
      priority: 'High',
      customer: customers[1]._id,
      customerName: customers[1].companyName,
      companyName: customers[1].companyName,
      contactPerson: 'P. Meenakshi',
      designation: 'Head of Quality & Storage',
      mobileNumber: '+91 98840 33001',
      email: 'meenakshi@biogentherapeutics.in',
      gstin: customers[1].gstin,
      city: 'Hyderabad',
      state: 'Telangana',
      billingAddress: 'Plot 18, Genome Valley, Shamirpet, Hyderabad - 500078',
      shippingAddress: 'Plot 18, Genome Valley, Shamirpet, Hyderabad - 500078',
      assignedTo: salesExec._id,
      department: 'Sales & Marketing',
      status: 'Quotation Sent',
      products: [
        {
          product: products[1]._id,
          productName: products[1].productName,
          category: products[1].category,
          modelNumber: products[1].modelNumber,
          quantity: 1,
          unit: 'Nos',
          application: 'Vaccine Bulk Formulation Master Cell Bank Storage',
          temperatureRequirements: '-80°C to -86°C steady state',
          installationRequired: true,
          expectedBudget: 650000
        }
      ],
      createdBy: salesExec._id
    });

    const enquiry3 = await Enquiry.create({
      enquiryNumber: 'ENQ-2026-0003',
      enquiryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      enquirySource: 'Website',
      enquiryType: 'Existing Customer',
      priority: 'Medium',
      customer: customers[2]._id,
      customerName: customers[2].companyName,
      companyName: customers[2].companyName,
      contactPerson: 'Dr. Kavitha Menon',
      mobileNumber: '+91 97400 44001',
      email: 'kavitha.m@apolloblood.org',
      city: 'Bengaluru',
      state: 'Karnataka',
      assignedTo: salesExec._id,
      status: 'Under Estimation',
      products: [
        {
          product: products[2]._id,
          productName: products[2].productName,
          category: products[2].category,
          modelNumber: products[2].modelNumber,
          quantity: 3,
          unit: 'Nos',
          temperatureRequirements: '+4°C +/- 1°C',
          installationRequired: true
        }
      ],
      createdBy: salesExec._id
    });

    const enquiry4 = await Enquiry.create({
      enquiryNumber: 'ENQ-2026-0004',
      enquiryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      enquirySource: 'Tender / Portal',
      enquiryType: 'New Customer',
      priority: 'Low',
      customer: customers[3]._id,
      customerName: customers[3].companyName,
      companyName: customers[3].companyName,
      contactPerson: 'Dr. Vivek Deshmukh',
      mobileNumber: '+91 98220 55001',
      email: 'v.deshmukh@niv.res.in',
      city: 'Pune',
      state: 'Maharashtra',
      assignedTo: salesExec._id,
      status: 'Lost',
      products: [
        {
          product: products[4]._id,
          productName: products[4].productName,
          category: products[4].category,
          modelNumber: products[4].modelNumber,
          quantity: 4,
          unit: 'Nos'
        }
      ],
      createdBy: salesExec._id
    });

    console.log(`[Seed] Created 4 sample enquiries`);

    // 5. Create Estimations
    const estimation1 = await Estimation.create({
      estimateNumber: 'EST-2026-0001',
      estimateDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      enquiry: enquiry1._id,
      enquiryNumber: enquiry1.enquiryNumber,
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      items: [
        {
          product: products[0]._id,
          productName: products[0].productName,
          modelNumber: products[0].modelNumber,
          quantity: 2,
          costingLines: [
            { category: 'Raw Materials', itemName: 'SS 304 Electro-polished Inner Chamber Sheets', quantity: 2, unit: 'Set', unitPrice: 45000, totalAmount: 90000 },
            { category: 'Raw Materials', itemName: 'Heavy Gauge Mild Steel Outer Casing & PUF Insulation', quantity: 2, unit: 'Set', unitPrice: 38000, totalAmount: 76000 },
            { category: 'Sensors', itemName: 'Dual Class A PT-100 RTD Sensors with Calibration', quantity: 4, unit: 'Nos', unitPrice: 6500, totalAmount: 26000 },
            { category: 'Controllers', itemName: '7-inch Colour Touchscreen PLC Controller with Data Logging', quantity: 2, unit: 'Nos', unitPrice: 35000, totalAmount: 70000 },
            { category: 'Electrical Components', itemName: 'Danfoss / Secop Cascade Compressors Dual Stage', quantity: 4, unit: 'Nos', unitPrice: 48000, totalAmount: 192000 },
            { category: 'Labour', itemName: 'Skilled Refrigeration Piping & Vacuum Brazing', quantity: 2, unit: 'Job', unitPrice: 18000, totalAmount: 36000 },
            { category: 'Testing & Calibration', itemName: '72-Hour Continuous Pull-Down & Temperature Mapping Test', quantity: 2, unit: 'Job', unitPrice: 15000, totalAmount: 30000 },
            { category: 'Packing', itemName: 'Export Quality Heavy Duty Wooden Pallet Packing', quantity: 2, unit: 'Set', unitPrice: 12000, totalAmount: 24000 },
            { category: 'Transportation', itemName: 'Dedicated Shock-Absorbing Transit to Chennai Site', quantity: 1, unit: 'Trip', unitPrice: 16000, totalAmount: 16000 }
          ],
          totalEstimatedCost: 560000,
          profitMarginPercent: 25,
          profitAmount: 140000,
          sellingPrice: 700000,
          gstPercent: 18,
          gstAmount: 126000,
          finalEstimatedAmount: 826000
        }
      ],
      totalCost: 560000,
      totalProfit: 140000,
      totalSellingPrice: 700000,
      totalGst: 126000,
      grandTotal: 826000,
      revisionNumber: 1,
      preparedBy: users[4]._id,
      reviewedBy: enggMgr._id,
      status: 'Approved',
      reviewRemarks: 'Technical costing verified against engineering BOM. Cascade compressors and PT-100 specs approved.'
    });

    console.log(`[Seed] Created Estimation 1`);

    // 6. Create Follow-up records
    await FollowUp.create([
      {
        followUpId: 'FOL-2026-0001',
        enquiry: enquiry1._id,
        enquiryNumber: enquiry1.enquiryNumber,
        customer: customers[0]._id,
        customerName: customers[0].companyName,
        contactPerson: 'Dr. Anand Raman',
        followUpDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
        followUpType: 'Call',
        discussionDetails: 'Discussed technical requirement of ULT-400V. Customer confirmed they need two units with IQ/OQ documentation.',
        customerResponse: 'Positive / High Interest',
        nextFollowUpDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        assignedTo: salesExec._id,
        remarks: 'Move to formal quotation.',
        status: 'Completed',
        createdBy: salesExec._id
      },
      {
        followUpId: 'FOL-2026-0002',
        enquiry: enquiry2._id,
        enquiryNumber: enquiry2.enquiryNumber,
        customer: customers[1]._id,
        customerName: customers[1].companyName,
        contactPerson: 'P. Meenakshi',
        followUpDate: new Date(),
        followUpType: 'Meeting',
        discussionDetails: 'Plant visit at Genome Valley. Customer asked for quotation version with 5% commercial discount.',
        customerResponse: 'Price Negotiation Requested',
        nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedTo: salesExec._id,
        status: 'Scheduled',
        createdBy: salesExec._id
      }
    ]);

    // 7. Lead Decision
    await LeadDecision.create([
      {
        enquiry: enquiry1._id,
        enquiryNumber: enquiry1.enquiryNumber,
        customer: customers[0]._id,
        customerName: customers[0].companyName,
        expectedOrderValue: 826000,
        decisionDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        leadStatus: 'Won',
        reason: 'Technical Superiority Won',
        remarks: 'Customer accepted Cryo Scientific dual cascade reliability and NABL calibration.',
        updatedBy: salesExec._id
      },
      {
        enquiry: enquiry4._id,
        enquiryNumber: enquiry4.enquiryNumber,
        customer: customers[3]._id,
        customerName: customers[3].companyName,
        expectedOrderValue: 380000,
        decisionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        leadStatus: 'Lost',
        reason: 'Price Too High',
        remarks: 'Customer chose lower tier imported dewar model with budget pricing.',
        updatedBy: salesExec._id
      }
    ]);

    // 8. Create Quotations
    const quotation1 = await Quotation.create({
      quotationNumber: 'QUO-2026-0001',
      version: 1,
      versionLabel: 'V1',
      quotationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      enquiry: enquiry1._id,
      enquiryNumber: enquiry1.enquiryNumber,
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      billingAddress: '45, Grand Southern Trunk Road, Chennai - 600043',
      shippingAddress: 'Apex Hospital Biomedical Stores, Block B, Chennai - 600043',
      estimateReference: estimation1._id,
      estimateNumber: estimation1.estimateNumber,
      products: [
        {
          product: products[0]._id,
          productCode: products[0].productId,
          productName: products[0].productName,
          model: products[0].modelNumber,
          description: products[0].description,
          technicalSpecifications: 'Dual Cascade Hermetic Refrigeration (-86°C), PT-100 RTD Class A, 7" Touch PLC Controller, 24 Months Warranty',
          quantity: 2,
          unit: 'Nos',
          unitPrice: 350000,
          discountPercent: 0,
          discountAmount: 0,
          taxableAmount: 700000,
          gstPercent: 18,
          gstAmount: 126000,
          lineTotal: 826000
        }
      ],
      subtotal: 700000,
      discountTotal: 0,
      taxableAmount: 700000,
      gstTotal: 126000,
      grandTotal: 826000,
      commercialTerms: {
        paymentTerms: '30% Advance with PO, 70% against Proforma Invoice prior to dispatch.',
        deliveryPeriod: '4 to 6 weeks from date of technically & commercially clear Purchase Order with advance.',
        warranty: '24 Months comprehensive on-site warranty from date of installation.',
        installationCharges: 'Free of charge commissioning by Cryo certified service engineers.',
        freightTerms: 'Ex-Works Chennai Factory'
      },
      status: 'Accepted',
      preparedBy: salesExec._id,
      approvedBy: salesMgr._id,
      approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      sentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      sentChannel: 'Email',
      isLocked: true
    });

    try {
      const qPdf = await generateQuotationPDF(quotation1);
      quotation1.pdfUrl = qPdf;
      await quotation1.save();
    } catch (e) {
      console.error(e);
    }

    console.log(`[Seed] Created Quotation 1`);

    // 9. Customer Negotiation & Acceptance
    await Negotiation.create({
      quotation: quotation1._id,
      quotationNumber: quotation1.quotationNumber,
      version: 1,
      versionLabel: 'V1',
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      enquiry: enquiry1._id,
      customerResponse: 'Accepted',
      customerRemarks: 'Quotation V1 terms accepted. Issuing official PO for 2 units.',
      managerApprovalStatus: 'Approved',
      approvedBy: salesMgr._id,
      approvedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
    });

    // 10. Proforma Invoice
    const pi1 = await ProformaInvoice.create({
      piNumber: 'PI-2026-0001',
      piDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      validityDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      billingAddress: '45, Grand Southern Trunk Road, Chennai - 600043',
      shippingAddress: 'Apex Hospital Biomedical Stores, Block B, Chennai - 600043',
      enquiry: enquiry1._id,
      enquiryNumber: enquiry1.enquiryNumber,
      quotation: quotation1._id,
      quotationNumber: quotation1.quotationNumber,
      quotationVersion: 'V1',
      products: [
        {
          product: products[0]._id,
          productCode: products[0].productId,
          productName: products[0].productName,
          model: products[0].modelNumber,
          description: products[0].description,
          quantity: 2,
          unit: 'Nos',
          unitPrice: 350000,
          discountPercent: 0,
          taxableAmount: 700000,
          gstPercent: 18,
          gstAmount: 126000,
          lineTotal: 826000
        }
      ],
      totalTaxableAmount: 700000,
      totalGstAmount: 126000,
      totalPiAmount: 826000,
      advancePercentage: 30,
      advanceAmount: 247800,
      balancePercentage: 70,
      balanceAmount: 578200,
      paymentTerms: '30% Advance (₹2,47,800), 70% balance before dispatch.',
      status: 'Partially Paid',
      approvedBy: accMgr._id,
      approvedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      createdBy: salesExec._id
    });

    try {
      const piPdf = await generateProformaInvoicePDF(pi1);
      pi1.pdfUrl = piPdf;
      await pi1.save();
    } catch (e) {
      console.error(e);
    }

    console.log(`[Seed] Created Proforma Invoice 1`);

    // 11. Customer PO Receiving & 3-Way Match
    const cpo1 = await CustomerPurchaseOrder.create({
      receiptId: 'CPO-2026-0001',
      customerPoNumber: 'APEX/PUR/2026/0892',
      customerPoDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      enquiry: enquiry1._id,
      enquiryNumber: enquiry1.enquiryNumber,
      quotation: quotation1._id,
      quotationNumber: quotation1.quotationNumber,
      proformaInvoice: pi1._id,
      piNumber: pi1.piNumber,
      poValue: 826000,
      currency: 'INR',
      deliveryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      paymentTerms: '30% Advance, 70% before dispatch',
      billingAddress: '45, Grand Southern Trunk Road, Chennai - 600043',
      shippingAddress: 'Apex Hospital Biomedical Stores, Block B, Chennai - 600043',
      verificationStatus: 'Verified',
      verificationChecks: {
        productModelMatch: true,
        quantityMatch: true,
        unitPriceMatch: true,
        totalValueMatch: true,
        gstRateMatch: true,
        deliveryPeriodMatch: true,
        paymentTermsMatch: true,
        technicalSpecsMatch: true,
        mismatchNotes: 'All 8 commercial and technical check parameters 100% matched with Quote QUO-2026-0001 V1.',
        verifiedBy: enggMgr._id,
        verifiedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      },
      receivedBy: salesExec._id,
      remarks: 'Customer PO verified and approved for SO booking.'
    });

    console.log(`[Seed] Created Customer PO 1 (Verified)`);

    // 12. Payment Receipt
    await PaymentReceipt.create({
      receiptNumber: 'REC-2026-0001',
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      proformaInvoice: pi1._id,
      piNumber: pi1.piNumber,
      customerPurchaseOrder: cpo1._id,
      customerPoNumber: cpo1.customerPoNumber,
      paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      paymentMode: 'RTGS',
      transactionId: 'RTGS/HDFC998812048/APEX',
      bankAccount: 'State Bank of India (A/C: 382910482910)',
      amountReceived: 247800,
      tdsDeduction: 0,
      netCreditAmount: 247800,
      status: 'Verified',
      verifiedBy: accMgr._id,
      verifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      verificationNotes: 'Advance payment of ₹2,47,800 credited in SBI Ambattur current account.',
      createdBy: users[7]._id
    });

    console.log(`[Seed] Created Payment Receipt 1 (Verified)`);

    // 13. Sales Order (SO) - Full Department Approvals & Released for Production
    const so1 = await SalesOrder.create({
      soNumber: 'SO-2026-0001',
      soDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      enquiry: enquiry1._id,
      enquiryNumber: enquiry1.enquiryNumber,
      customer: customers[0]._id,
      customerName: customers[0].companyName,
      quotation: quotation1._id,
      quotationNumber: quotation1.quotationNumber,
      quotationVersion: 'V1',
      proformaInvoice: pi1._id,
      piNumber: pi1.piNumber,
      customerPurchaseOrder: cpo1._id,
      customerPoNumber: cpo1.customerPoNumber,
      customerPoDate: cpo1.customerPoDate,
      salesPerson: salesExec._id,
      salesPersonName: salesExec.name,
      orderType: 'Standard Equipment',
      priority: 'High',
      deliveryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      billingAddress: '45, Grand Southern Trunk Road, Chennai - 600043',
      shippingAddress: 'Apex Hospital Biomedical Stores, Block B, Chennai - 600043',
      products: [
        {
          product: products[0]._id,
          productCode: products[0].productId,
          productName: products[0].productName,
          model: products[0].modelNumber,
          description: products[0].description,
          technicalSpecification: 'Dual Stage Cascade Freezers (-86°C), PT-100 RTD Class A, 7" Touchscreen PLC, 24 Months Warranty',
          quantity: 2,
          unit: 'Nos',
          unitPrice: 350000,
          discount: 0,
          taxableAmount: 700000,
          gstPercent: 18,
          gstAmount: 126000,
          totalAmount: 826000,
          deliverySchedule: 'Delivery in 4 weeks',
          installationRequired: true,
          warranty: '24 Months'
        }
      ],
      soValue: 826000,
      advanceRequired: 247800,
      advanceReceived: 247800,
      balanceAmount: 578200,
      paymentTerms: '30% advance received, balance 70% against delivery.',
      paymentStatus: 'Advance Received',
      approvals: {
        salesApproval: { status: 'Approved', approvedBy: salesMgr._id, approvedByName: salesMgr.name, approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), remarks: 'Sales terms verified.' },
        accountsApproval: { status: 'Approved', approvedBy: accMgr._id, approvedByName: accMgr.name, approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), remarks: 'Advance RTGS verified in bank statement.' },
        technicalApproval: { status: 'Approved', approvedBy: enggMgr._id, approvedByName: enggMgr.name, approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), remarks: 'Production drawings and cascade schematics validated.' },
        productionFeasibilityApproval: { status: 'Approved', approvedBy: users[8]._id, approvedByName: users[8].name, approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), remarks: 'Plant line 2 slot booked for assembly.' },
        managementApproval: { status: 'Approved', approvedBy: mdUser._id, approvedByName: mdUser.name, approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), remarks: 'Approved for manufacturing release.' }
      },
      soStatus: 'Released to Production',
      releaseForExecution: {
        isReleased: true,
        releasedBy: mdUser._id,
        releasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        productionNotificationSent: true,
        purchaseNotificationSent: true,
        releaseNotes: 'All 5 departmental approvals satisfied. Released to plant production.'
      },
      orderHistory: [
        { action: 'Sales Order Created', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), performedBy: salesExec._id, performedByName: salesExec.name, details: 'Initial booking' },
        { action: 'Departmental Approvals Cleared', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), performedBy: mdUser._id, performedByName: mdUser.name, details: 'All 5 gates cleared' },
        { action: 'Released for Production', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), performedBy: mdUser._id, performedByName: mdUser.name, details: 'Production and Purchase notified' }
      ],
      createdBy: salesExec._id
    });

    try {
      const soPdf = await generateSalesOrderPDF(so1);
      so1.pdfUrl = soPdf;
      await so1.save();
    } catch (e) {
      console.error(e);
    }

    console.log(`[Seed] Created Sales Order 1 (Released to Production)`);

    // 14. Notifications & Counters
    await Notification.create([
      {
        title: 'Sales Order SO-2026-0001 Released to Plant',
        message: 'Order for Apex Hospital (2 x ULT-400V Freezers) released for fabrication.',
        link: `/sales-orders/${so1._id}`,
        type: 'SalesOrder'
      },
      {
        title: 'New Enquiry ENQ-2026-0003 Under Estimation',
        message: 'Dr. Kavitha Menon (Apollo Blood Bank) enquiry awaits BOM costing review.',
        link: `/enquiries/${enquiry3._id}`,
        type: 'Enquiry'
      }
    ]);

    // Counters update
    await Counter.create([
      { key: 'ENQ-2026', sequenceValue: 4 },
      { key: 'EST-2026', sequenceValue: 1 },
      { key: 'FOL-2026', sequenceValue: 2 },
      { key: 'QUO-2026', sequenceValue: 1 },
      { key: 'PI-2026', sequenceValue: 1 },
      { key: 'CPO-2026', sequenceValue: 1 },
      { key: 'REC-2026', sequenceValue: 1 },
      { key: 'SO-2026', sequenceValue: 1 },
      { key: 'CUST-CODE', sequenceValue: 4 },
      { key: 'PRD-CODE', sequenceValue: 6 }
    ]);

    console.log('[Seed] Database successfully seeded with realistic Cryo Scientific ERP data!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
