const express = require('express');
const router = express.Router();
const { 
  getPolicies, 
  createPolicy, 
  updatePolicy, 
  deletePolicy 
} = require('../controllers/policyController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(protect);

router.get('/', getPolicies);
router.post('/', authorize('manage_policies'), createPolicy);
router.put('/:id', authorize('manage_policies'), updatePolicy);
router.delete('/:id', authorize('manage_policies'), deletePolicy);

module.exports = router;
