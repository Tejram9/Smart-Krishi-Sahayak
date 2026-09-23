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

  async function logout() {
    try {
      if (getToken() && typeof Api !== 'undefined') {
        await Api.post('/api/v1/auth/logout', null, true);
      }
    } catch (e) {
      console.warn('Backend logout notification failed, clearing local session:', e);
    } finally {
      clearAuth();
      window.location.href = 'login.html';
    }
  }

  function redirectByRole(roleOverride) {
    const role = roleOverride || getRole();
    if (role === 'ROLE_ADMIN') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'farmer-dashboard.html';
    }
  }

  function requireAuthentication() {
    if (!isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function requireRole(requiredRole) {
    if (!requireAuthentication()) return false;
    const currentRole = getRole();
    if (currentRole !== requiredRole) {
      if (currentRole === 'ROLE_FARMER') {
        window.location.href = 'farmer-dashboard.html?access_denied=true';
      } else {
        window.location.href = 'admin-dashboard.html?access_denied=true';
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
