const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');

// Generate a test with random questions
exports.generateTest = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has an active test
    const existingTest = await Test.findOne({ userId, completed: false });
    if (existingTest) {
      return res.json({ testId: existingTest._id, message: 'Existing test found' });
    }
    
    // Get 60 random questions (15 from each category, 5 easy/5 medium/5 hard per category)
    const categories = ['Mathematics', 'Reasoning', 'Technical', 'Database'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    
    let questions = [];
    
    for (const category of categories) {
      for (const difficulty of difficulties) {
        const categoryQuestions = await Question.aggregate([
          { $match: { category, difficulty } },
          { $sample: { size: 5 } }
        ]);
        questions = questions.concat(categoryQuestions);
      }
    }
    
    // Create a new test
    const test = new Test({
      userId,
      questions: questions.map(q => ({ questionId: q._id }))
    });
    
    await test.save();
    
    res.json({ testId: test._id, message: 'Test generated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get test questions
exports.getTestQuestions = async (req, res) => {
  try {
    const testId = req.params.testId;
    const test = await Test.findById(testId).populate('questions.questionId');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Format questions for the frontend
    const questions = test.questions.map((q, index) => ({
      id: q.questionId._id,
      number: index + 1,
      category: q.questionId.category,
      difficulty: q.questionId.difficulty,
      questionText: q.questionId.questionText,
      options: q.questionId.options,
      userAnswer: q.userAnswer || null,
      isAnswered: !!q.userAnswer
    }));
    
    res.json({
      testId: test._id,
      startTime: test.startTime,
      duration: test.duration,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit answer for a question
exports.submitAnswer = async (req, res) => {
  try {
    const { testId, questionId, answer } = req.body;
    
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Check if test is completed
    if (test.completed) {
      return res.status(400).json({ message: 'Test already completed' });
    }
    
    // Find the question in the test
    const questionIndex = test.questions.findIndex(
      q => q.questionId.toString() === questionId
    );
    
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found in test' });
    }
    
    // Get the correct answer
    const question = await Question.findById(questionId);
    const isCorrect = question.correctAnswer === answer;
    
    // Update the question in the test
    test.questions[questionIndex].userAnswer = answer;
    test.questions[questionIndex].isCorrect = isCorrect;
    
    await test.save();
    
    res.json({ message: 'Answer submitted successfully', isCorrect });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit the entire test
exports.submitTest = async (req, res) => {
  try {
    const { testId } = req.body;
    
    const test = await Test.findById(testId).populate('questions.questionId');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Check if test is already completed
    if (test.completed) {
      return res.status(400).json({ message: 'Test already completed' });
    }
    
    // Calculate score
    const correctAnswers = test.questions.filter(q => q.isCorrect).length;
    const totalQuestions = test.questions.length;
    
    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - test.startTime) / 1000); // in seconds
    
    // Update test completion status
    test.endTime = endTime;
    test.completed = true;
    await test.save();
    
    // Calculate category-wise scores
    const categoryWiseScore = {};
    const categories = ['Mathematics', 'Reasoning', 'Technical', 'Database'];
    
    categories.forEach(category => {
      const categoryQuestions = test.questions.filter(
        q => q.questionId.category === category
      );
      const correctCategoryAnswers = categoryQuestions.filter(q => q.isCorrect).length;
      categoryWiseScore[category] = correctCategoryAnswers;
    });
    
    // Create result record
    const result = new Result({
      userId: test.userId,
      testId: test._id,
      score: correctAnswers,
      totalQuestions,
      timeTaken,
      categoryWiseScore
    });
    
    await result.save();
    
    res.json({
      message: 'Test submitted successfully',
      score: correctAnswers,
      totalQuestions,
      timeTaken,
      categoryWiseScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};