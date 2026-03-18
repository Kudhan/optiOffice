const express = require('express');
const router = express.Router();
const { 
  getFloorData, 
  updateDeskAssignments 
} = require('../controllers/officeController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/floor-data', protect, getFloorData);
router.post('/desks', protect, authorize('can_manage_users'), updateDeskAssignments);

module.exports = router;
