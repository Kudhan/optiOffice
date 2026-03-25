const express = require('express');
const router = express.Router();
const { 
  getMe, 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserDossier,
  updateUserHierarchy,
  updateUserDepartment,
  accountControl
} = require('../controllers/userController');
const { getProfileData, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validateAuthority = require('../middleware/validateAuthority');

const { updateUserStatus, manageAuthority, terminateUser, getActivityLogs } = require('../controllers/adminController');

router.get('/me', protect, getMe);
router.get('/', protect, getUsers);
router.get('/activity-logs', protect, authorize('can_manage_users'), getActivityLogs);
router.get('/:id/dossier', protect, getUserDossier);
router.get('/profile/:id', protect, getProfileData);
router.put('/profile', protect, updateProfile);

// Management Routes
router.post('/', protect, authorize('can_manage_users'), createUser);
router.patch('/:id/hierarchy', protect, authorize('can_manage_users'), updateUserHierarchy);
router.patch('/:id/department', protect, authorize('can_manage_users'), updateUserDepartment);
router.post('/:id/kill-switch', protect, authorize('can_manage_users'), accountControl);
router.patch('/:id/status', protect, authorize('can_manage_users'), validateAuthority, updateUserStatus);
router.patch('/:id/authority', protect, authorize('can_manage_users'), validateAuthority, manageAuthority);
router.delete('/:id/terminate', protect, authorize('can_manage_users'), validateAuthority, terminateUser);
router.patch('/:id', protect, authorize('can_manage_users'), validateAuthority, updateUser);
router.delete('/:id', protect, authorize('can_manage_users'), validateAuthority, deleteUser);

module.exports = router;
