/**
 * Smart Krishi Sahayak - Application Frontend Configuration
 *
 * This file centralizes configuration parameters for the frontend client.
 *
 * CONFIGURATION MODES:
 * 1. Default (Empty string ""):
 *    - Uses same-origin relative paths (e.g. "/api/v1/auth/login").
 *    - Ideal when frontend is served directly by Spring Boot on port 8080.
 *    - Also works when deploying to Vercel if using Vercel Rewrites (vercel.json).
 *
 * 2. Explicit Backend URL:
 *    - Set `API_BASE_URL` to your deployed Spring Boot URL once deployed
 *      (e.g., 'https://smart-krishi-backend.onrender.com' or 'https://api.yourdomain.com').
 *    - Do NOT include a trailing slash.
 *
 * 3. Runtime Override (Without redeploying):
 *    - In browser developer console:
 *      Api.setBaseUrl('https://your-backend-url')
 *      or: localStorage.setItem('sks_api_base_url', 'https://your-backend-url')
 *    - Or visit any page with the query parameter:
 *      https://your-app.vercel.app/login.html?apiUrl=https://your-backend-url
 */
window.APP_CONFIG = {
  // Set your deployed backend URL here, or leave empty to use relative path / local detection
  API_BASE_URL: ''
};
