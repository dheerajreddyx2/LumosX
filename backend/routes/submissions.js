const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Leaderboard = require('../models/Leaderboard');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/submissions/:id/request-reevaluation
// @desc    Request re-evaluation for a graded assignment
// @access  Private (Student only)
router.post('/:id/request-reevaluation', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('assignment');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (submission.status !== 'graded') {
      return res.status(400).json({ success: false, message: 'Assignment not graded yet' });
    }
    // Only allow one re-evaluation per assignment per student. If this submission (or any submission for this assignment by this student) already had reevalDone, reject.
    const priorReevalOnAssignment = await Submission.findOne({
      student: req.user.id,
      'assignment': submission.assignment._id,
      reevalDone: true
    });

    if (priorReevalOnAssignment) {
      return res.status(400).json({ success: false, message: 'You have already used your re-evaluation for this assignment' });
    }

    if (submission.reevalRequested) {
      return res.status(400).json({ success: false, message: 'Re-evaluation already requested' });
    }

    submission.reevalRequested = true;
    await submission.save();
    // Notify teacher
    await Notification.create({
      user: submission.assignment.createdBy,
      title: 'Re-evaluation Requested',
      message: `Student has requested re-evaluation for assignment "${submission.assignment.title}"`,
      type: 'reevaluation',
      relatedId: submission._id
    });
    res.status(200).json({ success: true, message: 'Re-evaluation requested' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/submissions';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files (JPG, PNG) are allowed'));
    }
  }
});

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment
// @access  Private (Teacher only)
router.get('/assignment/:assignmentId', protect, authorize('teacher'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .populate('assignment', 'title maxPoints')
      .sort('-submittedAt');
    
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/submissions/student/my-submissions
// @desc    Get all submissions by logged-in student
// @access  Private (Student only)
router.get('/student/my-submissions', protect, authorize('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate('assignment', 'title maxPoints course')
      .populate({
        path: 'assignment',
        populate: {
          path: 'course',
          select: 'title'
        }
      })
      .sort('-submittedAt');
    
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId/my-submission
// @desc    Get student's submission for an assignment
// @access  Private (Student only)
router.get('/assignment/:assignmentId/my-submission', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id
    }).populate('assignment', 'title maxPoints');
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/submissions
// @desc    Submit an assignment (with optional file upload)
// @access  Private (Student only)
router.post('/', protect, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { assignment, content } = req.body;
    
    // Verify assignment exists
  const assignmentDoc = await Assignment.findById(assignment).populate('course').populate('createdBy');
    if (!assignmentDoc) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(assignmentDoc.course._id);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to submit assignments' });
    }
    
    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment,
      student: req.user.id
    });
    
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: 'You have already submitted this assignment' });
    }
    
    // Determine file type if file uploaded
    let fileType = 'text';
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === '.pdf') {
        fileType = 'pdf';
      } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        fileType = 'image';
      }
    }
    
    const submission = await Submission.create({
      assignment,
      student: req.user.id,
      content: content || 'File submission',
      filename: req.file ? req.file.originalname : null,
      filepath: req.file ? req.file.path : null,
      fileType
    });
    
    // Notify teacher
    await Notification.create({
      user: assignmentDoc.createdBy?._id || assignmentDoc.createdBy,
      title: 'New Submission',
      message: `A student has submitted "${assignmentDoc.title}"`,
      type: 'assignment',
      relatedId: submission._id
    });
    
    await submission.populate('assignment', 'title maxPoints');
    
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/submissions/:id/download
// @desc    Download a submission file
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({ path: 'assignment', populate: { path: 'createdBy', select: '_id name' } });
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Check authorization (teacher who created the assignment or the student who submitted)
    const assignmentCreatorId = submission.assignment && submission.assignment.createdBy ? (submission.assignment.createdBy._id ? submission.assignment.createdBy._id.toString() : submission.assignment.createdBy.toString()) : null;
    const isTeacher = req.user.role === 'teacher' && assignmentCreatorId && assignmentCreatorId === req.user.id;
    const isOwner = submission.student.toString() === req.user.id;
    
    if (!isTeacher && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (!submission.filepath) {
      return res.status(404).json({ success: false, message: 'No file attached to this submission' });
    }
    
    const filePath = path.resolve(submission.filepath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    res.download(filePath, submission.filename);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Grade a submission
// @access  Private (Teacher only)
router.put('/:id/grade', protect, authorize('teacher'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    
    let submission = await Submission.findById(req.params.id)
      .populate('assignment')
      .populate('student', 'name email');
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Verify teacher owns the assignment
    if (submission.assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this submission' });
    }
    
  const wasReevalRequested = submission.reevalRequested;

  // Compute previous grade (0 if not graded yet) so we can apply a delta to leaderboard
  const previousGrade = typeof submission.grade === 'number' ? submission.grade : 0;

  submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = Date.now();
    // If teacher is grading again after a re-evaluation request, mark re-eval done and clear the request flag
    if (wasReevalRequested) {
      submission.reevalRequested = false;
      submission.reevalDone = true;
    }

  await submission.save();

  // Update leaderboard by delta so re-evaluation adjusts points instead of double-counting
  const delta = grade - previousGrade;
  await updateLeaderboard(submission.student._id, delta);

    // Notify student
    await Notification.create({
      user: submission.student._id,
      title: wasReevalRequested ? 'Re-evaluation Completed' : 'Assignment Graded',
      message: wasReevalRequested
        ? `Your submission for "${submission.assignment.title}" has been re-evaluated. New Score: ${grade}/10`
        : `Your submission for "${submission.assignment.title}" has been graded. Score: ${grade}/10`,
      type: 'grade',
      relatedId: submission._id
    });

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(studentId, points) {
  try {
    let leaderboard = await Leaderboard.findOne({ student: studentId });
    
    if (!leaderboard) {
      leaderboard = await Leaderboard.create({ student: studentId });
    }

    // Check if weekly reset is needed (7 days)
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - leaderboard.lastWeeklyReset > weekInMs) {
      leaderboard.weeklyPoints = 0;
      leaderboard.lastWeeklyReset = Date.now();
    }

    leaderboard.assignmentPoints += points;
    leaderboard.totalPoints = leaderboard.quizPoints + leaderboard.assignmentPoints;
    leaderboard.weeklyPoints += points;
    leaderboard.updatedAt = Date.now();

    await leaderboard.save();
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

// @route   GET /api/submissions/student/:studentId/grades
// @desc    Get all grades for a student
// @access  Private
router.get('/student/:studentId/grades', protect, async (req, res) => {
  try {
    // Students can only view their own grades
    if (req.user.role === 'student' && req.params.studentId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const submissions = await Submission.find({
      student: req.params.studentId,
      status: 'graded'
    })
      .populate('assignment', 'title maxPoints course')
      .populate({
        path: 'assignment',
        populate: {
          path: 'course',
          select: 'title'
        }
      })
      .sort('-gradedAt');
    
    // Calculate overall statistics
    const totalGrades = submissions.length;
    const averageGrade = totalGrades > 0
      ? submissions.reduce((sum, sub) => sum + sub.grade, 0) / totalGrades
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        submissions,
        statistics: {
          totalGraded: totalGrades,
          averageGrade: averageGrade.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


