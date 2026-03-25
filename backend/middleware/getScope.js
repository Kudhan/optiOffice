const mongoose = require('mongoose');
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

  // Admins and HR always have Global access regardless of map
  if (roleName === 'admin' || roleName === 'hr' || roleName === 'super-admin' || scopeType === 'Global') {
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
    $or: [{ manager: new mongoose.Types.ObjectId(id) }, { _id: new mongoose.Types.ObjectId(id) }] 
  };
};

/**
 * Security Utility: getTeamScope (Aggregated Filter)
 * Used for cross-collection queries (Attendance, Tasks)
 */
const getTeamScope = async (req, fieldName = 'user') => {
  const filter = await getScope(req);
  const users = await User.find(filter).select('_id');
  const userIds = users.map(u => u._id);
  
  if (fieldName === 'assigned_to') {
    // For tasks, we check if ANY assigned user is in our scoped list
    return { tenantId: req.user.tenantId, assigned_to: { $in: userIds } };
  }
  
  return { tenantId: req.user.tenantId, [fieldName]: { $in: userIds } };
};

module.exports = { getScope, getTeamScope };
