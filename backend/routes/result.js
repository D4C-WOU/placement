const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const auth = require('../middleware/auth');

// All routes protected by authentication
router.use(auth);

// Get user results
router.get('/my-results', resultController.getUserResults);

// Get specific result details
router.get('/:id', resultController.getResultDetails);

// Get performance statistics for a user
router.get('/stats/performance', resultController.getPerformanceStats);

// Get test analysis with question details
router.get('/analysis/:id', resultController.getTestAnalysis);

// Get leaderboard (top performers)
router.get('/leaderboard/all', resultController.getLeaderboard);

// Admin: Get all results
router.get('/', resultController.getAllResults);

// Admin: Get results by enrollment number
router.get('/user/:enrollment', resultController.getResultsByEnrollment);

// Admin: Delete result
router.delete('/:id', resultController.deleteResult);

module.exports = router;