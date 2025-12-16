# SmartDine - Setup Guide for New Developers

This guide will help you set up and run the SmartDine project on your machine.

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** (free) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Groq API Key** (free) - [Get it here](https://console.groq.com/)

## 🔑 Getting Your API Keys

### 1. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password

### 2. Groq API (AI Features)
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Create a new API key
4. Copy the key (starts with `gsk_`)

### 3. OpenWeather API (Optional - for weather features)
1. Go to [OpenWeather](https://openweathermap.org/api)
2. Sign up for free
3. Get your API key

## 🚀 Setup Instructions

### Step 1: Clone or Extract the Project
```bash
# If from GitHub
git clone <repository-url>
cd smartdine

# If from ZIP file
# Extract the ZIP and navigate to the folder
cd smartdine
```

### Step 2: Set Up Environment Variables

#### Backend Environment File
Create a file named `.env` inside the `server` folder:

```bash
# Navigate to server folder
cd server

# Create .env file (copy from .env.example)
```

**File: `server/.env`**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
GROQ_API_KEY=your_groq_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
JWT_SECRET=your_random_secret_key_here
NODE_ENV=development
```

**⚠️ IMPORTANT:** 
- Replace all `your_*_here` values with your actual keys
- For `JWT_SECRET`, use a random string (you can generate one online or use any long random string)
- **NEVER** commit the `.env` file to GitHub!

#### Root Environment File (for Docker)
Create a file named `.env` in the root `smartdine` folder:

```bash
cd ..  # Go back to root
```

**File: `.env` (root)**
```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/smartdine
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_random_secret_key_here
NODE_ENV=development
```

### Step 3: Install Dependencies

#### Install Backend Dependencies
```bash
cd server
npm install
```

#### Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Seed the Database
```bash
cd ../server
npm run seed
```

You should see a success message showing restaurants were added to the database.

### Step 5: Run the Project

**Option A: Run Locally (Recommended for Development)**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
You should see: `🚀 Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173`

**Option B: Run with Docker**
```bash
# From root directory
docker-compose up
```

### Step 6: Access the Application
Open your browser and go to:
```
http://localhost:5173
```

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB Atlas cluster is running
- Whitelist your IP address in MongoDB Atlas (Network Access → Add IP → Allow Access from Anywhere: `0.0.0.0/0`)

### Issue: "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
```bash
# Kill process on port 5000 (backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env to 5001
```

### Issue: Groq API errors
- Verify your API key is correct
- Check if you've exceeded free tier limits
- Ensure there are no extra spaces in the `.env` file

## 📦 Pushing to GitHub

### First Time Setup
```bash
# Initialize git (if not already done)
git init

# Add all files (gitignore will exclude sensitive files)
git add .

# Commit
git commit -m "Initial commit"

# Create repository on GitHub and then:
git remote add origin https://github.com/yourusername/smartdine.git
git branch -M main
git push -u origin main
```

### Important Git Commands
```bash
# Check what will be committed
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull
```

**⚠️ SECURITY REMINDER:**
- The `.gitignore` file is already configured to exclude `.env` files
- **NEVER** commit API keys or passwords
- Always use `.env.example` as a template for others

## 🛠️ Making Code Changes

1. Make your changes to the code
2. Test locally to ensure everything works
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push
   ```

## 📁 Project Structure

```
smartdine/
├── server/              # Backend (Node.js/Express)
│   ├── controllers/     # Route handlers
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── services/        # AI & external services
│   ├── .env            # YOUR API KEYS (don't commit!)
│   └── server.js       # Entry point
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API calls
│   └── vite.config.js
├── .env                 # Docker environment (don't commit!)
├── .gitignore          # Excludes sensitive files
└── docker-compose.yml   # Docker configuration
```

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all `.env` variables are set correctly
3. Ensure all dependencies are installed
4. Try restarting the server/client

## 📝 Development Workflow

1. Pull latest changes: `git pull`
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Added feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request on GitHub

---

**Happy Coding! 🚀**
