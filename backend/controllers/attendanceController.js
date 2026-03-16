const Attendance = require('../models/Attendance');

// @desc    Get current user's attendance mapped by tenantId
// @route   GET /attendance/me
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ 
      username: req.user.sub,
      tenantId: req.user.tenantId
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Check-in user
// @route   POST /attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
  try {
    const now = new Date();
    // Simplified logic for grace period / status, keeping it simple "Present" for parity
    const attendance = await Attendance.create({
      tenantId: req.user.tenantId,
      username: req.user.sub,
      date: now.toISOString().split('T')[0],
      check_in: now,
      status: "Present"
    });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Check-out user
// @route   PUT /attendance/check-out/:id
// @access  Private
const checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { check_out: new Date() },
      { new: true }
    );
    
    if (attendance) {
      res.json(true);
    } else {
      res.status(404).json({ detail: "Attendance record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getMyAttendance,
  checkIn,
  checkOut
};
