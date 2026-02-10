# Google Search Console Issues - Fixes Applied

This document outlines the fixes applied to resolve the indexing issues identified by Google Search Console on Feb 9-10, 2026.

## Issues Identified

1. **Page with Redirect** (2 pages) - Validation Failed
2. **Soft 404** (23 job pages)
3. **Duplicate without user-selected canonical** (11 company/category pages)

---

## 1. Page with Redirect - FIXED ✅

### Problem
HTTP versions of the site (`http://acrossjob.com/` and `http://www.acrossjob.com/`) were not properly redirecting to HTTPS, causing validation failures.

### Solution
Updated `/public/_redirects` file with proper redirect rules:

```
# HTTP to HTTPS redirects
http://acrossjob.com/* https://acrossjob.com/:splat 301!
http://www.acrossjob.com/* https://acrossjob.com/:splat 301!
https://www.acrossjob.com/* https://acrossjob.com/:splat 301!
```

### Implementation Details
- All HTTP traffic now redirects to HTTPS with 301 (permanent redirect)
- Both www and non-www versions redirect to the canonical `https://acrossjob.com`
- The `!` ensures these are force redirects that take priority
- SPA routing still works via the `/* /index.html 200` rule

### Testing
1. Visit `http://acrossjob.com` - should redirect to `https://acrossjob.com`
2. Visit `http://www.acrossjob.com` - should redirect to `https://acrossjob.com`
3. Visit `https://www.acrossjob.com` - should redirect to `https://acrossjob.com`
4. Use URL Inspection tool in Search Console to verify
5. Click "Validate Fix" in Search Console

---

## 2. Soft 404 (Expired Job Listings) - IMPLEMENTATION GUIDE

### Problem
23 job listing pages were returning 200 OK status but appeared to have no content or expired jobs, causing Google to flag them as Soft 404 errors.

### Affected Pages Example
- `/job/classpass-senior-product-designer-consumer-corporate-growth-c939c0de`
- `/job/snowflake-staff-software-engineer-applied-performance-group-ee2916eb`
- `/job/canonical-talent-scientist-graduate-lead-b9e87439`

### Solution Approach
Created utility functions in `lib/jobStatus.ts` to track and handle expired jobs.

### Implementation Steps

#### Step 1: Import the utility in JobDetailPage.tsx

```typescript
import { getJobStatus, getJobHttpStatus } from '../lib/jobStatus';
```

#### Step 2: Add job status check in the component

```typescript
const jobStatus = getJobStatus(job.posted_date);
```

#### Step 3: Handle expired jobs in the UI

```typescript
{jobStatus.isExpired && (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Position Filled
        </h3>
        <p className="text-sm text-red-700 mt-1">
          This job posting has been closed. Check out similar opportunities below.
        </p>
      </div>
    </div>
  </div>
)}
```

#### Step 4: Add noindex meta tag for expired jobs using SEO component

```typescript
<SEO 
  title={`${job.title} at ${job.company_name}`}
  description={job.description?.substring(0, 160)}
  noindex={jobStatus.isExpired}
/>
```

#### Step 5: Remove apply button for expired jobs

```typescript
{!jobStatus.isExpired && (
  <a 
    href={job.apply_url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
  >
    Apply Now
  </a>
)}
```

#### Step 6: Update sitemap generation
Modify your sitemap generation script to exclude expired jobs:

```typescript
const activeJobs = jobs.filter(job => !getJobStatus(job.posted_date).isExpired);
```

### Alternative: Return 410 Status (Server-side approach)

If you have server-side rendering capability or API routes:

```typescript
// In your API route or server function
const httpStatus = getJobHttpStatus(job.posted_date);
if (httpStatus === 410) {
  return new Response('Job posting no longer available', { 
    status: 410,
    headers: { 'Content-Type': 'text/plain' }
  });
}
```

### Testing
1. Navigate to an old job posting (60+ days old)
2. Verify "Position Filled" banner appears
3. Verify apply button is hidden
4. Check page source for `<meta name="robots" content="noindex, follow">`
5. Verify these pages are excluded from sitemap.xml
6. Use Search Console URL Inspection tool
7. Click "Validate Fix" for Soft 404 issues

---

## 3. Duplicate without user-selected canonical - FIXED ✅

### Problem
11 pages (company pages and category pages) lacked canonical tags, causing Google to be unable to determine which version to index.

### Affected Pages Example
- `https://acrossjob.com/company/basecamp`
- `https://acrossjob.com/jobs?category=marketing`
- `https://acrossjob.com/company/notion`

### Solution
Created a reusable `SEO` component (`components/SEO.tsx`) that automatically adds:
- Canonical tags
- Meta descriptions
- Robots meta tags
- Dynamic titles

### Implementation

#### In Any Page Component

```typescript
import { SEO } from '../components/SEO';

function CompanyPage() {
  return (
    <>
      <SEO 
        title="Company Name - Jobs at AcrossJob"
        description="Browse all open positions at Company Name"
        canonicalUrl="https://acrossjob.com/company/company-slug"
      />
      {/* Page content */}
    </>
  );
}
```

