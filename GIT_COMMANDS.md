# Quick Reference: Git Commands for Deployment

## Initial Setup

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Tennis Match Predictor"
```

## Connect to GitHub

```bash
# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Future Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Deploy to Heroku

```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

## Important Notes

- **Never commit**: `.venv/`, `node_modules/`, `.env` files
- **Dataset**: If CSV is large (>100MB), consider Git LFS or external storage
- **Environment Variables**: Set in hosting platform, not in code

