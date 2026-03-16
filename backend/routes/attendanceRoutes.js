const express = require('express');
const router = express.Router();
const { getMyAttendance, getAllAttendance, checkIn, checkOut } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/me', protect, getMyAttendance);
router.get('/', protect, authorize('admin', 'manager'), getAllAttendance);
router.post('/check-in', protect, checkIn);
router.put('/check-out/:id', protect, checkOut);

module.exports = router;
