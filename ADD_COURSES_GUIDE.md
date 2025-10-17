# How to Add More Courses

## Method 1: Using the Seed Script (Fastest) 🚀

### Step 1: Run the Seed Script
```powershell
cd "C:\Users\Likhitha M-3456\Desktop\Projectp\backend"
node seedCourses.js
```

**This will add 15 sample courses instantly!**

### What it does:
- Adds 15 diverse courses covering different topics
- Uses an existing teacher account (or creates one)
- Skips courses that already exist (no duplicates)
- Shows progress for each course added

### Sample Courses Added:
1. Introduction to Web Development
2. Data Structures and Algorithms  
3. Machine Learning Fundamentals
4. Mobile App Development with React Native
5. Database Design and SQL
6. Cloud Computing with AWS
7. Cybersecurity Essentials
8. UI/UX Design Principles
9. Python for Data Science
10. DevOps and CI/CD
11. Blockchain and Cryptocurrency
12. Advanced JavaScript and TypeScript
13. Digital Marketing Strategies
14. Game Development with Unity
15. Business Analytics and Intelligence

---

## Method 2: Add Courses Through the UI (Manual)

### As a Teacher:

1. **Login as Teacher**
   - Go to http://localhost:3000/login
   - Use teacher credentials:
     - Email: `teacher@edulearn.com`
     - Password: `teacher123`

2. **Navigate to Courses**
   - Click "Courses" in the navigation bar

3. **Create New Course**
   - Click the "+ Create Course" button
   - Fill in:
     - **Title**: e.g., "Introduction to React"
     - **Description**: Brief course overview
     - **Duration**: e.g., "8 weeks"
   - Click "Create Course"

4. **Repeat**
   - Add as many courses as you want!

---

## Method 3: Create Additional Teacher Accounts

If you want courses from different teachers:

### Step 1: Register New Teacher
1. Go to http://localhost:3000/register
2. Fill in details and select "Teacher" role
3. Login with new account
4. Create courses

### Step 2: Use Multiple Teachers
You can have different teachers creating different courses for variety!

---

## Verify Courses Were Added

### Check in the App:
1. Go to http://localhost:3000/courses
2. You should see all courses in the "All Courses" section

### Check Database:
```powershell
# In backend directory
node -e "const mongoose = require('mongoose'); const Course = require('./models/Course'); mongoose.connect(process.env.MONGODB_URI).then(() => Course.countDocuments().then(count => console.log('Total courses:', count)).then(() => process.exit()))"
```

---

## Customize the Sample Courses

Want to add your own courses instead? Edit `backend/seedCourses.js`:

```javascript
const sampleCourses = [
  {
    title: "Your Course Title",
    description: "Your course description here",
    duration: "X weeks"
  },
  // Add more courses...
];
```

Then run: `node seedCourses.js`

---

## Quick Commands Reference

### Add sample courses:
```bash
cd backend
node seedCourses.js
```

### Check total courses:
```bash
cd backend
node -e "require('./models/Course'); require('mongoose').connect(process.env.MONGODB_URI).then(() => require('./models/Course').countDocuments().then(console.log))"
```

### Clear all courses (if needed):
```bash
cd backend  
node -e "require('./models/Course'); require('mongoose').connect(process.env.MONGODB_URI).then(() => require('./models/Course').deleteMany({}).then(() => console.log('Cleared')))"
```

---

## What's Next?

After adding courses:
1. **Enroll students** - Students can enroll in these courses
2. **Add assignments** - Create assignments for each course
3. **Create quizzes** - Add quizzes to test student knowledge
4. **Upload materials** - Add course materials (PDFs, docs, etc.)

---

## Troubleshooting

### Error: "MongoDB connection error"
**Fix:** Make sure MongoDB is running and `.env` has correct connection string

### Error: "No teacher found"
**Fix:** The script will create a default teacher automatically
- Email: teacher@edulearn.com
- Password: teacher123

### Courses not showing?
1. Refresh the browser
2. Check if backend server is running
3. Verify MongoDB connection

---

## Need Different Courses?

Let me know what subjects/topics you want, and I can customize the seed script with those specific courses! 🎓

