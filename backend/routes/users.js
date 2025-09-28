const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  getUserDashboardStats
} = require('../controllers/userController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');
const {
  validateUserUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/:userId/profile', validateObjectId('userId'), optionalAuth, getUserById);

// Protected routes
router.use(authenticate); // All routes below require authentication

// General user routes
router.get('/dashboard/stats', getUserDashboardStats);
router.put('/:userId', validateObjectId('userId'), uploadSingle('avatar'), validateUserUpdate, updateUser);

// Admin only routes
router.get('/', isAdmin, validatePagination, getAllUsers);
router.delete('/:userId', validateObjectId('userId'), isAdmin, deleteUser);
router.patch('/:userId/status', validateObjectId('userId'), isAdmin, toggleUserStatus);
router.patch('/:userId/role', validateObjectId('userId'), isAdmin, changeUserRole);

module.exports = router;



