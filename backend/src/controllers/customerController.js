const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const logActivity = require('../utils/activityLogger');

const getNextCustomerCode = async () => {
  const lastCustomer = await Customer.findOne({ customerCode: /^CSS-CUST-/ })
    .sort({ createdAt: -1 })
    .select('customerCode');

  let nextSequence = 1;
  if (lastCustomer && lastCustomer.customerCode) {
    const parts = lastCustomer.customerCode.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }
  return `CSS-CUST-${String(nextSequence).padStart(4, '0')}`;
};

// @desc    Get all customers with search & pagination
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { customerCode: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer master record
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      gstin,
      pan,
      billingAddress,
      shippingAddress,
      industry,
      notes,
      leadId
    } = req.body;

    // Check duplicate email or GSTIN if provided
    if (gstin && gstin.trim()) {
      const existingGstin = await Customer.findOne({ gstin: gstin.trim() });
      if (existingGstin) {
        return res.status(400).json({
          success: false,
          message: `A customer with GSTIN ${gstin} already exists (${existingGstin.companyName}). You can link the existing customer to this lead.`
        });
      }
    }

    const customerCode = await getNextCustomerCode();

    const customer = await Customer.create({
      customerCode,
      companyName,
      contactPerson,
      email,
      phone,
      gstin: gstin || '',
      pan: pan || '',
      billingAddress: billingAddress || {},
      shippingAddress: shippingAddress || billingAddress || {},
      industry: industry || 'Cryogenics / Research & Industrial',
      notes: notes || '',
      createdBy: req.user._id
    });

    // If linked to a lead, update the lead
    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (lead) {
        lead.customer = customer._id;
        if (lead.stage === 'ENQUIRY_RECEIVED' || lead.stage === 'QUALIFICATION') {
          lead.stage = 'CUSTOMER_MAPPED';
        }
        await lead.save();

        await logActivity({
          leadId: lead._id,
          activityType: 'CUSTOMER_CREATED',
          title: `Customer Master Created: ${customer.customerCode}`,
          description: `Created and mapped customer account for ${customer.companyName} (${customer.customerCode})`,
          userId: req.user._id,
          documentType: 'Customer',
          documentId: customer._id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Customer master created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Link an existing customer to a lead
// @route   POST /api/customers/link-lead
// @access  Private
exports.linkLead = async (req, res, next) => {
  try {
    const { leadId, customerId } = req.body;
    const lead = await Lead.findById(leadId);
    const customer = await Customer.findById(customerId);

    if (!lead || !customer) {
      return res.status(404).json({ success: false, message: 'Lead or Customer not found' });
    }

    lead.customer = customer._id;
    if (lead.stage === 'ENQUIRY_RECEIVED' || lead.stage === 'QUALIFICATION') {
      lead.stage = 'CUSTOMER_MAPPED';
    }
    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'CUSTOMER_LINKED',
      title: 'Customer Account Linked',
      description: `Mapped existing customer ${customer.companyName} (${customer.customerCode}) to lead ${lead.leadNumber}`,
      userId: req.user._id,
      documentType: 'Customer',
      documentId: customer._id
    });

    res.status(200).json({
      success: true,
      message: `Lead linked to ${customer.companyName}`,
      data: { lead, customer }
    });
  } catch (error) {
    next(error);
  }
};

