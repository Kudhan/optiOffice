const Role = require('../models/Role');

/**
 * Authority Middleware for OptiOffice RBAC
 * Checks if the user's role has the required permission within their tenant.
 */
const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Task 1: Super Admin & Admin Bypass
    const currentRole = req.user.role?.toLowerCase();
    if (currentRole === 'super-admin' || currentRole === 'admin') {
      return next();
    }

    if (!req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Tenant context missing' });
    }

    try {
      // Robust tenant check: normalize both to string
      const searchTenantId = String(req.user.tenantId);
      
      // Lookup the role in the database for the specific tenant
      const roleDoc = await Role.findOne({ 
        name: { $regex: new RegExp(`^${req.user.role}$`, 'i') }, 
        tenantId: searchTenantId 
      }).lean();

      if (!roleDoc) {
        console.log(`[AUTH DEBUG] Role [${req.user.role}] not found for Tenant [${searchTenantId}]`);
        return res.status(403).json({ 
          success: false, 
          message: 'Access Denied: Role permissions not initialized for your tenant. Please contact support.' 
        });
      }

      // Check if the role contains the required permission
      if (!roleDoc.permissions || !roleDoc.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access Denied: Missing permission [${requiredPermission}]` 
        });
      }

      // Task: Self-Management Restriction
      // Admins/HR cannot edit their own critical roles or permissions
      const isSelfEdit = req.params.id && String(req.params.id) === String(req.user.id);
      if (isSelfEdit && (req.body.role || req.body.permissions)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Security Policy: Self-management of roles or permissions is restricted. Please contact another administrator.' 
        });
      }

      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error during authorization' });
    }
  };
};

module.exports = authorize;
