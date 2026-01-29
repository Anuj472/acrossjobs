import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Check if the root element has children.
 * If it does, we assume SSR was successful and we should hydrate.
 * Otherwise, we fall back to standard createRoot rendering.
 */
const hasSSRContent = rootElement.hasChildNodes() && rootElement.innerText.trim().length > 0;

try {
  if (hasSSRContent) {
    ReactDOM.hydrateRoot(
      rootElement,
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.debug("Hydration successful");
  } else {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.debug("Client-side render successful");
  }
} catch (error) {
  console.error("React Mounting Error:", error);
  // Fallback: if hydration fails, try to re-render from scratch to recover UI
  if (hasSSRContent) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}
