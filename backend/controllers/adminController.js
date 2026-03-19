const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');

const AuditLog = require('../models/AuditLog');

// @desc    Update user status (Block/Suspend)
// @route   PATCH /admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { action } = req.body; // 'Block' or 'Suspend'
    const targetUserId = req.params.id;

    // Security Rule: The Suicide Check
    if (targetUserId === req.user.id) {
      return res.status(400).json({ 
        detail: "Suicide mission blocked: You cannot disable your own account." 
      });
    }

    const targetStatus = action === 'Block' ? 'blocked' : 
                         action === 'Suspend' ? 'suspended' : 'active';
    
    // Atomically Update Status with Scope Guard
    const user = await User.findOneAndUpdate(
      { _id: targetUserId, tenantId: req.user.tenantId },
      { $set: { status: targetStatus } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ detail: "Target User not found within your organization." });
    }

    // Verification: Persist Activity Log
    const timestamp = new Date().toISOString();
    await AuditLog.create({
      adminId: req.user.id,
      userId: targetUserId,
      action: action,
      details: `${req.user.id} ${action.toLowerCase()}ed ${targetUserId} at ${timestamp}`,
      tenantId: req.user.tenantId
    });

    res.json({ message: `User status changed to ${targetStatus}`, user });
  } catch (error) {
    console.error('updateUserStatus Error Details:', error);
    res.status(500).json({ detail: error.message || "Server Error during status update" });
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
    await User.updateOne({ _id: targetUserId, tenantId: req.user.tenantId }, { role: role });

    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error('manageAuthority Error Details:', error);
    res.status(500).json({ detail: error.message || "Server Error during authority update" });
  }
};

// @desc    Hard delete user and associated metadata
// @route   DELETE /admin/users/:id/terminate
// @access  Private/Admin
const terminateUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Prevent self-termination
    if (targetUserId === req.user.id) {
      return res.status(403).json({ detail: "Security Violation: Admins cannot terminate their own account." });
    }

    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    const { username } = user;
    const timestamp = new Date().toISOString();

    // Cascading deletion
    try {
      // 1. Log the termination before data purge (Audit Trail Persistence)
      await AuditLog.create({
        adminId: req.user.id,
        userId: targetUserId,
        action: 'Terminate',
        details: `${req.user.id} terminated ${targetUserId} at ${timestamp}`,
        tenantId: req.user.tenantId
      });

      // 2. Eradicate user lifecycle data
      await User.deleteOne({ _id: targetUserId });
      await Attendance.deleteMany({ user: targetUserId });
      await Task.deleteMany({ assigned_to: username, tenantId: req.user.tenantId });
      await Leave.deleteMany({ username: username, tenantId: req.user.tenantId });

      res.json({ message: "Cascade deletion complete. User and associated metabolic data purged successfully." });
    } catch (dbErr) {
      console.error('Data Integrity Violation in terminateUser:', dbErr);
      res.status(500).json({ detail: "Data integrity violation during cascade deletion." });
    }
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
