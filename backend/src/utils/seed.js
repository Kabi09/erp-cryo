require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const QuotationRevision = require('../models/QuotationRevision');
const ProformaInvoice = require('../models/ProformaInvoice');
const CustomerPurchaseOrder = require('../models/CustomerPurchaseOrder');
const POVerification = require('../models/POVerification');
const SalesOrder = require('../models/SalesOrder');
const Activity = require('../models/Activity');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cryo_sales_db';
    await mongoose.connect(mongoUri);
    console.log(`[Seed]: Connected to MongoDB at ${mongoUri}`);

    // Clean existing data for clean idempotent seed
    console.log('[Seed]: Resetting existing sales records...');
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Lead.deleteMany({}),
      Quotation.deleteMany({}),
      QuotationRevision.deleteMany({}),
      ProformaInvoice.deleteMany({}),
      CustomerPurchaseOrder.deleteMany({}),
      POVerification.deleteMany({}),
      SalesOrder.deleteMany({}),
      Activity.deleteMany({})
    ]);

    // 1. Create Default Sales Admin User
    console.log('[Seed]: Creating Sales Admin user...');
    const adminUser = await User.create({
      name: 'Sales Administrator',
      email: 'admin@cryoscientific.com',
      password: 'Admin@123', // Will be hashed by User pre-save hook
      role: 'sales_admin',
      department: 'Sales & Marketing',
      phone: '+91 98400 12345',
      isActive: true
    });

    const execUser = await User.create({
      name: 'Ramesh Sundaram',
      email: 'ramesh.s@cryoscientific.com',
      password: 'Sales@123',
      role: 'sales_executive',
      department: 'Cryo Equipment Sales',
      phone: '+91 98401 67890',
      isActive: true
    });

    console.log('[Seed]: Users created successfully (admin@cryoscientific.com / Admin@123)');

    // 2. Create Sample Customers
    console.log('[Seed]: Creating Customer master records...');
    const customer1 = await Customer.create({
      customerCode: 'CSS-CUST-0001',
      companyName: 'Indian Institute of Technology Madras (IITM)',
      contactPerson: {
        name: 'Dr. K. S. Ramanathan',
        designation: 'Principal Investigator - Cryogenic Physics Lab',
        email: 'ramanathan@physics.iitm.ac.in',
        phone: '+91 94440 55667'
      },
      email: 'purchase@iitm.ac.in',
      phone: '+91 44 2257 8000',
      gstin: '33AAAGI1234F1Z1',
      pan: 'AAAGI1234F',
      billingAddress: {
        addressLine1: 'Department of Physics, IIT Madras Campus',
        addressLine2: 'Sardar Patel Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600036',
        country: 'India'
      },
      shippingAddress: {
        addressLine1: 'Central Cryogenic Facility, Physics Building',
        addressLine2: 'IIT Madras Campus',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600036',
        country: 'India'
      },
      industry: 'Higher Education & Advanced Research',
      notes: 'Key academic partner. Requires high vacuum biological storage containers.',
      createdBy: adminUser._id
    });

    const customer2 = await Customer.create({
      customerCode: 'CSS-CUST-0002',
      companyName: 'Bharat Biotech International Limited',
      contactPerson: {
        name: 'Mr. Arvind Verma',
        designation: 'General Manager - Central Procurement',
        email: 'arvind.verma@bharatbiotech.com',
        phone: '+91 98200 44321'
      },
      email: 'procurement@bharatbiotech.com',
      phone: '+91 40 2348 0567',
      gstin: '36AABCB5678G1Z9',
      pan: 'AABCB5678G',
      billingAddress: {
        addressLine1: 'Genome Valley, Shameerpet',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500078',
        country: 'India'
      },
      shippingAddress: {
        addressLine1: 'Biotech Block 3, Genome Valley',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500078',
        country: 'India'
      },
      industry: 'Vaccines & Pharmaceuticals',
      notes: 'High volume buyer of ultra-low temperature freezers (-86C).',
      createdBy: adminUser._id
    });

    const customer3 = await Customer.create({
      customerCode: 'CSS-CUST-0003',
      companyName: 'ISRO Propulsion Complex (IPRC)',
      contactPerson: {
        name: 'Smt. Malini Chandran',
        designation: 'Purchase Officer - Cryo Components',
        email: 'malini.c@iprc.gov.in',
        phone: '+91 94888 22110'
      },
      email: 'purchase@iprc.gov.in',
      phone: '+91 4637 281234',
      gstin: '33AAAGI9876Q1Z3',
      pan: 'AAAGI9876Q',
      billingAddress: {
        addressLine1: 'IPRC Main Gate, Mahendragiri',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        postalCode: '627133',
        country: 'India'
      },
      shippingAddress: {
        addressLine1: 'Cryogenic Testing Facility, Bay 4',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        postalCode: '627133',
        country: 'India'
      },
      industry: 'Aerospace & Defence',
      notes: 'Govt tender account. High precision cryogenic transfer lines.',
      createdBy: adminUser._id
    });

    // 3. Create Sample Leads across all pipeline stages

    // Lead A: Complete pipeline through Handover to Production!
    console.log('[Seed]: Creating full Lead-to-Production workflow sample...');
    const lead1 = await Lead.create({
      leadNumber: 'CSS-LD-2026-0001',
      companyName: 'Indian Institute of Technology Madras (IITM)',
      contactPerson: {
        name: 'Dr. K. S. Ramanathan',
        designation: 'Principal Investigator',
        email: 'ramanathan@physics.iitm.ac.in',
        phone: '+91 94440 55667'
      },
      email: 'purchase@iitm.ac.in',
      phone: '+91 44 2257 8000',
      city: 'Chennai',
      state: 'Tamil Nadu',
      source: 'Direct Referral',
      customer: customer1._id,
      requirements: {
        equipmentType: 'Liquid Nitrogen Cryo Bio-Storage Container',
        capacity: '50 Litres',
        specificationDetails: 'CryoBio 50 with 6 canister racks, static holding time > 120 days, high vacuum insulation.',
        estimatedBudget: 250000,
        expectedDeliveryTime: '4 Weeks'
      },
      qualification: {
        isQualified: true,
        status: 'Qualified',
        qualifiedAt: new Date(Date.now() - 25 * 86400000),
        qualifiedBy: adminUser._id,
        qualificationNotes: 'Technical specifications clarified. Department purchase budget formally approved.',
        budgetConfirmed: true,
        decisionMakerIdentified: true,
        requirementClarity: 'High'
      },
      stage: 'PRODUCTION_HANDOVER',
      status: 'Closed',
      assignedTo: adminUser._id,
      createdBy: adminUser._id
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'LEAD_CREATED',
      title: 'Enquiry Received: CSS-LD-2026-0001',
      description: 'Initial enquiry from IIT Madras for 50L LN2 Cryo Bio-Storage Container',
      user: adminUser._id,
      documentType: 'Lead',
      documentId: lead1._id,
      createdAt: new Date(Date.now() - 30 * 86400000)
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'LEAD_QUALIFIED',
      title: 'Lead Successfully Qualified',
      description: 'Budget confirmed by HOD Physics. Technical compatibility verified.',
      user: adminUser._id,
      documentType: 'Lead',
      documentId: lead1._id,
      createdAt: new Date(Date.now() - 25 * 86400000)
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'CUSTOMER_LINKED',
      title: 'Customer Account Linked: CSS-CUST-0001',
      description: 'Linked to Indian Institute of Technology Madras master record',
      user: adminUser._id,
      documentType: 'Customer',
      documentId: customer1._id,
      createdAt: new Date(Date.now() - 24 * 86400000)
    });

    // Create Quotation for Lead 1 with Rev 0 and Rev 1
    const quote1 = new Quotation({
      quotationNumber: 'CSS-QT-2026-0001',
      lead: lead1._id,
      customer: customer1._id,
      currentRevisionNumber: 1,
      status: 'Won',
      wonDate: new Date(Date.now() - 15 * 86400000),
      wonRemarks: 'Approved after 5% institutional discount agreed in Rev 1.',
      createdBy: adminUser._id
    });

    // Rev 0: Initial
    const rev0 = await QuotationRevision.create({
      quotation: quote1._id,
      revisionNumber: 0,
      revisionLabel: 'Rev 0',
      revisionReason: 'Initial Commercial Quotation',
      items: [
        {
          itemCode: 'CRYO-BIO-50L',
          productName: 'CryoBio 50 Liquid Nitrogen Biological Storage Container',
          specification: '50L capacity, 6 canister racks, static evaporation rate 0.42 L/day, neck dia 50mm',
          hsnCode: '841869',
          quantity: 2,
          unit: 'Nos',
          unitPrice: 110000,
          discountPercent: 0,
          discountAmount: 0,
          taxableAmount: 220000,
          gstRate: 18,
          gstAmount: 39600,
          totalAmount: 259600
        }
      ],
      subTotal: 220000,
      totalDiscount: 0,
      taxableAmount: 220000,
      totalGst: 39600,
      grandTotal: 259600,
      paymentTerms: '30% Advance with PO, 70% against Proforma Invoice prior to dispatch',
      deliveryPeriod: '4 Weeks from receipt of PO',
      validityDays: 30,
      warranty: '12 Months warranty from commissioning',
      freightTerms: 'Ex-works Chennai / Freight extra',
      specialTerms: 'Factory pressure and vacuum test certificate provided.',
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - 20 * 86400000)
    });

    // Rev 1: Revised after negotiation (5% institutional discount applied)
    const rev1 = await QuotationRevision.create({
      quotation: quote1._id,
      revisionNumber: 1,
      revisionLabel: 'Rev 1',
      revisionReason: 'Negotiation: 5% Institutional discount applied for academic research',
      items: [
        {
          itemCode: 'CRYO-BIO-50L',
          productName: 'CryoBio 50 Liquid Nitrogen Biological Storage Container',
          specification: '50L capacity, 6 canister racks, static evaporation rate 0.42 L/day, neck dia 50mm',
          hsnCode: '841869',
          quantity: 2,
          unit: 'Nos',
          unitPrice: 110000,
          discountPercent: 5,
          discountAmount: 11000,
          taxableAmount: 209000,
          gstRate: 18,
          gstAmount: 37620,
          totalAmount: 246620
        }
      ],
      subTotal: 220000,
      totalDiscount: 11000,
      taxableAmount: 209000,
      totalGst: 37620,
      grandTotal: 246620,
      paymentTerms: '30% Advance with PO, 70% against Proforma Invoice prior to dispatch',
      deliveryPeriod: '4 Weeks from receipt of PO',
      validityDays: 30,
      warranty: '12 Months warranty from commissioning',
      freightTerms: 'Ex-works Chennai / Freight extra',
      specialTerms: 'Factory pressure and vacuum test certificate provided.',
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - 17 * 86400000)
    });

    quote1.activeRevision = rev1._id;
    quote1.winningRevision = rev1._id;
    quote1.revisions = [rev0._id, rev1._id];
    await quote1.save();

    await Activity.create({
      lead: lead1._id,
      activityType: 'QUOTATION_CREATED',
      title: 'Quotation Rev 0 Issued: CSS-QT-2026-0001',
      description: 'Initial commercial quotation created for Rs. 2,59,600',
      user: adminUser._id,
      documentType: 'Quotation',
      documentId: quote1._id,
      createdAt: new Date(Date.now() - 20 * 86400000)
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'CUSTOMER_FEEDBACK',
      title: 'Customer Review Feedback: Price Clarification',
      description: 'Customer requested 5% educational discount to match allocated institute budget.',
      user: adminUser._id,
      documentType: 'Quotation',
      documentId: quote1._id,
      createdAt: new Date(Date.now() - 18 * 86400000)
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'QUOTATION_REVISED',
      title: 'Quotation Revised to Rev 1',
      description: '5% institutional discount applied. Revised grand total: Rs. 2,46,620',
      user: adminUser._id,
      documentType: 'QuotationRevision',
      documentId: rev1._id,
      createdAt: new Date(Date.now() - 17 * 86400000)
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'QUOTATION_WON',
      title: 'Quotation Marked as WON',
      description: 'Customer confirmed acceptance of Rev 1 quotation. Ready for PI generation.',
      user: adminUser._id,
      documentType: 'Quotation',
      documentId: quote1._id,
      createdAt: new Date(Date.now() - 15 * 86400000)
    });

    // Proforma Invoice for Lead 1
    const pi1 = await ProformaInvoice.create({
      piNumber: 'CSS-PI-2026-0001',
      piDate: new Date(Date.now() - 14 * 86400000),
      quotation: quote1._id,
      quotationRevision: rev1._id,
      lead: lead1._id,
      customer: customer1._id,
      items: rev1.items,
      subTotal: rev1.subTotal,
      totalDiscount: rev1.totalDiscount,
      taxableAmount: rev1.taxableAmount,
      totalGst: rev1.totalGst,
      grandTotal: rev1.grandTotal,
      paymentTerms: rev1.paymentTerms,
      deliveryPeriod: rev1.deliveryPeriod,
      status: 'Issued',
      createdBy: adminUser._id
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'PI_GENERATED',
      title: 'Proforma Invoice Generated: CSS-PI-2026-0001',
      description: 'PI issued for Rs. 2,46,620 and forwarded to customer for PO release',
      user: adminUser._id,
      documentType: 'ProformaInvoice',
      documentId: pi1._id,
      createdAt: new Date(Date.now() - 14 * 86400000)
    });

    // Customer Purchase Order for Lead 1
    const po1 = await CustomerPurchaseOrder.create({
      poNumber: 'IITM/PHY/CRYO/2026/048',
      poDate: new Date(Date.now() - 10 * 86400000),
      lead: lead1._id,
      customer: customer1._id,
      quotation: quote1._id,
      proformaInvoice: pi1._id,
      poValue: 246620,
      deliveryDate: new Date(Date.now() + 18 * 86400000),
      deliveryPeriodText: 'Within 4 Weeks',
      paymentTerms: '30% Advance with PO, 70% against Proforma Invoice prior to dispatch',
      itemSummary: 'CryoBio 50 Liquid Nitrogen Biological Storage Container (Qty: 2 Nos)',
      quantity: 2,
      unitPrice: 110000,
      documentPath: '',
      originalFileName: 'IITM_Purchase_Order_048.pdf',
      fileSize: 184520,
      mimeType: 'application/pdf',
      amendmentVersion: 1,
      verificationStatus: 'Passed',
      notes: 'Formal institutional purchase order received with all terms agreed.',
      createdBy: adminUser._id
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'PO_UPLOADED',
      title: 'Customer PO Received: IITM/PHY/CRYO/2026/048',
      description: 'Customer PO received for Rs. 2,46,620. Pending 5-point verification.',
      user: adminUser._id,
      documentType: 'CustomerPurchaseOrder',
      documentId: po1._id,
      createdAt: new Date(Date.now() - 10 * 86400000)
    });

    // 5-Point PO Verification for Lead 1 (PASSED)
    const verification1 = await POVerification.create({
      lead: lead1._id,
      customer: customer1._id,
      customerPO: po1._id,
      quotation: quote1._id,
      quotationRevision: rev1._id,
      verificationRound: 1,
      checks: {
        itemSpecification: {
          pointNumber: 1,
          pointName: 'Item / Product Name and Specification',
          expectedValue: 'CryoBio 50 Liquid Nitrogen Biological Storage Container (50L)',
          actualValue: 'CryoBio 50 Liquid Nitrogen Biological Storage Container (50L)',
          status: 'MATCH',
          remarks: 'Item description and technical specs match quotation Rev 1'
        },
        quantity: {
          pointNumber: 2,
          pointName: 'Quantity',
          expectedValue: '2 Nos',
          actualValue: '2 Nos',
          status: 'MATCH',
          remarks: 'Quantity matches 2 Nos exactly'
        },
        pricingValue: {
          pointNumber: 3,
          pointName: 'Unit Price and Total Value',
          expectedValue: 'Unit: Rs. 1,10,000 | Grand Total: Rs. 2,46,620 (incl. GST)',
          actualValue: 'Unit: Rs. 1,10,000 | Grand Total: Rs. 2,46,620 (incl. GST)',
          status: 'MATCH',
          remarks: 'Pricing and GST calculations match quotation Rev 1'
        },
        deliveryDate: {
          pointNumber: 4,
          pointName: 'Delivery Date',
          expectedValue: '4 Weeks from PO acceptance',
          actualValue: 'Within 4 Weeks',
          status: 'MATCH',
          remarks: 'Delivery schedule acceptable to manufacturing team'
        },
        paymentTerms: {
          pointNumber: 5,
          pointName: 'Payment Terms',
          expectedValue: '30% Advance, 70% against PI prior to dispatch',
          actualValue: '30% Advance, 70% against PI prior to dispatch',
          status: 'MATCH',
          remarks: 'Payment terms match quotation Rev 1 commercial terms'
        }
      },
      allMatched: true,
      overallStatus: 'PASSED',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 8 * 86400000),
      generalRemarks: 'All 5 points successfully verified and matched. Cleared for Sales Order generation.'
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'PO_VERIFICATION_PASSED',
      title: 'Five-Point PO Verification Passed (Round 1)',
      description: 'All 5 verification points match approved quote Rev 1. Sales Order authorized.',
      user: adminUser._id,
      documentType: 'POVerification',
      documentId: verification1._id,
      createdAt: new Date(Date.now() - 8 * 86400000)
    });

    // Sales Order for Lead 1
    const so1 = await SalesOrder.create({
      soNumber: 'CSS-SO-2026-0001',
      soDate: new Date(Date.now() - 7 * 86400000),
      lead: lead1._id,
      customer: customer1._id,
      quotation: quote1._id,
      quotationRevision: rev1._id,
      proformaInvoice: pi1._id,
      customerPO: po1._id,
      poVerification: verification1._id,
      items: rev1.items,
      subTotal: rev1.subTotal,
      totalDiscount: rev1.totalDiscount,
      taxableAmount: rev1.taxableAmount,
      totalGst: rev1.totalGst,
      grandTotal: rev1.grandTotal,
      deliverySchedule: '4 Weeks from PO date (Dispatched by 28-Nov-2026)',
      committedDispatchDate: new Date(Date.now() + 17 * 86400000),
      paymentTerms: '30% Advance with PO, 70% against Proforma Invoice prior to dispatch',
      warranty: '12 Months warranty from commissioning',
      specialInstructions: 'Inspect vacuum retention for 72 hours before dispatch packing.',
      status: 'Handed Over to Production',
      productionHandover: {
        isHandedOver: true,
        handoverDate: new Date(Date.now() - 5 * 86400000),
        handedOverBy: adminUser._id,
        handoverRemarks: 'Commercial verification complete. Advance received. Handed over to shop floor production.',
        targetCompletionDate: new Date(Date.now() + 15 * 86400000)
      },
      createdBy: adminUser._id
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'SO_CREATED',
      title: 'Sales Order Created: CSS-SO-2026-0001',
      description: 'Formal Sales Order generated. Order value: Rs. 2,46,620',
      user: adminUser._id,
      documentType: 'SalesOrder',
      documentId: so1._id,
      createdAt: new Date(Date.now() - 7 * 86400000)
    });

    await Activity.create({
      lead: lead1._id,
      activityType: 'PRODUCTION_HANDOVER',
      title: 'Sales Order Handed Over to Production',
      description: 'Commercial clearances signed off. Order released for fabrication and assembly.',
      user: adminUser._id,
      documentType: 'SalesOrder',
      documentId: so1._id,
      createdAt: new Date(Date.now() - 5 * 86400000)
    });

    lead1.currentQuotation = quote1._id;
    lead1.currentPI = pi1._id;
    lead1.currentPO = po1._id;
    lead1.currentSO = so1._id;
    await lead1.save();

    // Lead B: PO Verification in Progress with a Mismatch (Testing the 5-point blocking rule)
    console.log('[Seed]: Creating Lead with PO Verification mismatch...');
    const lead2 = await Lead.create({
      leadNumber: 'CSS-LD-2026-0002',
      companyName: 'Bharat Biotech International Limited',
      contactPerson: {
        name: 'Mr. Arvind Verma',
        designation: 'General Manager - Procurement',
        email: 'arvind.verma@bharatbiotech.com',
        phone: '+91 98200 44321'
      },
      email: 'procurement@bharatbiotech.com',
      phone: '+91 40 2348 0567',
      city: 'Hyderabad',
      state: 'Telangana',
      source: 'Trade Show / Expo',
      customer: customer2._id,
      requirements: {
        equipmentType: 'Ultra-Low Temperature Cryo Freezer (-86C)',
        capacity: '700 Litres',
        specificationDetails: 'Dual cascade refrigeration, touchscreen controller, CO2 backup port, VIP insulation',
        estimatedBudget: 850000,
        expectedDeliveryTime: '6 Weeks'
      },
      qualification: {
        isQualified: true,
        status: 'Qualified',
        qualifiedAt: new Date(Date.now() - 12 * 86400000),
        qualifiedBy: adminUser._id,
        qualificationNotes: 'Qualified for biological vaccine storage expansion project.',
        budgetConfirmed: true,
        decisionMakerIdentified: true,
        requirementClarity: 'High'
      },
      stage: 'PO_AMENDMENT_PENDING',
      status: 'In Progress',
      assignedTo: adminUser._id,
      createdBy: adminUser._id
    });

    const quote2 = new Quotation({
      quotationNumber: 'CSS-QT-2026-0002',
      lead: lead2._id,
      customer: customer2._id,
      currentRevisionNumber: 0,
      status: 'Won',
      wonDate: new Date(Date.now() - 5 * 86400000),
      wonRemarks: 'PO released directly on Rev 0 terms',
      createdBy: adminUser._id
    });

    const rev0_quote2 = await QuotationRevision.create({
      quotation: quote2._id,
      revisionNumber: 0,
      revisionLabel: 'Rev 0',
      revisionReason: 'Standard Commercial Offer',
      items: [
        {
          itemCode: 'ULT-700L',
          productName: 'Cryo Ultra-Low Temperature Freezer -86°C (700L)',
          specification: 'Double cascade HC compressor, VIP insulation, microprocessor control, 230V 50Hz',
          hsnCode: '841869',
          quantity: 1,
          unit: 'Nos',
          unitPrice: 720000,
          discountPercent: 0,
          discountAmount: 0,
          taxableAmount: 720000,
          gstRate: 18,
          gstAmount: 129600,
          totalAmount: 849600
        }
      ],
      subTotal: 720000,
      totalDiscount: 0,
      taxableAmount: 720000,
      totalGst: 129600,
      grandTotal: 849600,
      paymentTerms: '40% Advance with PO, 60% against PI before dispatch',
      deliveryPeriod: '6 to 8 Weeks from PO date',
      validityDays: 30,
      warranty: '24 Months warranty on refrigeration system',
      freightTerms: 'Ex-works Chennai / Freight extra',
      specialTerms: 'Factory FAT validation before dispatch',
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - 8 * 86400000)
    });

    quote2.activeRevision = rev0_quote2._id;
    quote2.winningRevision = rev0_quote2._id;
    quote2.revisions = [rev0_quote2._id];
    await quote2.save();

    const pi2 = await ProformaInvoice.create({
      piNumber: 'CSS-PI-2026-0002',
      piDate: new Date(Date.now() - 4 * 86400000),
      quotation: quote2._id,
      quotationRevision: rev0_quote2._id,
      lead: lead2._id,
      customer: customer2._id,
      items: rev0_quote2.items,
      subTotal: rev0_quote2.subTotal,
      totalDiscount: rev0_quote2.totalDiscount,
      taxableAmount: rev0_quote2.taxableAmount,
      totalGst: rev0_quote2.totalGst,
      grandTotal: rev0_quote2.grandTotal,
      paymentTerms: rev0_quote2.paymentTerms,
      deliveryPeriod: rev0_quote2.deliveryPeriod,
      status: 'Issued',
      createdBy: adminUser._id
    });

    // Customer PO 2 with a payment terms MISMATCH!
    const po2 = await CustomerPurchaseOrder.create({
      poNumber: 'BBIL/PO/2026/8912',
      poDate: new Date(Date.now() - 2 * 86400000),
      lead: lead2._id,
      customer: customer2._id,
      quotation: quote2._id,
      proformaInvoice: pi2._id,
      poValue: 849600,
      deliveryDate: new Date(Date.now() + 45 * 86400000),
      deliveryPeriodText: '6-8 Weeks',
      paymentTerms: '100% after 60 days credit (MISMATCH - Expected: 40% Advance)',
      itemSummary: 'Cryo Ultra-Low Temperature Freezer -86°C (700L) - 1 Unit',
      quantity: 1,
      unitPrice: 720000,
      originalFileName: 'BBIL_PO_8912.pdf',
      fileSize: 245100,
      mimeType: 'application/pdf',
      amendmentVersion: 1,
      verificationStatus: 'Failed_Mismatch',
      notes: 'Customer PO states 60 days credit instead of agreed 40% advance.',
      createdBy: adminUser._id
    });

    // PO Verification showing the mismatch on point 5
    const verification2 = await POVerification.create({
      lead: lead2._id,
      customer: customer2._id,
      customerPO: po2._id,
      quotation: quote2._id,
      quotationRevision: rev0_quote2._id,
      verificationRound: 1,
      checks: {
        itemSpecification: {
          pointNumber: 1,
          pointName: 'Item / Product Name and Specification',
          expectedValue: 'Cryo Ultra-Low Temperature Freezer -86°C (700L)',
          actualValue: 'Cryo Ultra-Low Temperature Freezer -86°C (700L)',
          status: 'MATCH',
          remarks: 'Specifications match quotation Rev 0'
        },
        quantity: {
          pointNumber: 2,
          pointName: 'Quantity',
          expectedValue: '1 No',
          actualValue: '1 No',
          status: 'MATCH',
          remarks: 'Quantity 1 No matches'
        },
        pricingValue: {
          pointNumber: 3,
          pointName: 'Unit Price and Total Value',
          expectedValue: 'Unit: Rs. 7,20,000 | Grand Total: Rs. 8,49,600 (incl. GST)',
          actualValue: 'Unit: Rs. 7,20,000 | Grand Total: Rs. 8,49,600 (incl. GST)',
          status: 'MATCH',
          remarks: 'Total price matches'
        },
        deliveryDate: {
          pointNumber: 4,
          pointName: 'Delivery Date',
          expectedValue: '6 to 8 Weeks from PO date',
          actualValue: '6-8 Weeks',
          status: 'MATCH',
          remarks: 'Lead time matches agreed delivery period'
        },
        paymentTerms: {
          pointNumber: 5,
          pointName: 'Payment Terms',
          expectedValue: '40% Advance with PO, 60% against PI before dispatch',
          actualValue: '100% after 60 days credit',
          status: 'MISMATCH',
          remarks: 'MISMATCH: Commercial payment terms deviate drastically from approved quote.'
        }
      },
      allMatched: false,
      overallStatus: 'FAILED_MISMATCH',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(Date.now() - 1 * 86400000),
      generalRemarks: 'Sales Order blocked due to Payment Terms mismatch. Customer PO requires amendment.'
    });

    await Activity.create({
      lead: lead2._id,
      activityType: 'PO_VERIFICATION_FAILED',
      title: 'PO Verification Mismatch Detected (Round 1)',
      description: 'Point 5 (Payment Terms) mismatch: Customer printed 60 days credit instead of agreed 40% advance. Sales Order creation blocked.',
      user: adminUser._id,
      documentType: 'POVerification',
      documentId: verification2._id,
      createdAt: new Date(Date.now() - 1 * 86400000)
    });

    lead2.currentQuotation = quote2._id;
    lead2.currentPI = pi2._id;
    lead2.currentPO = po2._id;
    await lead2.save();

    // Lead C: In Negotiation stage with Rev 0
    console.log('[Seed]: Creating Lead in Negotiation stage...');
    const lead3 = await Lead.create({
      leadNumber: 'CSS-LD-2026-0003',
      companyName: 'ISRO Propulsion Complex (IPRC)',
      contactPerson: {
        name: 'Smt. Malini Chandran',
        designation: 'Purchase Officer',
        email: 'malini.c@iprc.gov.in',
        phone: '+91 94888 22110'
      },
      email: 'purchase@iprc.gov.in',
      phone: '+91 4637 281234',
      city: 'Tirunelveli',
      state: 'Tamil Nadu',
      source: 'Tender / Govt Portal',
      customer: customer3._id,
      requirements: {
        equipmentType: 'Vacuum Jacketed Liquid Nitrogen Transfer Line',
        capacity: '20 Metres with bayonet couplings',
        specificationDetails: 'Multi-layer vacuum insulation, SS304 inner/outer, flexible sections, helium leak tested to 1x10^-9 mbar l/s',
        estimatedBudget: 1500000,
        expectedDeliveryTime: '8 Weeks'
      },
      qualification: {
        isQualified: true,
        status: 'Qualified',
        qualifiedAt: new Date(Date.now() - 6 * 86400000),
        qualifiedBy: adminUser._id,
        qualificationNotes: 'Govt space propulsion tender requirement qualified.',
        budgetConfirmed: true,
        decisionMakerIdentified: true,
        requirementClarity: 'High'
      },
      stage: 'QUOTATION_NEGOTIATION',
      status: 'Quoted',
      assignedTo: adminUser._id,
      createdBy: adminUser._id
    });

    const quote3 = new Quotation({
      quotationNumber: 'CSS-QT-2026-0003',
      lead: lead3._id,
      customer: customer3._id,
      currentRevisionNumber: 0,
      status: 'Under Negotiation',
      createdBy: adminUser._id
    });

    const rev0_quote3 = await QuotationRevision.create({
      quotation: quote3._id,
      revisionNumber: 0,
      revisionLabel: 'Rev 0',
      revisionReason: 'Tender Technical & Commercial Bid',
      items: [
        {
          itemCode: 'CRYO-VJTL-20M',
          productName: 'Vacuum Jacketed Cryogenic Transfer Line (20m)',
          specification: 'Rigid + flexible vacuum jacketed SS316 transfer line, bayonet couplings, relief valves',
          hsnCode: '841869',
          quantity: 1,
          unit: 'Set',
          unitPrice: 1250000,
          discountPercent: 0,
          discountAmount: 0,
          taxableAmount: 1250000,
          gstRate: 18,
          gstAmount: 225000,
          totalAmount: 1475000
        }
      ],
      subTotal: 1250000,
      totalDiscount: 0,
      taxableAmount: 1250000,
      totalGst: 225000,
      grandTotal: 1475000,
      paymentTerms: '20% Advance with PO, 80% against dispatch & inspection',
      deliveryPeriod: '8 to 10 Weeks from technical clearance',
      validityDays: 60,
      warranty: '18 Months from delivery',
      freightTerms: 'CIP IPRC Mahendragiri',
      specialTerms: 'Helium mass spectrometer leak test report mandatory',
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - 4 * 86400000)
    });

    quote3.activeRevision = rev0_quote3._id;
    quote3.revisions = [rev0_quote3._id];
    await quote3.save();

    await Activity.create({
      lead: lead3._id,
      activityType: 'LEAD_CREATED',
      title: 'Tender Enquiry Logged: CSS-LD-2026-0003',
      description: 'ISRO tender enquiry for 20M vacuum jacketed transfer line',
      user: adminUser._id,
      documentType: 'Lead',
      documentId: lead3._id,
      createdAt: new Date(Date.now() - 7 * 86400000)
    });

    await Activity.create({
      lead: lead3._id,
      activityType: 'QUOTATION_CREATED',
      title: 'Quotation Rev 0 Submitted: CSS-QT-2026-0003',
      description: 'Bid submitted with total value Rs. 14,75,000',
      user: adminUser._id,
      documentType: 'Quotation',
      documentId: quote3._id,
      createdAt: new Date(Date.now() - 4 * 86400000)
    });

    lead3.currentQuotation = quote3._id;
    await lead3.save();

    // Lead D: Fresh Enquiry (New)
    console.log('[Seed]: Creating New Enquiry sample...');
    const lead4 = await Lead.create({
      leadNumber: 'CSS-LD-2026-0004',
      companyName: 'National Institute of Immunology (NII)',
      contactPerson: {
        name: 'Dr. Shalini Aggarwal',
        designation: 'Research Fellow',
        email: 'shalini@nii.ac.in',
        phone: '+91 99112 33445'
      },
      email: 'stores@nii.ac.in',
      phone: '+91 11 2671 7121',
      city: 'New Delhi',
      state: 'Delhi',
      source: 'Website',
      requirements: {
        equipmentType: 'Liquid Nitrogen Auto-Filling System',
        capacity: '120 Litres Supply Tank with Dual Sensors',
        specificationDetails: 'Auto controller, solenoid valves, low level alarm, battery backup',
        estimatedBudget: 400000,
        quantity: 1,
        expectedDeliveryTime: '3-4 Weeks'
      },
      priority: 'HIGH',
      stage: 'ENQUIRY_RECEIVED',
      status: 'New',
      followUps: [
        {
          followUpDate: new Date('2026-11-12'),
          status: 'INTERESTED',
          notes: 'Customer requested preliminary brochure and compliance certificates',
          nextFollowUpDate: new Date('2026-11-15'),
          conductedByName: 'Ananya Sharma',
          conductedBy: adminUser._id
        }
      ],
      assignedTo: adminUser._id,
      createdBy: adminUser._id
    });

    await Activity.create({
      lead: lead4._id,
      activityType: 'LEAD_CREATED',
      title: 'Website Enquiry Received: CSS-LD-2026-0004',
      description: 'Inquiry received from NII for LN2 Auto-Filling System',
      user: adminUser._id,
      documentType: 'Lead',
      documentId: lead4._id,
      createdAt: new Date(Date.now() - 1 * 86400000)
    });

    // Lead E: Blood Bank Refrigerator Lead matching User's exact prompt & image!
    console.log('[Seed]: Creating Blood Bank Refrigerator Lead with complete Follow-up history...');
    const lead5 = await Lead.create({
      leadNumber: 'CSS-LD-2026-0005',
      companyName: 'Manipal Academy of Higher Education (MAHE)',
      contactPerson: {
        name: 'Dr. Vikram Raman',
        designation: 'Head of Transfusion Medicine',
        email: 'dr.vikram@manipaluniv.res.in',
        phone: '+91 820 292 11223'
      },
      email: 'procurement@manipaluniv.res.in',
      phone: '+91 820 292 11223',
      city: 'Manipal',
      state: 'Karnataka',
      source: 'Exhibition Bangalore',
      customer: null, // NEW CUSTOMER
      requirements: {
        equipmentType: 'Blood Bank Refrigerator (+4°C) with automatic chart logging',
        capacity: '360 Litres',
        specificationDetails: 'Digital 7-day circular temperature chart recorder, battery backup, glass door',
        estimatedBudget: 180000,
        quantity: 1,
        expectedDeliveryTime: '3 Weeks'
      },
      priority: 'MEDIUM',
      stage: 'QUOTATION_LOST',
      status: 'Lost',
      followUps: [
        {
          followUpDate: new Date('2026-11-12'),
          status: 'NOT INTERESTED',
          notes: 'rejected',
          nextFollowUpDate: null,
          conductedByName: 'Ananya Sharma',
          conductedBy: adminUser._id
        },
        {
          followUpDate: new Date('2026-11-12'),
          status: 'NO RESPONSE',
          notes: 'laterrr',
          nextFollowUpDate: null,
          conductedByName: 'Ananya Sharma',
          conductedBy: adminUser._id
        },
        {
          followUpDate: new Date('2026-11-12'),
          status: 'INTERESTED',
          notes: 'send message',
          nextFollowUpDate: new Date('2026-11-11'),
          conductedByName: 'Ananya Sharma',
          conductedBy: adminUser._id
        },
        {
          followUpDate: new Date('2026-11-12'),
          status: 'INTERESTED',
          notes: 'later',
          nextFollowUpDate: null,
          conductedByName: 'Dr. Vikram Raman',
          conductedBy: adminUser._id
        }
      ],
      assignedTo: adminUser._id,
      createdBy: adminUser._id
    });

    await Activity.create({
      lead: lead5._id,
      activityType: 'LEAD_CREATED',
      title: 'Exhibition Enquiry Logged: CSS-LD-2026-0005',
      description: 'Captured from Exhibition Bangalore for Blood Bank Refrigerator (+4°C) with automatic chart logging (Qty: 1, Est: Rs. 1,80,000)',
      user: adminUser._id,
      documentType: 'Lead',
      documentId: lead5._id,
      createdAt: new Date('2026-11-10')
    });

    console.log('[Seed]: Database successfully seeded!');
    console.log('[Seed]: Summary:');
    console.log(' - Users: 2 (Sales Admin: admin@cryoscientific.com / Admin@123)');
    console.log(' - Customers: 3');
    console.log(' - Leads: 4 across various lifecycle stages');
    console.log(' - Quotations: 3 (with revisions Rev 0 and Rev 1)');
    console.log(' - Proforma Invoices: 2');
    console.log(' - Customer Purchase Orders: 2');
    console.log(' - 5-Point PO Verifications: 2 (1 Passed, 1 Mismatch)');
    console.log(' - Sales Orders: 1 (Handed over to Production)');
    console.log(' - Activity Timeline Records: 14+ audit entries');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Failed]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

