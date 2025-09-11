const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Student login
router.post('/student/login', authController.studentLogin);

// Admin login
router.post('/admin/login', authController.adminLogin);

// Get pending approvals (admin only)
router.get('/pending', auth, authController.getPendingApprovals);

// Approve student (admin only)
router.post('/approve', auth, authController.approveStudent);

// Get user profile
router.get('/profile', auth, authController.getUserProfile);

// Update user profile
router.put('/profile', auth, authController.updateUserProfile);

// Admin: Get all users
router.get('/users', auth, authController.getAllUsers);

// Admin: Create new user
router.post('/users', auth, authController.createUser);

// Admin: Delete user
router.delete('/users/:enrollment', auth, authController.deleteUser);

module.exports = router;