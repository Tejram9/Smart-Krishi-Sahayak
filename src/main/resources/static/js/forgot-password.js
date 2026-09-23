/**
 * Smart Krishi Sahayak - Password Recovery Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  const step1Container = document.getElementById('step1Container');
  const step2Container = document.getElementById('step2Container');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const alertBannerStep1 = document.getElementById('alertBannerStep1');
  const alertBannerStep2 = document.getElementById('alertBannerStep2');
  const btnSendOtp = document.getElementById('btnSendOtp');
  const btnResetPassword = document.getElementById('btnResetPassword');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');

  let currentIdentifier = '';

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert(alertBannerStep1);

      const identifier = document.getElementById('recoveryIdentifier').value.trim();
      if (!identifier) {
        showAlert(alertBannerStep1, 'Please enter your registered mobile number or email.', 'danger');
        return;
      }

      Utils.setLoadingButton(btnSendOtp, true);

      try {
        const response = await Api.post('/api/v1/auth/forgot-password', {
          mobileNumberOrEmail: identifier
        });

        currentIdentifier = identifier;

        // Transition to Step 2
        step1Container.style.display = 'none';
        step2Container.style.display = 'block';
        showAlert(alertBannerStep2,
          'Recovery code generated! Please check your server console log (or SMS/Email) and enter the 6-digit OTP below.',
          'success'
        );

        const otpInput = document.getElementById('otpCode');
        if (otpInput) {
          otpInput.value = '';
          otpInput.focus();
        }
      } catch (error) {
        console.error('Password reset request error:', error);
        showAlert(alertBannerStep1, error.message || 'Unable to process recovery request.', 'danger');
      } finally {
        Utils.setLoadingButton(btnSendOtp, false);
      }
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => {
      step2Container.style.display = 'none';
      step1Container.style.display = 'block';
      hideAlert(alertBannerStep2);
      hideAlert(alertBannerStep1);
    });
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert(alertBannerStep2);

      const otpCode = document.getElementById('otpCode').value.trim();
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!otpCode || !newPassword || !confirmPassword) {
        showAlert(alertBannerStep2, 'Please fill in all required fields.', 'danger');
        return;
      }

      if (newPassword.length < 6) {
        showAlert(alertBannerStep2, 'New password must be at least 6 characters long.', 'danger');
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert(alertBannerStep2, 'Passwords do not match. Please verify and re-enter.', 'danger');
        return;
      }

      Utils.setLoadingButton(btnResetPassword, true);

      try {
        const response = await Api.post('/api/v1/auth/reset-password', {
          mobileNumberOrEmail: currentIdentifier,
          tokenOrOtp: otpCode,
          newPassword: newPassword
        });

        if (response && response.success) {
          showAlert(alertBannerStep2, 'Password successfully reset! Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else {
          showAlert(alertBannerStep2, response?.message || 'Password reset failed.', 'danger');
        }
      } catch (error) {
        console.error('Reset password error:', error);
        showAlert(alertBannerStep2, error.message || 'Invalid or expired OTP code.', 'danger');
      } finally {
        Utils.setLoadingButton(btnResetPassword, false);
      }
    });
  }

  function showAlert(banner, message, type = 'danger') {
    if (!banner) return;
    banner.className = `alert-banner alert-banner-${type}`;
    banner.textContent = message;
    banner.style.display = 'block';
  }

  function hideAlert(banner) {
    if (!banner) return;
    banner.style.display = 'none';
  }
});
