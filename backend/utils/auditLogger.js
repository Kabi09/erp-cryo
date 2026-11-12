const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, moduleName, documentId, details = {}) => {
  try {
    await AuditLog.create({
      user: req?.user?._id,
      userName: req?.user?.name || 'System',
      userRole: req?.user?.role || 'System',
      action,
      module: moduleName,
      documentId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = logAudit;
