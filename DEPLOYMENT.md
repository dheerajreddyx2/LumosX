# 🚀 Deployment Guide for LMS Project

This guide will help you deploy your Learning Management System to production.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] Backend code tested locally
- [ ] Frontend code tested locally
- [ ] Environment variables documented
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free Tier is sufficient)

### Step 2: Configure Database Access
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Create a username and password
4. Set **Database User Privileges** to "Read and write to any database"
5. Click **Add User**

### Step 3: Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 4: Get Connection String
1. Go to **Database** (Clusters)
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `lms_db` or your preferred database name

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lms_db?retryWrites=true&w=majority
```

## 🔧 Backend Deployment

### Option 1: Deploy to Render

#### Step 1: Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub account

#### Step 2: Create New Web Service
1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Select the repository containing your LMS project

#### Step 3: Configure Service
- **Name:** `lms-backend`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main` or `master`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Step 4: Add Environment Variables
Click **Advanced** → **Add Environment Variable**

Add these variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lms_db
JWT_SECRET=your_super_secret_random_string_min_32_chars
NODE_ENV=production
PORT=10000
```

To generate a secure JWT_SECRET, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 5: Deploy
1. Click **Create Web Service**
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://lms-backend.onrender.com`)

### Option 2: Deploy to Railway

#### Step 1: Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub account

#### Step 2: Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Select your repository

#### Step 3: Configure Service
1. Click on the service
2. Go to **Settings**
3. Set **Root Directory** to `backend`
4. Set **Start Command** to `npm start`

#### Step 4: Add Environment Variables
Go to **Variables** tab and add:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

#### Step 5: Deploy
1. Railway will automatically deploy
2. Go to **Settings** → **Generate Domain** to get public URL

## 🎨 Frontend Deployment

### Option 1: Deploy to Vercel

#### Step 1: Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub account

#### Step 2: Import Project
1. Click **Add New** → **Project**
2. Import your GitHub repository

#### Step 3: Configure Project
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### Step 4: Add Environment Variables (if needed)
If you have environment variables for frontend:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

#### Step 5: Deploy
1. Click **Deploy**
2. Wait for deployment to complete
3. Get your deployment URL (e.g., `https://lms-project.vercel.app`)

### Option 2: Deploy to Netlify

#### Step 1: Create Netlify Account
1. Go to [Netlify](https://www.netlify.com)
2. Sign up with GitHub account

#### Step 2: Add New Site
1. Click **Add new site** → **Import an existing project**
2. Connect to GitHub and select your repository

#### Step 3: Configure Build Settings
- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist`

#### Step 4: Deploy
1. Click **Deploy site**
2. Wait for deployment to complete
3. Get your deployment URL

## 🔄 Update Frontend API URL

After deploying the backend, you need to update the frontend to use the production API URL.

### Option 1: Using Environment Variables (Recommended)

1. Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

2. Update `frontend/src/utils/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// ... rest of the code
```

### Option 2: Direct URL Update

Update `frontend/src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://your-backend-url.onrender.com/api'
});
```

And `frontend/src/context/AuthContext.jsx`:
```javascript
const { data } = await axios.get('https://your-backend-url.onrender.com/api/auth/me', config);
```

## 🔒 CORS Configuration

Make sure your backend allows requests from your frontend domain.

Update `backend/server.js`:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app',
    'https://your-frontend-url.netlify.app'
  ],
  credentials: true
}));
```

## ✅ Post-Deployment Testing

### Backend Testing
Test your backend API endpoints:
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Register test user
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"student"}'
```

### Frontend Testing
1. Open your deployed frontend URL
2. Test user registration
3. Test user login
4. Test creating courses (as teacher)
5. Test enrolling in courses (as student)
6. Test all major features

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem:** Frontend can't connect to backend
**Solution:** Update CORS configuration in backend to include frontend URL

#### 2. MongoDB Connection Failed
**Problem:** Backend can't connect to MongoDB
**Solution:** 
- Check MongoDB Atlas connection string
- Verify IP whitelist includes 0.0.0.0/0
- Check username/password in connection string

#### 3. 404 on Frontend Routes
**Problem:** Refreshing page gives 404
**Solution:** Configure redirects in `netlify.toml` or `vercel.json`

#### 4. Environment Variables Not Working
**Problem:** App can't read environment variables
**Solution:** 
- Restart the service after adding variables
- Check variable names (no typos)
- For Vite, variables must start with `VITE_`

#### 5. Build Fails
**Problem:** Deployment build fails
**Solution:**
- Check build logs for errors
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

## 📊 Monitoring

### Backend Monitoring
- Check logs in Render/Railway dashboard
- Monitor API response times
- Set up error tracking (e.g., Sentry)

### Frontend Monitoring
- Check Vercel/Netlify analytics
- Monitor Core Web Vitals
- Set up user analytics (e.g., Google Analytics)

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

1. **Enable Auto-Deploy:**
   - Every push to `main` branch triggers deployment
   - Already enabled by default in most cases

2. **Preview Deployments:**
   - Pull requests create preview deployments
   - Test changes before merging

## 📝 Deployment Checklist

- [ ] MongoDB Atlas configured and accessible
- [ ] Backend deployed to Render/Railway
- [ ] Backend environment variables set
- [ ] Backend health endpoint responding
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Frontend API URL updated to backend URL
- [ ] CORS configured correctly
- [ ] Test user registration works
- [ ] Test user login works
- [ ] Test all major features
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Analytics set up (optional)

## 🎉 Success!

Your LMS is now live and accessible to users worldwide!

**Backend URL:** https://your-backend-url.onrender.com
**Frontend URL:** https://your-frontend-url.vercel.app

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Railway Documentation](https://docs.railway.app)

## 🔐 Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Rotate secrets periodically**
4. **Enable two-factor authentication** on all platforms
5. **Keep dependencies updated** regularly
6. **Monitor for security vulnerabilities**
7. **Use HTTPS** everywhere (automatic on all platforms)

## 💰 Cost Considerations

All platforms offer free tiers:
- **MongoDB Atlas:** 512MB free
- **Render:** 750 hours/month free
- **Railway:** $5 credit/month
- **Vercel:** Unlimited for personal projects
- **Netlify:** 100GB bandwidth/month free

For production use, consider upgrading to paid plans for:
- Better performance
- Custom domains
- Higher limits
- Priority support

---

**Happy Deploying! 🚀**


