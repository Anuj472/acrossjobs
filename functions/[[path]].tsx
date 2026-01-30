import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';
import { createClient } from '@supabase/supabase-js';

interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface PagesFunction<Env = any> {
  (context: {
    request: Request;
    env: Env;
    [key: string]: any;
  }): Response | Promise<Response>;
}

/**
 * Fetch INITIAL jobs for fast SSR (500 jobs max)
 * Client will load ALL jobs after page hydration
 */
async function fetchInitialJobs(supabase: any): Promise<any[]> {
  const INITIAL_LIMIT = 500; // Fast initial load for SSR
  const BATCH_SIZE = 250; // Smaller batches for faster processing
  
  let allJobs: any[] = [];
  let from = 0;
  let hasMore = true;
  let batches = 0;
  const maxBatches = Math.ceil(INITIAL_LIMIT / BATCH_SIZE);

  console.log(`📥 SSR: Fetching initial ${INITIAL_LIMIT} jobs for fast page load...`);

  while (hasMore && batches < maxBatches) {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, category, location_city, location_country, job_type, apply_link, created_at, company:companies(id, name, slug, logo_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, from + BATCH_SIZE - 1);
    
    const elapsed = Date.now() - startTime;
    
    if (error) {
      console.error('❌ SSR: Error fetching jobs:', error);
      break;
    }
    
    if (data && data.length > 0) {
      allJobs = [...allJobs, ...data];
      console.log(`✅ SSR: Batch ${batches + 1}: ${data.length} jobs in ${elapsed}ms (Total: ${allJobs.length})`);
      from += BATCH_SIZE;
      hasMore = data.length === BATCH_SIZE && allJobs.length < INITIAL_LIMIT;
      batches++;
    } else {
      hasMore = false;
    }
    
    // Stop if we've reached the limit
    if (allJobs.length >= INITIAL_LIMIT) {
      console.log(`✅ SSR: Initial ${INITIAL_LIMIT} jobs loaded for SSR. Client will fetch remaining jobs.`);
      hasMore = false;
    }
  }
  
  console.log(`✅ SSR: Total initial jobs: ${allJobs.length}`);
  return allJobs;
}

/**
 * Cloudflare Pages Function with SSR, Data Prefetching, and Edge Caching.
 * Optimized to prevent "Worker exceeded resource limits" errors.
 * 
 * Strategy:
 * - SSR loads first 500 jobs for fast initial render
 * - Client-side JavaScript loads ALL remaining jobs after hydration
 * - This prevents Worker timeouts while still showing all 5000+ jobs
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Fix: Property 'default' does not exist on type 'CacheStorage'.
  // Use type assertion to access the Cloudflare-specific default cache instance.
  const cache = (caches as any).default;

  // 1. Check Cache first to return instant responses
  // Cache is CRITICAL to reduce database load
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('✅ SSR: Returning cached response (bypassing DB)');
    return cachedResponse;
  }

  const path = url.pathname;

  // For static assets, bypass SSR
  if (path.includes('.') && !path.endsWith('.html')) {
    return env.ASSETS.fetch(request);
  }

  try {
    console.log(`🔄 SSR: Processing request for ${path}`);
    const startTime = Date.now();
    
    // 2. Create Supabase client
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    // 3. Fetch HTML and initial jobs with timeout protection
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => {
      console.warn('⚠️ SSR: Request timeout - using fallback');
      timeoutController.abort();
    }, 8000); // 8 second timeout (Cloudflare has 10s CPU limit)
    
    try {
      const [htmlResponse, initialJobs] = await Promise.all([
        env.ASSETS.fetch(request),
        fetchInitialJobs(supabase)
      ]);
      
      clearTimeout(timeout);

      let html = await htmlResponse.text();

      // 4. Render the App with the pre-fetched data
      const appHtml = renderToString(<App ssrPath={path} initialJobs={initialJobs} />);
      
      // 5. Inject content and data into the template
      html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      const envScript = `
        <script>
          window.ENV = {
            SUPABASE_URL: ${JSON.stringify(env.SUPABASE_URL || '')},
            SUPABASE_ANON_KEY: ${JSON.stringify(env.SUPABASE_ANON_KEY || '')}
          };
          // Initial SSR data (500 jobs for fast load)
          window.INITIAL_DATA = ${JSON.stringify(initialJobs)};
          // Flag to tell client to load remaining jobs
          window.SSR_PARTIAL_DATA = true;
          console.log('📊 SSR: Loaded ' + ${initialJobs.length} + ' initial jobs. Client will fetch remaining jobs...');
        </script>
      `;
      
      html = html.replace('</head>', `${envScript}</head>`);

      const elapsed = Date.now() - startTime;
      console.log(`✅ SSR: Response ready with ${initialJobs.length} initial jobs in ${elapsed}ms`);

      const response = new Response(html, {
        headers: { 
          'content-type': 'text/html;charset=UTF-8',
          // Cache for 5 minutes at edge, revalidate in background
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
          'X-Jobs-Count': initialJobs.length.toString(),
          'X-Render-Time': `${elapsed}ms`,
          'X-SSR-Partial': 'true' // Indicates more jobs available client-side
        },
      });

      // 6. Store in Edge Cache for 5 minutes
      context.waitUntil(cache.put(request, response.clone()));

      return response;
      
    } catch (fetchError) {
      clearTimeout(timeout);
      throw fetchError;
    }
    
  } catch (error: any) {
    console.error('❌ SSR Error:', error.message);
    
    // Return error page with retry info
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AcrossJobs - Loading</title>
          <meta charset="UTF-8" />
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            h1 { color: #333; }
            p { color: #666; }
            .retry { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>⚡ Loading Jobs...</h1>
          <p>Our servers are processing a large number of jobs. Please wait a moment.</p>
          <a href="/" class="retry">Refresh Page</a>
          <script>
            // Auto-refresh after 3 seconds
            setTimeout(() => window.location.reload(), 3000);
          </script>
        </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 503,
      headers: { 
        'content-type': 'text/html;charset=UTF-8',
        'Retry-After': '3',
        'Cache-Control': 'no-store' // Don't cache error pages
      }
    });
  }
};
