// Emergency API URL fix for CSP issues
// This script runs before the main app and fixes API configuration
(function() {
  'use strict';
  
  console.log('🔧 Emergency API URL fix running...');
  
  // Detect environment
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isProduction = !isDev;
  
  console.log('Environment detected:', isDev ? 'Development' : 'Production');
  console.log('Current hostname:', window.location.hostname);
  
  // Set the correct API URL
  if (isProduction) {
    // Force production API URL
    const productionApiUrl = 'https://homebase-gear-guard.onrender.com/api';
    
    // Create/override VITE environment variables
    if (!window.import) window.import = {};
    if (!window.import.meta) window.import.meta = {};
    if (!window.import.meta.env) window.import.meta.env = {};
    
    // Override the API URL
    window.import.meta.env.VITE_API_URL = productionApiUrl;
    
    // Also set it as a global variable for immediate access
    window.EMERGENCY_API_URL = productionApiUrl;
    
    console.log('✅ Emergency fix applied - API URL set to:', productionApiUrl);
    
    // Show user notification
    setTimeout(() => {
      if (document.body) {
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="
            position: fixed; 
            top: 10px; 
            right: 10px; 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            padding: 12px; 
            border-radius: 6px; 
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          ">
            <div style="font-weight: bold; color: #92400e; margin-bottom: 4px;">
              🔧 API Fix Applied
            </div>
            <div style="color: #92400e; font-size: 12px;">
              Emergency fix for API connectivity activated. App should work normally now.
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
              position: absolute; 
              top: 4px; 
              right: 6px; 
              background: none; 
              border: none; 
              font-size: 16px; 
              cursor: pointer;
              color: #92400e;
            ">×</button>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
          if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
          }
        }, 10000);
      }
    }, 1000);
  } else {
    console.log('Development environment - using default localhost API');
  }
  
  // Log current configuration
  console.log('Final API configuration:');
  console.log('- window.import.meta.env.VITE_API_URL:', window.import?.meta?.env?.VITE_API_URL);
  console.log('- window.EMERGENCY_API_URL:', window.EMERGENCY_API_URL);
})();