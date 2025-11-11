# Vercel Configuration

## Build Settings

**Root Directory:** `frontend`
**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install --legacy-peer-deps` (if needed)

## Environment Variables

- `VITE_API_URL` = `https://web-production-a621b.up.railway.app`

## If Build Fails

### Option 1: Update Build Command
Try: `npm install --legacy-peer-deps && npm run build`

### Option 2: Add .npmrc file
Create `frontend/.npmrc`:
```
legacy-peer-deps=true
```

### Option 3: Ignore Scripts (if patch-package error persists)
Add to Vercel environment variables:
- `NPM_CONFIG_IGNORE_SCRIPTS=true`

---

**The package.json has been updated to handle postinstall scripts.**

