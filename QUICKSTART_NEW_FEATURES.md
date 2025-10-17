# Quick Start Guide - New Features

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend

# Install dependencies (multer already in package.json)
npm install

# Start the backend server
npm start
# OR for development with auto-reload
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

### 3. Access the Application
- Frontend: `http://localhost:5173` (or the port shown in terminal)
- Backend: `http://localhost:5000`

## 🎯 Testing New Features

### Dark Mode Toggle
1. Log in to the application
2. Look for the Sun/Moon icon in the top navigation bar
3. Click to toggle between light and dark themes
4. Theme preference is saved automatically

### My Courses vs All Courses
**As a Student:**
1. Go to "Courses" from the navigation
2. See "My Courses" section at the top (courses you're enrolled in)
3. See "All Courses" section below (courses available to enroll)
4. Click "Continue Learning" on enrolled courses

**As a Teacher:**
1. Go to "Courses"
2. See "My Courses" section showing courses you created
3. Click "Manage Course" to edit your courses

### Notifications
1. Look for the bell icon in the top right
2. Red badge shows unread notification count
3. Click the bell to see recent notifications
4. Click "View All" to go to full notifications page

### Forum
1. Click "Forum" in the navigation
2. Select a course from the sidebar
3. Click "+ New Post" to create a discussion
4. Click on any post to view details and replies
5. Click "AI Assistant" button to open the chatbot
6. Type questions to get AI responses (demo mode)

### Quizzes
**As a Teacher:**
1. Go to any course you teach
2. Click the "Quizzes" tab
3. Click "+ Create Quiz"
4. Add questions with multiple choice options
5. Set due date and duration
6. View student attempts and scores

**As a Student:**
1. Enroll in a course
2. Go to the course detail page
3. Click the "Quizzes" tab
4. Click "Take Quiz" on any available quiz
5. Click "Start Quiz" to begin
6. Answer all questions before time runs out
7. View your score after submission

### Assignments with File Upload
**As a Student:**
1. Go to an assignment
2. Click "Submit Assignment"
3. Either:
   - Write text in the submission box, OR
   - Upload a PDF or image file (JPG, PNG), OR
   - Do both
4. Click "Submit Assignment"

**As a Teacher:**
1. Go to your course
2. Click "View Submissions" on any assignment
3. Click download icon to get student files
4. Grade with a score from 0-10
5. Provide feedback

### Course Materials
**As a Teacher:**
1. Go to your course
2. Click the "Materials" tab
3. Click "Upload Material"
4. Select a file (PDF, DOC, PPT, XLS, TXT)
5. File is uploaded and available to students

**As a Student:**
1. Go to an enrolled course
2. Click the "Materials" tab
3. Click "Download" to get any material
4. View or save files locally

### Leaderboard
1. Click "Leaderboard" in the navigation
2. Switch between "Overall" and "Weekly" tabs
3. See your rank and stats at the top (students only)
4. View top 3 students with special badges
5. See your position in the full ranking list

## 🎨 Feature Highlights

### Course Detail Tabs
Each course now has 3 organized tabs:
- **Assignments**: All course assignments
- **Quizzes**: All course quizzes
- **Materials**: All course materials

### Scoring System
- All assessments use 0-10 scale
- Quizzes are auto-graded
- Assignments are manually graded by teachers
- Points automatically update the leaderboard

### Weekly Leaderboard Reset
- Resets every 7 days
- Encourages continuous participation
- Overall leaderboard keeps all-time scores

## 🔍 Tips & Tricks

### For Teachers:
- Pin important forum posts to keep them at the top
- Upload materials before starting assignments/quizzes
- Check submission counts to track student progress
- Use the forum to answer common questions

### For Students:
- Check the leaderboard to see your ranking
- Use the AI chatbot for quick doubts
- Download course materials for offline study
- Complete quizzes and assignments to earn points
- Participate in forum discussions

## 🐛 Common Issues & Solutions

### Issue: Cannot upload file
**Solution**: Check file type (must be PDF or image) and size (max 5MB for assignments, 10MB for materials)

### Issue: Quiz timer not working
**Solution**: Ensure JavaScript is enabled and refresh the page

### Issue: Dark mode colors look wrong
**Solution**: Clear browser cache and reload

### Issue: Notifications not updating
**Solution**: Refresh the page or log out and log back in

### Issue: Cannot see forum posts
**Solution**: Ensure you're enrolled in the course

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify backend server is running
3. Check MongoDB connection
4. Review the IMPLEMENTATION_SUMMARY.md for detailed information

## 🎉 Enjoy Your Enhanced LMS!

All features are now ready to use. Explore the system and discover how these new additions improve the learning experience!

