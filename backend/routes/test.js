const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const auth = require('../middleware/auth');

// All routes protected by authentication
router.use(auth);

// Generate a new test
router.post('/generate', testController.generateTest);

// Get test questions
router.get('/:testId', testController.getTestQuestions);

// Submit answer for a question
router.post('/answer', testController.submitAnswer);

// Submit the entire test
router.post('/submit', testController.submitTest);

// Get active test for user
router.get('/active/user', testController.getActiveTest);

// Admin: Get all tests
router.get('/', auth, testController.getAllTests);

// Admin: Get tests by user enrollment
router.get('/user/:enrollment', auth, testController.getTestsByEnrollment);

// Admin: Delete test
router.delete('/:testId', auth, testController.deleteTest);

module.exports = router;