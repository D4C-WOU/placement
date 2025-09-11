const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const Result = require('../models/Result');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const questionCount = await Question.countDocuments();
    const testCount = await Test.countDocuments();
    const resultCount = await Result.countDocuments();
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentResults = await Result.find()
      .populate('userId', 'name enrollment')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      userCount,
      questionCount,
      testCount,
      resultCount,
      recentUsers,
      recentResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, approved, isAdmin } = req.query;
    let filter = {};
    
    if (approved !== undefined) filter.approved = approved === 'true';
    if (isAdmin !== undefined) filter.isAdmin = isAdmin === 'true';
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const users = await User.paginate(filter, options);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const user = await User.findOneAndUpdate(
      { enrollment },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { enrollment } = req.params;
    const user = await User.findOneAndDelete({ enrollment });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Also delete user's tests and results
    await Test.deleteMany({ userId: user._id });
    await Result.deleteMany({ userId: user._id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { category: 1, difficulty: 1 }
    };
    
    const questions = await Question.paginate(filter, options);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk import questions
exports.bulkImportQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const result = await Question.insertMany(questions);
    res.status(201).json({ 
      message: `${result.length} questions imported successfully`,
      importedCount: result.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, completed } = req.query;
    let filter = {};
    
    if (completed !== undefined) filter.completed = completed === 'true';
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: 'userId'
    };
    
    const tests = await Test.paginate(filter, options);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete test
exports.deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await Test.findByIdAndDelete(testId);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Also delete the associated result
    await Result.findOneAndDelete({ testId });
    
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all results
exports.getAllResults = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ['userId', 'testId']
    };
    
    const results = await Result.paginate({}, options);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete result
exports.deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await Result.findByIdAndDelete(resultId);
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    // In a real application, you would get these from a settings collection
    const settings = {
      testDuration: 7200, // 2 hours in seconds
      questionsPerCategory: 15,
      easyQuestions: 5,
      mediumQuestions: 5,
      hardQuestions: 5,
      requireAdminApproval: true,
      allowTestRetake: false
    };
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    // In a real application, you would save these to a settings collection
    const settings = req.body;
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export results
exports.exportResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('userId', 'name enrollment email')
      .populate('testId');
    
    // Convert to CSV format
    const csvData = results.map(result => ({
      Enrollment: result.userId.enrollment,
      Name: result.userId.name,
      Email: result.userId.email,
      Score: result.score,
      TotalQuestions: result.totalQuestions,
      TimeTaken: result.timeTaken,
      Date: result.createdAt
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
    
    // Simple CSV conversion
    let csv = 'Enrollment,Name,Email,Score,TotalQuestions,TimeTaken,Date\n';
    csvData.forEach(row => {
      csv += `${row.Enrollment},${row.Name},${row.Email},${row.Score},${row.TotalQuestions},${row.TimeTaken},${row.Date}\n`;
    });
    
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export users
exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    // Convert to CSV format
    const csvData = users.map(user => ({
      Enrollment: user.enrollment,
      Name: user.name,
      Email: user.email,
      Contact: user.contact,
      IsAdmin: user.isAdmin,
      Approved: user.approved,
      CreatedAt: user.createdAt
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    
    // Simple CSV conversion
    let csv = 'Enrollment,Name,Email,Contact,IsAdmin,Approved,CreatedAt\n';
    csvData.forEach(row => {
      csv += `${row.Enrollment},${row.Name},${row.Email},${row.Contact},${row.IsAdmin},${row.Approved},${row.CreatedAt}\n`;
    });
    
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};