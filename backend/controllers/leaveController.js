const mongoose = require('mongoose');
const { Leave, LeaveBalance } = require('../models/Leave');
const User = require('../models/User');
const Holiday = require('../models/Holiday');

// Task 1: The 'Smart Duration' Helper
const calculateDuration = async (startDate, endDate, tenantId) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Fetch Holidays for the tenant in this range
    const holidays = await Holiday.find({
        tenantId,
        date: { $gte: start, $lte: end }
    });

    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));
    
    let count = 0;
    let current = new Date(start);
    while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayOfWeek = current.getDay();
        
        // Exclude Weekends (0 = Sunday, 6 = Saturday) and Holidays
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = holidayDates.has(dateStr);

        if (!isWeekend && !isHoliday) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
};

// @desc    Get leaves mapping by tenantId
// @route   GET /leaves
const getLeaves = async (req, res) => {
  try {
    const role = req.user.role;
    let filter = { tenantId: req.user.tenantId };

    if (role === 'admin' || role === 'super-admin') {
      // Admin View: See everything in the tenant
      const leaves = await Leave.find(filter).populate('user', 'full_name role').sort({ createdAt: -1 });
      return res.json(leaves);
    } 
    
    if (role === 'manager') {
      // Manager View: See their own leaves + direct reports who are NOT managers
      // Using aggregation to filter by populated user role
      const leaves = await Leave.aggregate([
        { 
          $match: { 
            tenantId: req.user.tenantId, 
            $or: [{ appliedTo: new mongoose.Types.ObjectId(req.user.id) }, { user: new mongoose.Types.ObjectId(req.user.id) }] 
          } 
        },
        {
          $lookup: {
            from: 'users_collection',
            localField: 'user',
            foreignField: '_id',
            as: 'userDoc'
          }
        },
        { $unwind: '$userDoc' },
        {
          $match: {
            $or: [
              { "userDoc._id": new mongoose.Types.ObjectId(req.user.id) }, // Their own leaves
              { "userDoc.role": { $ne: 'manager' } } // Reports who are not managers
            ]
          }
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            user: { _id: '$userDoc._id', id: '$userDoc._id', full_name: '$userDoc.full_name', role: '$userDoc.role' },
            type: 1, startDate: 1, endDate: 1, status: 1, reason: 1, rejection_reason: 1, appliedTo: 1, createdAt: 1
          }
        }
      ]);

      // Map _id and nested user.id to strings for compatibility
      const formattedLeaves = leaves.map(l => ({ 
        ...l, 
        id: l._id.toString(),
        user: { ...l.user, id: l.user.id.toString(), _id: l.user._id.toString() }
      }));
      return res.json(formattedLeaves);
    }

    // Default: Employee View (Self only)
    const leaves = await Leave.find({ tenantId: req.user.tenantId, user: req.user.id }).populate('user', 'full_name').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Task 2: Who's Away Calendar
// @route   GET /leaves/team-calendar
const getTeamCalendar = async (req, res) => {
    try {
        const leaves = await Leave.find({ 
            tenantId: req.user.tenantId,
            status: { $in: ['Approved', 'Pending'] }
        }).populate('user', 'full_name department role');
        res.json(leaves);
    } catch (error) {
        console.error("TEAM_CALENDAR_PROTOCOL_FAIL:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get current user's leave balance
// @route   GET /leaves/balance
const getBalance = async (req, res) => {
  try {
    let balance = await LeaveBalance.findOne({ user: req.user.id, tenantId: req.user.tenantId });
    if (!balance) {
      balance = await LeaveBalance.create({ user: req.user.id, tenantId: req.user.tenantId });
    }
    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Task 2 & 3: Apply for leave with Smart Duration
// @route   POST /leaves
const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    
    // Phase 4: Admin Restriction - Admins cannot apply for leave
    if (['admin', 'super-admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Strategic Restriction: Admin accounts are not permitted to submit leave requests." });
    }

    // Phase 5: Overlap Prevention Guard
    const start = new Date(startDate);
    const end = new Date(endDate);
    const existingLeave = await Leave.findOne({
      user: req.user.id,
      tenantId: req.user.tenantId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (existingLeave) {
      return res.status(400).json({ message: "Tactical Conflict: You already have a pending or approved request for this period." });
    }

    // Task 3: Smart Duration Calculation
    console.log("LEAVE_REQUEST_TRACE:", { user: req.user, body: req.body });
    const diffDays = await calculateDuration(startDate, endDate, req.user.tenantId);

    // Find or Initialize Balance
    let balance = await LeaveBalance.findOne({ user: req.user.id, tenantId: req.user.tenantId });
    if (!balance) {
      balance = await LeaveBalance.create({ user: req.user.id, tenantId: req.user.tenantId });
    }

    let finalType = type;
    // Task 2: Balance Check validation
    if (type !== 'LWP' && balance.remaining < diffDays) {
       finalType = 'LWP'; // Auto-categorize as Leave Without Pay
    }

    const employee = await User.findById(req.user.id);
    
    const leave = await Leave.create({
      tenantId: req.user.tenantId,
      user: req.user.id,
      username: req.user.sub || "unknown_user",
      type: finalType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      appliedTo: employee.manager || null
    });

    res.json({ leave, autoLWP: finalType === 'LWP' && type !== 'LWP', calculatedDays: diffDays });
  } catch (error) {
    console.error("LEAVE_APPLICATION_FAIL:", error);
    res.status(500).json({ message: "Server Error", error_detail: error.message });
  }
};

// @desc    Task 2 & 3: Manage Request with Smart Deduction
// @route   PUT /leaves/:id/manage
const manageRequest = async (req, res) => {
  try {
    const { status, reason } = req.body; // status: Approved | Rejected
    if (status === 'Rejected' && (!reason || reason.trim() === '')) {
      return res.status(400).json({ detail: "Strategic Requirement: A formal reason must be provided for all tactical denials." });
    }

    const leave = await Leave.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
      .populate('user', 'role full_name'); // Populate to check requester role

    if (!leave) return res.status(404).json({ detail: "Request not found" });

    // Hierarchy Security
    const isAdmin = ['admin', 'super-admin'].includes(req.user.role);
    const isDirectManager = leave.appliedTo?.toString() === req.user.id;
    
    // Phase 4: Escalation Rule - Manager leaves MUST be approved by Admin
    const isRequesterManager = leave.user?.role === 'manager';
    
    if (isRequesterManager && !isAdmin) {
      return res.status(403).json({ detail: "Escalation Required: Manager leave requests can only be authorized by an Admin." });
    }

    if (!isAdmin && !isDirectManager) {
      return res.status(403).json({ detail: "Security Violation: You are not authorized to manage this request." });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ detail: "Request already processed" });
    }

    if (status === 'Approved') {
      // Automated Smart Deduction
      if (leave.type !== 'LWP') {
        const diffDays = await calculateDuration(leave.startDate, leave.endDate, leave.tenantId);
        const balance = await LeaveBalance.findOne({ user: leave.user, tenantId: leave.tenantId });
        if (balance) {
          balance.used += diffDays;
          balance.remaining -= diffDays;
          await balance.save();
        }
      }
      leave.status = 'Approved';
    } else {
      leave.status = 'Rejected';
      leave.rejection_reason = reason;
    }

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Compatibility export
module.exports = {
  getLeaves,
  getBalance,
  getTeamCalendar,
  applyLeave,
  approveLeave: manageRequest,
  rejectLeave: manageRequest,
  manageRequest
};
