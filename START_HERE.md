# 🚀 START HERE - Quick Fix for Blank Screen

## The Problem
You're seeing a blank screen at http://localhost:3000

## Most Likely Causes
1. Frontend server is not running
2. Backend server is not running  
3. Missing dependencies

## SOLUTION - Follow These Steps:

### Step 1: Start Backend Server
```bash
# Open a terminal/PowerShell
cd C:\Users\Likhitha M-3456\Desktop\Projectp\backend
npm install
npm start
```

**Wait for this message:**
```
MongoDB connected successfully
Server running on port 5000
```

✅ Keep this terminal window open!

---

### Step 2: Start Frontend Server (New Terminal)
```bash
# Open a NEW terminal/PowerShell window
cd C:\Users\Likhitha M-3456\Desktop\Projectp\frontend
npm install
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

✅ Keep this terminal window open too!

---

### Step 3: Open Browser
Now open: **http://localhost:3000/**

You should see the login page!

---

## Still Seeing Blank Screen?

### TEST 1: Try the Test Component
1. Open `frontend/src/main.jsx`
2. Change line 3 from:
   ```jsx
   import App from './App'
   ```
   to:
   ```jsx
   import App from './TestApp'
   ```
3. Save the file
4. Refresh browser

If you see "✅ React is Working!" - React is fine, we need to fix the new code.

### TEST 2: Check Browser Console
1. Press F12 in browser
2. Click "Console" tab
3. Take a screenshot of any RED errors
4. Share the error message

---

## Quick Commands (Copy & Paste)

### For PowerShell Users:

**Start Backend:**
```powershell
cd "C:\Users\Likhitha M-3456\Desktop\Projectp\backend"
npm start
```

**Start Frontend (in new terminal):**
```powershell
cd "C:\Users\Likhitha M-3456\Desktop\Projectp\frontend"  
npm run dev
```

---

## Common Error Messages & Fixes

### Error: "EADDRINUSE: address already in use :::3000"
**Fix:** Something is already using port 3000
```bash
# Kill the process and try again
netstat -ano | findstr :3000
# Note the PID and kill it:
taskkill /PID <PID_NUMBER> /F
```

### Error: "Cannot find module 'xyz'"
**Fix:**
```bash
cd frontend
npm install
```

### Error: "MongoDB connection error"
**Fix:** Check your `.env` file in backend folder has:
```
MONGODB_URI=your_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

---

## Screenshot of What You Should See

### Terminal 1 (Backend):
```
> lms-backend@1.0.0 start
> node server.js

MongoDB connected successfully
Server running on port 5000
```

### Terminal 2 (Frontend):
```
> lms-frontend@1.0.0 dev
> vite

  VITE v5.0.8  ready in 432 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Browser:
You should see the EduLearn login page with blue gradient!

---

## Still Not Working? 

Please share:
1. ✅ Is backend terminal showing "MongoDB connected successfully"?
2. ✅ Is frontend terminal showing "Local: http://localhost:3000/"?
3. ✅ What errors show in browser console (F12)?
4. ✅ Screenshot of browser and console

I'll help you debug further!

