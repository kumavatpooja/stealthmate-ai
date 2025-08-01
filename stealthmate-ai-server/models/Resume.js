const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeText: {
    type: String,
    required: true,
  },
  extraInfo: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Resume', resumeSchema);






