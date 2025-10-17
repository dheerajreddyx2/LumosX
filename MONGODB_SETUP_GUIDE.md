# MongoDB Atlas Setup Guide - Quick & Easy

## Why MongoDB Atlas?
- ✅ **Free forever** (512 MB storage)
- ✅ **No installation** required
- ✅ **Cloud-based** - works from anywhere
- ✅ **Takes 2-3 minutes** to setup

## Step-by-Step Setup

### 1. Create Account
1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with Google/GitHub or email (FREE - no credit card needed)

### 2. Create a Free Cluster
1. Choose **FREE M0 Cluster** (should be pre-selected)
2. Select a cloud provider (AWS recommended)
3. Choose region closest to you
4. Click **"Create Deployment"** or **"Create Cluster"**
5. Wait 1-3 minutes for cluster to be created

### 3. Create Database User
1. You'll see a popup to create a database user
2. Set **Username**: `lmsuser` (or any name you want)
3. Set **Password**: `lmspassword123` (or any secure password)
4. **IMPORTANT**: Save these credentials!
5. Click **"Create Database User"**

### 4. Set Network Access
1. In the popup or left sidebar, go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add your IP: `0.0.0.0/0`)
4. Click **"Confirm"**

### 5. Get Connection String
1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add database name: `/lms-database` before the `?`

### 6. Update Your .env File

Your final connection string should look like:
```
MONGODB_URI=mongodb+srv://lmsuser:lmspassword123@cluster0.xxxxx.mongodb.net/lms-database?retryWrites=true&w=majority
```

## Quick Alternative: Use MongoDB Locally

If you prefer local MongoDB:
```bash
# Install MongoDB Community Server
winget install MongoDB.Server

# Start MongoDB service
net start MongoDB

# Use this in .env:
MONGODB_URI=mongodb://localhost:27017/lms-database
```

## After Setup

1. Update the `MONGODB_URI` in `backend/.env` file
2. Restart your backend server:
   ```bash
   cd backend
   npm start
   ```
3. Test the API at: `http://localhost:5000/api/health`

## Troubleshooting

- **Connection timeout?** Check Network Access allows your IP
- **Authentication failed?** Verify username and password in connection string
- **DNS error?** Make sure the cluster URL is correct

---

Need help? The free tier includes:
- 512 MB storage
- Shared RAM
- Unlimited connections
- Perfect for development!

