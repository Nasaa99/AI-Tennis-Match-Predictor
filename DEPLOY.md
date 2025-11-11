# 🚀 Deployment Guide - Quick Start

## Option 1: Railway (Easiest - Recommended) ⭐

Railway is the easiest platform for beginners. It auto-detects Python and deploys automatically.

### Steps:

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub (click "Login with GitHub")
3. **Create New Project** → "Deploy from GitHub repo"
4. **Select your repository**: `Nasaa99/ai-tennis-match-predictor`
5. **Railway auto-detects** Python and Flask
6. **Set Environment Variables** (click on your service → Variables):
   ```
   FLASK_ENV=production
   FLASK_DEBUG=False
   PORT=5000
   ```
7. **Deploy!** Railway will automatically:
   - Install dependencies from `requirements.txt`
   - Run `python app.py`
   - Give you a public URL

**That's it!** Your app will be live in ~5 minutes.

---

## Option 2: Render (Also Easy)

Similar to Railway, very beginner-friendly.

### Steps:

1. **Go to Render**: https://render.com
2. **Sign up** with GitHub
3. **New** → "Web Service"
4. **Connect GitHub** → Select your repo
5. **Configure**:
   - **Name**: `ai-tennis-predictor` (or your choice)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
6. **Set Environment Variables**:
   ```
   FLASK_ENV=production
   FLASK_DEBUG=False
   PORT=5000
   ```
7. **Create Web Service**

**Done!** Your app will be live.

---

## Option 3: Heroku (More Setup Required)

Heroku requires a bit more configuration but is very popular.

### Steps:

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   heroku create ai-tennis-predictor
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set FLASK_DEBUG=False
   ```

5. **Add Gunicorn** (production server):
   - Add to `requirements.txt`: `gunicorn`
   - Update `Procfile` to: `web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app`

6. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## ⚠️ Important Notes

### Dataset File
- Your `Dataset/atp_matches_filtered.csv` file will be included in the deployment
- If it's very large (>100MB), consider:
  - Using Git LFS: `git lfs track "Dataset/*.csv"`
  - Or hosting it externally (S3, etc.)

### Frontend Deployment
The React frontend needs to be built and deployed separately:

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy options**:
   - **Vercel** (easiest for frontend): https://vercel.com
     - Import GitHub repo
     - Set root directory to `frontend`
     - Build command: `npm run build`
     - Output: `dist`
   - **Netlify**: Similar to Vercel
   - **Same platform**: Serve `frontend/dist` folder

3. **Update API URL**:
   - In production, update frontend to use your backend URL
   - Or use environment variable: `VITE_API_URL`

---

## 🎯 Recommended: Railway (Backend) + Vercel (Frontend)

**Backend (Railway)**:
- Deploy Flask API
- Get URL: `https://your-app.railway.app`

**Frontend (Vercel)**:
- Deploy React app
- Set environment variable: `VITE_API_URL=https://your-app.railway.app`
- Build and deploy

---

## ✅ Post-Deployment Checklist

- [ ] Test API endpoints work
- [ ] Test predictions work
- [ ] Check error handling
- [ ] Verify environment variables are set
- [ ] Test frontend connects to backend
- [ ] Monitor logs for errors

---

## 🆘 Troubleshooting

**"Application Error"**
- Check logs in your hosting platform
- Verify environment variables are set
- Check that dataset file exists

**"Module not found"**
- Ensure `requirements.txt` has all dependencies
- Check build logs

**"Port already in use"**
- Use `PORT` environment variable (Railway/Render set this automatically)

---

**Ready to deploy? Start with Railway - it's the easiest! 🚀**

