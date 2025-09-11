const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get questions by category and difficulty (protected)
router.get('/', auth, questionController.getQuestions);

// Get question by ID (protected)
router.get('/:id', auth, questionController.getQuestionById);

// Admin: Create new question
router.post('/', adminAuth, questionController.createQuestion);

// Admin: Update question
router.put('/:id', adminAuth, questionController.updateQuestion);

// Admin: Delete question
router.delete('/:id', adminAuth, questionController.deleteQuestion);

// Admin: Bulk import questions
router.post('/bulk-import', adminAuth, questionController.bulkImportQuestions);

// Admin: Get all questions with filters
router.get('/admin/all', adminAuth, questionController.getAllQuestions);

// Admin: Get question statistics
router.get('/admin/stats', adminAuth, questionController.getQuestionStats);

module.exports = router;