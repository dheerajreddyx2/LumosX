
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String
  },
  filename: String,
  filepath: String,
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'text'],
    default: 'text'
  },
  grade: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: String,
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: Date,
  reevalRequested: {
    type: Boolean,
    default: false
  },
  reevalDone: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Submission', submissionSchema);

