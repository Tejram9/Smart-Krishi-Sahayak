/**
 * Smart Krishi Sahayak - Administrator Registration Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  // If user is already authenticated as admin, redirect to admin dashboard
  if (Auth.isAuthenticated() && Auth.getRole() === 'ROLE_ADMIN') {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  const form = document.getElementById('adminRegisterForm');
  const alertBanner = document.getElementById('alertBanner');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnFillSampleAdmin = document.getElementById('btnFillSampleAdmin');

  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const mobileInput = document.getElementById('mobileNumber');
  const departmentSelect = document.getElementById('department');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const secretKeyInput = document.getElementById('adminSecretKey');

  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');

  // Password reveal toggle
  if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordIcon.className = isPassword ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
  }

  // 1-Click sample admin details fill for immediate test
  if (btnFillSampleAdmin) {
    btnFillSampleAdmin.addEventListener('click', () => {
      hideAlert();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      fullNameInput.value = 'Dr. Rajesh Deshmukh';
      emailInput.value = `officer.${randomSuffix}@smartkrishi.gov.in`;
      mobileInput.value = `982233${randomSuffix}`;
      departmentSelect.value = 'Department of Agriculture & Farmers Welfare';
      passwordInput.value = 'Admin@SecurePass2026';
      confirmPasswordInput.value = 'Admin@SecurePass2026';
      secretKeyInput.value = 'KisanAdmin@2026';

      showAlert('✓ Filled sample administrator credentials with master authorization key. Click Register to continue!', 'info');
    });
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim();
      const mobileNumber = mobileInput.value.trim();
      const department = departmentSelect.value;
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const adminSecretKey = secretKeyInput.value.trim();

      // Basic client validations
      if (!fullName || !email || !mobileNumber || !password || !confirmPassword || !adminSecretKey) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
      }

      if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
        showAlert('Please enter a valid 10-digit mobile number.', 'danger');
        mobileInput.focus();
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'danger');
        passwordInput.focus();
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match. Please re-check.', 'danger');
        confirmPasswordInput.focus();
        return;
      }

      Utils.setLoadingButton(submitBtn, true);

      try {
        const payload = {
          fullName,
          email,
          mobileNumber,
          department,
          password,
          adminSecretKey,
          preferredLanguage: 'EN'
        };

        const response = await Api.post('/api/v1/auth/register-admin', payload);

        if (response && response.success && response.data) {
          Auth.setAuth(response.data);
          showAlert('✓ Administrator account registered successfully! Redirecting to Administrator Console...', 'success');
          setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
          }, 700);
        } else {
          showAlert(response?.message || 'Administrator registration failed. Please check your authorization key.', 'danger');
        }
      } catch (error) {
        console.error('Admin registration error:', error);
        showAlert(error.message || 'Registration failed. Please verify credentials and master secret key.', 'danger');
      } finally {
        Utils.setLoadingButton(submitBtn, false);
      }
    });
  }

  function showAlert(message, type = 'danger') {
    if (!alertBanner) return;
    alertBanner.className = `alert-banner alert-banner-${type}`;
    if (type === 'danger') {
      alertBanner.textContent = message;
    } else {
      alertBanner.innerHTML = message;
    }
    alertBanner.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBanner) return;
    alertBanner.style.display = 'none';
  }
});
