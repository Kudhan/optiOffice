/**
 * Authority Middleware for OptiOffice RBAC
 * Checks if the user's role is within the allowed roles array.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access Denied: Insufficient Permissions' 
      });
    }

    next();
  };
};

module.exports = authorize;
