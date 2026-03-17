const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getOrganization, updateOrganization, getOrgTree } = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOrganization);
router.get('/tree', protect, getOrgTree);
router.put('/:id', protect, updateOrganization);

module.exports = router;
