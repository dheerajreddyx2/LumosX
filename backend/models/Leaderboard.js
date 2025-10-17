const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  quizPoints: {
    type: Number,
    default: 0
  },
  assignmentPoints: {
    type: Number,
    default: 0
  },
  weeklyPoints: {
    type: Number,
    default: 0
  },
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
leaderboardSchema.index({ totalPoints: -1 });
leaderboardSchema.index({ weeklyPoints: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

