const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Authenticate user & get token
// @route   POST /token
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  console.log('Login attempt received:', req.body);
  const { username: rawUsername, password: rawPassword } = req.body;
  const username = rawUsername?.trim();
  const password = rawPassword?.trim();

  // Search for user by either username OR email
  const user = await User.findOne({ 
    $or: [
      { username: { $regex: new RegExp(`^${username}$`, 'i') } }, 
      { email: { $regex: new RegExp(`^${username}$`, 'i') } }
    ]
  });
  console.log('User lookup result:', user ? `Found (${user.username})` : 'Not Found');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  // Verify password matching
  const isMatch = await bcrypt.compare(password, user.hashed_password);

  if (!isMatch) {
    console.log(`[AUTH DEBUG] Password mismatch for: ${username}`);
    console.log(`[AUTH DEBUG] Provided password: [${password}]`);
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

// @desc    Setup password via onboarding token
// @route   POST /auth/setup-password
// @access  Public
const setupPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and password are required' });
  }

  // Find user by token and check expiration
  const user = await User.findOne({
    onboardingToken: token,
    onboardingTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired setup link' });
  }

  // Password Strength Validation (Server-side)
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!complexityRegex.test(password)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password does not meet complexity requirements: Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character.' 
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  user.hashed_password = await bcrypt.hash(password, salt);

  // Clear onboarding token fields
  user.onboardingToken = null;
  user.onboardingTokenExpires = null;
  
  // Ensure status is active
  if (user.status === 'frozen') user.status = 'active';

  await user.save();

  res.json({ success: true, message: 'Password established successfully. Deployment complete.' });
});

module.exports = {
  loginUser,
  setupPassword
};
