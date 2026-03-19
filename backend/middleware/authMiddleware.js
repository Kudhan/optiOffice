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

      // Real-time Status Verification
      const user = await User.findById(decoded.id).select('status');
      
      if (!user) {
        return res.status(401).json({ detail: 'User no longer exists' });
      }

      // 1. Blocked Status: Total Lockout
      if (user.status === 'blocked') {
        return res.status(401).json({ detail: 'Account Blocked: Access Denied' });
      }

      // 2. Suspended Status: Write-Restricted (Notice Period)
      if (user.status === 'suspended') {
        const restrictedMethods = ['POST', 'PUT', 'DELETE'];
        const restrictedPaths = ['attendance', 'tasks', 'profile'];
        
        const isRestrictedPath = restrictedPaths.some(path => req.originalUrl.toLowerCase().includes(path));
        
        if (restrictedMethods.includes(req.method) && isRestrictedPath) {
          return res.status(403).json({ detail: 'Account Suspended during Notice Period' });
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
