const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, approveLeave, rejectLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getLeaves);
router.post('/', protect, applyLeave);
router.put('/:id/approve', protect, approveLeave);
router.put('/:id/reject', protect, rejectLeave);

module.exports = router;
