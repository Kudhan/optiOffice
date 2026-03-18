const express = require('express');
const router = express.Router();
const { getMe, getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { getProfileData, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateAuthority = require('../middleware/validateAuthority');

router.get('/me', protect, getMe);
router.get('/', protect, getUsers);
router.get('/profile/:id', protect, getProfileData);
router.put('/profile', protect, updateProfile);
router.post('/', protect, authorize('can_manage_users'), createUser);
router.patch('/:id', protect, authorize('can_manage_users'), validateAuthority, updateUser);
router.delete('/:id', protect, authorize('can_manage_users'), validateAuthority, deleteUser);

module.exports = router;
