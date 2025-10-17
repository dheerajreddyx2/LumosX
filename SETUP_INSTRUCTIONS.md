# 🛠️ Setup Instructions for LMS Project

Complete step-by-step guide to set up and run the Learning Management System locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software
- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Choose one:
  - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- **Git** - [Download](https://git-scm.com/)

### Optional but Recommended
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - For API testing
- **VS Code** - Code editor

## ✅ Verify Installations

Open terminal and run:

```bash
# Check Node.js version
node --version
# Should show v14.0.0 or higher

# Check npm version
npm --version
# Should show 6.0.0 or higher

# Check MongoDB (if installed locally)
mongod --version
# Should show MongoDB version

# Check Git
git --version
# Should show Git version
```

## 📥 Step 1: Clone or Download Project

### Option A: Clone with Git
```bash
# Navigate to your desired directory
cd ~/Desktop

# Clone the repository
git clone <your-repository-url>

# Navigate into project folder
cd Projectp
```

### Option B: Download ZIP
1. Download the project ZIP file
2. Extract to your desired location
3. Open terminal in the extracted folder

## 🗄️ Step 2: MongoDB Setup

### Option A: Local MongoDB

#### Windows
1. Install MongoDB Community Edition
2. MongoDB should start automatically as a service
3. Verify it's running:
```bash
# In Command Prompt
net start MongoDB
```

#### macOS
```bash
# Install with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list
```

#### Linux (Ubuntu/Debian)
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb

# Enable MongoDB to start on boot
sudo systemctl enable mongodb

# Check status
sudo systemctl status mongodb
```

### Option B: MongoDB Atlas (Cloud - Recommended for Beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier)
4. Create a database user:
   - Username: `lms_user`
   - Password: `lms_password123` (or your choice)
5. Add IP to whitelist:
   - Click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `lms_db`

Example: `mongodb+srv://lms_user:lms_password123@cluster0.xxxxx.mongodb.net/lms_db?retryWrites=true&w=majority`

## 🔧 Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### Create Environment File

Create a new file named `.env` in the `backend` folder:

```bash
# For Windows (Command Prompt)
copy .env.example .env

# For macOS/Linux
cp .env.example .env
```

Edit the `.env` file with your text editor:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=my_super_secret_jwt_key_change_this_to_something_secure_12345
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://lms_user:lms_password123@cluster0.xxxxx.mongodb.net/lms_db?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_jwt_key_change_this_to_something_secure_12345
PORT=5000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random secure string!

### Generate Secure JWT Secret (Optional but Recommended)

```bash
# Run this in terminal to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` in `.env`

## 🎨 Step 4: Frontend Setup

Open a NEW terminal window/tab:

```bash
# Navigate to frontend directory from project root
cd frontend

# Install dependencies
npm install
```

## 🚀 Step 5: Running the Application

You need TWO terminal windows/tabs open:

### Terminal 1 - Start Backend

```bash
# Make sure you're in the backend directory
cd backend

# Start backend server
npm run dev
```

You should see:
```
MongoDB connected successfully
Server running on port 5000
```

**Keep this terminal running!**

### Terminal 2 - Start Frontend

```bash
# Make sure you're in the frontend directory
cd frontend

# Start frontend development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Keep this terminal running too!**

## 🌐 Step 6: Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

You should see the LMS login page!

## 👤 Step 7: Create Your First User

### Register as Teacher:
1. Click "Sign up here"
2. Fill in the form:
   - Name: John Teacher
   - Email: teacher@test.com
   - Password: teacher123
   - Role: Select "Teacher"
3. Click "Create Account"
4. You'll be logged in automatically

### Register as Student (Open in Incognito/Private Window):
1. Open a new incognito/private browser window
2. Go to `http://localhost:3000`
3. Click "Sign up here"
4. Fill in the form:
   - Name: Jane Student
   - Email: student@test.com
   - Password: student123
   - Role: Select "Student"
5. Click "Create Account"

## 🧪 Step 8: Test the Features

### As Teacher:
1. ✅ Create a new course
2. ✅ View the course details
3. ✅ Create an assignment for the course
4. ✅ Check notifications

### As Student:
1. ✅ Browse all courses
2. ✅ Enroll in a course
3. ✅ View assignments
4. ✅ Submit an assignment
5. ✅ Check grades

### Back as Teacher:
1. ✅ View student submissions
2. ✅ Grade a submission
3. ✅ View enrolled students

### Back as Student:
1. ✅ Check grades
2. ✅ View notifications
3. ✅ See grade statistics

## 🛑 Stopping the Application

To stop the servers:
1. Go to each terminal
2. Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)

## 🔄 Restarting the Application

### Quick Start (after initial setup):

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🐛 Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:**
- Make sure MongoDB is running
- Check your connection string in `.env`
- For Atlas: Verify IP is whitelisted

### Problem: "Port 5000 already in use"
**Solution:**
Change port in `backend/.env`:
```env
PORT=5001
```

### Problem: "Port 3000 already in use"
**Solution:**
Vite will automatically suggest another port (like 3001), press `y` to use it

### Problem: Frontend can't connect to backend
**Solution:**
- Make sure backend is running (Terminal 1)
- Check `http://localhost:5000/api/health` in browser
- Check CORS settings in `backend/server.js`

### Problem: "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Or for Windows:
rmdir /s node_modules
npm install
```

### Problem: MongoDB connection timeout
**Solution:**
- If using Atlas, check your internet connection
- Verify MongoDB Atlas IP whitelist includes your IP
- Try using `0.0.0.0/0` for testing

## 📱 Additional Commands

### Backend

```bash
# Start in development mode (with auto-restart)
npm run dev

# Start in production mode
npm start

# Install new package
npm install package-name
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🗂️ Project Structure After Setup

```
Projectp/
├── backend/
│   ├── node_modules/        # Backend dependencies
│   ├── .env                 # Environment variables (YOU CREATE THIS)
│   └── ...
├── frontend/
│   ├── node_modules/        # Frontend dependencies
│   └── ...
└── README.md
```

## ✨ What You Should See

### Backend Terminal:
```
[nodemon] starting `node server.js`
MongoDB connected successfully
Server running on port 5000
```

### Frontend Terminal:
```
VITE v5.x.x  ready in 450 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Browser (http://localhost:3000):
- Beautiful login page
- Registration form
- Dashboard after login

## 📚 Next Steps

1. ✅ Explore all features
2. ✅ Create multiple test users
3. ✅ Test teacher and student workflows
4. ✅ Check the deployment guide for going live
5. ✅ Customize the application

## 💡 Tips

1. **Keep both terminals running** while using the app
2. **Use different browsers or incognito** to test different user roles
3. **Check terminal logs** if something doesn't work
4. **MongoDB Compass** is great for viewing your database
5. **Postman** is useful for testing API endpoints directly

## 🆘 Getting Help

If you encounter issues:
1. Check the error messages in terminals
2. Look at browser console (F12 → Console tab)
3. Verify all prerequisites are installed
4. Make sure MongoDB is running
5. Check `.env` file configuration

## ✅ Success Checklist

- [ ] Node.js installed and verified
- [ ] MongoDB running (local or Atlas)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created and configured
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can access login page in browser
- [ ] Can register and login users
- [ ] All features working

## 🎉 You're Ready!

If you can see the login page and create users, you're all set! Start exploring your Learning Management System.

---

**Need more help? Check:**
- README.md - Full project documentation
- DEPLOYMENT.md - How to deploy to production
- Code comments - Inline documentation

**Happy Learning! 📚**


