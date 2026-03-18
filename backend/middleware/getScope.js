const User = require('../models/User');

/**
 * Security Utility: getScope
 * Returns a basic MongoDB filter for the collection context.
 */
const getScope = (req) => {
  const { role, tenantId, id } = req.user;
  if (role === 'admin' || role === 'super-admin') return { tenantId };
  if (role === 'manager') return { tenantId, $or: [{ manager: id }, { _id: id }] };
  return { tenantId, _id: id };
};

/**
 * Security Utility: getTeamScope
 * Fetches the IDs or Usernames of everyone in the user's reporting line.
 * Useful for Attendance, Task, and Activity logging.
 */
const getTeamScope = async (req, type = 'id') => {
  const { role, tenantId, id, sub } = req.user;

  // Admins are not scoped by team
  if (role === 'admin' || role === 'super-admin') {
    return { tenantId };
  }

  // Managers see their team + themselves
  if (role === 'manager') {
    const team = await User.find({
      tenantId,
      $or: [{ manager: id }, { _id: id }]
    }).select('_id username');

    if (type === 'username') {
      return { tenantId, assigned_to: { $in: team.map(u => u.username) } };
    }
    return { tenantId, user: { $in: team.map(u => u._id) } };
  }

  // Employees only see themselves
  if (type === 'username') {
    return { tenantId, assigned_to: sub };
  }
  return { tenantId, user: id };
};

module.exports = { getScope, getTeamScope };
