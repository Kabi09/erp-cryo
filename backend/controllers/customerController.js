const Customer = require('../models/Customer');
const Enquiry = require('../models/Enquiry');
const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const { getCustomerCode } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');

// @desc Get all customers
// @route GET /api/customers
exports.getCustomers = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } },
        { 'contacts.name': { $regex: search, $options: 'i' } },
        { 'contacts.email': { $regex: search, $options: 'i' } },
        { 'contacts.mobile': { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.customerCategory = category;
    if (status) query.status = status;

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single customer by ID
// @route GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Customer
// @route POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const { companyName, gstin, contacts } = req.body;

    // Duplicate check
    if (gstin && gstin.trim()) {
      const existingGstin = await Customer.findOne({ gstin: gstin.trim().toUpperCase() });
      if (existingGstin) {
        return res.status(400).json({
          success: false,
          message: `Customer with GSTIN ${gstin} already exists (${existingGstin.companyName})`
        });
      }
    }

    // Check duplicate by primary email if provided
    const primaryContactEmail = contacts?.find(c => c.isPrimary)?.email || contacts?.[0]?.email;
    if (primaryContactEmail) {
      const existingEmail = await Customer.findOne({ 'contacts.email': primaryContactEmail.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: `Customer with contact email ${primaryContactEmail} already exists (${existingEmail.companyName})`
        });
      }
    }

    const customerCode = await getCustomerCode();

    const customer = await Customer.create({
      ...req.body,
      customerCode,
      createdBy: req.user?._id
    });

    await logAudit(req, 'CREATE', 'Customer', customer._id.toString(), { companyName: customer.companyName, code: customerCode });

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update Customer
// @route PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await logAudit(req, 'UPDATE', 'Customer', customer._id.toString(), { companyName: customer.companyName });

    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete / Deactivate Customer
// @route DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if customer has active enquiries or sales orders
    const enquiriesCount = await Enquiry.countDocuments({ customer: customer._id });
    if (enquiriesCount > 0) {
      customer.status = 'Inactive';
      await customer.save();
      await logAudit(req, 'DEACTIVATE', 'Customer', customer._id.toString(), { reason: 'Has associated enquiries' });
      return res.json({ success: true, message: 'Customer has transaction history; marked as Inactive instead of hard deleting.', data: customer });
    }

    await customer.deleteOne();
    await logAudit(req, 'DELETE', 'Customer', customer._id.toString(), { companyName: customer.companyName });

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get Customer History (Enquiries, Quotations, Sales Orders)
// @route GET /api/customers/:id/history
exports.getCustomerHistory = async (req, res) => {
  try {
    const customerId = req.params.id;

    const [enquiries, quotations, salesOrders] = await Promise.all([
      Enquiry.find({ customer: customerId }).sort({ createdAt: -1 }),
      Quotation.find({ customer: customerId }).sort({ createdAt: -1 }),
      SalesOrder.find({ customer: customerId }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        enquiries,
        quotations,
        salesOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
