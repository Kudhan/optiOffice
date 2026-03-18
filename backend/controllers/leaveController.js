const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Get leaves mapping by tenantId
// @route   GET /leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const role = req.user.role;
    let filter = { tenantId: req.user.tenantId };

    if (role === 'admin' || role === 'super-admin') {
      // Admins see everyone
    } else if (role === 'manager') {
       // Filter by direct reports or department based on new getScope logic (simplified for now)
       filter = { tenantId: req.user.tenantId, $or: [{ manager: req.user.id }, { username: req.user.sub }] };
    } else {
      // Employees see their own
      filter = { tenantId: req.user.tenantId, username: req.user.sub };
    }
    
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Apply for leave
// @route   POST /leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    // Task 1: Smart Route Logic
    const employee = await User.findById(req.user.id);
    
    const leaveData = {
      ...req.body,
      tenantId: req.user.tenantId,
      username: req.user.sub,
      manager: employee.manager || null,
      hr_notified: true // CC to HR logging
    };
    
    const leave = await Leave.create(leaveData);
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Approve leave (Admin/Manager only)
// @route   PUT /leaves/:id/approve
// @access  Private
const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    
    if (!leave) {
      return res.status(404).json({ detail: "Leave request not found" });
    }

    // Role-based Verification: Must be the Direct Manager or an Admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin' && leave.manager?.toString() !== req.user.id) {
        return res.status(403).json({ detail: "You are not authorized to approve this request (Direct Manager only)" });
    }
    
    leave.status = "Approved";
    await leave.save();
    res.json(true);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reject leave (Admin/Manager only)
// @route   PUT /leaves/:id/reject
// @access  Private
const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    
    if (!leave) {
      return res.status(404).json({ detail: "Leave request not found" });
    }

    // Role-based Verification: Direct Manager or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin' && leave.manager?.toString() !== req.user.id) {
        return res.status(403).json({ detail: "Not authorized to reject this request (Direct Manager only)" });
    }
    
    leave.status = "Rejected";
    leave.rejection_reason = req.query.reason || req.body.reason;
    await leave.save();
    res.json(true);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getLeaves,
  applyLeave,
  approveLeave,
  rejectLeave
};
