const User = require('../models/User');
const Role = require('../models/Role');
const { Leave } = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendOnboardingEmail } = require('../utils/emailService');
const { getScope } = require('../middleware/getScope');

const stripSensitiveData = (user, viewer) => {
  const isSelf = String(user._id) === String(viewer.id || viewer._id);
  const isAdmin = viewer.role === 'admin';
  const isHR = viewer.role === 'hr' || viewer.department === 'HR';
  const hasPermission = viewer.permissions?.includes('can_view_sensitive_data');

  const userObj = user.toObject ? user.toObject() : user;

  if (isSelf || isAdmin || isHR || hasPermission) {
    if (user.decryptVault) user.decryptVault();
    // Re-get object after decryption if it was a mongoose document
    const fullObj = user.toObject ? user.toObject() : user;
    return fullObj;
  }

  // Colleague View: Strip privateIdentity and secureVault
  const { privateIdentity, secureVault, hashed_password, sessionVersion, ...publicData } = userObj;
  return publicData;
};

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
    const strippedUsers = users.map(u => stripSensitiveData(u, req.user));
    res.json(strippedUsers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create/Invite new user
// @route   POST /users
// @access  Private
const createUser = async (req, res) => {
  try {
    let { username, password, email, full_name, role, manager, department } = req.body;
    
    // Trim and Cleanse Inputs
    username = username?.trim();
    email = email?.trim()?.toLowerCase();
    full_name = full_name?.trim();
    
    // Task 3: Hierarchy Protection
    if (manager) {
      const managerUser = await User.findOne({ _id: manager, tenantId: req.user.tenantId });
      if (!managerUser) {
        return res.status(400).json({ detail: "Invalid manager: selection must be within your organization" });
      }
      
      // Strict Management Role Enforcement
      if (!['admin', 'manager', 'hr'].includes(managerUser.role?.toLowerCase())) {
        return res.status(400).json({ detail: "Hierarchy Error: Only High-Level Command Nodes (Admin/Manager/HR) can be assigned as personnel managers." });
      }
    }

    const userExists = await User.findOne({ 
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: email }
      ]
    });

    if (userExists) {
      const conflictField = userExists.username.toLowerCase() === username.toLowerCase() ? "Username" : "Email";
      return res.status(400).json({ detail: `${conflictField} already exists in the system.` });
    }

    // Generate Onboarding Token
    const onboardingToken = crypto.randomBytes(32).toString('hex');
    const onboardingTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Salt and hash a random placeholder password (mirroring bcrypt flow)
    const randomPass = crypto.randomBytes(16).toString('hex');
    const salt = await bcrypt.genSalt(12);
    const hashed_password = await bcrypt.hash(randomPass, salt);
    
    const user = await User.create({
      tenantId: req.user.tenantId,
      username,
      hashed_password,
      email,
      full_name,
      role: role || 'employee',
      manager: manager || null,
      department: department || 'General',
      onboardingToken,
      onboardingTokenExpires,
      publicProfile: req.body.publicProfile || { preferredName: full_name, workEmail: email },
      privateIdentity: req.body.privateIdentity || { legalName: full_name },
      secureVault: req.body.secureVault || {}
    });

    // --- Validation Protocol (Indian Standards) ---
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const aadharRegex = /^[2-9]{1}[0-9]{11}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (user.privateIdentity?.panNumber && !panRegex.test(user.privateIdentity.panNumber)) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ detail: "Invalid PAN Card Format: Must be AAAAA1234A" });
    }
    if (user.privateIdentity?.aadharNumber) {
      const cleanAadhar = user.privateIdentity.aadharNumber.replace(/\s/g, '');
      if (!aadharRegex.test(cleanAadhar)) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ detail: "Invalid Aadhar Number: Must be 12 digits" });
      }
      user.privateIdentity.aadharNumber = cleanAadhar; // Store without spaces
    }
    if (user.secureVault?.bankDetails?.ifscCode && !ifscRegex.test(user.secureVault.bankDetails.ifscCode)) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ detail: "Invalid IFSC Code: Must be AAAA0123456" });
    }
    await user.save();

    // Send Onboarding Email (Async)
    sendOnboardingEmail(user, onboardingToken).catch(err => {
      console.error('[ONBOARDING] Failed to send email during creation:', err);
    });
    
    const userResponse = stripSensitiveData(user, req.user);
    res.json(userResponse);
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update user (Role/Status)
// @route   PATCH /users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { role, status, department, full_name, manager, publicProfile, privateIdentity, secureVault } = req.body;
    const targetUserId = req.params.id;
    const user = await User.findOne({ _id: targetUserId, tenantId: req.user.tenantId });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Role check for sensitivity
    const isAdmin = req.user.role === 'admin';
    const isSelf = String(req.user.id || req.user._id) === String(targetUserId);

    if (manager) {
      if (manager === targetUserId) {
        return res.status(400).json({ detail: "Circular Reference: A user cannot be their own manager" });
      }
      const managerUser = await User.findOne({ _id: manager, tenantId: req.user.tenantId });
      if (!managerUser) {
        return res.status(400).json({ detail: "Invalid manager: selection must be within your organization" });
      }
    }

    if (role && isAdmin) user.role = role.toLowerCase();
    if (status && isAdmin) user.status = status;
    if (department && isAdmin) user.department = department;
    if (full_name) user.full_name = full_name;
    if (manager !== undefined && isAdmin) user.manager = manager;

    // Deep merge for buckets
    if (publicProfile) user.publicProfile = { ...user.publicProfile, ...publicProfile };
    
    if (isAdmin || isSelf) {
      if (privateIdentity) {
        // Validation for Updates
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        const aadharRegex = /^[2-9]{1}[0-9]{11}$/;

        if (privateIdentity.panNumber && !panRegex.test(privateIdentity.panNumber)) {
          return res.status(400).json({ detail: "Invalid PAN Card Format: Must be AAAAA1234A" });
        }
        if (privateIdentity.aadharNumber) {
          const cleanAadhar = privateIdentity.aadharNumber.replace(/\s/g, '');
          if (!aadharRegex.test(cleanAadhar)) {
            return res.status(400).json({ detail: "Invalid Aadhar Number: Must be 12 digits" });
          }
          privateIdentity.aadharNumber = cleanAadhar;
        }
        user.privateIdentity = { ...user.privateIdentity, ...privateIdentity };
      }

      if (secureVault) {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (secureVault.bankDetails?.ifscCode && !ifscRegex.test(secureVault.bankDetails.ifscCode)) {
          return res.status(400).json({ detail: "Invalid IFSC Code: Must be AAAA0123456" });
        }
        user.secureVault = { ...user.secureVault, ...secureVault };
      }
    }

    await user.save();
    res.json(stripSensitiveData(user, req.user));
  } catch (error) {
    console.error('[ERROR] Identity Override Failure:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ detail: error.message });
    }
    res.status(500).json({ message: "Identity Override Protocol Failed" });
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

// @desc    Get 360 Dossier for a user
// @route   GET /users/:id/dossier
// @access  Private/Admin/Manager
const getUserDossier = async (req, res) => {
  try {
    const targetId = req.params.id;
    console.log('[DEBUG] Fetching Dossier for:', targetId);
    
    const user = await User.findById(targetId)
      .select('-hashed_password')
      .populate('manager', 'full_name')
      .populate('shift_id');
    
    if (!user) return res.status(404).json({ detail: "User not found" });

    // Aggregate stats from other collections 
    const [totalTasks, completedTasks, lastAttendance, recentTasks, attendanceLogs, leaves] = await Promise.all([
      Task.countDocuments({ assigned_to: user._id, tenantId: user.tenantId }),
      Task.countDocuments({ 
        assigned_to: user._id, 
        tenantId: user.tenantId,
        status: { $regex: /^completed$/i } 
      }),
      Attendance.findOne({ user: targetId }).sort({ createdAt: -1 }),
      Task.find({ assigned_to: user._id, tenantId: user.tenantId }).sort({ createdAt: -1 }).limit(20),
      Attendance.find({ user: targetId }).sort({ date: -1 }).limit(20),
      Leave.find({ user: targetId, status: { $in: ['Approved', 'Pending'] } })
    ]);

    const userResponse = stripSensitiveData(user, req.user);
    res.json({
      user: userResponse,
      stats: {
        totalTasks,
        completedTasks,
        performance: totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0,
        lastPulse: lastAttendance ? lastAttendance.status : 'N/A',
        recentTasks, // Full task objects
        attendanceLogs, // Full attendance objects
        leaves // Full leave objects
      }
    });
  } catch (error) {
    console.error('[ERROR] Dossier Stats Failure:', error);
    res.status(500).json({ detail: "Dossier Retrieval Failed: Intelligence Node Connectivity Error." });
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
    let newManager = null;
    if (managerId) {
      newManager = await User.findById(managerId);
      if (!newManager || !['admin', 'manager', 'hr'].includes(newManager.role?.toLowerCase())) {
        return res.status(400).json({ detail: "Hierarchy Action Denied: The target node must have Command Clearance (Admin/Manager/HR)." });
      }
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
    user.manager = managerId || null;
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
    console.error('[ERROR] Hierarchy Update Failure:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ detail: error.message });
    }
    res.status(500).json({ detail: "Hierarchy Update Failed: Command Node Logic Error." });
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
    console.error('[ERROR] Kill-Switch Failure:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ detail: error.message });
    }
    res.status(500).json({ message: "Kill-Switch Execution Failed" });
  }
};

// @desc    Update User Department
// @route   PATCH /users/:id/department
// @access  Private/Admin/HR
const updateUserDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const targetUserId = req.params.id;

    // Validate Department
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ detail: "Invalid Organizational Unit ID" });
    }
    
    const Department = mongoose.model('Department');
    const department = await Department.findOne({ _id: departmentId, tenantId: req.user.tenantId });
    if (!department) {
      return res.status(404).json({ detail: "Department not found in your organization." });
    }

    // Update User
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ detail: "User not found" });

    const oldDept = user.department;
    user.department = department.name;
    user.department_id = department._id;
    await user.save();

    console.log(`[HIERARCHY] User ${user.username} shifted: ${oldDept} -> ${department.name}`);

    res.json({ 
      success: true, 
      message: `Personnel Deployment Successful: Realigned to ${department.name}`,
      user: {
        id: user.id,
        department: user.department,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error('[ERROR] Department Shift Failure:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ detail: error.message });
    }
    res.status(500).json({ message: "Department Shift Protocol Failed" });
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
  updateUserDepartment,
  accountControl
};
