const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50)
      .lean();

    // For each notification, try to attach courseTitle when possible
    for (const n of notifications) {
      n.courseTitle = null;
      if (n.relatedId) {
        // Try as Course
        try {
          const course = await Course.findById(n.relatedId).select('title');
          if (course) {
            n.courseTitle = course.title;
            continue;
          }
        } catch (err) {}

        // Try as Assignment (and get course title)
        try {
          const assignment = await Assignment.findById(n.relatedId).populate({ path: 'course', select: 'title' });
          if (assignment && assignment.course) {
            n.courseTitle = assignment.course.title;
          }
        } catch (err) {}
      }
    }
    
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
    
    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


