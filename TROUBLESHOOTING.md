# Troubleshooting Blank Screen Issue

## Quick Diagnosis Steps

### Step 1: Check if Frontend Server is Running
```bash
cd frontend
npm run dev
```

**Expected output:** Server running on `http://localhost:3000`

If you see any errors, note them down.

### Step 2: Open Browser Console
1. Open `http://localhost:3000` in your browser
2. Press F12 to open Developer Tools
3. Click on "Console" tab
4. Look for any red error messages

**Common errors to look for:**
- "Failed to fetch module"
- "Unexpected token"
- "Cannot find module"
- "undefined is not a function"

### Step 3: Check Backend Server
```bash
cd backend
npm start
```

**Expected output:** 
- "MongoDB connected successfully"
- "Server running on port 5000"

### Step 4: Verify MongoDB
Make sure MongoDB is running:
- If using MongoDB Atlas: Check connection string in `.env`
- If using local MongoDB: Run `mongod` command

## Common Issues & Fixes

### Issue 1: Module Not Found Errors
**Fix:**
```bash
cd frontend
npm install
```

### Issue 2: Port Already in Use
**Fix:**
- Kill the process using port 3000
- Or change port in `frontend/vite.config.js`

### Issue 3: CORS Errors
**Fix:** Make sure backend `cors()` is enabled in `backend/server.js`

### Issue 4: MongoDB Connection Failed
**Fix:**
1. Check `.env` file in backend folder
2. Verify MongoDB connection string
3. Make sure MongoDB service is running

## Emergency Reset

If all else fails, try this complete reset:

```bash
# 1. Stop all running servers (Ctrl+C)

# 2. Clean install frontend
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install

# 3. Clean install backend  
cd ../backend
rmdir /s /q node_modules
del package-lock.json
npm install

# 4. Start backend
npm start

# 5. In new terminal, start frontend
cd ../frontend
npm run dev
```

## Still Having Issues?

### Check These Files:

1. **frontend/src/App.jsx** - Make sure all imports are correct
2. **frontend/src/main.jsx** - Should import App correctly
3. **frontend/index.html** - Should have `<div id="root"></div>`

### Get Error Details:

Please provide:
1. Browser console errors (copy the full error message)
2. Terminal output from `npm run dev`
3. Any error messages from the backend

## Quick Test

Create a simple test file to verify React is working:

**frontend/src/Test.jsx:**
```jsx
function Test() {
  return <h1>React is working!</h1>;
}

export default Test;
```

**Temporarily modify frontend/src/App.jsx:**
```jsx
import Test from './Test';

function App() {
  return <Test />;
}

export default App;
```

If you see "React is working!", then React is fine and the issue is with the new code.

## Next Steps Based on Error Type

### If you see "Cannot find module 'react-icons'"
```bash
cd frontend
npm install react-icons
```

### If you see context errors
The ThemeContext might not be wrapping properly. Check App.jsx provider order.

### If you see routing errors
Check that react-router-dom is installed:
```bash
cd frontend
npm install react-router-dom
```

## Manual Testing

Visit these URLs after starting the server:
- http://localhost:3000 - Should show login page
- http://localhost:5000/api/health - Should show `{"success":true,"message":"Server is running"}`

---

**Need immediate help?** 
Share the error message from the browser console!

