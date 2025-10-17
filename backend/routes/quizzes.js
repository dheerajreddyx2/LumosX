const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Leaderboard = require('../models/Leaderboard');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Create a quiz (teacher only)
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { courseId, title, description, questions, totalPoints, duration, dueDate } = req.body;

    // Verify course exists and user is the teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to create quiz for this course' });
    }

    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide a dueDate for the quiz' });
    }

    // Validate questions: each should have 4 options and a correctAnswer index
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz must have at least one question' });
    }

    for (const q of questions) {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({ success: false, message: 'Each question must have exactly 4 options' });
      }
      // Accept correctAnswer as either 0-3 or 1-4 (UI shows 1-4)
      if (typeof q.correctAnswer !== 'number') {
        return res.status(400).json({ success: false, message: 'Each question must have a correctAnswer index' });
      }
      if (q.correctAnswer >= 1 && q.correctAnswer <= 4) {
        q.correctAnswer = q.correctAnswer - 1; // convert to 0-based index
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({ success: false, message: 'Each question must have a correctAnswer index between 1 and 4' });
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      course: courseId,
      questions,
      totalPoints: totalPoints || 10,
      duration: duration || 30,
      dueDate,
      createdBy: req.user.id
    });

    // Notify enrolled students about new quiz
    for (const studentId of course.enrolledStudents) {
      await Notification.create({
        user: studentId,
        title: 'New Quiz Posted',
        message: `A new quiz "${quiz.title}" has been posted in ${course.title}`,
        type: 'assignment',
        relatedId: quiz._id
      });
    }

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all quizzes for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const quizzes = await Quiz.find({ course: req.params.courseId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get a specific quiz
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'name');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if student is enrolled (hide correct answers for students)
    if (req.user.role === 'student') {
      const course = await Course.findById(quiz.course._id);
      const isEnrolled = course.enrolledStudents.some(s => s.toString() === req.user.id);
      
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      }

      // Remove correct answers for students
      const quizForStudent = quiz.toObject();
      quizForStudent.questions = quizForStudent.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points
      }));
      
      return res.status(200).json({ success: true, data: quizForStudent });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Submit quiz attempt (student only)
router.post('/:id/attempt', protect, authorize('student'), async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if student is enrolled
    const course = await Course.findById(quiz.course);
    const isEnrolled = course.enrolledStudents.some(s => s.toString() === req.user.id);
    
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Check if already attempted
    const existingAttempt = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user.id });
    if (existingAttempt) {
      return res.status(400).json({ success: false, message: 'Quiz already attempted' });
    }

    // Calculate score
    let correctAnswers = 0;
    let earnedPoints = 0;

    answers.forEach((answer, index) => {
      if (quiz.questions[index] && answer.selectedAnswer === quiz.questions[index].correctAnswer) {
        correctAnswers++;
        earnedPoints += quiz.questions[index].points;
      }
    });

    // Normalize score to 0-10
    const totalPossiblePoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const normalizedScore = totalPossiblePoints > 0 
      ? Math.min(10, Math.round((earnedPoints / totalPossiblePoints) * 10 * 100) / 100)
      : 0;

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user.id,
      answers,
      score: normalizedScore,
      totalQuestions: quiz.questions.length,
      correctAnswers
    });

    // Update leaderboard
    await updateLeaderboard(req.user.id, normalizedScore, 'quiz');

    // Check and award badge if criteria satisfied
    try {
      const { checkAndAwardBadge } = require('../utils/badges');
      checkAndAwardBadge(quiz.course, req.user.id).catch(err => console.error('Badge check error', err));
    } catch (err) {
      console.error('Badge helper load error', err);
    }

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get quiz attempts (teacher: all, student: their own)
router.get('/:id/attempts', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let query = { quiz: req.params.id };
    
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    const attempts = await QuizAttempt.find(query)
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update quiz (teacher only)
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Verify ownership
    const course = await Course.findById(quiz.course);
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete quiz (teacher only)
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const course = await Course.findById(quiz.course);
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await quiz.deleteOne();
    await QuizAttempt.deleteMany({ quiz: quiz._id });

    res.status(200).json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard(studentId, points, type) {
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

    if (type === 'quiz') {
      leaderboard.quizPoints += points;
    } else if (type === 'assignment') {
      leaderboard.assignmentPoints += points;
    }

    leaderboard.totalPoints = leaderboard.quizPoints + leaderboard.assignmentPoints;
    leaderboard.weeklyPoints += points;
    leaderboard.updatedAt = Date.now();

    await leaderboard.save();
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

module.exports = router;

// @route GET /api/quizzes/student/:studentId/attempts
// Returns all quiz attempts for a student (protected)
router.get('/student/:studentId/attempts', protect, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Students can only request their own attempts
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempts = await QuizAttempt.find({ student: studentId })
      .populate({ path: 'quiz', populate: { path: 'course', select: 'title' } })
      .sort('-submittedAt');

    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

