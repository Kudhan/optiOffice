const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { getScope } = require('../middleware/getScope');

// @desc    Get current user profile and permissions
// @route   GET /users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-hashed_password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lookup the role in the database for the user's role name and tenantId
    const roleDoc = await Role.findOne({ 
      name: user.role, 
      tenantId: user.tenantId 
    }).lean();

    const userObj = user.toObject();
    
    res.json({
      ...userObj,
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
    
    // Add role filtering from query
    const { role } = req.query;
    if (role) {
      if (Array.isArray(role)) {
        filter.role = { $in: role };
      } else {
        filter.role = role;
      }
    }

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
      
      // Strict Management Role Enforcement
      if (!['admin', 'manager', 'hr'].includes(managerUser.role)) {
        return res.status(400).json({ detail: "Hierarchy Error: Only High-Level Command Nodes (Admin/Manager/HR) can be assigned as personnel managers." });
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

const Task = require('../models/Task');
const Attendance = require('../models/Attendance');

// @desc    Get 360 Dossier for a user
// @route   GET /users/:id/dossier
// @access  Private/Admin/Manager
const getUserDossier = async (req, res) => {
  try {
    const targetId = req.params.id;
    console.log('[DEBUG] Fetching Dossier for:', targetId);
    
    const user = await User.findById(targetId)
      .select('-hashed_password')
      .populate('manager', 'full_name');
    
    if (!user) return res.status(404).json({ detail: "User not found" });

    // Aggregate stats from other collections 
    // Note: Task uses 'assigned_to' (username) and Attendance uses 'user' (ObjectId)
    const [totalTasks, completedTasks, lastAttendance, recentTasks, attendanceLogs] = await Promise.all([
      Task.countDocuments({ assigned_to: user.username, tenantId: user.tenantId }),
      Task.countDocuments({ 
        assigned_to: user.username, 
        tenantId: user.tenantId,
        status: { $regex: /^completed$/i } 
      }),
      Attendance.findOne({ user: targetId }).sort({ createdAt: -1 }),
      Task.find({ assigned_to: user.username, tenantId: user.tenantId }).sort({ createdAt: -1 }).limit(20),
      Attendance.find({ user: targetId }).sort({ date: -1 }).limit(20)
    ]);

    console.log('[DEBUG] DB Results:', { 
      username: user.username,
      totalTasks, 
      completedTasks, 
      tasksCount: recentTasks.length,
      logsCount: attendanceLogs.length 
    });

    res.json({
      user,
      stats: {
        totalTasks,
        completedTasks,
        performance: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        lastPulse: lastAttendance ? lastAttendance.status : 'N/A',
        recentTasks, // Full task objects
        attendanceLogs // Full attendance objects
      }
    });
  } catch (error) {
    console.error('[ERROR] Dossier Stats Failure:', error);
    res.status(500).json({ message: "Dossier Retrieval Failed" });
  }
};

// @desc    Update User Hierarchy (Manager Transfer)
// @route   PATCH /users/:id/hierarchy
// @access  Private/Admin
const updateUserHierarchy = async (req, res) => {
  try {
    const { managerId, reassignTasks } = req.body;
    const targetUserId = req.params.id;

    // 1. Basic Validation
    if (managerId === targetUserId) {
      return res.status(400).json({ detail: "Self-Reporting Error: A node cannot report to itself." });
    }

    // New Manager Role Validation
    const newManager = await User.findById(managerId);
    if (!newManager || !['admin', 'manager', 'hr'].includes(newManager.role)) {
      return res.status(400).json({ detail: "Hierarchy Action Denied: The target node must have Command Clearance (Admin/Manager/HR)." });
    }

    // 2. Circular Dependency Check (Recursive)
    const isCircular = async (currentManagerId, soughtUserId) => {
      if (!currentManagerId) return false;
      if (String(currentManagerId) === String(soughtUserId)) return true;
      const nextManager = await User.findById(currentManagerId).select('manager');
      return nextManager ? isCircular(nextManager.manager, soughtUserId) : false;
    };

    if (await isCircular(managerId, targetUserId)) {
      return res.status(400).json({ detail: "Hierarchy Loop Detected: This move would create a circular reference." });
    }

    const user = await User.findById(targetUserId);
    const oldManagerId = user.manager;
    user.manager = managerId;
    await user.save();

    // 3. Bulk Task Reassignment
    if (reassignTasks && oldManagerId) {
      const Task = mongoose.model('Task');
      await Task.updateMany(
        { assignedTo: targetUserId, observer: oldManagerId },
        { $set: { observer: managerId } }
      );
    }

    res.json({ success: true, message: "Hierarchy alignment completed." });
  } catch (error) {
    res.status(500).json({ message: "Hierarchy Update Failed" });
  }
};

// @desc    Account Control Kill-Switch
// @route   POST /users/:id/kill-switch
// @access  Private/Admin
const accountControl = async (req, res) => {
  try {
    const { action } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ detail: "User not found" });

    switch (action) {
      case 'freeze':
        user.status = 'frozen';
        break;
      case 'unfreeze':
        user.status = 'active';
        break;
      case 'logout':
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        break;
      default:
        return res.status(400).json({ detail: "Invalid protocol action" });
    }

    await user.save();
    res.json({ success: true, message: `Action ${action} executed on node ${user.username}` });
  } catch (error) {
    res.status(500).json({ message: "Kill-Switch Execution Failed" });
  }
};

module.exports = {
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserDossier,
  updateUserHierarchy,
  accountControl
};
