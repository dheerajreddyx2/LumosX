const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const { protect } = require('../middleware/auth');

// Get overall leaderboard
router.get('/overall', protect, async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('student', 'name email')
      .sort({ totalPoints: -1 })
      .limit(100);

    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      student: entry.student,
      totalPoints: entry.totalPoints,
      quizPoints: entry.quizPoints,
      assignmentPoints: entry.assignmentPoints
    }));

    res.status(200).json({ success: true, data: rankedLeaderboard });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get weekly leaderboard
router.get('/weekly', protect, async (req, res) => {
  try {
    // Reset weekly points if needed
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    await Leaderboard.updateMany(
      { lastWeeklyReset: { $lt: new Date(Date.now() - weekInMs) } },
      { $set: { weeklyPoints: 0, lastWeeklyReset: Date.now() } }
    );

    const leaderboard = await Leaderboard.find()
      .populate('student', 'name email')
      .sort({ weeklyPoints: -1 })
      .limit(100);

    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      student: entry.student,
      weeklyPoints: entry.weeklyPoints,
      totalPoints: entry.totalPoints
    }));

    res.status(200).json({ success: true, data: rankedLeaderboard });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get current user's leaderboard stats
router.get('/me', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Only students have leaderboard stats' });
    }

    let stats = await Leaderboard.findOne({ student: req.user.id })
      .populate('student', 'name email');

    if (!stats) {
      stats = await Leaderboard.create({ student: req.user.id });
      stats = await Leaderboard.findById(stats._id).populate('student', 'name email');
    }

    // Get overall rank
    const higherRanked = await Leaderboard.countDocuments({
      totalPoints: { $gt: stats.totalPoints }
    });
    const overallRank = higherRanked + 1;

    // Get weekly rank
    const higherRankedWeekly = await Leaderboard.countDocuments({
      weeklyPoints: { $gt: stats.weeklyPoints }
    });
    const weeklyRank = higherRankedWeekly + 1;

    res.status(200).json({
      success: true,
      data: {
        ...stats.toObject(),
        overallRank,
        weeklyRank
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

