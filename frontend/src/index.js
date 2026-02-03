import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/i18n"; // Initialize i18n before App
import App from "@/App";


// Suppress ResizeObserver errors BEFORE React mounts
// This is critical to prevent the error overlay in development
if (typeof window !== 'undefined') {
  // Capture phase listener to catch errors before React
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('ResizeObserver')) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  // Also override console.error to filter out ResizeObserver messages
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