#### For Category Pages with Query Parameters

```typescript
// For /jobs?category=marketing, canonicalize to main category page
<SEO 
  title="Marketing Jobs - AcrossJob"
  description="Browse marketing job opportunities"
  canonicalUrl="https://acrossjob.com/jobs/marketing"
/>
```

### Where to Add SEO Component

1. **JobDetailPage.tsx** - Add at top of component return
2. **CategoryPage.tsx** - Add with proper canonical for filtered pages
3. **CompanyPage.tsx** - If exists, add for each company
4. **Home.tsx** - Add for homepage
5. **Landing.tsx** - Add for landing page
6. **StaticPages.tsx** - Add for About, Contact, Privacy, Terms

### Example for Category Pages

```typescript
function CategoryPage() {
  const { category } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Canonicalize filtered pages to main category page
  const canonicalUrl = `https://acrossjob.com/jobs/${category}`;
  
  return (
    <>
      <SEO 
        title={`${category} Jobs - AcrossJob`}
        description={`Browse ${category} job opportunities`}
        canonicalUrl={canonicalUrl}
      />
      {/* Page content */}
    </>
  );
}
```

### Testing
1. Navigate to any page on the site
2. View page source (Ctrl+U)
3. Look for `<link rel="canonical" href="https://acrossjob.com/..." />`
4. Verify canonical URL is correct
5. For filtered pages, verify they point to main page
6. Use Search Console URL Inspection tool
7. Click "Validate Fix" for duplicate content issues

---

## Deployment Checklist

### Before Deployment
- [ ] Review all changed files
- [ ] Test redirects locally using Wrangler CLI
- [ ] Verify SEO component doesn't break existing functionality
- [ ] Check that job status logic correctly identifies expired jobs

### After Deployment
- [ ] Test HTTP to HTTPS redirects
  - `curl -I http://acrossjob.com`
  - `curl -I http://www.acrossjob.com`
  - `curl -I https://www.acrossjob.com`
- [ ] Verify canonical tags on live site
  - View source on job pages
  - View source on company pages
  - View source on category pages
- [ ] Test expired job handling
  - Navigate to old job postings
  - Verify UI changes appear
  - Check for noindex tag

### Google Search Console Actions
- [ ] Visit [Google Search Console](https://search.google.com/search-console)
- [ ] Go to "Page indexing" report
- [ ] For "Page with redirect" - Click "Validate Fix"
- [ ] For "Soft 404" - Click "Validate Fix"
- [ ] For "Duplicate without user-selected canonical" - Click "Validate Fix"
- [ ] Monitor validation progress (takes 3-7 days)
- [ ] Check for validation complete notifications

### Post-Validation
- [ ] Verify indexed pages in Search Console
- [ ] Check if affected URLs now appear as "Indexed" or properly excluded
- [ ] Monitor for any new indexing issues
- [ ] Update sitemap if necessary
- [ ] Submit sitemap to Search Console if changed

---

## Expected Timeline

1. **Immediate (After Deployment)**
   - Redirects take effect immediately
   - Canonical tags appear in page source
   - Expired job UI changes visible

2. **1-3 Days**
   - Google starts crawling fixed pages
   - Validation progress updates in Search Console

3. **3-7 Days**
   - Validation completes
   - Receive notification from Search Console
   - Fixed pages start appearing in Google index

4. **1-2 Weeks**
   - All properly fixed pages indexed
   - Duplicate issues resolved
   - Soft 404 errors cleared

---

## Monitoring

### Daily (First Week)
- Check Search Console for validation updates
- Monitor any new indexing issues
- Verify redirect chains aren't forming

### Weekly
- Review "Page indexing" report
- Check indexed page count
- Verify sitemap submission status
- Monitor crawl stats

### Monthly
- Full SEO audit
- Review all indexed pages
- Check for new duplicate content issues
- Update sitemap as needed

---

## Troubleshooting

### Redirects Not Working
1. Clear Cloudflare cache
2. Verify `_redirects` file is in `public/` folder
3. Check Cloudflare Pages deployment logs
4. Test with `curl -I` command

### Canonical Tags Not Appearing
1. Check if SEO component is imported
2. Verify React Router is properly set up
3. Check browser console for errors
4. View source (not inspect element)

### Validation Failed Again
1. Check specific error message in Search Console
2. Use URL Inspection tool for details
3. Verify fix was actually deployed
4. Wait 24 hours and try again
5. Check if redirect chains exist

---

## Additional Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Cloudflare Pages Redirects](https://developers.cloudflare.com/pages/platform/redirects/)
- [Canonical URLs Best Practices](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

## Contact

If you encounter any issues with these fixes, please:
1. Check the troubleshooting section above
2. Review deployment logs
3. Test locally before deploying
4. Create an issue in the repository with details
