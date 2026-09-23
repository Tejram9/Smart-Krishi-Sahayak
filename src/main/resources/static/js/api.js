/**
 * Smart Krishi Sahayak - Centralized API Service
 */
const Api = (() => {
  /**
   * Resolves the configured API Base URL using the following priority order:
   * 1. URL search parameter override (?apiUrl=... or ?api_url=...) which auto-persists to localStorage
   * 2. Runtime localStorage override ('sks_api_base_url')
   * 3. window.APP_CONFIG.API_BASE_URL (from config.js or inline script)
   * 4. Automatic local development detection:
   *    - If running on localhost / 127.0.0.1 on a non-backend port (e.g. 3000, 5500),
   *      automatically points to local Spring Boot backend 'http://localhost:8080'.
   *    - If running on port 8080 (served directly by Spring Boot), uses relative path ''.
   * 5. Default: '' (relative URL, ideal for same-origin or Vercel rewrites)
   */
  function getBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
      // 1. Check URL query parameter override (?apiUrl=...)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryApiUrl = urlParams.get('apiUrl') || urlParams.get('api_url');
        if (queryApiUrl) {
          const sanitized = queryApiUrl.trim().replace(/\/+$/, '');
          localStorage.setItem('sks_api_base_url', sanitized);
          return sanitized;
        }
      } catch (e) {
        // Silently ignore URL parameter extraction error
      }

      // 2. Check localStorage override
      try {
        const stored = localStorage.getItem('sks_api_base_url');
        if (stored && stored.trim() !== '') {
          return stored.trim().replace(/\/+$/, '');
        }
      } catch (e) {
        // Silently ignore localStorage access error
      }

      // 3. Check window.APP_CONFIG
      if (typeof window.APP_CONFIG !== 'undefined' &&
          typeof window.APP_CONFIG.API_BASE_URL === 'string' &&
          window.APP_CONFIG.API_BASE_URL.trim() !== '') {
        return window.APP_CONFIG.API_BASE_URL.trim().replace(/\/+$/, '');
      }

      // 4. Local development environment heuristic
      const hostname = window.location.hostname;
      const port = window.location.port;
      if ((hostname === 'localhost' || hostname === '127.0.0.1') && port && port !== '8080') {
        return 'http://localhost:8080';
      }
    }

    return '';
  }

  /**
   * Normalizes and prefixes an API endpoint with the base URL.
   */
  function formatUrl(endpoint) {
    if (!endpoint) return getBaseUrl();
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const base = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
  }

  /**
   * Helper function to execute HTTP requests
   */
  async function request(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = formatUrl(endpoint);
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (requiresAuth) {
      const token = Auth.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : null;

      if (!response.ok) {
        if (response.status === 401) {
          Auth.clearAuth();
          if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
            window.location.href = 'login.html?expired=true';
          }
        }
        
        const errorMessage = responseData?.message ||
          (response.status === 404
            ? `HTTP Error 404: Endpoint not found at ${url}. Please verify your backend API base URL configuration.`
            : `HTTP Error ${response.status}`);
        const error = new Error(errorMessage);
        error.status = response.status;
        error.responseData = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      if (!error.status) {
        error.message = error.message || 'Unable to connect to the server. Please check your connection.';
      }
      throw error;
    }
  }

  async function upload(endpoint, formData, requiresAuth = true) {
    const url = formatUrl(endpoint);
    const headers = {
      'Accept': 'application/json'
    };

    if (requiresAuth) {
      const token = Auth.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : null;

      if (!response.ok) {
        if (response.status === 401) {
          Auth.clearAuth();
          if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
            window.location.href = 'login.html?expired=true';
          }
        }
        const errorMessage = responseData?.message ||
          (response.status === 404
            ? `HTTP Error 404: Endpoint not found at ${url}. Please verify your backend API base URL configuration.`
            : `HTTP Error ${response.status}`);
        const error = new Error(errorMessage);
        error.status = response.status;
        error.responseData = responseData;
        throw error;
      }
      return responseData;
    } catch (error) {
      if (!error.status) {
        error.message = error.message || 'Unable to connect to the server.';
      }
      throw error;
    }
  }

  return {
    getBaseUrl,
    setBaseUrl: (url) => {
      if (url && typeof url === 'string') {
        localStorage.setItem('sks_api_base_url', url.trim().replace(/\/+$/, ''));
      } else {
        localStorage.removeItem('sks_api_base_url');
      }
    },
    formatUrl,
    get: (endpoint, requiresAuth = true) => request(endpoint, 'GET', null, requiresAuth),
    post: (endpoint, data, requiresAuth = false) => request(endpoint, 'POST', data, requiresAuth),
    put: (endpoint, data, requiresAuth = true) => request(endpoint, 'PUT', data, requiresAuth),
    patch: (endpoint, data, requiresAuth = true) => request(endpoint, 'PATCH', data, requiresAuth),
    delete: (endpoint, requiresAuth = true) => request(endpoint, 'DELETE', null, requiresAuth),
    upload: (endpoint, formData, requiresAuth = true) => upload(endpoint, formData, requiresAuth)
  };
})();
