const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedModules: [{ type: Number }], // store module.order indexes
  updatedAt: { type: Date, default: Date.now }
});

courseProgressSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
