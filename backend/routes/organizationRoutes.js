const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getOrganization, updateOrganization, getOrgTree, getDirectReports } = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOrganization);
router.get('/tree', protect, getOrgTree);
router.get('/direct-reports', protect, getDirectReports);
router.put('/:id', protect, updateOrganization);

module.exports = router;
