const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { getProfileData, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.get('/', protect, getUsers);
router.get('/profile/:id', protect, getProfileData);
router.put('/profile', protect, updateProfile);
router.post('/', protect, authorize('can_manage_users'), createUser);
router.patch('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('can_manage_users'), deleteUser);

module.exports = router;
