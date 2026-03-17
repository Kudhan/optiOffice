const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');

// Configurable Late Threshold (Default 9:30 AM)
const LATE_THRESHOLD = process.env.LATE_THRESHOLD || '09:30';

/**
 * Helper: Calculate work hours as a decimal
 * @param {Date} checkIn 
 * @param {Date} checkOut 
 * @returns {Number} Hours as decimal (e.g., 8.5)
 */
const calculateWorkHours = (checkIn, checkOut) => {
  const diffMs = checkOut - checkIn;
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
};

/**
 * @desc    Check-in user
 * @route   POST /attendance/check-in
 * @access  Private (Employee/Self)
 */
const checkIn = asyncHandler(async (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Debugging identity
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false, 
      message: 'User identity missing from token. Please log out and log back in.' 
    });
  }

  // Determine late status
  let status = 'Present';
  const [thresholdH, thresholdM] = LATE_THRESHOLD.split(':').map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(thresholdH, thresholdM, 0, 0);

  if (now > cutoff) {
    status = 'Late';
  }

  try {
    const attendance = await Attendance.create({
      user: req.user.id,
      tenantId: req.user.tenantId,
      date: today,
      checkIn: now,
      status
    });

    // Populate user to get full_name for the "Welcome" toast
    const populated = await attendance.populate('user', 'full_name');

    res.status(201).json({
      ...populated.toJSON(),
      userName: populated.user.full_name,
      formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    // Handling MongoDB duplicate key error (11000) for { user, date }
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Double Check-in Detected: You have already checked in for today.' 
      });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

/**
 * @desc    Check-out user
 * @route   PUT /attendance/check-out/:id
 * @access  Private (Employee/Self)
 */
const checkOut = asyncHandler(async (req, res) => {
  const now = new Date();
  const recordId = req.params.id;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'User identity missing. Please re-login.' });
  }

  const attendance = await Attendance.findOne({
    _id: recordId,
    user: req.user.id,
    checkOut: null
  });

  if (!attendance) {
    return res.status(404).json({ success: false, message: 'Active attendance record not found.' });
  }

  // Defensive: Handle legacy records with different field names or missing checkIn
  const actualCheckIn = attendance.checkIn || attendance.check_in;
  if (!actualCheckIn) {
    return res.status(400).json({ 
      success: false, 
      message: 'Critical Data Error: Original check-in time missing. This may be due to a schema update. Please contact Admin to reset this record.' 
    });
  }

  attendance.checkOut = now;
  // Ensure we are using the resolved checkIn time for calculation
  attendance.workHours = calculateWorkHours(actualCheckIn, now);

  // If we found check_in but not checkIn, populate checkIn to satisfy validation
  if (!attendance.checkIn && attendance.check_in) {
    attendance.checkIn = attendance.check_in;
  }

  await attendance.save();
  res.json(attendance);
});

/**
 * @desc    Get everyone currently 'In' for Floor Map (Admins/Managers)
 * @route   GET /attendance/daily-status
 * @access  Private (Admin/Manager)
 */
const getDailyStatus = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const currentlyIn = await Attendance.find({
    tenantId: req.user.tenantId,
    date: today,
    checkOut: null
  }).populate('user', 'full_name email profile_photo'); // Note: Model uses profile_photo

  res.json(currentlyIn);
});

/**
 * @desc    Get current user's attendance history
 * @route   GET /attendance/me
 * @access  Private (Employee)
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ 
    user: req.user.id 
  }).sort({ date: -1 });
  
  res.json(attendance);
});

/**
 * @desc    Get all attendance for the tenant (Admin/Manager only)
 * @route   GET /attendance/all
 * @access  Private (Admin/Manager)
 */
const getAllAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ 
    tenantId: req.user.tenantId 
  })
  .populate('user', 'full_name username')
  .sort({ createdAt: -1 });

  res.json(attendance);
});

/**
 * @desc    Get Monthly Attendance Report (Aggregation)
 * @route   GET /attendance/report
 * @access  Private (Admin/Manager)
 */
const getMonthlyReport = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const report = await Attendance.aggregate([
    { 
      $match: { 
        tenantId: req.user.tenantId,
        date: { $regex: `^${monthPrefix}` } 
      } 
    },
    {
      $group: {
        _id: "$user",
        totalDays: { $sum: 1 },
        totalLates: {
          $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] }
        },
        avgWorkHours: { $avg: "$workHours" }
      }
    },
    {
      $lookup: {
        from: 'users_collection',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: "$userDetails.full_name",
        email: "$userDetails.email",
        totalDays: 1,
        totalLates: 1,
        avgWorkHours: { $round: ["$avgWorkHours", 2] }
      }
    }
  ]);

  res.json(report);
});

module.exports = {
  checkIn,
  checkOut,
  getDailyStatus,
  getMyAttendance,
  getAllAttendance,
  getMonthlyReport
};
