const Result = require('../models/Result');
const Test = require('../models/Test');

// Get user results
exports.getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const results = await Result.find({ userId })
      .populate('testId')
      .sort({ createdAt: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get specific result details
exports.getResultDetails = async (req, res) => {
  try {
    const resultId = req.params.id;
    
    const result = await Result.findById(resultId)
      .populate('testId')
      .populate('userId', 'name enrollment');
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    // Check if the user is authorized to view this result
    if (req.user.id !== result.userId._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all results (admin only)
exports.getAllResults = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const results = await Result.find()
      .populate('userId', 'name enrollment')
      .populate('testId')
      .sort({ createdAt: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get results by enrollment number (admin only)
exports.getResultsByEnrollment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { enrollment } = req.params;
    
    // First find the user by enrollment
    const User = require('../models/User');
    const user = await User.findOne({ enrollment });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Then get their results
    const results = await Result.find({ userId: user._id })
      .populate('testId')
      .sort({ createdAt: -1 });
    
    res.json({
      user: {
        name: user.name,
        enrollment: user.enrollment,
        email: user.email
      },
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance statistics for a user
exports.getPerformanceStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const results = await Result.find({ userId })
      .populate('testId')
      .sort({ createdAt: -1 });
    
    if (results.length === 0) {
      return res.json({ message: 'No test results found' });
    }
    
    // Calculate overall statistics
    const totalTests = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalTests;
    const highestScore = Math.max(...results.map(result => result.score));
    const lowestScore = Math.min(...results.map(result => result.score));
    
    // Calculate category-wise performance
    const categoryStats = {
      Mathematics: { total: 0, correct: 0 },
      Reasoning: { total: 0, correct: 0 },
      Technical: { total: 0, correct: 0 },
      Database: { total: 0, correct: 0 }
    };
    
    results.forEach(result => {
      for (const [category, score] of Object.entries(result.categoryWiseScore)) {
        categoryStats[category].correct += score;
        // Assuming 15 questions per category (as per test generation logic)
        categoryStats[category].total += 15;
      }
    });
    
    // Calculate accuracy percentages
    const categoryAccuracy = {};
    for (const [category, stats] of Object.entries(categoryStats)) {
      categoryAccuracy[category] = stats.total > 0 
        ? ((stats.correct / stats.total) * 100).toFixed(2) 
        : 0;
    }
    
    // Get recent test results (last 5 tests)
    const recentTests = results.slice(0, 5).map(result => ({
      date: result.createdAt,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken
    }));
    
    res.json({
      totalTests,
      averageScore: averageScore.toFixed(2),
      highestScore,
      lowestScore,
      categoryAccuracy,
      recentTests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a result (admin only)
exports.deleteResult = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const resultId = req.params.id;
    
    const result = await Result.findByIdAndDelete(resultId);
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    // Also delete the associated test
    await Test.findByIdAndDelete(result.testId);
    
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leaderboard (top performers)
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Aggregate to get top scores with user information
    const leaderboard = await Result.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          highestScore: { $max: '$score' },
          averageScore: { $avg: '$score' },
          testCount: { $sum: 1 },
          user: { $first: '$user' }
        }
      },
      { $sort: { highestScore: -1, averageScore: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          enrollment: '$user.enrollment',
          highestScore: 1,
          averageScore: { $round: ['$averageScore', 2] },
          testCount: 1
        }
      }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get test analysis with question details
exports.getTestAnalysis = async (req, res) => {
  try {
    const resultId = req.params.id;
    
    const result = await Result.findById(resultId)
      .populate('testId')
      .populate('userId', 'name enrollment');
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    // Check if the user is authorized to view this result
    if (req.user.id !== result.userId._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }
    
    // Get detailed test information with questions
    const test = await Test.findById(result.testId)
      .populate('questions.questionId');
    
    if (!test) {
      return res.status(404).json({ message: 'Test details not found' });
    }
    
    // Format the response with question details
    const questionAnalysis = test.questions.map(q => ({
      question: q.questionId.questionText,
      category: q.questionId.category,
      difficulty: q.questionId.difficulty,
      options: q.questionId.options,
      correctAnswer: q.questionId.correctAnswer,
      userAnswer: q.userAnswer,
      isCorrect: q.isCorrect
    }));
    
    // Calculate category-wise performance for this test
    const categoryPerformance = {
      Mathematics: { correct: 0, total: 0 },
      Reasoning: { correct: 0, total: 0 },
      Technical: { correct: 0, total: 0 },
      Database: { correct: 0, total: 0 }
    };
    
    test.questions.forEach(q => {
      const category = q.questionId.category;
      categoryPerformance[category].total += 1;
      if (q.isCorrect) {
        categoryPerformance[category].correct += 1;
      }
    });
    
    // Calculate accuracy percentages
    const categoryAccuracy = {};
    for (const [category, stats] of Object.entries(categoryPerformance)) {
      categoryAccuracy[category] = stats.total > 0 
        ? ((stats.correct / stats.total) * 100).toFixed(2) 
        : 0;
    }
    
    res.json({
      result: {
        score: result.score,
        totalQuestions: result.totalQuestions,
        timeTaken: result.timeTaken,
        createdAt: result.createdAt
      },
      user: {
        name: result.userId.name,
        enrollment: result.userId.enrollment
      },
      categoryAccuracy,
      questionAnalysis
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};