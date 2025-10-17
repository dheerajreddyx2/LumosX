const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Please provide course duration']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  materials: [{
    title: String,
    filename: String,
    filepath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Ratings & reviews left by students
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stars: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  modules: [{
    title: { type: String, required: true },
    content: { type: String, default: '' },
    order: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for average rating
courseSchema.virtual('avgRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const totalStars = this.ratings.reduce((sum, rating) => sum + rating.stars, 0);
  return Math.round((totalStars / this.ratings.length) * 10) / 10;
});

// Virtual for rating count
courseSchema.virtual('ratingCount').get(function() {
  return this.ratings.length;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);

