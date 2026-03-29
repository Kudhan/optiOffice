const mongoose = require('mongoose');
const { Leave, LeaveBalance } = require('../models/Leave');
const User = require('../models/User');
const Holiday = require('../models/Holiday');
const Organization = require('../models/Organization');

// Task 1: The 'Smart Duration' Helper (Optimized)
const calculateDuration = (startDate, endDate, weeklyOffs = [0, 6], holidayDates = new Set()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let count = 0;
  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();

    const isWeeklyOff = weeklyOffs.includes(dayOfWeek);
    const isHoliday = holidayDates.has(dateStr);

    if (!isWeeklyOff && !isHoliday) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// @desc    Get leaves mapping by tenantId with pagination
// @route   GET /leaves
const getLeaves = async (req, res) => {
  try {
    const role = req.user.role;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let filter = { tenantId: req.user.tenantId };
    let total = 0;
    let leaves = [];

    if (role === 'admin' || role === 'super-admin') {
      // Admin View: See everything in the tenant
      total = await Leave.countDocuments(filter);
      leaves = await Leave.find(filter)
        .populate('user', 'full_name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        data: leaves,
        pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
      });
    }

    if (role === 'manager') {
      // Manager View: See their own leaves + direct reports who are NOT managers
      const aggregationMatch = {
        tenantId: req.user.tenantId,
        $or: [{ appliedTo: new mongoose.Types.ObjectId(req.user.id) }, { user: new mongoose.Types.ObjectId(req.user.id) }]
      };

      // Count total for pagination (approximate or use separate aggregation)
      // For managers, we'll fetch all and then slice to handle the complex role-based filtering logic if needed,
      // but let's try to do it all in aggregation for performance.

      const pipeline = [
        { $match: aggregationMatch },
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
        }
      ];

      // Get multi-result: count and data
      const results = await Leave.aggregate([
        ...pipeline,
        {
          $facet: {
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  user: { _id: '$userDoc._id', id: '$userDoc._id', full_name: '$userDoc.full_name', role: '$userDoc.role' },
                  type: 1, startDate: 1, endDate: 1, status: 1, reason: 1, rejection_reason: 1, appliedTo: 1, createdAt: 1
                }
              }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ]);

      const formattedLeaves = results[0].data.map(l => ({
        ...l,
        id: l._id.toString(),
        user: { ...l.user, id: l.user.id.toString(), _id: l.user._id.toString() }
      }));

      const count = results[0].totalCount[0]?.count || 0;

      return res.json({
        data: formattedLeaves,
        pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page, limit }
      });
    }

    // Default: Employee View (Self only)
    const employeeFilter = { tenantId: req.user.tenantId, user: req.user.id };
    total = await Leave.countDocuments(employeeFilter);
    leaves = await Leave.find(employeeFilter)
      .populate('user', 'full_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: leaves,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page, limit }
    });
  } catch (error) {
    console.error("GET_LEAVES_PROTOCOL_FAIL:", error);
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

// @desc    Get current user's detailed usage by type
// @route   GET /leaves/usage-stats
const getUsageStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const approvedLeaves = await Leave.find({
      user: req.user.id,
      tenantId: req.user.tenantId,
      status: 'Approved',
      startDate: { $gte: startOfYear, $lte: endOfYear }
    });

    const org = await Organization.findOne({ tenantId: req.user.tenantId });
    const weeklyOffs = org?.configuration?.weeklyOffs || [0, 6];
    
    // Fetch all holidays for the year once
    const holidays = await Holiday.find({
      tenantId: req.user.tenantId,
      date: { $gte: startOfYear, $lte: endOfYear }
    });
    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

    const stats = {};
    for (const l of approvedLeaves) {
      const days = calculateDuration(l.startDate, l.endDate, weeklyOffs, holidayDates);
      stats[l.type] = (stats[l.type] || 0) + days;
    }

    res.json(stats);
  } catch (error) {
    console.error("GET_USAGE_STATS_FAIL:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get current user's leave balance
// @route   GET /leaves/balance
const getBalance = async (req, res) => {
  try {
    const org = await Organization.findOne({ tenantId: req.user.tenantId });
    const leaveConfigs = org?.configuration?.leaveClassifications || [];
    const dynamicTotal = leaveConfigs
      .filter(c => c.isDeductible !== false) // Only sum deductible types
      .reduce((sum, c) => sum + (c.days || 0), 0) || 30;

    let balance = await LeaveBalance.findOne({ user: req.user.id, tenantId: req.user.tenantId });
    if (!balance) {
      balance = await LeaveBalance.create({ 
        user: req.user.id, 
        tenantId: req.user.tenantId,
        annual_total: dynamicTotal,
        remaining: dynamicTotal
      });
    } else if (balance.annual_total !== dynamicTotal) {
      // Sync total if organization config has changed
      const diff = dynamicTotal - balance.annual_total;
      balance.annual_total = dynamicTotal;
      balance.remaining += diff;
      await balance.save();
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

    // Fetch Organization once for config
    const org = await Organization.findOne({ tenantId: req.user.tenantId });
    const config = org?.configuration || {};
    const weeklyOffs = config.weeklyOffs || [0, 6];
    const leaveConfigs = config.leaveClassifications || [];
    
    // Fetch Holidays for duration calculation
    const holidaysInRange = await Holiday.find({
      tenantId: req.user.tenantId,
      date: { $gte: start, $lte: end }
    });
    const holidayDates = new Set(holidaysInRange.map(h => h.date.toISOString().split('T')[0]));

    // Task 3: Smart Duration Calculation
    console.log("LEAVE_REQUEST_TRACE:", { user: req.user, body: req.body });
    const diffDays = calculateDuration(startDate, endDate, weeklyOffs, holidayDates);

    const classification = leaveConfigs.find(c => c.code === type);
    const isDeductible = classification ? classification.isDeductible !== false : (type !== 'LWP' && type !== 'WFH');

    let finalType = type;

    if (type !== 'LWP') {
      if (!classification) {
        return res.status(400).json({ message: `Strategic Restriction: '${type}' is not configured.` });
      }

      // Calculate already used days for this year
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

      const approvedLeaves = await Leave.find({
        user: req.user.id,
        tenantId: req.user.tenantId,
        type: type,
        status: 'Approved',
        startDate: { $gte: startOfYear, $lte: endOfYear }
      });

      // Optimization: Fetch year-long holidays once for usage calculation
      const holidaysYear = await Holiday.find({
        tenantId: req.user.tenantId,
        date: { $gte: startOfYear, $lte: endOfYear }
      });
      const holidayDatesYear = new Set(holidaysYear.map(h => h.date.toISOString().split('T')[0]));

      let usedDaysForType = 0;
      for (const l of approvedLeaves) {
        usedDaysForType += calculateDuration(l.startDate, l.endDate, weeklyOffs, holidayDatesYear);
      }

      if (usedDaysForType + diffDays > classification.days) {
        if (isDeductible) {
            console.log(`[Quota Breach] User ${req.user.id} exceeded ${type} quota. Converting to LWP.`);
            finalType = 'LWP';
        } else {
            return res.status(400).json({ message: `Strategic Error: You have exhausted your ${classification.title} quota (${classification.days} days).` });
        }
      }
    }

    // Find or Initialize Balance
    let balance = await LeaveBalance.findOne({ user: req.user.id, tenantId: req.user.tenantId });
    if (!balance) {
      const dynamicTotal = leaveConfigs.filter(c => c.isDeductible !== false).reduce((sum, c) => sum + (c.days || 0), 0) || 30;
      balance = await LeaveBalance.create({ user: req.user.id, tenantId: req.user.tenantId, annual_total: dynamicTotal, remaining: dynamicTotal });
    }

    // Task 2: Global Balance Check (Deductible only)
    if (isDeductible && finalType !== 'LWP' && balance.remaining < diffDays) {
      finalType = 'LWP';
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
      // Find classification to check if deductible
      const org = await Organization.findOne({ tenantId: leave.tenantId });
      const classification = org?.configuration?.leaveClassifications?.find(c => c.code === leave.type);
      const isDeductible = classification ? classification.isDeductible !== false : (leave.type !== 'LWP' && leave.type !== 'WFH');

      // Automated Smart Deduction
      if (isDeductible) {
        const holidaysInRange = await Holiday.find({
          tenantId: leave.tenantId,
          date: { $gte: leave.startDate, $lte: leave.endDate }
        });
        const holidayDates = new Set(holidaysInRange.map(h => h.date.toISOString().split('T')[0]));
        const weeklyOffs = org?.configuration?.weeklyOffs || [0, 6];

        const diffDays = calculateDuration(leave.startDate, leave.endDate, weeklyOffs, holidayDates);
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
  getUsageStats,
  getTeamCalendar,
  applyLeave,
  approveLeave: manageRequest,
  rejectLeave: manageRequest,
  manageRequest
};
