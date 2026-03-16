const express = require('express');
const router = express.Router();
const { getHolidays, createHoliday } = require('../controllers/holidayController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHolidays);
router.post('/', protect, createHoliday);

module.exports = router;
