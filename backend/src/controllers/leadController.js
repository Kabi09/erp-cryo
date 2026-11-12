const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const logActivity = require('../utils/activityLogger');

// Helper to generate next Lead Number
const getNextLeadNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CSS-LD-${currentYear}-`;
  const lastLead = await Lead.findOne({ leadNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select('leadNumber');

  let nextSequence = 1;
  if (lastLead && lastLead.leadNumber) {
    const parts = lastLead.leadNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }
  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
};

// @desc    Get all leads with filters & pagination
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res, next) => {
  try {
    const { search, stage, status, source, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { leadNumber: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { 'requirements.equipmentType': { $regex: search, $options: 'i' } }
      ];
    }

    if (stage) query.stage = stage;
    if (status) query.status = status;
    if (source) query.source = source;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('customer', 'customerCode companyName contactPerson email phone')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'currentQuotation',
        select: 'quotationNumber status currentRevisionNumber grandTotal activeRevision'
      })
      .populate({
        path: 'currentPO',
        select: 'poNumber poDate poValue verificationStatus'
      })
      .populate({
        path: 'currentSO',
        select: 'soNumber soDate status productionHandover'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: leads,
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

// @desc    Get single lead by ID with complete relationships
// @route   GET /api/leads/:id
// @access  Private
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('customer')
      .populate('assignedTo', 'name email phone department')
      .populate('createdBy', 'name email')
      .populate('qualification.qualifiedBy', 'name email')
      .populate({
        path: 'currentQuotation',
        populate: [
          { path: 'activeRevision' },
          { path: 'winningRevision' },
          { path: 'revisions' }
        ]
      })
      .populate('currentPI')
      .populate('currentPO')
      .populate('currentSO');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lead / enquiry
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      city,
      state,
      source,
      requirements,
      priority,
      customer
    } = req.body;

    const leadNumber = await getNextLeadNumber();

    const lead = await Lead.create({
      leadNumber,
      companyName,
      contactPerson: typeof contactPerson === 'string' ? { name: contactPerson } : contactPerson,
      email,
      phone,
      city,
      state,
      source: source || 'Email Enquiry',
      requirements: requirements || { equipmentType: 'Cryogenic Container', quantity: 1 },
      priority: priority || 'MEDIUM',
      customer: customer || null,
      stage: 'ENQUIRY_RECEIVED',
      status: 'New',
      createdBy: req.user._id,
      assignedTo: req.user._id
    });

    // Log Activity
    await logActivity({
      leadId: lead._id,
      activityType: 'LEAD_CREATED',
      title: `Enquiry Received: ${lead.leadNumber}`,
      description: `New lead created for ${lead.companyName} (${lead.requirements?.equipmentType || 'Cryo Equipment'}) from source: ${lead.source}`,
      userId: req.user._id,
      documentType: 'Lead',
      documentId: lead._id
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead details
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updatableFields = [
      'companyName',
      'contactPerson',
      'email',
      'phone',
      'city',
      'state',
      'source',
      'requirements',
      'priority',
      'customer',
      'assignedTo',
      'status'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'LEAD_UPDATED',
      title: 'Lead Details Updated',
      description: `Updated lead information for ${lead.companyName}`,
      userId: req.user._id,
      documentType: 'Lead',
      documentId: lead._id
    });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Qualify or Disqualify a lead
// @route   PUT /api/leads/:id/qualify
// @access  Private
exports.qualifyLead = async (req, res, next) => {
  try {
    const {
      status, // 'Qualified' or 'Disqualified'
      qualificationNotes,
      budgetConfirmed,
      decisionMakerIdentified,
      requirementClarity
    } = req.body;

    if (!['Qualified', 'Disqualified'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Qualification status must be either Qualified or Disqualified'
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const isQualified = status === 'Qualified';

    lead.qualification = {
      isQualified,
      status,
      qualifiedAt: new Date(),
      qualifiedBy: req.user._id,
      qualificationNotes: qualificationNotes || '',
      budgetConfirmed: Boolean(budgetConfirmed),
      decisionMakerIdentified: Boolean(decisionMakerIdentified),
      requirementClarity: requirementClarity || 'High'
    };

    if (isQualified) {
      lead.stage = 'QUALIFICATION';
      lead.status = 'Qualified';
    } else {
      lead.stage = 'QUALIFICATION';
      lead.status = 'Disqualified';
    }

    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: isQualified ? 'LEAD_QUALIFIED' : 'LEAD_DISQUALIFIED',
      title: isQualified ? 'Lead Successfully Qualified' : 'Lead Disqualified',
      description: `Lead qualification marked as ${status}. Notes: ${qualificationNotes || 'No notes provided'}`,
      userId: req.user._id,
      documentType: 'Lead',
      documentId: lead._id,
      metadata: { status, budgetConfirmed, decisionMakerIdentified, requirementClarity }
    });

    res.status(200).json({
      success: true,
      message: `Lead has been marked as ${status}`,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lead timeline activities
// @route   GET /api/leads/:id/activities
// @access  Private
exports.getLeadActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ lead: req.params.id })
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add general note / activity to lead timeline
// @route   POST /api/leads/:id/activities
// @access  Private
exports.addLeadActivity = async (req, res, next) => {
  try {
    const { title, description, activityType = 'GENERAL_NOTE' } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Activity title is required' });
    }

    const activity = await logActivity({
      leadId: req.params.id,
      activityType,
      title,
      description,
      userId: req.user._id,
      documentType: 'Lead',
      documentId: req.params.id
    });

    res.status(201).json({
      success: true,
      message: 'Note added to lead timeline',
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a follow-up entry to a lead
// @route   POST /api/leads/:id/follow-ups
// @access  Private
exports.addFollowUp = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { followUpDate, status, notes, nextFollowUpDate, conductedByName } = req.body;
    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Follow-up remarks/notes are required' });
    }

    const newFollowUp = {
      followUpDate: followUpDate ? new Date(followUpDate) : new Date(),
      status: status || 'INTERESTED',
      notes: notes.trim(),
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      conductedByName: conductedByName || req.user.name || 'Sales Representative',
      conductedBy: req.user._id,
      createdAt: new Date()
    };

    if (!lead.followUps) lead.followUps = [];
    lead.followUps.unshift(newFollowUp);
    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'LEAD_FOLLOW_UP',
      title: `Follow-up: ${newFollowUp.status}`,
      description: `Follow-up logged by ${newFollowUp.conductedByName}: "${newFollowUp.notes}"${newFollowUp.nextFollowUpDate ? ` (Next Date: ${new Date(newFollowUp.nextFollowUpDate).toLocaleDateString()})` : ''}`,
      userId: req.user._id,
      documentType: 'Lead',
      documentId: lead._id
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up logged successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify/Update an existing follow-up entry
// @route   PUT /api/leads/:id/follow-ups/:followUpId
// @access  Private
exports.updateFollowUp = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const followUp = lead.followUps.id(req.params.followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up entry not found' });
    }

    const { followUpDate, status, notes, nextFollowUpDate, conductedByName } = req.body;
    if (followUpDate) followUp.followUpDate = new Date(followUpDate);
    if (status) followUp.status = status;
    if (notes) followUp.notes = notes.trim();
    if (nextFollowUpDate !== undefined) {
      followUp.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
    }
    if (conductedByName) followUp.conductedByName = conductedByName;

    await lead.save();

    await logActivity({
      leadId: lead._id,
      activityType: 'LEAD_FOLLOW_UP',
      title: `Follow-up Modified: ${followUp.status}`,
      description: `Follow-up record updated: "${followUp.notes}"`,
      userId: req.user._id,
      documentType: 'Lead',
      documentId: lead._id
    });

    res.status(200).json({
      success: true,
      message: 'Follow-up modified successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a follow-up entry
// @route   DELETE /api/leads/:id/follow-ups/:followUpId
// @access  Private
exports.deleteFollowUp = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.followUps.pull({ _id: req.params.followUpId });
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Follow-up removed',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

