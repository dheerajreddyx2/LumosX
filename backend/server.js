// Load environment variables from .env file in the same folder
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const notificationRoutes = require('./routes/notifications');
const quizRoutes = require('./routes/quizzes');
const forumRoutes = require('./routes/forum');
const leaderboardRoutes = require('./routes/leaderboard');
const chatbotRoutes = require('./routes/chatbot');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);

// Track DB connection state and health check route
let dbConnected = false;

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', dbConnected });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set! Check your .env file.');
  startServer(); // Optional: start server even without DB
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      dbConnected = true;
      startServer();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.warn('Starting server without DB connection...');
      startServer();
    });
}
