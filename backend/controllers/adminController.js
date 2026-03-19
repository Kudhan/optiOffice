const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');

// @desc    Update user status (Block/Suspend)
// @route   PATCH /admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { action } = req.body; // 'Block' or 'Suspend'
    const targetUserId = req.params.id;

    // Security Rule: Prevent an Admin from blocking/suspending their own account
    if (targetUserId === req.user.id) {
      return res.status(403).json({ 
        detail: "Security Violation: Admins cannot block or suspend their own accounts." 
      });
    }

    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    if (action === 'Block') {
      user.status = 'blocked';
    } else if (action === 'Suspend') {
      user.status = 'suspended';
    } else {
      return res.status(400).json({ detail: "Invalid action. Use 'Block' or 'Suspend'." });
    }

    await user.save();
    res.json({ message: `User status updated to ${user.status}`, user });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Manage user authority (Role changes)
// @route   PATCH /admin/users/:id/authority
// @access  Private/Admin
const manageAuthority = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    // Security Rule: Prevent an Admin from demoting themselves
    // If the admin is trying to change their own role to something other than Admin
    if (targetUserId === req.user.id && role !== 'Admin') {
      return res.status(403).json({ 
        detail: "Security Violation: Admins cannot demote themselves or change their own administrative role." 
      });
    }

    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error('manageAuthority error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Hard delete user and associated metadata
// @route   DELETE /admin/users/:id/terminate
// @access  Private/Admin
const terminateUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Prevent self-termination for safety
    if (targetUserId === req.user.id) {
      return res.status(403).json({ detail: "Security Violation: Admins cannot terminate their own account." });
    }

    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    const { username } = user;

    // Hard delete user
    await User.deleteOne({ _id: targetUserId });

    // Remove associated metadata
    await Attendance.deleteMany({ user: targetUserId });
    await Task.deleteMany({ assigned_to: username, tenantId: req.user.tenantId });
    await Leave.deleteMany({ username: username, tenantId: req.user.tenantId });

    res.json({ message: "User and all associated data have been permanently removed." });
  } catch (error) {
    console.error('terminateUser error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  updateUserStatus,
  manageAuthority,
  terminateUser
};
