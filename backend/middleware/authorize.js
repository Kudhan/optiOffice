const Role = require('../models/Role');

/**
 * Authority Middleware for OptiOffice RBAC
 * Checks if the user's role has the required permission within their tenant.
 */
const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role || !req.user.tenantId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
      // Lookup the role in the database for the specific tenant
      // Performance Tip: Use .lean() for faster read-only queries
      const roleDoc = await Role.findOne({ 
        name: req.user.role, 
        tenantId: req.user.tenantId 
      }).lean();

      if (!roleDoc) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access Denied: Role not found for this tenant' 
        });
      }

      // Check if the role contains the required permission
      if (!roleDoc.permissions || !roleDoc.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access Denied: Missing permission [${requiredPermission}]` 
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
