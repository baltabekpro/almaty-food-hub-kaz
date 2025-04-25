import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe fetch utility that gracefully handles network errors
 * and prevents console error spam from third-party services
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    // Check if we should use a proxy for this request
    const shouldUseProxy = 
      url.includes('studyquicks.com') || 
      url.includes('questionai.com');
    
    // If it's a third-party domain causing CORS issues, route through our proxy
    const finalUrl = shouldUseProxy 
      ? `/tracking-api${new URL(url).pathname}${new URL(url).search}` 
      : url;

    const response = await fetch(finalUrl, {
      ...options,
      // Add credentials and headers as needed
      credentials: 'same-origin',
    });
    
    return response;
  } catch (error) {
    // Silently suppress errors for known problematic third-party domains
    if (
      url.includes('studyquicks.com') || 
      url.includes('questionai.com') || 
      url.includes('autotrack') ||
      url.includes('math_h5')
    ) {
      // Just log a reduced message instead of the full error
      console.debug('Non-critical request suppressed:', url.split('?')[0]);
      // Return a mock response to prevent further errors
      return new Response(JSON.stringify({ status: 'ignored' }), { 
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });
    }
    
    // For other domains, we can still log but not throw
    console.error('Network request failed:', error);
    throw error;
  }
}

/**
 * Safely handle postMessage calls to prevent origin mismatch errors
 */
export function safePostMessage(targetWindow: Window, message: any, targetOrigin: string) {
  try {
    // Only send the message if the window exists and is accessible
    if (targetWindow && targetWindow.postMessage) {
      // Use a more permissive targetOrigin if we're in development
      const safeOrigin = process.env.NODE_ENV === 'development' ? '*' : targetOrigin;
      targetWindow.postMessage(message, safeOrigin);
    }
  } catch (error) {
    // Silently suppress postMessage errors
    console.debug('PostMessage error suppressed');
  }
}

/**
 * Apply global patches to suppress common third-party errors
 */
export function applyNetworkErrorSuppression() {
  // Patch XMLHttpRequest to suppress errors for specific domains
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(...args: any[]) {
    const url = args[1];
    if (typeof url === 'string' && (
      url.includes('studyquicks.com') || 
      url.includes('questionai.com') || 
      url.includes('autotrack') ||
      url.includes('math_h5')
    )) {
      // For problematic domains, make this a no-op request
      args[1] = 'about:blank';
    }
    return originalXhrOpen.apply(this, args);
  };

  // Patch window.postMessage to prevent origin mismatch errors
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message: any, targetOrigin: string, transfer?: Transferable[]) {
    try {
      return originalPostMessage.call(this, message, 
        // Use a more permissive origin in development
        process.env.NODE_ENV === 'development' ? '*' : targetOrigin, 
        transfer);
    } catch (error) {
      // Silently suppress errors
      return undefined;
    }
  };
  
  // Patch global error handling for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Check if this is a third-party network error we want to suppress
    const errorString = String(event.reason || '');
    if (
      errorString.includes('studyquicks.com') ||
      errorString.includes('questionai.com') ||
      errorString.includes('autotrack') ||
      errorString.includes('math_h5') ||
      errorString.includes('postMessage') ||
      errorString.includes('origin')
    ) {
      event.preventDefault();
      console.debug('Suppressed unhandled rejection for third-party domain');
    }
  });
}
