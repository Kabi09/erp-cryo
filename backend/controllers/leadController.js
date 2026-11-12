const LeadDecision = require('../models/LeadDecision');
const Enquiry = require('../models/Enquiry');
const logAudit = require('../utils/auditLogger');

// @desc Get all lead decisions
// @route GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, reason } = req.query;
    let query = {};
    if (status) query.leadStatus = status;
    if (reason) query.reason = reason;

    const leads = await LeadDecision.find(query)
      .populate('enquiry', 'enquiryNumber companyName priority status enquiryDate')
      .populate('customer', 'companyName customerCode')
      .populate('updatedBy', 'name role')
      .sort({ decisionDate: -1 });

    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create or Update Lead Decision
// @route POST /api/leads
exports.createOrUpdateLeadDecision = async (req, res) => {
  try {
    const { enquiry: enquiryId, leadStatus, reason, remarks, expectedOrderValue } = req.body;

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    let decision = await LeadDecision.findOne({ enquiry: enquiryId });

    if (decision) {
      decision.leadStatus = leadStatus;
      decision.reason = reason || 'None';
      decision.remarks = remarks;
      decision.expectedOrderValue = expectedOrderValue || decision.expectedOrderValue;
      decision.decisionDate = new Date();
      decision.updatedBy = req.user?._id;
      await decision.save();
    } else {
      decision = await LeadDecision.create({
        enquiry: enquiry._id,
        enquiryNumber: enquiry.enquiryNumber,
        customer: enquiry.customer,
        customerName: enquiry.companyName,
        expectedOrderValue: expectedOrderValue || 0,
        decisionDate: new Date(),
        leadStatus,
        reason: reason || 'None',
        remarks,
        updatedBy: req.user?._id
      });
    }

    // Update enquiry status
    if (leadStatus === 'Won') {
      enquiry.status = 'Won';
    } else if (leadStatus === 'Lost') {
      enquiry.status = 'Lost';
    }
    await enquiry.save();

    await logAudit(req, 'UPDATE', 'LeadDecision', decision._id.toString(), {
      enquiryNumber: enquiry.enquiryNumber,
      leadStatus,
      reason
    });

    res.status(200).json({ success: true, data: decision });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
