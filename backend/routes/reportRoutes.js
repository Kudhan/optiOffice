const express = require('express');
const router = express.Router();
const { 
    getHRAnalytics, 
    getInventoryAnalytics, 
    getOrganizationalAnalytics 
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Intelligence Hub Endpoints
router.get('/hr', protect, getHRAnalytics);
router.get('/inventory', protect, getInventoryAnalytics);
router.get('/org', protect, getOrganizationalAnalytics);

module.exports = router;
