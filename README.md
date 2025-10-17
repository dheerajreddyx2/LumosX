# 🎓 Learning Management System (LMS)

A full-stack Learning Management System built for educational institutions, allowing teachers to create courses and assignments, and students to enroll, submit assignments, and track their grades.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features Implemented](#features-implemented)
- [Tech Stack](#tech-stack)
- [User Stories Completed](#user-stories-completed)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

## 🌟 Project Overview

This Learning Management System (LMS) is a comprehensive educational platform that enables:
- **Teachers** to create and manage courses, create assignments, grade submissions, and track student progress
- **Students** to browse and enroll in courses, submit assignments, view grades, and receive notifications

## ✨ Features Implemented

### 🥉 Bronze Level Features
✅ **User Registration & Login**
- User registration with name, email, password, and role (Student/Teacher)
- Secure login system with JWT authentication
- Password encryption using bcrypt
- User profile management

✅ **Course Management**
- Teachers can create courses with title, description, and duration
- Students can view all available courses
- Beautiful course cards with detailed information

### 🥈 Silver Level Features
✅ **Course Enrollment**
- Students can enroll in courses
- Students can view their enrolled courses
- Teachers can see enrolled students in their courses
- Enrollment/unenrollment functionality

### 🥇 Gold Level Features
✅ **Assignment Submission**
- Teachers can create assignments for courses
- Students can submit assignments
- Teachers can view all submissions for their courses
- Assignment tracking with due dates and points

### 💎 Platinum Level Features
✅ **Grading System**
- Teachers can grade student submissions
- Students can view their grades
- Feedback system for submissions
- Overall grade calculation and statistics
- Average grade tracking

✅ **Advanced Features (Bonus)**
- **Notifications System**: Real-time notifications for assignments, grades, and enrollments
- **Dashboard**: Comprehensive dashboard with statistics and analytics
- **Grade Analytics**: Performance tracking with percentage calculations
- **Responsive Design**: Mobile-friendly UI with modern design

## 🛠️ Tech Stack

### Frontend
- **React.js** (v18.2.0) - UI Library
- **React Router** (v6.20.1) - Navigation
- **Axios** - HTTP Client
- **React Toastify** - Notifications
- **React Icons** - Icon Library
- **Vite** - Build Tool
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime Environment
- **Express.js** (v4.18.2) - Web Framework
- **MongoDB** - Database
- **Mongoose** (v8.0.3) - ODM
- **JWT** (v9.0.2) - Authentication
- **bcryptjs** (v2.4.3) - Password Hashing
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment Configuration

## 📝 User Stories Completed

### ✅ User Story 1 - User Registration & Login (Bronze)
- New users can register with name, email, password, and role
- Users can log in with email and password
- User data is stored securely in MongoDB

### ✅ User Story 2 - Course Management (Bronze)
- Teachers can create courses with title, description, and duration
- Students can view available courses on the homepage
- Course listing with search and filter capabilities

### ✅ User Story 3 - Course Enrollment (Silver)
- Students can enroll in courses
- Students can view their enrolled courses
- Teachers can see enrolled students in their courses

### ✅ User Story 4 - Assignment Submission (Gold)
- Teachers can create assignments for courses
- Students can submit assignments
- Teachers can view all submissions for assignments

### ✅ User Story 5 - Grading System (Platinum)
- Teachers can grade student assignments with points and feedback
- Students can view their grades
- System calculates overall grades and statistics

### ✅ User Story 6 - Optional Advanced Features (Platinum+)
- Notification system for assignments, grades, and updates
- Dashboard with analytics and statistics
- Performance tracking and grade analytics

## 📁 Project Structure

```
Projectp/
├── backend/
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── models/
│   │   ├── Assignment.js          # Assignment model
│   │   ├── Course.js              # Course model
│   │   ├── Notification.js        # Notification model
│   │   ├── Submission.js          # Submission model
│   │   └── User.js                # User model
│   ├── routes/
│   │   ├── assignments.js         # Assignment routes
│   │   ├── auth.js                # Authentication routes
│   │   ├── courses.js             # Course routes
│   │   ├── notifications.js       # Notification routes
│   │   └── submissions.js         # Submission routes
│   ├── .env.example               # Environment variables template
│   ├── .gitignore                 # Git ignore file
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateAssignmentModal.jsx
│   │   │   ├── CreateCourseModal.jsx
│   │   │   ├── GradeSubmissionModal.jsx
│   │   │   ├── SubmitAssignmentModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── Modal.css
│   │   │   └── Navbar.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication context
│   │   ├── pages/
│   │   │   ├── Assignments.jsx    # Assignment details page
│   │   │   ├── Courses.jsx        # All courses page
│   │   │   ├── CourseDetail.jsx   # Single course page
│   │   │   ├── Dashboard.jsx      # Dashboard page
│   │   │   ├── Grades.jsx         # Grades page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── MyCourses.jsx      # My courses page
│   │   │   ├── Notifications.jsx  # Notifications page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Submissions.jsx    # Submissions page
│   │   │   └── *.css              # Page styles
│   │   ├── utils/
│   │   │   └── api.js             # Axios configuration
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── .gitignore                 # Git ignore file
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite configuration
│
├── .gitignore                     # Root git ignore
└── README.md                      # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd Projectp
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=development
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/lms_db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## ▶️ Running the Application

### Option 1: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Option 2: Run with Concurrent (Recommended)

Install concurrently in the root directory:
```bash
npm install concurrently --save-dev
```

Add to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\"",
    "install-all": "cd backend && npm install && cd ../frontend && npm install"
  }
}
```

Then run:
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `GET /api/courses/my-courses` - Get user's courses
- `POST /api/courses` - Create course (Teacher)
- `PUT /api/courses/:id` - Update course (Teacher)
- `DELETE /api/courses/:id` - Delete course (Teacher)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)
- `POST /api/courses/:id/unenroll` - Unenroll from course (Student)

### Assignments
- `GET /api/assignments/course/:courseId` - Get course assignments
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (Teacher)
- `PUT /api/assignments/:id` - Update assignment (Teacher)
- `DELETE /api/assignments/:id` - Delete assignment (Teacher)

### Submissions
- `GET /api/submissions/assignment/:assignmentId` - Get assignment submissions (Teacher)
- `GET /api/submissions/student/my-submissions` - Get student submissions
- `GET /api/submissions/student/:studentId/grades` - Get student grades
- `POST /api/submissions` - Submit assignment (Student)
- `PUT /api/submissions/:id/grade` - Grade submission (Teacher)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. **Create account** on [Render](https://render.com) or [Railway](https://railway.app)

2. **Connect your GitHub repository**

3. **Set environment variables:**
   - `MONGODB_URI` - Use MongoDB Atlas
   - `JWT_SECRET` - Generate a secure key
   - `NODE_ENV=production`

4. **Deploy settings:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Create account** on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

2. **Connect your GitHub repository**

3. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Update frontend API calls** to point to deployed backend URL

### MongoDB Atlas Setup

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string and update `MONGODB_URI`

## 🎨 Features Breakdown

### For Teachers:
- ✅ Create and manage courses
- ✅ Create assignments with due dates
- ✅ View enrolled students
- ✅ Grade student submissions
- ✅ Provide feedback on assignments
- ✅ Track student performance
- ✅ Receive notifications

### For Students:
- ✅ Browse available courses
- ✅ Enroll in courses
- ✅ View course materials
- ✅ Submit assignments
- ✅ View grades and feedback
- ✅ Track academic progress
- ✅ Receive notifications

## 🎯 Achievement Level: **PLATINUM+** 💎

This project successfully implements:
- ✅ All Bronze Level features (User Stories 1-2)
- ✅ All Silver Level features (User Story 3)
- ✅ All Gold Level features (User Story 4)
- ✅ All Platinum Level features (User Stories 5-6)
- ✅ **Bonus Features**: Notifications, Dashboard Analytics, Grade Tracking

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with middleware
- Input validation
- MongoDB injection prevention
- CORS configuration

## 🎨 UI/UX Features

- Modern, clean design
- Responsive layout
- Smooth animations
- Toast notifications
- Loading states
- Empty states with guidance
- Modal dialogs
- Color-coded status badges
- Gradient backgrounds

## 🧪 Testing the Application

### Test User Accounts

**Teacher Account:**
- Email: teacher@test.com
- Password: teacher123
- Role: Teacher

**Student Account:**
- Email: student@test.com
- Password: student123
- Role: Student

### Testing Workflow:

1. **Register/Login** as both teacher and student
2. **As Teacher:**
   - Create a new course
   - Create assignments for the course
   - Wait for student submissions
   - Grade submissions
3. **As Student:**
   - Browse courses
   - Enroll in a course
   - Submit assignments
   - Check grades and notifications

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas connection string
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### CORS Errors
- Ensure backend CORS is configured correctly
- Check frontend API base URL

## 📚 Learning Outcomes

This project demonstrates:
- Full-stack MERN development
- RESTful API design
- Authentication & Authorization
- Database modeling and relationships
- State management in React
- Modern UI/UX practices
- Git version control
- Deployment strategies

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built for Hackathon Project
- MERN Stack Community
- React Icons Library
- MongoDB Documentation

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for Education**

**Project Status:** ✅ Complete & Ready for Deployment

**Achievement Level:** 💎 **PLATINUM+**


