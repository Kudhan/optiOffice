const Shift = require('../models/Shift');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new shift timing pattern
 * @route   POST /api/v1/shifts
 * @access  Private (Admin Only)
 */
const createShift = asyncHandler(async (req, res) => {
  const { name, startTime, endTime, gracePeriod, workDays } = req.body;
  const tenantId = req.user.tenantId;

  const shift = await Shift.create({
    name,
    startTime,
    endTime,
    gracePeriod,
    workDays,
    tenantId
  });

  res.status(201).json({
    success: true,
    data: shift
  });
});

/**
 * @desc    Assign a shift to one or more users
 * @route   POST /api/v1/shifts/assign
 * @access  Private (Admin Only)
 */
const assignUserToShift = asyncHandler(async (req, res) => {
  const { userIds, shiftId } = req.body;
  const tenantId = req.user.tenantId;

  // Verify shift exists and belongs to tenant
  const shift = await Shift.findOne({ _id: shiftId, tenantId });
  if (!shift) {
    return res.status(404).json({ success: false, message: 'Shift pattern not found.' });
  }

  // Bulk update users
  const result = await User.updateMany(
    { _id: { $in: userIds }, tenantId },
    { shift_id: shiftId }
  );

  res.json({
    success: true,
    message: `Pattern '${shift.name}' assigned to ${result.modifiedCount} personnel records.`,
    modifiedCount: result.modifiedCount
  });
});

/**
 * @desc    Get shift details for a specific user (populated)
 * @route   GET /api/v1/shifts/user/:userId
 * @access  Private
 */
const getShiftDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const tenantId = req.user.tenantId;

  const user = await User.findOne({ _id: userId, tenantId })
    .select('full_name shift_id')
    .populate('shift_id');

  if (!user) {
    return res.status(404).json({ success: false, message: 'Personnel record not found.' });
  }

  res.json({
    success: true,
    data: {
      user: user.full_name,
      shift: user.shift_id
    }
  });
});

/**
 * @desc    Get all shift patterns with user counts
 * @route   GET /api/v1/shifts
 * @access  Private (Admin Only)
 */
const getShifts = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;

  // Aggregate to get user counts per shift
  const shiftsWithCounts = await Shift.aggregate([
    { $match: { tenantId } },
    {
      $lookup: {
        from: 'users_collection',
        localField: '_id',
        foreignField: 'shift_id',
        as: 'assignedUsers'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        startTime: 1,
        endTime: 1,
        gracePeriod: 1,
        workDays: 1,
        userCount: { $size: "$assignedUsers" }
      }
    }
  ]);

  res.json({
    success: true,
    data: shiftsWithCounts
  });
});

module.exports = {
  createShift,
  getShifts,
  assignUserToShift,
  getShiftDetails
};
