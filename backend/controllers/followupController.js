const FollowUp = require('../models/FollowUp');
const Enquiry = require('../models/Enquiry');
const { getNextSequence } = require('../utils/generateDocNumber');
const logAudit = require('../utils/auditLogger');
const Notification = require('../models/Notification');

// @desc Get follow-ups with filter
// @route GET /api/followups
exports.getFollowUps = async (req, res) => {
  try {
    const { enquiryId, customerId, assignedTo, filter, status } = req.query;
    let query = {};

    if (enquiryId) query.enquiry = enquiryId;
    if (customerId) query.customer = customerId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (filter === 'today') {
      query.nextFollowUpDate = { $gte: todayStart, $lte: todayEnd };
    } else if (filter === 'overdue') {
      query.nextFollowUpDate = { $lt: todayStart };
      query.status = { $ne: 'Completed' };
    } else if (filter === 'upcoming') {
      query.nextFollowUpDate = { $gt: todayEnd };
    }

    const followUps = await FollowUp.find(query)
      .populate('enquiry', 'enquiryNumber companyName priority status')
      .populate('customer', 'companyName customerCode')
      .populate('assignedTo', 'name email role')
      .sort({ followUpDate: -1 });

    res.json({ success: true, count: followUps.length, data: followUps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Follow-up (Never overwrites existing records)
// @route POST /api/followups
exports.createFollowUp = async (req, res) => {
  try {
    const { enquiry: enquiryId, nextFollowUpDate, discussionDetails, customerResponse, assignedTo, remarks, followUpType, followUpTime } = req.body;

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const followUpId = await getNextSequence('FOL');

    const followUp = await FollowUp.create({
      followUpId,
      enquiry: enquiry._id,
      enquiryNumber: enquiry.enquiryNumber,
      customer: enquiry.customer,
      customerName: enquiry.companyName,
      contactPerson: enquiry.contactPerson,
      followUpDate: req.body.followUpDate || new Date(),
      followUpTime: followUpTime || '10:30 AM',
      followUpType: followUpType || 'Call',
      discussionDetails,
      customerResponse: customerResponse || 'Interested / Needs Time',
      requirementChanges: req.body.requirementChanges,
      nextFollowUpDate,
      assignedTo: assignedTo || enquiry.assignedTo || req.user?._id,
      remarks,
      status: 'Completed',
      createdBy: req.user?._id
    });

    // Update enquiry status to Follow-up if currently in Submitted/Under Estimation
    if (['Submitted', 'Estimation Completed'].includes(enquiry.status)) {
      enquiry.status = 'Follow-up';
      await enquiry.save();
    }

    await logAudit(req, 'CREATE', 'FollowUp', followUp._id.toString(), {
      followUpId,
      enquiryNumber: enquiry.enquiryNumber,
      customerResponse
    });

    if (nextFollowUpDate && assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        title: 'Upcoming Scheduled Follow-up',
        message: `Follow-up with ${enquiry.companyName} scheduled for ${new Date(nextFollowUpDate).toLocaleDateString('en-GB')}`,
        link: `/enquiries/${enquiry._id}`,
        type: 'Reminder'
      });
    }

    res.status(201).json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update Follow-up
// @route PUT /api/followups/:id
exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up record not found' });
    }

    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
