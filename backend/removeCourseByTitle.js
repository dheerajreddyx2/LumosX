/*
  removeCourseByTitle.js
  Usage: node removeCourseByTitle.js "PEGGING"
  This script connects to MongoDB (using backend/.env MONGODB_URI), finds a course by title (case-insensitive),
  removes the course and cleans up related documents: quizzes, quiz attempts, assignments, submissions, notifications.
  Run from the backend folder:
    cd backend
    node removeCourseByTitle.js "PEGGING"
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Notification = require('./models/Notification');

dotenv.config();

async function removeCourseByTitle(title) {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment. Please set it in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    const course = await Course.findOne({ title: { $regex: `^${title}$`, $options: 'i' } });
    if (!course) {
      console.log(`No course found with title matching "${title}"`);
      await mongoose.disconnect();
      return;
    }

    const courseId = course._id;
    console.log(`Found course: ${course.title} (id: ${courseId}). Removing related data...`);

    // Delete quizzes and their attempts
    const quizzes = await Quiz.find({ course: courseId });
    const quizIds = quizzes.map(q => q._id);
    const qDel = await Quiz.deleteMany({ course: courseId });
    const qaDel = await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
    console.log(`Deleted ${qDel.deletedCount || qDel.n || 0} quizzes and ${qaDel.deletedCount || qaDel.n || 0} quiz attempts`);

    // Delete assignments and submissions
    const assignments = await Assignment.find({ course: courseId });
    const assignmentIds = assignments.map(a => a._id);
    const aDel = await Assignment.deleteMany({ course: courseId });
    const sDel = await Submission.deleteMany({ assignment: { $in: assignmentIds } });
    console.log(`Deleted ${aDel.deletedCount || aDel.n || 0} assignments and ${sDel.deletedCount || sDel.n || 0} submissions`);

    // Delete notifications related to this course or its content
    const nDel = await Notification.deleteMany({ relatedId: { $in: [...quizIds, ...assignmentIds, courseId] } });
    console.log(`Deleted ${nDel.deletedCount || nDel.n || 0} notifications`);

    // Finally delete the course
    await course.deleteOne();
    console.log(`Deleted course: ${course.title}`);

    // Optionally remove course from users.enrolledCourses arrays
    const User = require('./models/User');
    const uUpdate = await User.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    );
    console.log(`Removed course reference from ${uUpdate.modifiedCount || uUpdate.nModified || 0} users`);

  } catch (err) {
    console.error('Error while removing course:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

const titleArg = process.argv[2] || 'PEGGING';
removeCourseByTitle(titleArg);
