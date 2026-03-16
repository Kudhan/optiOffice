const Holiday = require('../models/Holiday');
const seedIndiaHolidays = require('../utils/seedIndiaHolidays');

// @desc    Get all holidays for the tenant
// @route   GET /api/v1/holidays
// @access  Private
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({ tenantId: req.user.tenantId }).sort({ date: 1 });
    res.status(200).json({ success: true, count: holidays.length, data: holidays });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add a single holiday
// @route   POST /api/v1/holidays
// @access  Private (Admin)
exports.addHoliday = async (req, res) => {
  try {
    req.body.tenantId = req.user.tenantId;
    const holiday = await Holiday.create(req.body);
    res.status(201).json({ success: true, data: holiday });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A holiday already exists on this date.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Sync default Indian holidays
// @route   POST /api/v1/holidays/sync-defaults
// @access  Private (Admin)
exports.syncDefaults = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const result = await seedIndiaHolidays(tenantId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a holiday
// @route   PUT /api/v1/holidays/:id
// @access  Private (Admin)
exports.updateHoliday = async (req, res) => {
  try {
    let holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    // Ensure user owns this holiday
    if (holiday.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: holiday });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a holiday
// @route   DELETE /api/v1/holidays/:id
// @access  Private (Admin)
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    // Ensure user owns this holiday
    if (holiday.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    await holiday.deleteOne();
    res.status(200).json({ success: true, message: 'Holiday removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
