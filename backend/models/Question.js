const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Reasoning', 'Technical', 'Database']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['LeetCode', 'HackerRank', 'GeeksforGeeks']
  }
});

module.exports = mongoose.model('Question', questionSchema);