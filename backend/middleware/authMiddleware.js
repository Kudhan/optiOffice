const jwt = require('jsonwebtoken');

const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Real-time Status Verification: The Live Guard
      const user = await User.findById(decoded.id).select('status disabled');
      
      if (!user) {
        return res.status(401).json({ detail: 'Account Identity Null: Access Denied' });
      }

      // 1. Blocked Status: Total Lockout (with legacy fallback)
      if (user.disabled || user.status?.toLowerCase() === 'blocked') {
        return res.status(403).json({ detail: 'Your account has been disabled. Contact Admin.' });
      }

      // 2. Suspended Status: Global Write-Restrict (Read-only mode)
      if (user.status === 'suspended') {
        const restrictedMethods = ['POST', 'PUT', 'DELETE'];
        if (restrictedMethods.includes(req.method)) {
          return res.status(403).json({ detail: 'Account suspended: Read-only mode active' });
        }
      }

      // Mutate request to include current user equivalent
      req.user = decoded; 
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ detail: 'Not authenticated' });
    }
  } else {
    res.status(401).json({ detail: 'Not authenticated' });
  }
};

module.exports = { protect };
