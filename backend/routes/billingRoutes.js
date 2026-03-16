const express = require('express');
const router = express.Router();
const { getBillingInfo, mockPayment } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBillingInfo);
router.post('/mock-payment', protect, mockPayment);

module.exports = router;
