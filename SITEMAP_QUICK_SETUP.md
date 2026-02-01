# 🚀 Quick Setup: Automatic Sitemap Generation

## ✅ What Was Done

1. ✅ Added `scripts/generateSitemap.ts` - Dynamic sitemap generator
2. ✅ Added `public/robots.txt` - Points Google to your sitemap
3. ✅ Updated `package.json` - Added `generate:sitemap` script + tsx dependency
4. ✅ Updated build command - Sitemap generates automatically before each build

## 🔧 Required: Set Environment Variables in Cloudflare

**IMPORTANT**: You need to add your Supabase credentials to Cloudflare Pages.

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **acrossjob** → **Settings** → **Environment Variables**
3. Add these two variables (for **Production**):

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

4. **Save** and **Redeploy**

### Option B: Via Wrangler CLI

```bash
wrangler pages secret put VITE_SUPABASE_URL --project-name=acrossjob
wrangler pages secret put VITE_SUPABASE_ANON_KEY --project-name=acrossjob
```

## 🧪 Test Locally

```bash
# Install dependencies
npm install

# Generate sitemap (make sure .env has your Supabase credentials)
npm run generate:sitemap

# Check the output
cat public/sitemap.xml | grep -c "<loc>"
# Should show ~26,672 instead of 22
```

## 📊 Expected Output

When the sitemap generator runs, you'll see:

```
🚀 SITEMAP GENERATOR FOR ACROSSJOB.COM
============================================================
📥 Fetching active jobs from Supabase...
   ✅ Found 117 active companies
   ✅ Found 26,543 active jobs

🔨 Generating sitemap XML...
   ✅ Generated 26,672 URLs
   ✅ Sitemap written to: public/sitemap.xml

============================================================
📊 SITEMAP SUMMARY
============================================================
   Homepage:        1 URL
   Categories:      7 URLs
   Companies:       117 URLs
   Jobs:            26,543 URLs  ← Your job listings!
   Static pages:    4 URLs
   ────────────────────────────
   TOTAL:           26,672 URLs
============================================================
```

## ✅ Verify It Works

After the next deployment:

1. Visit: https://acrossjob.com/sitemap.xml
2. You should see **thousands** of job URLs like:
   ```xml
   <url>
     <loc>https://acrossjob.com/job/airbnb-software-engineer-abc123</loc>
     <lastmod>2026-02-01T14:30:00Z</lastmod>
     <changefreq>weekly</changefreq>
     <priority>0.7</priority>
   </url>
   ```

3. Use browser "Find" (Ctrl+F) and search for "<loc>" - you should see 26,672 results

## 🐛 Troubleshooting

### Problem: Build fails with "Missing Supabase credentials"

**Solution**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Cloudflare environment variables (see above)

### Problem: Sitemap still only shows 22 URLs

**Possible causes:**
1. Environment variables not set in Cloudflare
2. No jobs in database yet (run your job harvest script first)
3. Build script not running (check Cloudflare build logs)

**Debug:**
```bash
# Check Cloudflare build logs
wrangler pages deployment list --project-name=acrossjob
```

### Problem: "tsx: command not found" during build

**Solution**: The updated `package.json` includes `tsx` in devDependencies. Make sure Cloudflare runs:
```bash
npm install
```
before the build.

## 📈 What Happens on Each Deployment

1. Cloudflare detects commit
2. Runs: `npm install`
3. Runs: `npm run build` which triggers:
   - `npm run generate:sitemap` (fetches jobs from Supabase)
   - `vite build` (builds your app)
4. Sitemap is included in `dist/` folder
5. Deployed to https://acrossjob.com/sitemap.xml

## 🎯 Next Steps

1. ✅ Add environment variables to Cloudflare (see above)
2. ✅ Push any commit to trigger a new deployment
3. ✅ Wait 2-3 minutes for build to complete
4. ✅ Visit https://acrossjob.com/sitemap.xml
5. ✅ Submit to [Google Search Console](https://search.google.com/search-console)

## 🔄 Automatic Updates

The sitemap will automatically regenerate with fresh data from Supabase:
- ✅ On every deployment (git push)
- ✅ When you run your job harvest script (which updates the database)
- ✅ Manual trigger: `npm run generate:sitemap`

---

**🎉 Your 26,500+ job pages will now be discoverable by Google!**

For more details, see `SEO_SITEMAP_SETUP.md`
