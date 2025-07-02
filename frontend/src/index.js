import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";

// Clear console on load to reduce noise from extensions
if (process.env.NODE_ENV !== 'development') {
  console.clear();
}

// Handle uncaught errors gracefully
window.addEventListener('error', (event) => {
  // Suppress common browser extension errors
  if (event.message && (
    event.message.includes('ethereum') ||
    event.message.includes('chrome-extension') ||
    event.message.includes('moz-extension') ||
    event.message.includes('safari-extension') ||
    event.message.includes('Non-Error promise rejection captured')
  )) {
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Suppress common extension-related promise rejections
  if (event.reason && typeof event.reason === 'string' && (
    event.reason.includes('ethereum') ||
    event.reason.includes('extension')
  )) {
    event.preventDefault();
    return false;
  }
  console.warn('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
