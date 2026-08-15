/**
 * Smart Krishi Sahayak - Registration Page Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    Auth.redirectByRole();
    return;
  }

  const registerForm = document.getElementById('registerForm');
  const alertBanner = document.getElementById('alertBanner');
  const submitBtn = document.getElementById('submitBtn');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullName = document.getElementById('fullName').value.trim();
      const mobileNumber = document.getElementById('mobileNumber').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const preferredLanguage = document.getElementById('preferredLanguage').value;
      const district = document.getElementById('district').value.trim();
      const state = document.getElementById('state').value.trim() || 'Maharashtra';
      const taluka = document.getElementById('taluka').value.trim();
      const village = document.getElementById('village').value.trim();
      const landSizeAcresVal = document.getElementById('landSizeAcres').value.trim();
      const primaryCrops = document.getElementById('primaryCrops').value.trim();
      const soilType = document.getElementById('soilType').value.trim();

      // Client-side validations
      if (!fullName || !mobileNumber || !password || !confirmPassword || !district) {
        showAlert(I18n.getTranslation('err_required') || 'Please fill in all required fields.', 'danger');
        return;
      }

      if (!/^[0-9]{10}$/.test(mobileNumber)) {
        showAlert(I18n.getTranslation('err_mobile_invalid') || 'Mobile number must be exactly 10 digits.', 'danger');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'danger');
        return;
      }

      if (password !== confirmPassword) {
        showAlert(I18n.getTranslation('err_pass_mismatch') || 'Passwords do not match.', 'danger');
        return;
      }

      const payload = {
        fullName,
        mobileNumber,
        password,
        preferredLanguage,
        district,
        state
      };

      if (email) payload.email = email;
      if (taluka) payload.taluka = taluka;
      if (village) payload.village = village;
      if (landSizeAcresVal) payload.landSizeAcres = parseFloat(landSizeAcresVal);
      if (primaryCrops) payload.primaryCrops = primaryCrops;
      if (soilType) payload.soilType = soilType;

      Utils.setLoadingButton(submitBtn, true);

      try {
        const response = await Api.post('/api/v1/auth/register', payload);

        if (response && response.success) {
          showAlert('Registration successful! Redirecting to login page...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html?registered=true';
          }, 1500);
        } else {
          showAlert(response?.message || 'Registration failed. Please check input values.', 'danger');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Mobile number or email may already exist.', 'danger');
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
