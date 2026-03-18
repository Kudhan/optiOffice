const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/', protect, authorize('can_manage_users'), getRoles);
router.post('/', protect, authorize('can_edit_roles'), createRole);
router.put('/:id', protect, authorize('can_edit_roles'), updateRole);
router.delete('/:id', protect, authorize('can_edit_roles'), deleteRole);

module.exports = router;
