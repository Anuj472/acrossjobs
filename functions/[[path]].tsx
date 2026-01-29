
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
  if (cachedResponse) return cachedResponse;

  const path = url.pathname;

  // For static assets, bypass SSR
  if (path.includes('.') && !path.endsWith('.html')) {
    return env.ASSETS.fetch(request);
  }

  try {
    // 2. Prefetch Data and HTML in parallel
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const [htmlResponse, supabaseResponse] = await Promise.all([
      env.ASSETS.fetch(request),
      supabase
        .from('jobs')
        .select('*, company:companies(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    let html = await htmlResponse.text();
    const initialJobs = supabaseResponse.data || [];

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

    return response;
  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side only if SSR fails
    return env.ASSETS.fetch(request);
  }
};
