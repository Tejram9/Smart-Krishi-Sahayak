/**
 * Smart Krishi Sahayak - Admin Dashboard Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Enforce ADMIN role requirement
  if (!Auth.requireRole('ROLE_ADMIN')) return;

  const profileLoading = document.getElementById('profileLoading');
  const profileContent = document.getElementById('profileContent');
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  try {
    const response = await Api.get('/api/v1/auth/me');
    if (response && response.success && response.data) {
      renderAdminProfile(response.data);
    } else {
      showError('Failed to fetch administrator profile.');
    }
  } catch (error) {
    console.error('Admin profile error:', error);
    showError(error.message || 'Unable to load admin details.');
  }

  function renderAdminProfile(user) {
    if (profileLoading) profileLoading.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';

    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const mobileEl = document.getElementById('userMobile');
    const emailEl = document.getElementById('userEmail');
    const roleEl = document.getElementById('userRole');

    if (avatarEl) avatarEl.textContent = (user.fullName || 'A').charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.fullName || 'Administrator';
    if (mobileEl) mobileEl.textContent = user.mobileNumber || 'N/A';
    if (emailEl) emailEl.textContent = user.email || 'N/A';
    if (roleEl) roleEl.textContent = user.role || 'ROLE_ADMIN';
  }

  function showError(msg) {
    if (profileLoading) profileLoading.innerHTML = `<div class="alert alert-danger">${Utils.escapeHtml(msg)}</div>`;
  }
});
