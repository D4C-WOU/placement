const Question = require('../models/Question');

// Get questions by category and difficulty
exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const questions = await Question.find(filter).limit(parseInt(limit));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new question (admin only)
exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update question (admin only)
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete question (admin only)
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk import questions (admin only)
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

// Get all questions with filters (admin only)
exports.getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10 } = req.query;
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

// Get question statistics (admin only)
exports.getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: { category: "$category", difficulty: "$difficulty" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.category",
          difficulties: {
            $push: {
              difficulty: "$_id.difficulty",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};