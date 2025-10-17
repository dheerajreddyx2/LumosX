# ⚡ Quick Start Guide

Get the LMS running in under 5 minutes!

## 🚀 Super Quick Setup

### 1. Install Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free)

### 2. Clone & Install
```bash
cd Projectp
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Backend
Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=your_secret_key_min_32_characters_long_change_this
PORT=5000
NODE_ENV=development
```

### 4. Start Backend
```bash
cd backend
npm run dev
```
✅ Should show: "MongoDB connected successfully"

### 5. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```
✅ Should show: "Local: http://localhost:3000/"

### 6. Open Browser
Go to: **http://localhost:3000**

### 7. Create Test Accounts

**Teacher Account:**
- Email: teacher@test.com
- Password: teacher123
- Role: Teacher

**Student Account:**
- Email: student@test.com  
- Password: student123
- Role: Student

## 🎯 Quick Test Flow

### As Teacher:
1. Create Course → "Introduction to React"
2. Open Course → Create Assignment
3. Wait for student submission

### As Student (New Browser/Incognito):
1. Enroll in Course
2. Submit Assignment
3. Check Grades tab

### As Teacher:
1. View Submissions
2. Grade Submission
3. Check Notifications

## ✅ Common Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend  
cd frontend && npm run dev

# Install all dependencies
npm run install-all

# Run both (if concurrently installed)
npm run dev
```

## 🐛 Quick Fixes

**Can't connect to MongoDB?**
```bash
# Start MongoDB (Mac)
brew services start mongodb-community

# Or use MongoDB Atlas instead
```

**Port already in use?**
```env
# Change in backend/.env
PORT=5001
```

**Frontend can't reach backend?**
- Make sure backend is running
- Check: http://localhost:5000/api/health

## 📚 Full Documentation

For detailed setup: See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
For deployment: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

**That's it! Happy coding! 🎉**


