const Policy = require('../models/Policy');
const Shift = require('../models/Shift');
const Holiday = require('../models/Holiday');
const Attendance = require('../models/Attendance');
const { LeaveBalance } = require('../models/Leave');
const Billing = require('../models/Billing');
const Role = require('../models/Role');

// @desc    Get system-derived policies based on other modules
// @route   GET /api/v1/policies/system
const getSystemPolicies = async (tenantId) => {
  const systemPoints = [];

  // 1. Study Shift Module
  const primaryShift = await Shift.findOne({ tenantId }).sort({ createdAt: 1 });
  if (primaryShift) {
    systemPoints.push({
      title: 'Standard Work Hours',
      description: 'Official timing protocols and shift durations.',
      content: `Official deployment begins at **${primaryShift.startTime}** and concludes at **${primaryShift.endTime}**.`,
      icon: 'Clock',
      category: 'General',
      isSystemGenerated: true,
      tenantId
    });

    // Derive Weekend Logic from workDays
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const offDays = [0, 1, 2, 3, 4, 5, 6].filter(d => !primaryShift.workDays.includes(d));
    if (offDays.length > 0) {
      const offDaysNames = offDays.map(d => daysMap[d]).join(' and ');
      systemPoints.push({
        title: 'Weekly Off Protocol',
        description: 'Designated non-operational periods for personnel.',
        content: `**${offDaysNames}** are designated as non-operational weekly offs.`,
        icon: 'Calendar',
        category: 'Attendance',
        isSystemGenerated: true,
        tenantId
      });
    }

    // Derive Attendance Grace Period
    if (primaryShift.gracePeriod > 0) {
      const startTimeParts = primaryShift.startTime.split(':');
      const startMinutes = parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
      const lateMinutes = startMinutes + primaryShift.gracePeriod;
      const lateH = Math.floor(lateMinutes / 60).toString().padStart(2, '0');
      const lateM = (lateMinutes % 60).toString().padStart(2, '0');
      
      systemPoints.push({
        title: 'Late Mark Threshold',
        description: 'Punctuality compliance and grace period limits.',
        content: `Operational late marks are strictly applied after **${lateH}:${lateM}** (${primaryShift.gracePeriod} min grace period).`,
        icon: 'AlertCircle',
        category: 'Attendance',
        isSystemGenerated: true,
        tenantId
      });
    }
  }

  // 2. Study Holiday Module (Upcoming)
  const upcomingHolidays = await Holiday.find({ 
    tenantId, 
    date: { $gte: new Date() } 
  }).sort({ date: 1 }).limit(3);

  if (upcomingHolidays.length > 0) {
    const list = upcomingHolidays.map(h => `* **${h.name}**: ${new Date(h.date).toLocaleDateString()}`).join('\n');
    systemPoints.push({
      title: 'Upcoming Operational Holidays',
      description: 'Scheduled extraction breaks and public holidays.',
      content: `The following dates are scheduled as paid extraction breaks:\n\n${list}`,
      icon: 'Coffee',
      category: 'General',
      isSystemGenerated: true,
      tenantId
    });
  }

  // 3. Study Leave Module
  const leaveBalance = await LeaveBalance.findOne({ tenantId }).sort({ createdAt: 1 });
  if (leaveBalance) {
    systemPoints.push({
      title: 'Annual Leave Entitlement',
      description: 'Standard vacation and time-off allotments for personnel.',
      content: `Each personnel unit is entitled to an annual extraction budget of **${leaveBalance.annual_total}** days.`,
      icon: 'BookOpen',
      category: 'HR',
      isSystemGenerated: true,
      tenantId
    });

    systemPoints.push({
      title: 'Leave Classification Standards',
      description: 'Categorization for official time-off requests.',
      content: `The system recognizes and validates the following leave protocols: **Earned Leave (EL), Sick Leave (SL), Casual Leave (CL), and Leave Without Pay (LWP)**.`,
      icon: 'FileText',
      category: 'HR',
      isSystemGenerated: true,
      tenantId
    });
  }

  // 4. Study Billing Module
  const billingInfo = await Billing.findOne({ tenantId });
  if (billingInfo) {
    systemPoints.push({
      title: 'Organizational Resource Tier',
      description: 'Subscription protocol and personnel capacity limits.',
      content: `Current operations are synchronized with the **${billingInfo.planType}** tier, supporting a maximum deployment of **${billingInfo.userLimit}** active personnel.`,
      icon: 'Zap',
      category: 'General',
      isSystemGenerated: true,
      tenantId
    });
  }

  // 5. Study Role/Access Module
  const primaryRole = await Role.findOne({ tenantId, name: 'Admin' });
  if (primaryRole) {
    systemPoints.push({
      title: 'Authority & Scope Logic',
      description: 'Governance rules for systemic access and permissioning.',
      content: `System authority is strictly governed by **${primaryRole.scopeType}** scope logic. Unauthorized access attempt logs are preserved in the Tactical Audit Index.`,
      icon: 'Lock',
      category: 'IT',
      isSystemGenerated: true,
      tenantId
    });
  }

  return systemPoints;
};

// @desc    Get combined list of system and custom policies with pagination
// @route   GET /api/v1/policies
const getPolicies = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { category, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { tenantId, isSystemGenerated: false };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch system-generated points
    let systemPolicies = [];
    if (page === 1) {
      systemPolicies = await getSystemPolicies(tenantId);
      
      // Filter system policies by category
      if (category && category !== 'All') {
        systemPolicies = systemPolicies.filter(p => p.category === category);
      }

      // Filter system policies by search term
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        systemPolicies = systemPolicies.filter(p => 
          searchRegex.test(p.title) || 
          searchRegex.test(p.content) || 
          searchRegex.test(p.description)
        );
      }
    }

    // Fetch custom policies from DB (pagination appies to custom policies)
    const totalCustom = await Policy.countDocuments(query);
    const customPolicies = await Policy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Combine
    const combined = [...systemPolicies, ...customPolicies];

    res.json({
      data: combined,
      pagination: {
        total: systemPolicies.length + totalCustom,
        pages: Math.ceil((systemPolicies.length + totalCustom) / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server fragmentation in Policy Engine' });
  }
};

// CRUD for Custom Policies
const createPolicy = async (req, res) => {
  try {
    const policy = await Policy.create({ ...req.body, tenantId: req.user.tenantId, isSystemGenerated: false });
    res.status(201).json(policy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId, isSystemGenerated: false },
      req.body,
      { new: true }
    );
    if (!policy) return res.status(404).json({ message: 'Target policy not found' });
    res.json(policy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId, isSystemGenerated: false });
    if (!policy) return res.status(404).json({ message: 'Target policy not found' });
    res.json({ message: 'Policy successfully decommissioned' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy
};
