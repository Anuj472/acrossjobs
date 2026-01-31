# 🚀 Cloudflare Pages Deployment Guide for AcrossJob

## 📋 Prerequisites

1. GitHub account with this repository
2. Cloudflare account (free tier works)
3. Supabase project with database setup

---

## ⚡ Quick Deployment Steps

### Step 1: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **"Workers & Pages"** in the sidebar
3. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
4. Select **GitHub** and authorize Cloudflare
5. Choose repository: **`acrossjobs`**

---

### Step 2: Configure Build Settings

In the Cloudflare Pages setup:

**Framework preset:** `Vite`

**Build command:**
```bash
npm run build
```

**Build output directory:**
```
dist
```

**Root directory:** (leave blank or `/`)

**Node version:** `18` or higher

---

### Step 3: Set Environment Variables

⚠️ **CRITICAL:** Add these environment variables in Cloudflare:

1. In your Cloudflare Pages project, go to **Settings** → **Environment variables**
2. Add the following:

| Variable Name | Value | Example |
|---------------|-------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOiJIUzI1...` |
| `GEMINI_API_KEY` | Your Google Gemini API key (if using AI features) | `AIzaSy...` |

**Where to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

### Step 4: Deploy

1. Click **"Save and Deploy"**
2. Wait 2-5 minutes for build to complete
3. Your site will be live at: `https://acrossjobs.pages.dev`

---

## 🔧 Troubleshooting

### White Screen Issues

#### Problem 1: Environment Variables Not Set
**Symptoms:** White screen, console errors about Supabase

**Solution:**
1. Go to Cloudflare Pages → Your project → **Settings** → **Environment variables**
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Click **"Redeploy"** in Deployments tab

#### Problem 2: Build Failed
**Symptoms:** Deployment shows "Failed"

**Solution:**
1. Check build logs in Cloudflare dashboard
2. Ensure `package.json` dependencies are correct
3. Try rebuilding: **Deployments** → **Retry deployment**

#### Problem 3: 404 on Page Refresh
**Symptoms:** Works on homepage, but 404 on `/jobs` or other routes

**Solution:**
✅ Already fixed! The `public/_redirects` file handles this.
If still happening, check that `_redirects` file is in `public/` folder.

#### Problem 4: Assets Not Loading
**Symptoms:** Blank page, console shows 404 for CSS/JS files

**Solution:**
1. Verify build output directory is set to `dist`
2. Check that build completed successfully
3. Look for errors in browser console (F12)

---

## 📊 Expected Build Output

Successful build should show:
```
✓ building for production...
✓ 156 modules transformed.
dist/index.html                   3.45 kB │ gzip: 1.21 kB
dist/assets/index-a1b2c3d4.css   12.34 kB │ gzip: 3.45 kB
dist/assets/index-e5f6g7h8.js   234.56 kB │ gzip: 78.90 kB
✓ built in 15.23s
```

---

## 🌍 Custom Domain (Optional)

### Add Your Own Domain

1. In Cloudflare Pages project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `acrossjob.com`)
4. Follow DNS setup instructions
5. Wait for SSL certificate (5-10 minutes)

---

## 🔄 Automatic Deployments

✅ **Already configured!**

Every time you push to `main` branch:
1. Cloudflare automatically detects changes
2. Runs build process
3. Deploys new version
4. No manual action needed!

**Preview deployments:**
- Pull requests automatically get preview URLs
- Test before merging to main

---

## 📱 Testing Your Deployment

### Quick Checks:

1. **Homepage loads:** `https://your-site.pages.dev/`
2. **Browse jobs works:** Click "Browse Jobs" button
3. **Categories work:** Click any category
4. **Search works:** Try searching for a job
5. **Job details:** Click on a job listing
6. **Routing works:** Refresh on `/jobs` page (should not 404)

### Browser Console Check:

1. Open DevTools (F12)
2. Go to Console tab
3. Should see:
   ```
   🎬 AcrossJob: Initial page: landing
   ⚡ Fast loading first 30 jobs...
   ✅ Loaded 30 jobs
   ```

4. Should NOT see:
   ```
   ❌ Supabase URL is required
   ❌ Failed to fetch
   ```

---

## 🎯 Performance Optimization

### Current Setup:

✅ **CDN caching** - Cloudflare global CDN  
✅ **Asset optimization** - Vite minification  
✅ **Lazy loading** - 30 jobs initially, rest in background  
✅ **Compression** - Gzip/Brotli enabled  
✅ **HTTP/2** - Automatic  

### Expected Performance:

- **First Load:** 200-500ms
- **Time to Interactive:** <1 second
- **Lighthouse Score:** 90+

---

## 🔒 Security

### Environment Variables:

⚠️ **NEVER commit these to Git:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

✅ **Safe to commit:**
- `_redirects`
- `_headers`
- Build configuration files

### Supabase RLS (Row Level Security):

Make sure your Supabase database has RLS policies enabled:

```sql
-- Allow public read access to jobs
CREATE POLICY "Public jobs are viewable by everyone"
ON jobs FOR SELECT
USING (is_active = true);

-- Allow public read access to companies
CREATE POLICY "Public companies are viewable by everyone"
ON companies FOR SELECT
USING (true);
```

---

## 📞 Support

If you encounter issues:

1. Check [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
2. Check build logs in Cloudflare dashboard
3. Check browser console for errors
4. Verify environment variables are set

---

## 🎉 Success Checklist

- [ ] Repository connected to Cloudflare Pages
- [ ] Build command set to `npm run build`
- [ ] Output directory set to `dist`
- [ ] Environment variables added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] First deployment successful
- [ ] Homepage loads without errors
- [ ] Jobs page displays jobs
- [ ] Search functionality works
- [ ] Page refresh doesn't cause 404
- [ ] Console shows no errors

---

## 🚀 You're Live!

Your site is now deployed at: `https://acrossjobs.pages.dev`

Share it with the world! 🌍
