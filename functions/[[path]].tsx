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
 * Fetch all jobs with pagination to bypass Supabase's 1000 row limit
 */
async function fetchAllJobs(supabase: any): Promise<any[]> {
  let allJobs: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  console.log('📥 SSR: Starting job fetch with pagination...');

  while (hasMore) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, from + batchSize - 1);
    
    if (error) {
      console.error('❌ SSR: Error fetching jobs:', error);
      break;
    }
    
    if (data && data.length > 0) {
      allJobs = [...allJobs, ...data];
      console.log(`✅ SSR: Fetched batch ${Math.floor(from / batchSize) + 1}: ${data.length} jobs (Total: ${allJobs.length})`);
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }
  
  console.log(`✅ SSR: Total jobs loaded: ${allJobs.length}`);
  return allJobs;
}

/**
 * Cloudflare Pages Function with SSR, Data Prefetching, and Edge Caching.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Fix: Property 'default' does not exist on type 'CacheStorage'.
  // Use type assertion to access the Cloudflare-specific default cache instance.
  const cache = (caches as any).default;

  // 1. Check Cache first to return instant responses
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('✅ SSR: Returning cached response');
    return cachedResponse;
  }

  const path = url.pathname;

  // For static assets, bypass SSR
  if (path.includes('.') && !path.endsWith('.html')) {
    return env.ASSETS.fetch(request);
  }

  try {
    console.log(`🔄 SSR: Processing request for ${path}`);
    
    // 2. Prefetch Data and HTML in parallel
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const [htmlResponse, initialJobs] = await Promise.all([
      env.ASSETS.fetch(request),
      fetchAllJobs(supabase)
    ]);

    let html = await htmlResponse.text();

    // 3. Render the App with the pre-fetched data
    const appHtml = renderToString(<App ssrPath={path} initialJobs={initialJobs} />);
    
    // 4. Inject content and data into the template
    html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    const envScript = `
      <script>
        window.ENV = {
          SUPABASE_URL: ${JSON.stringify(env.SUPABASE_URL || '')},
          SUPABASE_ANON_KEY: ${JSON.stringify(env.SUPABASE_ANON_KEY || '')}
        };
        window.INITIAL_DATA = ${JSON.stringify(initialJobs)};
        console.log('📊 SSR: Loaded ' + ${initialJobs.length} + ' jobs into window.INITIAL_DATA');
      </script>
    `;
    
    html = html.replace('</head>', `${envScript}</head>`);

    const response = new Response(html, {
      headers: { 
        'content-type': 'text/html;charset=UTF-8',
        // Cache for 60 seconds at the edge, but tell browser to revalidate
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30' 
      },
    });

    // 5. Store in Edge Cache
    context.waitUntil(cache.put(request, response.clone()));

    console.log(`✅ SSR: Response ready with ${initialJobs.length} jobs`);
    return response;
  } catch (error) {
    console.error('❌ SSR Error:', error);
    // Fallback to client-side only if SSR fails
    return env.ASSETS.fetch(request);
  }
};
