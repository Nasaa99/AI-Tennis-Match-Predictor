# Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [x] Debug mode disabled (uses `FLASK_DEBUG` env var, defaults to False)
- [x] Port configurable via `PORT` environment variable
- [x] CORS enabled for cross-origin requests
- [ ] Set `FLASK_ENV=production` in production
- [ ] Set `FLASK_DEBUG=False` in production

### 2. Dependencies
- [x] `requirements.txt` includes all dependencies
- [x] Python version specified (3.7+)
- [x] Node.js dependencies in `frontend/package.json`

### 3. Security
- [x] No hardcoded API keys or secrets
- [x] CORS configured properly
- [x] Debug mode disabled by default
- [ ] Consider adding rate limiting for API endpoints
- [ ] Consider adding authentication if needed

### 4. File Structure
- [x] Dataset file exists: `Dataset/atp_matches_filtered.csv`
- [x] `.gitignore` file created
- [ ] Ensure dataset is included in deployment (or use external storage)

### 5. Frontend Configuration
- [ ] Update `vite.config.js` proxy target for production
- [ ] Build React frontend: `npm run build` in frontend directory
- [ ] Serve built files or configure reverse proxy

### 6. Error Handling
- [x] Try-catch blocks in place
- [x] Error messages are user-friendly
- [x] Fallback values for missing data

## 🚀 Deployment Options

### Option 1: Heroku
1. Create `Procfile`:
   ```
   web: python app.py
   ```
2. Create `runtime.txt`:
   ```
   python-3.11.0
   ```
3. Set environment variables:
   ```
   FLASK_ENV=production
   FLASK_DEBUG=False
   PORT=5000
   ```
4. Deploy:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku create your-app-name
   git push heroku main
   ```

### Option 2: Railway / Render
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python app.py`
4. Set environment variables (same as Heroku)

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)
1. Install Python 3.7+, Node.js
2. Clone repository
3. Install dependencies: `pip install -r requirements.txt`
4. Use gunicorn for production:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
5. Use nginx as reverse proxy
6. Set up SSL with Let's Encrypt

## 📝 Important Notes

### For Production:
1. **Disable Debug Mode**: Already configured via `FLASK_DEBUG` env var
2. **Use Production WSGI Server**: Use gunicorn or uwsgi instead of Flask dev server
3. **Frontend Build**: Build React app and serve static files
4. **Environment Variables**: Set all sensitive config via env vars
5. **Database**: If adding database later, use production-ready DB (PostgreSQL, etc.)

### Frontend Deployment:
- Build React app: `cd frontend && npm run build`
- Serve `frontend/dist` folder via nginx or static hosting
- Update API URLs to point to production backend

### Backend API URLs:
- Development: `http://localhost:5000`
- Production: Update in frontend build or use environment variables

## ⚠️ Known Issues to Address

1. **Vite Proxy**: Currently hardcoded to `localhost:5000` - needs to be configurable
2. **Dataset Path**: Hardcoded path `Dataset/atp_matches_filtered.csv` - ensure it exists in deployment
3. **Error Messages**: Some error messages reference localhost - consider making them generic

## 🔧 Quick Fixes Needed

1. Update `vite.config.js` to use environment variable for API URL
2. Consider using relative paths or environment variables for dataset
3. Add production WSGI server configuration

