const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/assignments/course/:courseId
// @desc    Get all assignments for a course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('course', 'title');
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private (Teacher only)
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, course, dueDate, maxPoints } = req.body;
    
    // Verify course exists and teacher owns it
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    if (courseDoc.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to create assignments for this course' });
    }
    
    const assignment = await Assignment.create({
      title,
      description,
      course,
      dueDate,
      maxPoints: maxPoints || 10,
      createdBy: req.user.id
    });
    
    // Notify all enrolled students
    const notifications = courseDoc.enrolledStudents.map(studentId => ({
      user: studentId,
      title: 'New Assignment',
      message: `New assignment "${title}" has been posted in ${courseDoc.title}`,
      type: 'assignment',
      relatedId: assignment._id
    }));
    
    await Notification.insertMany(notifications);
    
    await assignment.populate('createdBy', 'name email');
    
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher only - own assignments)
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assignment' });
    }
    
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher only - own assignments)
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assignment' });
    }
    
    // Find all submissions for this assignment
    const submissions = await Submission.find({ assignment: assignment._id });
    // For each submission, subtract grade from leaderboard
    for (const submission of submissions) {
      if (submission.grade && submission.student) {
        // Subtract assignment points from leaderboard
        const leaderboard = await require('../models/Leaderboard').findOne({ student: submission.student });
        if (leaderboard) {
          leaderboard.assignmentPoints -= submission.grade;
          if (leaderboard.assignmentPoints < 0) leaderboard.assignmentPoints = 0;
          leaderboard.totalPoints = leaderboard.quizPoints + leaderboard.assignmentPoints;
          leaderboard.weeklyPoints -= submission.grade;
          if (leaderboard.weeklyPoints < 0) leaderboard.weeklyPoints = 0;
          await leaderboard.save();
        }
      }
    }
    // Remove all submissions for this assignment
    await Submission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

