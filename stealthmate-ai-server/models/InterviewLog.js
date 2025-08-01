// models/InterviewLog.js
const mongoose = require('mongoose');

const InterviewLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['live', 'mock'],
    default: 'live',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('InterviewLog', InterviewLogSchema);



