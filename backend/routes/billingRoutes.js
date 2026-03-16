const express = require('express');
const router = express.Router();
const { getBillingInfo, mockPayment } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getBillingInfo);
router.post('/mock-payment', mockPayment);

module.exports = router;
