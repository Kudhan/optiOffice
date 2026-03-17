const express = require('express');
const router = express.Router();
const { 
  getMyAttendance, 
  getAllAttendance, 
  getDailyStatus, 
  checkIn, 
  checkOut,
  getMonthlyReport
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Employee Routes
router.get('/me', protect, getMyAttendance);
router.post('/check-in', protect, checkIn);
router.put('/check-out/:id', protect, checkOut);

// Admin/Manager Routes
router.get('/all', protect, authorize('can_view_all_attendance'), getAllAttendance);
router.get('/daily-status', protect, authorize('can_view_all_attendance'), getDailyStatus);
router.get('/report', protect, authorize('can_view_all_attendance'), getMonthlyReport);

module.exports = router;
