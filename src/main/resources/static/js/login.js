/**
 * Smart Krishi Sahayak - Advanced Login Page Controller
 * Includes Role Selection, Quick Demo Credentials, Password Reveal, Caps-Lock Warning & Ambient UX
 */
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);

  // If redirected with logout parameter, explicitly wipe local auth to prevent bounce loops
  if (urlParams.has('logout') || urlParams.has('logged_out')) {
    Auth.clearAuth();
  } else if (Auth.isAuthenticated()) {
    // If user is already authenticated and not explicitly logging out, redirect to dashboard
    Auth.redirectByRole();
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const alertBanner = document.getElementById('alertBanner');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const tabFarmer = document.getElementById('tabFarmer');
  const tabAdmin = document.getElementById('tabAdmin');
  const authCard = document.getElementById('authCard');
  const authLogo = document.getElementById('authLogo');
  const loginTitle = document.getElementById('loginTitle');
  const loginSubtitle = document.getElementById('loginSubtitle');
  const registerFooterBlock = document.getElementById('registerFooterBlock');
  const identifierIcon = document.getElementById('identifierIcon');

  const mobileNumberOrEmail = document.getElementById('mobileNumberOrEmail');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  const capsLockWarning = document.getElementById('capsLockWarning');
  const rememberMe = document.getElementById('rememberMe');

  const btnDemoFarmer = document.getElementById('btnDemoFarmer');
  const btnDemoAdmin = document.getElementById('btnDemoAdmin');
  const kisanQuoteText = document.getElementById('kisanQuoteText');

  let currentRole = 'ROLE_FARMER';

  // Inspiring Agricultural Quotes for Farmers
  const agriQuotes = [
    '"शेतकरी समृद्धी, देशाची प्रगती" — Indian Farmer Prosperity is National Growth',
    '"अन्नदाता सुखी भव" — May the provider of food always be prosperous & healthy',
    '"Jai Jawan, Jai Kisan" — Honoring the soldiers and farmers who sustain the nation',
    '"स्मार्ट शेती, अधिक नफा" — Science and AI technology for abundant harvests',
    '"Empowering every farm with data, precision, and verified agricultural science"'
  ];
  let quoteIndex = 0;
  if (kisanQuoteText) {
    setInterval(() => {
      quoteIndex = (quoteIndex + 1) % agriQuotes.length;
      kisanQuoteText.style.opacity = '0';
      setTimeout(() => {
        kisanQuoteText.textContent = agriQuotes[quoteIndex];
        kisanQuoteText.style.opacity = '1';
      }, 300);
    }, 7000);
  }

  // Restore remembered username/mobile
  const REMEMBER_KEY = 'sks_remembered_identifier';
  const savedIdentifier = localStorage.getItem(REMEMBER_KEY);
  if (savedIdentifier && mobileNumberOrEmail) {
    mobileNumberOrEmail.value = savedIdentifier;
    if (rememberMe) rememberMe.checked = true;
  }

  // Check URL parameters for session notifications
  // (urlParams is already declared above and reused here)
  if (urlParams.has('expired')) {
    showAlert(I18n.getTranslation('err_session_expired') || 'Your session has expired. Please log in again to continue.', 'danger');
  } else if (urlParams.has('access_denied')) {
    showAlert(I18n.getTranslation('err_access_denied') || 'Access Denied: Administrator permission required.', 'danger');
  } else if (urlParams.has('logout') || urlParams.has('logged_out')) {
    showAlert('✨ You have been logged out securely. Thank you for using Smart Krishi Sahayak!', 'success');
  }

  if (urlParams.get('role') === 'admin' || urlParams.get('portal') === 'admin') {
    setRoleMode('ROLE_ADMIN');
  }

  function setRoleMode(role) {
    currentRole = role;
    hideAlert();

    if (role === 'ROLE_ADMIN') {
      if (authCard) authCard.classList.add('mode-admin');
      tabAdmin.classList.add('active', 'admin-active');
      tabAdmin.setAttribute('aria-selected', 'true');
      tabFarmer.classList.remove('active');
      tabFarmer.setAttribute('aria-selected', 'false');

      if (authLogo) {
        authLogo.innerHTML = '<i class="bi bi-shield-lock-fill"></i>';
      }
      if (identifierIcon) {
        identifierIcon.className = 'bi bi-shield-lock-fill input-icon-left';
      }
      loginTitle.textContent = 'Administrator Portal';
      loginSubtitle.textContent = 'Authorized system administrator authentication and analytics access.';
      btnText.textContent = 'Log In as Administrator';
      if (registerFooterBlock) {
        registerFooterBlock.style.display = 'block';
        registerFooterBlock.innerHTML = `<span>New Administrator?</span> <a href="/admin-register.html" class="fw-bold ms-1" style="color: #1e3a8a;"><i class="bi bi-shield-plus me-1"></i>Register Admin Account</a>`;
      }
    } else {
      if (authCard) authCard.classList.remove('mode-admin');
      tabFarmer.classList.add('active');
      tabFarmer.setAttribute('aria-selected', 'true');
      tabAdmin.classList.remove('active', 'admin-active');
      tabAdmin.setAttribute('aria-selected', 'false');

      if (authLogo) {
        authLogo.innerHTML = '<i class="bi bi-flower1"></i>';
      }
      if (identifierIcon) {
        identifierIcon.className = 'bi bi-person-fill input-icon-left';
      }
      loginTitle.textContent = 'Farmer Login';
      loginSubtitle.textContent = 'Log in to access your farmer dashboard, crop disease advisory, and AI assistant.';
      btnText.textContent = 'Log In as Farmer';
      if (registerFooterBlock) {
        registerFooterBlock.style.display = 'block';
        registerFooterBlock.innerHTML = `<span data-i18n="login_no_account">Don't have an account?</span> <a href="/register.html" data-i18n="login_register_link" class="fw-bold ms-1">Register here</a>`;
      }
    }
  }

  if (tabFarmer) {
    tabFarmer.addEventListener('click', () => setRoleMode('ROLE_FARMER'));
  }

  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => setRoleMode('ROLE_ADMIN'));
  }

  // Quick Demo Autofill Handlers
  if (btnDemoFarmer) {
    btnDemoFarmer.addEventListener('click', () => {
      setRoleMode('ROLE_FARMER');
      mobileNumberOrEmail.value = '9876543210';
      passwordInput.value = 'Farmer@123';
      showAlert('🌾 Filled Farmer Demo credentials (9876543210 / Farmer@123). Click Log In to continue!', 'info');
      passwordInput.focus();
    });
  }

  if (btnDemoAdmin) {
    btnDemoAdmin.addEventListener('click', () => {
      setRoleMode('ROLE_ADMIN');
      mobileNumberOrEmail.value = 'admin@smartkrishi.gov.in';
      passwordInput.value = 'Admin@SecurePass2026';
      showAlert('🛡️ Filled Administrator credentials (admin@smartkrishi.gov.in / Admin@SecurePass2026). Click Log In to continue!', 'info');
      passwordInput.focus();
    });
  }

  // Password Visibility Reveal
  if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordIcon.className = isPassword ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
  }

  // Caps Lock Warning Detection
  if (passwordInput && capsLockWarning) {
    const checkCapsLock = (e) => {
      if (e.getModifierState && e.getModifierState('CapsLock')) {
        capsLockWarning.style.display = 'inline-flex';
      } else {
        capsLockWarning.style.display = 'none';
      }
    };
    passwordInput.addEventListener('keydown', checkCapsLock);
    passwordInput.addEventListener('keyup', checkCapsLock);
    passwordInput.addEventListener('blur', () => {
      capsLockWarning.style.display = 'none';
    });
  }

  // Form Submit Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const identifier = mobileNumberOrEmail.value.trim();
      const password = passwordInput.value;

      if (!identifier || !password) {
        showAlert(I18n.getTranslation('err_required') || 'Please enter both your mobile/email and password.', 'danger');
        return;
      }

      // Handle remember me
      if (rememberMe && rememberMe.checked) {
        localStorage.setItem(REMEMBER_KEY, identifier);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      Utils.setLoadingButton(submitBtn, true);

      try {
        const response = await Api.post('/api/v1/auth/login', {
          mobileNumberOrEmail: identifier,
          password: password,
          expectedRole: currentRole
        });

        if (response && response.success && response.data) {
          Auth.setAuth(response.data);
          const portalName = response.data.role === 'ROLE_ADMIN' ? 'Admin Dashboard' : 'Farmer Dashboard';
          showAlert(`✓ Authentication successful! Loading ${portalName}...`, 'success');
          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (redirect && !redirect.startsWith('http://') && !redirect.startsWith('https://') && !redirect.startsWith('//')) {
              window.location.href = redirect;
            } else {
              Auth.redirectByRole(response.data.role);
            }
          }, 600);
        } else {
          showAlert(response?.message || 'Login failed. Please check credentials.', 'danger');
          triggerCardShake();
        }
      } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Invalid login credentials. Please try again.', 'danger');
        triggerCardShake();
      } finally {
        Utils.setLoadingButton(submitBtn, false);
      }
    });
  }

  function triggerCardShake() {
    if (!authCard) return;
    authCard.style.animation = 'none';
    // Trigger reflow
    void authCard.offsetWidth;
    authCard.style.animation = 'shakeAnim 0.4s ease';
  }

  function showAlert(message, type = 'danger') {
    if (!alertBanner) return;
    alertBanner.className = `alert-banner alert-banner-${type}`;
    alertBanner.innerHTML = message;
    alertBanner.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBanner) return;
    alertBanner.style.display = 'none';
  }
});

// Keyframe animation for card shake on error
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shakeAnim {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
`;
document.head.appendChild(shakeStyle);
