const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/', protect, getUsers);
router.post('/', protect, authorize('admin'), createUser);
router.patch('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
