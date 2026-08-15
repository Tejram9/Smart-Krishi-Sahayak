/**
 * Smart Krishi Sahayak - Centralized API Service
 */
const Api = (() => {
  const BASE_URL = ''; // Relative path since frontend is served directly by Spring Boot

  /**
   * Helper function to execute HTTP requests
   */
  async function request(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${BASE_URL}${endpoint}`;
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
        
        const errorMessage = responseData?.message || `HTTP Error ${response.status}`;
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

  return {
    get: (endpoint, requiresAuth = true) => request(endpoint, 'GET', null, requiresAuth),
    post: (endpoint, data, requiresAuth = false) => request(endpoint, 'POST', data, requiresAuth),
    put: (endpoint, data, requiresAuth = true) => request(endpoint, 'PUT', data, requiresAuth),
    delete: (endpoint, requiresAuth = true) => request(endpoint, 'DELETE', null, requiresAuth)
  };
})();
