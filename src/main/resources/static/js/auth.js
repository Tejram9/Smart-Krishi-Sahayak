/**
 * Smart Krishi Sahayak - Centralized Authentication Module
 */
const Auth = (() => {
  const TOKEN_KEY = 'sks_jwt_token';
  const USER_KEY = 'sks_user_info';

  function setAuth(authResponseData) {
    if (authResponseData && authResponseData.token) {
      localStorage.setItem(TOKEN_KEY, authResponseData.token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        userId: authResponseData.userId,
        fullName: authResponseData.fullName,
        mobileNumber: authResponseData.mobileNumber,
        email: authResponseData.email,
        preferredLanguage: authResponseData.preferredLanguage,
        role: authResponseData.role
      }));
    }
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function updateCurrentUser(updates) {
    const user = getCurrentUser();
    if (!user) return;
    Object.assign(user, updates);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
  }

  function isAuthenticated() {
    return !!getToken();
  }

  async function logout(skipLogoutPage = false) {
    const user = getCurrentUser();
    if (user) {
      try {
        sessionStorage.setItem('sks_last_logged_out_user', JSON.stringify({
          fullName: user.fullName || 'Farmer Brother / किसान भाई',
          role: user.role || 'ROLE_FARMER',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      } catch (e) {
        // Ignore storage errors
      }
    }

    const token = getToken();

    // 1. Immediately wipe authentication state from client storage
    clearAuth();

    // 2. Notify backend audit logs asynchronously (fire-and-forget with 1.5s timeout abort)
    if (token) {
      try {
        const logoutUrl = typeof Api !== 'undefined' ? Api.formatUrl('/api/v1/auth/logout') : '/api/v1/auth/logout';
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;

        fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({}),
          signal: controller ? controller.signal : undefined
        }).finally(() => {
          if (timeoutId) clearTimeout(timeoutId);
        }).catch(() => {
          // Ignore network or serverless container sleep errors during logout
        });
      } catch (e) {
        // Ignore notification errors
      }
    }

    // 3. Immediately redirect to logout confirmation or login page
    if (skipLogoutPage) {
      window.location.href = '/login.html?logout=true';
    } else {
      window.location.href = '/logout.html';
    }
  }

  function redirectByRole(roleOverride) {
    const role = roleOverride || getRole();
    if (role === 'ROLE_ADMIN') {
      window.location.href = '/admin-dashboard.html';
    } else {
      window.location.href = '/farmer-dashboard.html';
    }
  }

  function requireAuthentication() {
    if (!isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }

  function requireRole(requiredRole) {
    if (!requireAuthentication()) return false;
    const currentRole = getRole();
    if (currentRole !== requiredRole) {
      if (currentRole === 'ROLE_FARMER') {
        window.location.href = '/farmer-dashboard.html?access_denied=true';
      } else {
        window.location.href = '/admin-dashboard.html?access_denied=true';
      }
      return false;
    }
    return true;
  }

  return {
    setAuth,
    clearAuth,
    updateCurrentUser,
    getToken,
    getCurrentUser,
    getRole,
    isAuthenticated,
    logout,
    redirectByRole,
    requireAuthentication,
    requireRole
  };
})();
