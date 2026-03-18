const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get all users for the floor map with current status
// @route   GET /office/floor-data
// @access  Private
const getFloorData = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const today = new Date().toISOString().split('T')[0];

    // Find all users in tenant and populate department
    const users = await User.find({ tenantId })
      .select('full_name username email role desk department_id department')
      .populate('department_id', 'name zone')
      .lean();

    // Get live attendance status for today
    const attendanceRecords = await Attendance.find({ 
      tenantId, 
      date: today,
      checkOut: null 
    }).select('user status').lean();

    // Mapping for quick lookup
    const activeUsers = new Set(attendanceRecords.map(a => a.user.toString()));

    const usersWithStatus = users.map(user => ({
      ...user,
      currentStatus: activeUsers.has(user._id.toString()) ? 'Clocked In' : 'Offline'
    }));

    res.json(usersWithStatus);
  } catch (error) {
    console.error('getFloorData Error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Bulk update desk assignments
// @route   POST /office/desks
// @access  Private (Admin Only)
const updateDeskAssignments = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ detail: "Not authorized: Admin access required." });
    }

    const { assignments } = req.body; // Expecting [{ userId, desk: { x, y, floor, seatNumber } }]
    
    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ detail: "Invalid assignments format." });
    }

    const tenantId = req.user.tenantId;

    // Perform updates
    const updatePromises = assignments.map(async (item) => {
      // Ensure the user belongs to the same tenant
      return User.findOneAndUpdate(
        { _id: item.userId, tenantId },
        { desk: item.desk },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: `Updated ${assignments.length} desk assignments.` });
  } catch (error) {
    console.error('updateDeskAssignments Error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getFloorData,
  updateDeskAssignments
};
