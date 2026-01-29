import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("AcrossJob: Could not find root element to mount to");
}

console.info("AcrossJob: Client-side JS bundle is running.");

/**
 * Check if the root element has children from SSR.
 */
const hasSSRContent = rootElement.hasChildNodes() && rootElement.innerText.trim().length > 0;

try {
  if (hasSSRContent) {
    console.debug("AcrossJob: Found SSR content, attempting hydration.");
    ReactDOM.hydrateRoot(
      rootElement,
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.debug("AcrossJob: Hydration success.");
  } else {
    console.debug("AcrossJob: No SSR content, performing fresh client render.");
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} catch (error) {
  console.error("AcrossJob: Hydration failure, falling back to createRoot.", error);
  // Total recovery: wipe existing HTML and force a fresh client-side render
  // This is the safety net that fixes 'unclickable' sites if SSR and Client differ too much.
  if (rootElement) {
    rootElement.innerHTML = '';
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

/**
 * FIX: 'Converting circular structure to JSON'
 * Do not log the raw 'e.target' because DOM nodes contain circular references to React Fibers.
 */
window.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target) {
    const info = `tag:${target.tagName.toLowerCase()} class:${target.className || 'none'}`;
    console.debug(`AcrossJob: Interaction -> click at [${info}]`);
  }
}, { passive: true });
