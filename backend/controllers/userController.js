const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users for tenant
// @route   GET /users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId }).select('-hashed_password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create/Invite new user
// @route   POST /users
// @access  Private
const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const { username, password, email, full_name, role } = req.body;
    
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ detail: "Username already exists" });
    }

    // Salt and hash the password (mirroring bcrypt flow from Python passlib)
    const salt = await bcrypt.genSalt(12);
    const hashed_password = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      tenantId: req.user.tenantId,
      username,
      hashed_password,
      email,
      full_name,
      role: role || 'employee'
    });
    
    const userResponse = user.toObject();
    delete userResponse.hashed_password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getUsers,
  createUser
};
