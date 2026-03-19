const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Hierarchical Guardrails Middleware
 * Enforces authority boundaries for user/role modifications.
 * 
 * Rules:
 * 1. Self-Edit: No one can edit their own role or administrative settings.
 * 2. Hierarchy Check: Managers can only edit their direct reports.
 * 3. Authority Ceiling: Managers cannot promote anyone to Admin (only Employee).
 * 4. Permission Logic: Only users with 'can_edit_roles' can perform role changes.
 */
const validateAuthority = async (req, res, next) => {
  try {
    const requester = req.user; // From authMiddleware
    const targetUserId = req.params.id;

    // Rule 1: Self-Edit Protection (Mandatory for ALL roles)
    if (requester.id === targetUserId) {
      return res.status(403).json({ 
        detail: "Security Restriction: You cannot modify your own administrative settings or roles." 
      });
    }

    // Role-based Verification: can_edit_roles check for role changes
    const newRole = req.body.role;
    if (newRole) {
      const requesterRole = await Role.findOne({ 
        name: { $regex: new RegExp(`^${requester.role}$`, 'i') }, 
        tenantId: requester.tenantId 
      }).lean();
      if (!requesterRole || !requesterRole.permissions?.includes('can_edit_roles')) {
        return res.status(403).json({ detail: "Security Violation: You do not have the required [can_edit_roles] permission." });
      }
    }

    // Task 2: Admin Bypass for Hierarchy/Ceiling
    // If the requester is an Admin, they can manage any user except themselves (Rule 1)
    if (requester.role === 'admin' || requester.role === 'super-admin') {
      return next();
    }

    // Fetch Target User details
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ detail: "Target user not found." });
    }

    // Rule 2: Hierarchy Check (for Managers)
    if (requester.role === 'manager') {
      // Check if targetUser reports to requester
      if (targetUser.manager?.toString() !== requester.id) {
        return res.status(403).json({ 
          detail: "Authority Violation: You do not have management authority over this employee." 
        });
      }
    }

    // Rule 3: Role Capping / Authority Ceiling (for Managers/Staff)
    if (newRole) {
      if (requester.role === 'manager' && newRole !== 'employee') {
        return res.status(403).json({ 
          detail: "Privilege Escalation Blocked: Managers can only assign the 'employee' role." 
        });
      }
    }

    next();
  } catch (error) {
    console.error('validateAuthority error:', error);
    res.status(500).json({ message: "Server Security Error during authority validation." });
  }
};

module.exports = validateAuthority;
