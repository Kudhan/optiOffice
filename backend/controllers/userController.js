const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const { getScope } = require('../middleware/getScope');

// @desc    Get current user profile and permissions
// @route   GET /users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-hashed_password').lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lookup the role in the database for the user's role name and tenantId
    const roleDoc = await Role.findOne({ 
      name: user.role, 
      tenantId: user.tenantId 
    }).lean();

    res.json({
      ...user,
      permissions: roleDoc ? roleDoc.permissions : []
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all users for tenant (Scoped)
// @route   GET /users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const filter = await getScope(req);
    const users = await User.find(filter).select('-hashed_password');
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
    const { username, password, email, full_name, role, manager, department } = req.body;
    
    // Task 3: Hierarchy Protection
    if (manager) {
      const managerUser = await User.findOne({ _id: manager, tenantId: req.user.tenantId });
      if (!managerUser) {
        return res.status(400).json({ detail: "Invalid manager: selection must be within your organization" });
      }
    }

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
      role: role || 'employee',
      manager: manager || null,
      department: department || 'General'
    });
    
    const userResponse = user.toObject();
    delete userResponse.hashed_password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update user (Role/Status)
// @route   PATCH /users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { role, status, department, full_name, manager } = req.body;
    const targetUserId = req.params.id;
    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Task 3: Hierarchy Protection
    if (manager) {
      if (manager === targetUserId) {
        return res.status(400).json({ detail: "Circular Reference: A user cannot be their own manager" });
      }
      const managerUser = await User.findOne({ _id: manager, tenantId: req.user.tenantId });
      if (!managerUser) {
        return res.status(400).json({ detail: "Invalid manager: selection must be within your organization" });
      }
    }

    if (role) user.role = role;
    if (status) user.status = status;
    if (department) user.department = department;
    if (full_name) user.full_name = full_name;
    if (manager !== undefined) user.manager = manager;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete user
// @route   DELETE /users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
