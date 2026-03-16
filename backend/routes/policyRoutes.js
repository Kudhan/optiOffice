const express = require('express');
const router = express.Router();
const { getPolicies, updatePolicies } = require('../controllers/policyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPolicies);
router.put('/', protect, updatePolicies);

module.exports = router;
