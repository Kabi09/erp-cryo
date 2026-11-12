const Activity = require('../models/Activity');

const logActivity = async ({
  leadId,
  activityType,
  title,
  description = '',
  userId,
  documentType = 'None',
  documentId = null,
  metadata = {}
}) => {
  try {
    const activity = await Activity.create({
      lead: leadId,
      activityType,
      title,
      description,
      user: userId,
      documentType,
      documentId,
      metadata
    });
    return activity;
  } catch (error) {
    console.error(`[Activity Logging Failed]: ${error.message}`);
    // We do not throw so main business flow does not fail if logging fails
    return null;
  }
};

module.exports = logActivity;

