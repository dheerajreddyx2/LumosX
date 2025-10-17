const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');

async function checkAndAwardBadge(courseId, studentId) {
  // Criteria:
  // - The course must have at least N enrolled students (N can be 1 for now, or configurable).
  // - All modules in the course are marked completed by the teacher.
  // - The student's CourseProgress shows all modules completed.
  // - The student has attempted and completed all quizzes for the course.
  // - The student has submitted assignments for the course (best-effort: check number equals assignments count).

  const MIN_ENROLLED = 1; // adjust as needed

  const course = await Course.findById(courseId).populate('enrolledStudents');
  if (!course) return null;

  if ((course.enrolledStudents || []).length < MIN_ENROLLED) return null;

  const allModulesCompletedByTeacher = (course.modules || []).every(m => m.completed === true);
  if (!allModulesCompletedByTeacher) return null;

  // student progress
  const prog = await CourseProgress.findOne({ course: courseId, student: studentId });
  const studentCompleted = prog ? prog.completedModules || [] : [];
  if ((course.modules || []).length > 0 && studentCompleted.length < (course.modules || []).length) return null;

  // quizzes: ensure student has attempts for all quizzes
  const quizzes = await Quiz.find({ course: courseId });
  const quizIds = quizzes.map(q => q._id.toString());
  const attempts = await require('../models/QuizAttempt').find({ quiz: { $in: quizIds }, student: studentId });
  if (quizIds.length > 0 && attempts.length < quizIds.length) return null;

  // assignments: ensure at least as many submissions as assignments (best-effort)
  const assignments = await Assignment.find({ course: courseId });
  const assignmentIds = assignments.map(a => a._id.toString());
  const submissions = await Submission.find({ assignment: { $in: assignmentIds }, student: studentId });
  if (assignmentIds.length > 0 && submissions.length < assignmentIds.length) return null;

  // If badge already exists, return existing
  const user = await User.findById(studentId);
  if (!user) return null;
  const already = (user.badges || []).some(b => b.course && b.course.toString() === courseId.toString());
  if (already) return null;

  // Award badge
  const badge = { course: courseId, title: `${course.title} - Completed`, awardedAt: Date.now() };
  user.badges = user.badges || [];
  user.badges.push(badge);
  await user.save();

  return badge;
}

module.exports = { checkAndAwardBadge };
