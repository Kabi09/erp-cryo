const Enquiry = require('../models/Enquiry');
const Customer = require('../models/Customer');
const { getNextSequence, getCustomerCode } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc Get all enquiries with filtering & search
// @route GET /api/enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { search, status, priority, source, assignedTo, startDate, endDate } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { enquiryNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.enquirySource = source;
    if (assignedTo) query.assignedTo = assignedTo;

    if (startDate || endDate) {
      query.enquiryDate = {};
      if (startDate) query.enquiryDate.$gte = new Date(startDate);
      if (endDate) query.enquiryDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const enquiries = await Enquiry.find(query)
      .populate('customer', 'companyName customerCode gstin')
      .populate('assignedTo', 'name email role department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single enquiry
// @route GET /api/enquiries/:id
exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('customer')
      .populate('assignedTo', 'name email role department')
      .populate('products.product');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Enquiry
// @route POST /api/enquiries
exports.createEnquiry = async (req, res) => {
  try {
    let {
      customer: customerId,
      companyName,
      contactPerson,
      mobileNumber,
      email,
      billingAddress,
      shippingAddress,
      products,
      ...rest
    } = req.body;

    // If no existing customer selected, auto-register customer in Customer Master
    if (!customerId && companyName) {
      let existingCustomer = await Customer.findOne({ companyName: new RegExp(`^${companyName}$`, 'i') });
      if (!existingCustomer) {
        const customerCode = await getCustomerCode();
        existingCustomer = await Customer.create({
          customerCode,
          companyName,
          contacts: [{ name: contactPerson, mobile: mobileNumber, email, isPrimary: true }],
          billingAddresses: [{ addressLine1: billingAddress || 'Address', city: req.body.city || 'Chennai', state: req.body.state || 'Tamil Nadu', pinCode: req.body.pinCode || '600001', country: 'India', isDefault: true }],
          shippingAddresses: [{ addressLine1: shippingAddress || billingAddress || 'Address', city: req.body.city || 'Chennai', state: req.body.state || 'Tamil Nadu', pinCode: req.body.pinCode || '600001', country: 'India', isDefault: true }],
          gstin: req.body.gstin,
          pan: req.body.pan,
          createdBy: req.user?._id
        });
      }
      customerId = existingCustomer._id;
    }

    const enquiryNumber = await getNextSequence('ENQ');

    const enquiry = await Enquiry.create({
      enquiryNumber,
      customer: customerId,
      companyName,
      customerName: companyName,
      contactPerson,
      mobileNumber,
      email,
      billingAddress,
      shippingAddress,
      products: products || [],
      createdBy: req.user?._id,
      ...rest
    });

    await logAudit(req, 'CREATE', 'Enquiry', enquiry._id.toString(), { enquiryNumber, companyName });

    // Notify assigned sales person if present
    if (enquiry.assignedTo) {
      await Notification.create({
        recipient: enquiry.assignedTo,
        title: 'New Enquiry Assigned',
        message: `Enquiry ${enquiryNumber} from ${companyName} has been assigned to you.`,
        link: `/enquiries/${enquiry._id}`,
        type: 'Enquiry'
      });
    }

    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update Enquiry
// @route PUT /api/enquiries/:id
exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('customer assignedTo');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await logAudit(req, 'UPDATE', 'Enquiry', enquiry._id.toString(), { enquiryNumber: enquiry.enquiryNumber, status: enquiry.status });

    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update Enquiry Status
// @route PATCH /api/enquiries/:id/status
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    enquiry.status = status;
    if (remarks) enquiry.remarks = remarks;
    await enquiry.save();

    await logAudit(req, 'STATUS_CHANGE', 'Enquiry', enquiry._id.toString(), { newStatus: status });

    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Delete Enquiry
// @route DELETE /api/enquiries/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await enquiry.deleteOne();
    await logAudit(req, 'DELETE', 'Enquiry', enquiry._id.toString(), { enquiryNumber: enquiry.enquiryNumber });

    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
