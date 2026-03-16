const Leave = require('../models/Leave');

// @desc    Get leaves mapping by tenantId
// @route   GET /leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    let leaves;
    // Admins and managers see all leaves for the tenant, employees see their own
    if (['admin', 'manager'].includes(req.user.role)) {
      leaves = await Leave.find({ tenantId: req.user.tenantId });
    } else {
      leaves = await Leave.find({ tenantId: req.user.tenantId, username: req.user.sub });
    }
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
    const leaveData = {
      ...req.body,
      tenantId: req.user.tenantId,
      username: req.user.sub
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
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { status: "Approved" },
      { new: true }
    );
    
    if (leave) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Leave request not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reject leave (Admin/Manager only)
// @route   PUT /leaves/:id/reject
// @access  Private
const rejectLeave = async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ detail: "Not authorized" });
    }
    
    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { status: "Rejected", rejection_reason: req.query.reason || req.body.reason },
      { new: true }
    );
    
    if (leave) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Leave request not found" });
    }
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
