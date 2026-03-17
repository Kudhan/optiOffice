const express = require('express');
const router = express.Router();
const {
  getHolidays,
  addHoliday,
  syncDefaults,
  updateHoliday,
  deleteHoliday
} = require('../controllers/holidayController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getHolidays)
  .post(authorize('can_manage_holidays'), addHoliday);

router.post('/sync-defaults', authorize('can_manage_holidays'), syncDefaults);

router
  .route('/:id')
  .put(authorize('can_manage_holidays'), updateHoliday)
  .delete(authorize('can_manage_holidays'), deleteHoliday);

module.exports = router;
