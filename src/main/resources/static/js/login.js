/**
 * Smart Krishi Sahayak - Login Page Controller with Farmer/Admin Roles
 */
document.addEventListener('DOMContentLoaded', () => {
  // If user is already authenticated, redirect them to their dashboard
  if (Auth.isAuthenticated()) {
    Auth.redirectByRole();
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const alertBanner = document.getElementById('alertBanner');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const tabFarmer = document.getElementById('tabFarmer');
  const tabAdmin = document.getElementById('tabAdmin');
  const authLogo = document.getElementById('authLogo');
  const loginTitle = document.getElementById('loginTitle');
  const loginSubtitle = document.getElementById('loginSubtitle');
  const registerFooterBlock = document.getElementById('registerFooterBlock');

  let currentRole = 'ROLE_FARMER';

  // Check URL parameters for session expiry, access denied, or direct role switch
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('expired')) {
    showAlert(I18n.getTranslation('err_session_expired') || 'Your session has expired. Please log in again.', 'danger');
  } else if (urlParams.has('access_denied')) {
    showAlert(I18n.getTranslation('err_access_denied') || 'Access Denied: Administrator permission required.', 'danger');
  }

  if (urlParams.get('role') === 'admin' || urlParams.get('portal') === 'admin') {
    setRoleMode('ROLE_ADMIN');
  }

  function setRoleMode(role) {
    currentRole = role;
    hideAlert();

    if (role === 'ROLE_ADMIN') {
      tabAdmin.classList.add('active', 'admin-active');
      tabAdmin.setAttribute('aria-selected', 'true');
      tabFarmer.classList.remove('active');
      tabFarmer.setAttribute('aria-selected', 'false');

      authLogo.innerHTML = '<i class="bi bi-shield-lock-fill"></i>';
      authLogo.style.background = '#1e3a8a';
      loginTitle.textContent = 'Administrator Portal';
      loginSubtitle.textContent = 'Authorized system administrator authentication and analytics access.';
      btnText.textContent = 'Log In as Administrator';
      if (registerFooterBlock) registerFooterBlock.style.display = 'none';
    } else {
      tabFarmer.classList.add('active');
      tabFarmer.setAttribute('aria-selected', 'true');
      tabAdmin.classList.remove('active', 'admin-active');
      tabAdmin.setAttribute('aria-selected', 'false');

      authLogo.innerHTML = '<i class="bi bi-person-lock"></i>';
      authLogo.style.background = 'var(--primary-color)';
      loginTitle.textContent = 'Farmer Login';
      loginSubtitle.textContent = 'Log in to access your farmer dashboard, crop advisory, and AI assistant.';
      btnText.textContent = 'Log In as Farmer';
      if (registerFooterBlock) registerFooterBlock.style.display = 'block';
    }
  }

  if (tabFarmer) {
    tabFarmer.addEventListener('click', () => setRoleMode('ROLE_FARMER'));
  }

  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => setRoleMode('ROLE_ADMIN'));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const mobileNumberOrEmail = document.getElementById('mobileNumberOrEmail').value.trim();
      const password = document.getElementById('password').value;

      if (!mobileNumberOrEmail || !password) {
        showAlert(I18n.getTranslation('err_required') || 'Please fill in all required fields.', 'danger');
        return;
      }

      Utils.setLoadingButton(submitBtn, true);

      try {
        const response = await Api.post('/api/v1/auth/login', {
          mobileNumberOrEmail,
          password,
          expectedRole: currentRole
        });

        if (response && response.success && response.data) {
          Auth.setAuth(response.data);
          const portalName = response.data.role === 'ROLE_ADMIN' ? 'Admin Dashboard' : 'Farmer Dashboard';
          showAlert(`Login successful! Redirecting to ${portalName}...`, 'success');
          setTimeout(() => {
            Auth.redirectByRole(response.data.role);
          }, 700);
        } else {
          showAlert(response?.message || 'Login failed. Please check credentials.', 'danger');
        }
      } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Invalid login credentials.', 'danger');
      } finally {
        Utils.setLoadingButton(submitBtn, false);
      }
    });
  }

  function showAlert(message, type = 'danger') {
    if (!alertBanner) return;
    alertBanner.className = `alert-banner alert-banner-${type}`;
    alertBanner.textContent = message;
    alertBanner.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBanner) return;
    alertBanner.style.display = 'none';
  }
});
