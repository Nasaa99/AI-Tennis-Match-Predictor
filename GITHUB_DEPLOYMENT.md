# GitHub Deployment Guide

## 📦 Preparing for GitHub

### Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Tennis Match Predictor"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `ai-tennis-match-predictor` (or your preferred name)
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

### Step 3: Connect and Push

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-tennis-match-predictor.git

# Rename main branch if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🚀 Deploying from GitHub

### Option 1: Heroku (Recommended for Beginners)

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set FLASK_DEBUG=False
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Open App**:
   ```bash
   heroku open
   ```

**Note**: For Heroku, you may need to:
- Add `gunicorn` to `requirements.txt`
- Update `Procfile` to: `web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app`

### Option 2: Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Python
5. Set environment variables:
   - `FLASK_ENV=production`
   - `FLASK_DEBUG=False`
6. Deploy automatically on every push

### Option 3: Render

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Environment**: Python 3
5. Set environment variables
6. Deploy

### Option 4: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel)**:
1. Go to [Vercel](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`

**Backend (Railway/Render)**:
- Deploy Flask backend separately
- Update frontend API URL to backend URL

## 📋 Pre-Deployment Checklist

- [x] `.gitignore` configured
- [x] `README.md` updated
- [x] `requirements.txt` complete
- [x] `Procfile` created (for Heroku)
- [x] `runtime.txt` created (for Heroku)
- [x] Debug mode disabled (via env var)
- [x] Environment variables documented
- [ ] Dataset file included (or use external storage)
- [ ] Test locally before deploying

## 🔐 Environment Variables

Set these in your hosting platform:

```bash
# Required
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000

# Optional (for frontend)
VITE_API_URL=https://your-backend-url.com
```

## 📝 Important Notes

1. **Dataset File**: 
   - If `atp_matches_filtered.csv` is large (>100MB), consider:
     - Using Git LFS: `git lfs track "Dataset/*.csv"`
     - Or hosting dataset externally (S3, etc.)

2. **Frontend Build**:
   - For production, build React app:
     ```bash
     cd frontend
     npm run build
     ```
   - Serve `frontend/dist` folder

3. **Production Server**:
   - Use gunicorn instead of Flask dev server:
     ```bash
     pip install gunicorn
     # Update Procfile: web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app
     ```

4. **CORS**:
   - Already configured in `app.py`
   - Update allowed origins if needed

## 🎯 Quick Deploy Commands

### Heroku
```bash
heroku create your-app-name
heroku config:set FLASK_ENV=production FLASK_DEBUG=False
git push heroku main
```

### Railway/Render
- Just connect GitHub repo and configure environment variables
- Auto-deploys on push

## ✅ Post-Deployment

1. Test all endpoints
2. Verify predictions work
3. Check error handling
4. Monitor logs for issues
5. Set up monitoring (optional)

---

**Ready to deploy? Follow the steps above and your app will be live! 🚀**

