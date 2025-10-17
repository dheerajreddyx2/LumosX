# 📝 Command Reference - LMS Project

Quick reference for all commonly used commands.

---

## 🚀 Development Commands

### Initial Setup

```bash
# Clone repository
git clone <your-repo-url>
cd Projectp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Or install both at once (from root)
npm run install-all
```

### Running the Application

```bash
# Start backend (Terminal 1)
cd backend
npm run dev
# Server runs on http://localhost:5000

# Start frontend (Terminal 2)
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build
# Creates dist/ folder

# Preview production build
npm run preview

# Start backend in production mode
cd backend
npm start
```

---

## 🗄️ MongoDB Commands

### Local MongoDB

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Check MongoDB status
brew services list

# Start MongoDB (Linux)
sudo systemctl start mongodb
sudo systemctl status mongodb

# Start MongoDB (Windows - as service)
net start MongoDB
```

### MongoDB Shell

```bash
# Open MongoDB shell
mongosh

# Show databases
show dbs

# Use database
use lms_db

# Show collections
show collections

# View users
db.users.find()

# View courses
db.courses.find()

# Clear collection (careful!)
db.users.deleteMany({})
```

---

## 📦 Package Management

### Installing New Packages

```bash
# Backend
cd backend
npm install package-name
npm install --save-dev package-name  # Dev dependency

# Frontend
cd frontend
npm install package-name
```

### Updating Packages

```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### Removing Packages

```bash
npm uninstall package-name
```

---

## 🔧 Git Commands

### Basic Git Operations

```bash
# Initialize git (if not done)
git init

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### First Time GitHub Setup

```bash
# Create repository on GitHub first, then:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### Branching

```bash
# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main

# List branches
git branch

# Delete branch
git branch -d feature-name
```

---

## 🐛 Troubleshooting Commands

### Clear Node Modules & Reinstall

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Check Node/npm Versions

```bash
node --version
npm --version
```

### Kill Process on Port

```bash
# Find process on port 5000
lsof -i :5000

# Kill process (macOS/Linux)
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Clear npm Cache

```bash
npm cache clean --force
```

---

## 🧪 Testing Commands

### Test API with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## 🚀 Deployment Commands

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

### Netlify (Frontend)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Environment Variables

```bash
# Vercel
vercel env add

# Netlify
netlify env:set VARIABLE_NAME value
```

---

## 🔐 Security Commands

### Generate JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -base64 32
```

### Generate Random Password

```bash
# macOS/Linux
openssl rand -base64 12
```

---

## 📊 Monitoring Commands

### Check Application Logs

```bash
# Backend logs (if using PM2)
pm2 logs

# View all processes
pm2 list

# Stop process
pm2 stop app-name

# Restart process
pm2 restart app-name
```

### Check Disk Space

```bash
# macOS/Linux
df -h

# Windows
wmic logicaldisk get size,freespace,caption
```

---

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Start development servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# 4. Make changes and test

# 5. Commit changes
git add .
git commit -m "Description of changes"
git push origin main
```

---

## 📦 Build & Production

### Production Deployment Workflow

```bash
# 1. Test locally
npm run dev

# 2. Build frontend
cd frontend
npm run build

# 3. Test production build locally
npm run preview

# 4. Commit changes
git add .
git commit -m "Production build"
git push origin main

# 5. Deploy (automatic if connected to Vercel/Netlify)
# Or manually:
vercel --prod
netlify deploy --prod
```

---

## 🎯 Useful Shortcuts

### VS Code Terminal

```bash
# Open new terminal
Ctrl + Shift + `

# Split terminal
Ctrl + Shift + 5

# Switch between terminals
Ctrl + Tab
```

### Process Management

```bash
# Stop current process
Ctrl + C

# Run in background (Linux/Mac)
npm run dev &

# Bring to foreground
fg
```

---

## 📝 Environment Setup

### Create .env Files

```bash
# Backend
cd backend
touch .env
# Then edit with your values

# Or copy from example
cp .env.example .env
```

### Edit .env

```bash
# macOS/Linux
nano backend/.env
# or
vim backend/.env

# Windows
notepad backend\.env
```

---

## 🔍 Debugging Commands

### Check Environment Variables

```bash
# Show all env vars
printenv

# Show specific var
echo $MONGODB_URI

# Windows
echo %MONGODB_URI%
```

### Test MongoDB Connection

```bash
# Try connecting
mongosh "mongodb://localhost:27017/lms_db"

# Or for Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/lms_db"
```

---

## 💻 Platform-Specific Commands

### macOS

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community
```

### Windows

```bash
# Install Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Install MongoDB
choco install mongodb
```

### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt install -y mongodb
```

---

## 🎓 Learning Resources Commands

### View Documentation

```bash
# Open README in default viewer
open README.md  # macOS
start README.md  # Windows
xdg-open README.md  # Linux

# Read in terminal
cat README.md
less README.md
```

---

## 🚨 Emergency Commands

### If Everything Breaks

```bash
# 1. Clear everything
rm -rf node_modules package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall
npm install

# 4. Restart MongoDB
# (see MongoDB commands above)

# 5. Delete and recreate .env
rm .env
cp .env.example .env
# Edit .env with correct values

# 6. Try again
npm run dev
```

---

## 📚 Quick Reference Links

### NPM
```bash
# View package info
npm info package-name

# Search packages
npm search package-name

# View outdated
npm outdated
```

### Git
```bash
# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all changes
git reset --hard HEAD
```

---

**Quick Tip:** Bookmark this file for easy reference during development!

**Most Used Commands:**
1. `npm run dev` - Start development
2. `git add . && git commit -m "message" && git push` - Quick commit
3. `npm install` - Install dependencies
4. `rm -rf node_modules && npm install` - Fresh install

Happy coding! 🚀

