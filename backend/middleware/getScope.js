const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Security Utility: getScope
 * Returns a MongoDB filter based on the Role's scopeType configuration.
 * Scenarios:
 * 1. Global (Admin/HR): Sees everyone in tenant.
 * 2. Departmental (Dept Head): Sees everyone in their department.
 * 3. DirectReport (Standard Manager): Sees their reporting line.
 */
const getScope = async (req) => {
  const { role: roleName, tenantId, id } = req.user;

  // Find role to determine depth of access
  const roleDoc = await Role.findOne({ name: roleName, tenantId });
  const scopeType = roleDoc ? roleDoc.scopeType : 'DirectReport';

  // Admins always have Global access regardless of map
  if (roleName === 'admin' || roleName === 'super-admin' || scopeType === 'Global') {
    return { tenantId };
  }

  // Fetch current user details for department/manager context
  const currentUser = await User.findById(id).select('department_id department');

  if (scopeType === 'Departmental') {
    return { 
      tenantId, 
      $or: [
        { department_id: currentUser.department_id },
        { department: currentUser.department } // Compatibility fallback
      ]
    };
  }

  // Default: DirectReport / Standard Manager
  return { 
    tenantId, 
    $or: [{ manager: id }, { _id: id }] 
  };
};

/**
 * Security Utility: getTeamScope (Aggregated Filter)
 * Used for cross-collection queries (Attendance, Tasks)
 */
const getTeamScope = async (req, type = 'id') => {
  const filter = await getScope(req);
  
  // Convert results of getScope into a set of User IDs or Usernames
  const users = await User.find(filter).select('_id username');
  
  if (type === 'username') {
    return { tenantId: req.user.tenantId, assigned_to: { $in: users.map(u => u.username) } };
  }
  return { tenantId: req.user.tenantId, user: { $in: users.map(u => u._id) } };
};

module.exports = { getScope, getTeamScope };
