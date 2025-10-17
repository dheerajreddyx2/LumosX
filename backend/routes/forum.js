const express = require('express');
const router = express.Router();
const ForumPost = require('../models/Forum');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// Create a forum post
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, title, content } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user is enrolled or is the teacher
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = req.user.role === 'student' && 
                      course.enrolledStudents.some(s => s.toString() === req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Not authorized to post in this forum' });
    }

    const post = await ForumPost.create({
      course: courseId,
      author: req.user.id,
      title,
      content
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all forum posts for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if user has access to this forum
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = req.user.role === 'student' && 
                      course.enrolledStudents.some(s => s.toString() === req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this forum' });
    }

    const posts = await ForumPost.find({ course: req.params.courseId })
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get a specific forum post
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .populate('course', 'title');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add a reply to a forum post
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Verify user has access to this forum
    const course = await Course.findById(post.course);
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = req.user.role === 'student' && 
                      course.enrolledStudents.some(s => s.toString() === req.user.id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    post.replies.push({
      author: req.user.id,
      content
    });
    post.updatedAt = Date.now();

    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update a forum post (author only)
router.put('/:id', protect, async (req, res) => {
  try {
    let post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, content } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.updatedAt = Date.now();

    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Pin/Unpin a forum post (teacher only)
router.put('/:id/pin', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user is the course teacher
    const course = await Course.findById(post.course);
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only course teacher can pin posts' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete a forum post (author or course teacher)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const course = await Course.findById(post.course);
    const isAuthor = post.author.toString() === req.user.id;
    const isTeacher = course.teacher.toString() === req.user.id;

    if (!isAuthor && !isTeacher) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

