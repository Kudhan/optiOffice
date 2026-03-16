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
  .post(authorize('admin'), addHoliday);

router.post('/sync-defaults', authorize('admin'), syncDefaults);

router
  .route('/:id')
  .put(authorize('admin'), updateHoliday)
  .delete(authorize('admin'), deleteHoliday);

module.exports = router;
