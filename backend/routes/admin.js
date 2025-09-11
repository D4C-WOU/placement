const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// All routes require admin authentication
router.use(adminAuth);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// Manage users
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:enrollment', adminController.updateUser);
router.delete('/users/:enrollment', adminController.deleteUser);

// Manage questions
router.get('/questions', adminController.getAllQuestions);
router.post('/questions/bulk', adminController.bulkImportQuestions);

// Manage tests
router.get('/tests', adminController.getAllTests);
router.delete('/tests/:testId', adminController.deleteTest);

// Manage results
router.get('/results', adminController.getAllResults);
router.delete('/results/:resultId', adminController.deleteResult);

// System settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Export data
router.get('/export/results', adminController.exportResults);
router.get('/export/users', adminController.exportUsers);

module.exports = router;