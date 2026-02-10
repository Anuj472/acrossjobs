# Performance Optimization Guide

## Current Issues (PageSpeed Insights Report - Feb 10, 2026)

### Performance Score: 55/100 ❌

**Critical Metrics:**
- First Contentful Paint: 6.0s (Target: <1.8s)
- Largest Contentful Paint: 8.4s (Target: <2.5s) 
- Total Blocking Time: 220ms (Target: <200ms)
- Speed Index: 7.0s (Target: <3.4s)
- Cumulative Layout Shift: 0.048 (Good: <0.1) ✅

**Key Issues:**
1. Render blocking requests - Est savings: 1,300ms
2. JavaScript execution time: 1.9s
3. Main-thread work: 3.9s
4. Unused JavaScript: 371 KiB
5. Network payloads: 17,448 KiB (17 MB)
6. 20 long tasks found

---

## Immediate Wins (Quick Fixes)

### 1. Replace Tailwind CDN with Build-Time CSS

**Problem:** Loading Tailwind CSS from CDN (https://cdn.tailwindcss.com) is blocking render and adding ~50KB.

**Solution:** Install Tailwind locally

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Create `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
```

**Create `src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Move your custom styles here */
```

**Update `index.tsx`:**
```typescript
import './index.css';
```

**Expected Savings:** ~1,200ms on FCP, ~50KB reduction

### 2. Optimize Font Loading

**Current Issue:** Google Fonts blocking render

**Solution:** Use `font-display: swap` and preload

**Update in `index.html`:**
```html
<!-- Replace the current font link with: -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Or better - Self-host fonts:**

1. Download Inter font from Google Fonts
2. Place in `public/fonts/`
3. Add to CSS:

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
}
/* Repeat for other weights */
```

**Expected Savings:** ~300ms on FCP

### 3. Optimize Images

**Current Issue:** Favicon loading from Google Drive (slow)

**Solution:**

1. Download your favicon
2. Convert to optimized formats:
```bash
# Convert to WebP and optimized PNG
npx @squoosh/cli --webp auto --resize width=192 favicon.png
```

3. Place in `public/` folder
4. Update `index.html`:

```html
<link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
<link rel="icon" type="image/png" href="/favicon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/favicon-192.png">
```

**Expected Savings:** ~200ms on initial load

### 4. Code Splitting & Lazy Loading

**Problem:** Loading all pages upfront

**Solution:** Lazy load route components

**Update `App.tsx`:**
```typescript
import { lazy, Suspense } from 'react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* other routes */}
      </Routes>
    </Suspense>
  );
}
```

**Expected Savings:** ~371KB unused JS eliminated, ~800ms on initial load

---

## Medium Priority (Build Optimizations)

### 5. Enable Vite Build Optimizations

**Update `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

**Expected Savings:** Better caching, ~100KB JS reduction

### 6. Add Resource Hints

**Update `index.html` head:**
```html
<!-- Preconnect to important origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com">

<!-- Preload critical resources -->
<link rel="preload" as="style" href="/assets/index.css">
<link rel="preload" as="script" href="/assets/index.js">
```

### 7. Implement Service Worker for Caching

**Install Workbox:**
```bash
npm install -D workbox-webpack-plugin
```

**Create `public/sw.js`:**
```javascript
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);
```

---

## Advanced Optimizations

### 8. Database Query Optimization

If you're fetching jobs from Supabase:

```typescript
// Bad: Fetching all fields
const { data } = await supabase
  .from('jobs')
  .select('*');

// Good: Select only needed fields
const { data } = await supabase
  .from('jobs')
  .select('id, title, company_name, location, posted_date')
  .limit(20);

// Better: Add pagination
const { data } = await supabase
  .from('jobs')
  .select('id, title, company_name, location, posted_date')
  .range(0, 19)  // First 20 items
  .order('posted_date', { ascending: false });
```

### 9. Implement Virtual Scrolling for Job Lists

**Install react-window:**
```bash
npm install react-window
```

**Update job list component:**
```typescript
import { FixedSizeList } from 'react-window';

const JobList = ({ jobs }) => (
  <FixedSizeList
    height={600}
    itemCount={jobs.length}
    itemSize={120}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <JobCard job={jobs[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

### 10. Optimize Third-Party Scripts

**Defer non-critical scripts:**

```html
<!-- Google AdSense - defer loading -->
<script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1964422373240810"
 crossorigin="anonymous"></script>

<!-- Google Analytics - use gtag with defer -->
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-MKQ5EZHGQL"></script>
<script>
  window.addEventListener('load', () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-MKQ5EZHGQL');
  });
</script>
```

---
## Implementation Priority

### Phase 1 (This Week) - Expected: 60-70 Performance Score
1. ✅ Fix robots.txt (already done)
2. ✅ Add meta description (already done)
3. Replace Tailwind CDN with local build
4. Optimize font loading
5. Move favicon to local

### Phase 2 (Next Week) - Expected: 75-85 Performance Score
6. Implement code splitting
7. Add Vite optimizations
8. Add resource hints
9. Optimize images

### Phase 3 (Following Week) - Expected: 85-95 Performance Score
10. Implement service worker
11. Add virtual scrolling
12. Optimize database queries
13. Defer third-party scripts

---

## Monitoring

### Tools to Use

1. **Google PageSpeed Insights** - https://pagespeed.web.dev/
2. **Lighthouse (Chrome DevTools)** - F12 → Lighthouse tab
3. **WebPageTest** - https://www.webpagetest.org/
4. **Cloudflare Web Analytics** - Check in Cloudflare dashboard

### Key Metrics to Track

| Metric | Current | Target | Good |
|--------|---------|--------|------|
| FCP | 6.0s | 1.8s | <1.8s |
| LCP | 8.4s | 2.5s | <2.5s |
| TBT | 220ms | 200ms | <200ms |
| CLS | 0.048 | 0.1 | <0.1 |
| SI | 7.0s | 3.4s | <3.4s |
| Performance | 55 | 90+ | 90+ |

---

## Expected Results

### After Phase 1 (Quick Wins)
- **Performance Score:** 60-70
- **FCP:** ~3.5s (42% improvement)
- **LCP:** ~5.0s (40% improvement)
- **Bundle Size:** ~15 MB (13% reduction)

### After Phase 2 (Build Optimizations)
- **Performance Score:** 75-85
- **FCP:** ~2.5s (58% improvement)
- **LCP:** ~3.5s (58% improvement)  
- **Bundle Size:** ~12 MB (31% reduction)

### After Phase 3 (Advanced)
- **Performance Score:** 85-95
- **FCP:** ~1.5s (75% improvement)
- **LCP:** ~2.3s (73% improvement)
- **Bundle Size:** ~10 MB (43% reduction)

---

## Quick Test Commands

```bash
# Build and preview locally
npm run build
npm run preview

# Analyze bundle size
npm run build -- --mode analyze

# Test with Lighthouse CLI
npx lighthouse http://localhost:4173 --view

# Check bundle size
du -sh dist/
ls -lh dist/assets/
```

---

## Notes

- Focus on Phase 1 first - these are the easiest wins
- Test each change individually to measure impact
- Don't sacrifice functionality for performance
- Mobile performance is what matters most for SEO
- Aim for 90+ performance score on mobile

## Questions?

Refer to:
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/fast/)
