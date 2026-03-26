const express = require('express');
const router = express.Router();
const { getBillingInfo, getInvoices, mockPayment } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(protect);
router.use(authorize('can_manage_billing'));

router.get('/', getBillingInfo);
router.get('/invoices', getInvoices);
router.post('/mock-payment', mockPayment);

module.exports = router;
