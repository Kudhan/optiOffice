const ActivityLog = require('../models/ActivityLog');

/**
 * Record a user activity
 * @param {Object} req - Express request object (contains user and tenantId)
 * @param {String} type - 'Attendance' or 'Task'
 * @param {String} action - Description of the action
 * @param {String} details - Additional context
 */
const recordActivity = async (req, type, action, details = '') => {
  try {
    if (!req.user) return; // Guard against unauthenticated requests

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.full_name || req.user.username || 'Unknown User',
      type,
      action,
      details,
      tenantId: req.user.tenantId
    });
  } catch (error) {
    console.error(`[ActivityLogger] Failed to record activity: ${error.message}`);
    // We don't want to throw error here to avoid breaking the main flow
  }
};

module.exports = { recordActivity };
