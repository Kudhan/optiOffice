const Holiday = require('../models/Holiday');

// @desc    Get all holidays
// @route   GET /holidays
// @access  Private
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({ tenantId: req.user.tenantId });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create new holiday
// @route   POST /holidays
// @access  Private
const createHoliday = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: "Only admin can add holidays" });
    }
    
    const holidayData = {
      ...req.body,
      tenantId: req.user.tenantId
    };
    
    const holiday = await Holiday.create(holidayData);
    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getHolidays,
  createHoliday
};
