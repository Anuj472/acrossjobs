
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';

interface Env {
  ASSETS: {
    fetch: typeof fetch;
  };
}

// Added PagesFunction type definition to fix 'Cannot find name' error
type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

/**
 * Cloudflare Pages Function entry point.
 * This handles SSR for any non-static-file request.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Allow static assets (images, js, css) to be served normally
  // We check for common extensions to skip SSR for them
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|txt|map)$/.test(url.pathname);
  if (isStaticAsset || url.pathname.startsWith('/api/')) {
    return env.ASSETS.fetch(request);
  }

  // 1. Fetch the original index.html template from static assets
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) {
    return response;
  }
  
  const html = await response.text();

  try {
    // 2. Render the React App to string
    // We pass the current path to the App component so it knows what to render
    const appHtml = renderToString(
      <React.StrictMode>
        <App ssrPath={url.pathname} />
      </React.StrictMode>
    );

    // 3. Inject the rendered HTML into the template's root div
    // We use a simple replace. Ensure index.html has <div id="root"></div> exactly.
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
    // Fallback to client-side only rendering if SSR fails
    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  }
};
