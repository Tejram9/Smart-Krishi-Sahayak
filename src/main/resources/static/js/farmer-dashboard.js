/**
 * Smart Krishi Sahayak - Farmer Dashboard Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuthentication()) return;

  const profileLoading = document.getElementById('profileLoading');
  const profileContent = document.getElementById('profileContent');
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  try {
    const response = await Api.get('/api/v1/auth/me');
    if (response && response.success && response.data) {
      renderProfile(response.data);
    } else {
      showError('Failed to fetch profile information.');
    }
  } catch (error) {
    console.error('Farmer profile error:', error);
    showError(error.message || 'Unable to load profile data.');
  }

  function renderProfile(user) {
    if (profileLoading) profileLoading.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';

    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const mobileEl = document.getElementById('userMobile');
    const emailEl = document.getElementById('userEmail');
    const langEl = document.getElementById('userLang');
    const locationEl = document.getElementById('userLocation');
    const landEl = document.getElementById('userLand');
    const cropsEl = document.getElementById('userCrops');
    const soilEl = document.getElementById('userSoil');

    if (avatarEl) avatarEl.textContent = (user.fullName || 'F').charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.fullName || 'Farmer';
    if (mobileEl) mobileEl.textContent = user.mobileNumber || 'N/A';
    if (emailEl) emailEl.textContent = user.email || 'Not provided';
    if (langEl) langEl.textContent = user.preferredLanguage || 'MR';
    
    let locStr = user.district || '';
    if (user.taluka) locStr += `, ${user.taluka}`;
    if (user.state) locStr += `, ${user.state}`;
    if (locationEl) locationEl.textContent = locStr || 'N/A';

    if (landEl) landEl.textContent = user.landSizeAcres ? `${user.landSizeAcres} Acres` : 'Not specified';
    if (cropsEl) cropsEl.textContent = user.primaryCrops || 'Not specified';
    if (soilEl) soilEl.textContent = user.soilType || 'Not specified';
  }

  function showError(msg) {
    if (profileLoading) profileLoading.innerHTML = `<div class="alert alert-danger">${Utils.escapeHtml(msg)}</div>`;
  }
});
