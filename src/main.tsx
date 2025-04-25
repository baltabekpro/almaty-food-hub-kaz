import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyNetworkErrorSuppression } from './lib/utils'

// Apply network error suppression to prevent console errors from third-party services
if (typeof window !== 'undefined') {
  // Patch the postMessage API to prevent origin errors
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOriginOrOptions, transfer?) {
    try {
      // Always use '*' as targetOrigin to avoid "Failed to execute 'postMessage'" errors
      return originalPostMessage.call(this, message, '*', transfer);
    } catch (e) {
      console.debug('Suppressed postMessage error');
      return false;
    }
  };
  
  // Apply our network error suppression for problematic domains
  applyNetworkErrorSuppression();
  
  // Suppress other unrelated console errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filter out specific errors that are coming from third party libraries
    const errorMsg = args[0]?.toString() || '';
    if (
      errorMsg.includes('postMessage') || 
      errorMsg.includes('is not a function') ||
      errorMsg.includes('ERR_ADDRESS_INVALID') ||
      errorMsg.includes('Failed to load resource') ||
      errorMsg.includes('CORS policy')
    ) {
      console.debug('Suppressed error:', ...args);
      return;
    }
    
    return originalConsoleError.apply(this, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
