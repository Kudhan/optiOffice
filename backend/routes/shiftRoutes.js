const express = require('express');
const router = express.Router();
const { 
  createShift, 
  getShifts,
  assignUserToShift, 
  getShiftDetails,
  updateShift,
  deleteShift
} = require('../controllers/shiftController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Routes linked to /api/v1/shifts
router.get('/', protect, authorize('can_manage_users'), getShifts);
router.post('/', protect, authorize('can_manage_users'), createShift);
router.post('/assign', protect, authorize('can_manage_users'), assignUserToShift);
router.get('/user/:userId', protect, getShiftDetails);
router.put('/:id', protect, authorize('can_manage_users'), updateShift);
router.delete('/:id', protect, authorize('can_manage_users'), deleteShift);

module.exports = router;
