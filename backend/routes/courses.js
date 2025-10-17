const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const CourseProgress = require('../models/CourseProgress');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/materials';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'material-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (PDF, DOC, PPT, XLS, TXT)'));
    }
  },
});

// @route   GET /api/courses
router.get('/', protect, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name email')
      .sort('-createdAt');
    // attach rating summary
    const withRatings = courses.map(c => {
      const ratingCount = (c.ratings || []).length;
      const avgRating = ratingCount > 0 ? (c.ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratingCount) : 0;
      return { ...c.toObject(), ratingCount, avgRating };
    });
    res.status(200).json({ success: true, data: withRatings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/my-courses
router.get('/my-courses', protect, async (req, res) => {
  try {
    let courses;
    if (req.user.role === 'teacher') {
      courses = await Course.find({ teacher: req.user.id })
        .populate('enrolledStudents', 'name email')
        .sort('-createdAt');
    } else {
      courses = await Course.find({ enrolledStudents: req.user.id })
        .populate('teacher', 'name email')
        .sort('-createdAt');
    }
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Use virtual fields for rating summary
    res.status(200).json({ success: true, data: course.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, duration, modules } = req.body;

    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course modules (syllabus) when creating a course',
      });
    }

    const course = await Course.create({
      title,
      description,
      duration,
      modules,
      teacher: req.user.id,
    });

    await course.populate('teacher', 'name email');
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/courses/:id
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    const updateData = req.body;
    course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('teacher', 'name email');

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/courses/:id
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/enroll
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    course.enrolledStudents.push(req.user.id);
    await course.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { enrolledCourses: course._id } });

    await Notification.create({
      user: req.user.id,
      title: 'Enrollment Successful',
      message: `You have successfully enrolled in ${course.title}`,
      type: 'enrollment',
      relatedId: course._id,
    });

    await course.populate('teacher', 'name email');
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/unenroll
router.post('/:id/unenroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    course.enrolledStudents = course.enrolledStudents.filter(
      (studentId) => studentId.toString() !== req.user.id
    );
    await course.save();

    await User.findByIdAndUpdate(req.user.id, { $pull: { enrolledCourses: course._id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/materials
router.post('/:id/materials', protect, authorize('teacher'), upload.single('file'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const material = {
      title: req.body.title || req.file.originalname,
      filename: req.file.originalname,
      filepath: req.file.path,
    };

    course.materials.push(material);
    await course.save();

    for (const studentId of course.enrolledStudents) {
      await Notification.create({
        user: studentId,
        title: 'New Course Material',
        message: `New material "${material.title}" has been uploaded to ${course.title}`,
        type: 'material',
        relatedId: course._id,
      });
    }

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/rate
// body: { stars: number (1-5), review?: string }
router.post('/:id/rate', protect, authorize('student'), async (req, res) => {
  try {
    const { stars, review } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Only enrolled students can rate
    const isEnrolled = course.enrolledStudents.some(s => s.toString() === req.user.id);
    if (!isEnrolled) return res.status(403).json({ success: false, message: 'Only enrolled students may rate this course' });

    if (!stars || typeof stars !== 'number' || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be a number between 1 and 5' });
    }

    // If user already rated, update; otherwise push new rating
    const existing = (course.ratings || []).find(r => r.user && r.user.toString() === req.user.id);
    if (existing) {
      existing.stars = stars;
      existing.review = review || existing.review;
      existing.createdAt = Date.now();
    } else {
      course.ratings.push({ user: req.user.id, stars, review: review || '' });
    }

    await course.save();

    const ratingCount = (course.ratings || []).length;
    const avgRating = ratingCount > 0 ? (course.ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratingCount) : 0;

    res.status(200).json({ success: true, data: { ratingCount, avgRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id/materials/:materialId/summary
router.get('/:id/materials/:materialId/summary', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isEnrolled = course.enrolledStudents.some((s) => s.toString() === req.user.id);

    // Only students (enrolled) can summarize materials
    if (req.user.role !== 'student' || !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Only enrolled students may summarize materials' });
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    const filePath = path.resolve(material.filepath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });

    const ext = path.extname(filePath).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      // Prefer pdf-parse for reliable extraction
      let pdfParse;
      try {
        pdfParse = require('pdf-parse');
      } catch (err) {
        return res.status(501).json({
          success: false,
          message:
            "PDF summarization requires the 'pdf-parse' package to be installed on the server. Please run 'npm install pdf-parse' in the backend and restart the server."
        });
      }

      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text = (pdfData && pdfData.text) ? String(pdfData.text) : '';
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to extract text from PDF: ' + err.message });
      }
    } else if (ext === '.txt') {
      // Plain text files
      try {
        text = fs.readFileSync(filePath, 'utf8');
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to read text file: ' + err.message });
      }
    } else if (ext === '.docx' || ext === '.doc') {
      // DOC/DOCX summarization requires a parser (e.g. 'mammoth'). Ask admin to install it.
      return res.status(501).json({
        success: false,
        message:
          "DOC/DOCX summarization is not available. Install 'mammoth' (npm i mammoth) on the backend to enable docx parsing, or upload PDFs/TXT files for summarization."
      });
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type for summarization' });
    }

    // If we couldn't extract text or text is tiny, return a helpful response
    if (!text || text.trim().length < 50) {
      return res.status(422).json({ success: false, message: 'Could not extract meaningful text from the file for summarization.' });
    }

    // Robust naive summarizer: split into sentences and pick first meaningful ones
    const sentences = text
      .replace(/\n+/g, ' ') // normalize newlines
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 30);

    let summary = '';
    if (sentences.length >= 3) {
      summary = sentences.slice(0, 3).join(' ');
    } else if (sentences.length > 0) {
      // join whatever sentences we have up to ~400 chars
      summary = sentences.join(' ').slice(0, 800);
    } else {
      // fallback to a substring of the full text
      summary = text.slice(0, 800);
    }

    const excerpt = summary;
    res.status(200).json({ success: true, data: { excerpt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/notify
router.post('/:id/notify', protect, authorize('teacher'), async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const course = await Course.findById(req.params.id).populate('enrolledStudents', '_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const recipients = course.enrolledStudents.map((s) => s._id.toString());
    const createOps = recipients.map((studentId) =>
      Notification.create({
        user: studentId,
        title: title || `Message from ${req.user.name || 'Course'}`,
        message: message || '',
        type: type || 'general',
        relatedId: course._id,
      })
    );

    const created = await Promise.all(createOps);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/modules/:order/teacher-complete
router.post('/:id/modules/:order/teacher-complete', protect, authorize('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const order = parseInt(req.params.order, 10);
    if (isNaN(order) || order < 0 || order >= course.modules.length) {
      return res.status(400).json({ success: false, message: 'Invalid module order' });
    }

    course.modules[order].completed = true;
    await course.save();

    const ops = course.enrolledStudents.map((studentId) =>
      CourseProgress.findOneAndUpdate(
        { course: course._id, student: studentId },
        { $addToSet: { completedModules: order }, updatedAt: Date.now() },
        { upsert: true, new: true }
      )
    );

    await Promise.all(ops);

    const notifyOps = course.enrolledStudents.map((studentId) =>
      Notification.create({
        user: studentId,
        title: `Module completed in ${course.title}`,
        message: `Module "${course.modules[order].title}" has been marked complete by the instructor.`,
        type: 'general',
        relatedId: course._id,
      })
    );

    await Promise.all(notifyOps);

    // After teacher completes a module, attempt to award badges to enrolled students
    const { checkAndAwardBadge } = require('../utils/badges');
    for (const studentId of course.enrolledStudents) {
      // run in background (no await necessary per student)
      checkAndAwardBadge(course._id, studentId).catch(err => console.error('Badge check error', err));
    }

    res.status(200).json({ success: true, data: course.modules[order] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id/announcements
router.get('/:id/announcements', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ relatedId: req.params.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id/materials
router.get('/:id/materials', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled =
      req.user.role === 'student' &&
      course.enrolledStudents.some((s) => s.toString() === req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: course.materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id/materials/:materialId/download
router.get('/:id/materials/:materialId/download', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled =
      req.user.role === 'student' &&
      course.enrolledStudents.some((s) => s.toString() === req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const filePath = path.resolve(material.filepath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.download(filePath, material.filename);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/courses/:id/materials/:materialId
router.delete('/:id/materials/:materialId', protect, authorize('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (fs.existsSync(material.filepath)) {
      fs.unlinkSync(material.filepath);
    }

    material.deleteOne();
    await course.save();

    res.status(200).json({ success: true, message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id/progress
router.get('/:id/progress', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const progress = await CourseProgress.findOne({ course: course._id, student: req.user.id });
    const completed = progress ? progress.completedModules.length : 0;
    const total = course.modules.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        completed,
        total,
        percent,
        completedModules: progress?.completedModules || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/modules/:order/complete
router.post('/:id/modules/:order/complete', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const order = parseInt(req.params.order, 10);
    if (isNaN(order)) return res.status(400).json({ success: false, message: 'Invalid module order' });

        const prog = await CourseProgress.findOneAndUpdate(
      { course: course._id, student: req.user.id },
      { $addToSet: { completedModules: order }, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: prog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses/:id/rate
// @desc    Rate and review a course (enrolled students only)
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { stars, review } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id;

    // Validate input
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating (1-5 stars)' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.some(studentId => studentId.toString() === userId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Only enrolled students can rate this course' });
    }

    // Check if user already rated
    const existingRatingIndex = course.ratings.findIndex(rating => rating.user.toString() === userId);
    
    if (existingRatingIndex >= 0) {
      // Update existing rating
      course.ratings[existingRatingIndex].stars = stars;
      course.ratings[existingRatingIndex].review = review || '';
      course.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      course.ratings.push({
        user: userId,
        stars: stars,
        review: review || '',
        createdAt: new Date()
      });
    }

    await course.save();

    // Calculate average rating
    const totalStars = course.ratings.reduce((sum, rating) => sum + rating.stars, 0);
    const avgRating = course.ratings.length > 0 ? totalStars / course.ratings.length : 0;

    res.json({
      success: true,
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: course.ratings.length,
        userRating: { stars, review: review || '' }
      }
    });
  } catch (error) {
    console.error('Rate course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courses/:id/reviews
// @desc    Get all reviews for a course
router.get('/:id/reviews', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('ratings.user', 'name email')
      .select('ratings');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Sort reviews by newest first
    const reviews = course.ratings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(rating => ({
        _id: rating._id,
        user: rating.user,
        stars: rating.stars,
        review: rating.review,
        createdAt: rating.createdAt
      }));

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

