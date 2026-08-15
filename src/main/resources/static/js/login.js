/**
 * Smart Krishi Sahayak - Login Page Controller
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

  // Check URL parameters for session expiry or access denied
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('expired')) {
    showAlert(I18n.getTranslation('err_session_expired') || 'Your session has expired. Please log in again.', 'danger');
  } else if (urlParams.has('access_denied')) {
    showAlert(I18n.getTranslation('err_access_denied') || 'Access Denied: Permission required.', 'danger');
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
          password
        });

        if (response && response.success && response.data) {
          Auth.setAuth(response.data);
          showAlert('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            Auth.redirectByRole(response.data.role);
          }, 800);
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
