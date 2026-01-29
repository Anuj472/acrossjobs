
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';

interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
}

/**
 * Local definition for PagesFunction to fix compilation error when Cloudflare types 
 * are not globally available in the development environment.
 */
type PagesFunction<E = any> = (context: { 
  request: Request; 
  env: E; 
  [key: string]: any; 
}) => Response | Promise<Response>;

/**
 * Cloudflare Pages Function entry point.
 * This handles SSR for any non-static-file request.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. Check if the request is for a static asset
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt|map)$/.test(url.pathname);
  
  // 2. If it's a static asset, let Cloudflare serve it directly
  if (isStaticAsset || url.pathname.startsWith('/api/')) {
    return env.ASSETS.fetch(request);
  }

  // 3. For all other routes, perform SSR
  // First, get the base index.html template
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return response;
  
  const html = await response.text();

  try {
    // Render the React App to string
    const appHtml = renderToString(
      <React.StrictMode>
        <App ssrPath={url.pathname} />
      </React.StrictMode>
    );

    // Inject into the root div
    const ssrHtml = html.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    );

    return new Response(ssrHtml, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side only rendering
    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  }
};
