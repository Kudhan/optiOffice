const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Authenticate user & get token
// @route   POST /token
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  console.log('Login attempt received:', req.body);
  const { username, password } = req.body; // 'username' here acts as a generic identifier (username or email)

  // Search for user by either username OR email
  const user = await User.findOne({ 
    $or: [
      { username: username }, 
      { email: username }
    ]
  });
  console.log('User lookup result:', user ? `Found (${user.username})` : 'Not Found');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  // Verify password matching old bcrypt python hash
  const isMatch = await bcrypt.compare(password, user.hashed_password);

  if (!isMatch) {
    console.log('Password mismatch for user:', username);
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  // Security Guard: Lifecycle Block
  if (user.disabled || user.status?.toLowerCase() === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact Admin.' });
  }

  // Generate JWT mirroring python payload {"sub": user["username"], "role": user["role"]} and added tenantId and userId
  const token = jwt.sign(
    { 
      id: user._id.toString(), 
      sub: user.username, 
      role: user.role, 
      tenantId: user.tenantId || 'default_tenant' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30m' }
  );

  // Return the exact structure React is expecting
  res.json({
    access_token: token,
    token_type: "bearer"
  });
});

module.exports = {
  loginUser
};
