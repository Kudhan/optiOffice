const express = require('express');
const router = express.Router();
const { 
  getLeaves, 
  getBalance, 
  getTeamCalendar, 
  applyLeave, 
  approveLeave, 
  rejectLeave, 
  manageRequest 
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLeaves);
router.get('/balance', protect, getBalance);
router.get('/team-calendar', protect, getTeamCalendar);
router.post('/', protect, applyLeave);
router.put('/:id/approve', protect, approveLeave);
router.put('/:id/reject', protect, rejectLeave);
router.put('/:id/manage', protect, manageRequest);

module.exports = router;
