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
    if (req.body.isCustom === undefined) req.body.isCustom = true;
    
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
    console.log(`[DEBUG] Delete Request for ID: ${req.params.id} by User: ${req.user._id} (Tenant: ${req.user.tenantId})`);
    
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      console.log(`[DEBUG] Holiday ${req.params.id} not found in DB.`);
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    console.log(`[DEBUG] Found Holiday: ${holiday.name} | Tenant: ${holiday.tenantId} | isCustom: ${holiday.isCustom}`);

    // Super-admin bypass
    if (req.user.role === 'super-admin') {
      await holiday.deleteOne();
      return res.status(200).json({ success: true, message: 'Holiday purged by Super-Admin' });
    }

    // Ensure user owns this holiday
    // Use String comparison for robustness
    if (String(holiday.tenantId) !== String(req.user.tenantId)) {
      console.log(`[DEBUG] Tenant Mismatch! Holiday:${holiday.tenantId} vs User:${req.user.tenantId}`);
      return res.status(403).json({ success: false, message: 'Access Denied: You do not have permission to delete this holiday.' });
    }

    // Restrict deletion of national/system holidays
    // If isCustom is undefined, treat it as true (user-added)
    if (holiday.isCustom === false) {
      return res.status(403).json({ 
        success: false, 
        message: 'National holidays are protected and cannot be deleted.' 
      });
    }

    await holiday.deleteOne();
    res.status(200).json({ success: true, message: 'Holiday removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
