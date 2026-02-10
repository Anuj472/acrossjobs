# Quick Implementation Guide

This guide provides step-by-step instructions to integrate the SEO fixes into your existing pages.

## Step 1: Update All Page Components

### 1. Home.tsx

```typescript
import { SEO } from '../components/SEO';

function Home() {
  return (
    <>
      <SEO 
        title="AcrossJob - Smart Job Search with Network-First Approach"
        description="Find your next opportunity with AcrossJob. Browse thousands of jobs across technology, healthcare, finance, and more."
        canonicalUrl="https://acrossjob.com/"
      />
      {/* Existing content */}
    </>
  );
}
```

### 2. JobDetailPage.tsx

```typescript
import { SEO } from '../components/SEO';
import { getJobStatus } from '../lib/jobStatus';

function JobDetailPage() {
  // ... existing code ...
  
  const jobStatus = getJobStatus(job.posted_date);
  
  return (
    <>
      <SEO 
        title={`${job.title} at ${job.company_name} - AcrossJob`}
        description={job.description?.substring(0, 160) || `Apply for ${job.title} position at ${job.company_name}`}
        noindex={jobStatus.isExpired}
      />
      
      {jobStatus.isExpired && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                This Position Has Been Filled
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This job posting is no longer accepting applications. Browse similar opportunities below or search for new positions.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Existing job details */}
      
      {/* Update Apply Button */}
      {!jobStatus.isExpired && (
        <a href={job.apply_url} /* ... existing props ... */>
          Apply Now
        </a>
      )}
    </>
  );
}
```

### 3. CategoryPage.tsx

```typescript
import { SEO } from '../components/SEO';
import { useParams } from 'react-router-dom';

function CategoryPage() {
  const { category } = useParams();
  
  const categoryNames: Record<string, string> = {
    'technology': 'Technology',
    'marketing': 'Marketing',
    'sales': 'Sales',
    // ... add all categories
  };
  
  const displayName = categoryNames[category || ''] || 'Jobs';
  
  return (
    <>
      <SEO 
        title={`${displayName} Jobs - AcrossJob`}
        description={`Browse ${displayName.toLowerCase()} job opportunities. Find your next career move in ${displayName.toLowerCase()}.`}
        canonicalUrl={`https://acrossjob.com/jobs/${category}`}
      />
      {/* Existing content */}
    </>
  );
}
```

### 4. StaticPages.tsx

Update each static page:

```typescript
import { SEO } from '../components/SEO';

function AboutUs() {
  return (
    <>
      <SEO 
        title="About Us - AcrossJob"
        description="Learn about AcrossJob's mission to connect job seekers with opportunities through a network-first approach."
        canonicalUrl="https://acrossjob.com/about-us"
      />
      {/* Existing content */}
    </>
  );
}

function Contact() {
  return (
    <>
      <SEO 
        title="Contact Us - AcrossJob"
        description="Get in touch with AcrossJob. We're here to help with your job search questions."
        canonicalUrl="https://acrossjob.com/contact"
      />
      {/* Existing content */}
    </>
  );
}

function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy - AcrossJob"
        description="Read AcrossJob's privacy policy to understand how we protect and use your data."
        canonicalUrl="https://acrossjob.com/privacy"
      />
      {/* Existing content */}
    </>
  );
}

function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service - AcrossJob"
        description="Review AcrossJob's terms of service and user agreement."
        canonicalUrl="https://acrossjob.com/terms"
      />
      {/* Existing content */}
    </>
  );
}
```

## Step 2: If You Have Company Pages

If you have a `CompanyPage.tsx` component:

```typescript
import { SEO } from '../components/SEO';
import { useParams } from 'react-router-dom';

function CompanyPage() {
  const { companySlug } = useParams();
  const company = /* fetch company data */;
  
  return (
    <>
      <SEO 
        title={`${company.name} Jobs - AcrossJob`}
        description={`Browse all open positions at ${company.name}. Find your next opportunity with ${company.name}.`}
        canonicalUrl={`https://acrossjob.com/company/${companySlug}`}
      />
      {/* Existing content */}
    </>
  );
}
```

## Step 3: Update Sitemap Generation

If you have a script that generates the sitemap (`scripts/generate-sitemap.ts` or similar):

```typescript
import { getJobStatus } from '../lib/jobStatus';

async function generateSitemap() {
  const jobs = await fetchAllJobs();
  
  // Filter out expired jobs
  const activeJobs = jobs.filter(job => {
    const status = getJobStatus(job.posted_date);
    return !status.isExpired;
  });
  
  // Generate sitemap with only active jobs
  const jobUrls = activeJobs.map(job => `
    <url>
      <loc>https://acrossjob.com/job/${job.slug}</loc>
      <lastmod>${job.updated_at}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');
  
  // ... rest of sitemap generation
}
```

## Step 4: Deploy and Test

### Local Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test in browser
# 1. Visit http://localhost:5173
# 2. View page source (Ctrl+U or Cmd+U)
# 3. Look for <link rel="canonical" href="..." />
# 4. Check that canonical URLs are correct
```

### Test Redirects with Wrangler

```bash
# Build the project
npm run build

# Preview with Cloudflare Pages locally
npm run preview

# Or use wrangler
npx wrangler pages dev dist

# Test redirects
curl -I http://localhost:8788
# Should show redirect to https://
```

### Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Fix: Implement Google Search Console fixes"
git push origin fix/google-search-console-issues

# Create Pull Request
# Review changes
# Merge to main

# Cloudflare Pages will auto-deploy
```

### Post-Deployment Testing

```bash
# Test HTTP to HTTPS redirect
curl -I http://acrossjob.com
# Should show 301 redirect to https://acrossjob.com

curl -I http://www.acrossjob.com
# Should show 301 redirect to https://acrossjob.com

curl -I https://www.acrossjob.com
# Should show 301 redirect to https://acrossjob.com
```

1. Visit your live site
2. View page source on different pages
3. Verify canonical tags are present
4. Check expired job pages show proper messaging
5. Verify apply buttons are hidden on expired jobs

## Step 5: Google Search Console Validation

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (acrossjob.com)
3. Navigate to "Pages" (left sidebar)
4. Find each issue:
   - Page with redirect
   - Soft 404
   - Duplicate without user-selected canonical
5. Click "Validate Fix" for each issue
6. Monitor validation progress (check back in 2-3 days)
7. You'll receive email notifications when validation completes

## Common Issues & Solutions

### Issue: Canonical tags not appearing
**Solution**: Make sure you're viewing page source (Ctrl+U), not inspecting elements. The canonical tags are dynamically added to the DOM.

### Issue: Redirects not working
**Solution**: Clear Cloudflare cache:
1. Log into Cloudflare dashboard
2. Go to your domain
3. Click "Caching" → "Purge Everything"

### Issue: Validation fails again
**Solution**: 
1. Wait 24 hours before re-validating
2. Use URL Inspection tool to check specific URLs
3. Verify changes are actually deployed
4. Check for JavaScript errors in console

## Need Help?

If you run into issues:
1. Check the full documentation in `GOOGLE_SEARCH_CONSOLE_FIXES.md`
2. Review the troubleshooting section
3. Check Cloudflare Pages deployment logs
4. Test locally first before deploying
