/**
 * Smart Krishi Sahayak - My Farm Profile Controller (Phase 6)
 *
 * Handles viewing, editing, validating, and updating the authenticated
 * farmer's personal profile and farm details across EN, MR, and HI.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuthentication()) return;

  // DOM Elements
  const farmLoadingState = document.getElementById('farmLoadingState');
  const farmProfileForm = document.getElementById('farmProfileForm');
  const feedbackAlert = document.getElementById('feedbackAlert');
  const viewModeActionBar = document.getElementById('viewModeActionBar');
  const editModeActionBar = document.getElementById('editModeActionBar');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const bannerFarmerName = document.getElementById('bannerFarmerName');

  // Read-Only Grid Elements
  const viewFullName = document.getElementById('viewFullName');
  const viewMobileNumber = document.getElementById('viewMobileNumber');
  const viewEmail = document.getElementById('viewEmail');
  const viewPreferredLanguage = document.getElementById('viewPreferredLanguage');
  const viewState = document.getElementById('viewState');
  const viewDistrict = document.getElementById('viewDistrict');
  const viewTaluka = document.getElementById('viewTaluka');
  const viewVillage = document.getElementById('viewVillage');
  const viewLandSize = document.getElementById('viewLandSize');
  const viewSoilType = document.getElementById('viewSoilType');
  const viewCropsTagList = document.getElementById('viewCropsTagList');

  // Form Input Elements
  const inputFullName = document.getElementById('inputFullName');
  const inputMobileNumber = document.getElementById('inputMobileNumber');
  const inputEmail = document.getElementById('inputEmail');
  const inputPreferredLanguage = document.getElementById('inputPreferredLanguage');
  const inputState = document.getElementById('inputState');
  const inputDistrict = document.getElementById('inputDistrict');
  const inputTaluka = document.getElementById('inputTaluka');
  const inputVillage = document.getElementById('inputVillage');
  const inputLandSize = document.getElementById('inputLandSize');
  const inputSoilType = document.getElementById('inputSoilType');
  const inputPrimaryCrops = document.getElementById('inputPrimaryCrops');

  // View vs Edit Containers
  const personalViewGrid = document.getElementById('personalViewGrid');
  const personalEditGrid = document.getElementById('personalEditGrid');
  const locationViewGrid = document.getElementById('locationViewGrid');
  const locationEditGrid = document.getElementById('locationEditGrid');
  const landSoilViewGrid = document.getElementById('landSoilViewGrid');
  const landSoilEditGrid = document.getElementById('landSoilEditGrid');
  const cropsViewContainer = document.getElementById('cropsViewContainer');
  const cropsEditContainer = document.getElementById('cropsEditContainer');

  // State
  let currentProfileData = null;
  let isSaving = false;

  // Initialize
  init();

  function init() {
    if (editProfileBtn) editProfileBtn.addEventListener('click', enableEditMode);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEdit);
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
    if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

    // Language switcher changes
    document.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('lang-select')) {
        if (currentProfileData) {
          renderProfile(currentProfileData);
        }
      }
    });

    loadProfile();
  }

  /**
   * Load farmer profile from API
   */
  async function loadProfile() {
    showLoading(true);
    hideFeedback();

    try {
      const response = await Api.get('/api/v1/farmer/profile', true);
      if (response && response.success && response.data) {
        currentProfileData = response.data;
        renderProfile(currentProfileData);
        populateForm(currentProfileData);
        showLoading(false);
        farmProfileForm.classList.remove('d-none');
      } else {
        throw new Error(I18n.getTranslation('farm_update_failed'));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showLoading(false);
      showFeedback(error.message || I18n.getTranslation('crops_error_desc'), 'danger');
    }
  }

  /**
   * Render profile data into read-only UI grids
   */
  function renderProfile(data) {
    if (bannerFarmerName) {
      bannerFarmerName.textContent = data.fullName || I18n.getTranslation('farm_page_title');
    }

    if (viewFullName) viewFullName.textContent = data.fullName || '-';
    if (viewMobileNumber) viewMobileNumber.textContent = data.mobileNumber || '-';
    if (viewEmail) viewEmail.textContent = data.email || '-';

    if (viewPreferredLanguage) {
      const langMap = { 'MR': 'मराठी (MR)', 'HI': 'हिंदी (HI)', 'EN': 'English (EN)' };
      viewPreferredLanguage.textContent = langMap[data.preferredLanguage] || data.preferredLanguage || '-';
    }

    if (viewState) viewState.textContent = data.state || 'Maharashtra';
    if (viewDistrict) viewDistrict.textContent = data.district || '-';
    if (viewTaluka) viewTaluka.textContent = data.taluka || '-';
    if (viewVillage) viewVillage.textContent = data.village || '-';

    if (viewLandSize) {
      const suffix = I18n.getTranslation('farm_land_acres_suffix') || 'Acres';
      viewLandSize.textContent = (data.landSizeAcres !== null && data.landSizeAcres !== undefined)
        ? `${data.landSizeAcres} ${suffix}`
        : '-';
    }

    if (viewSoilType) viewSoilType.textContent = data.soilType || '-';

    if (viewCropsTagList) {
      if (data.primaryCrops && data.primaryCrops.trim()) {
        const crops = data.primaryCrops.split(',').map(c => c.trim()).filter(c => c);
        viewCropsTagList.innerHTML = crops.map(crop => `
          <span class="crop-tag-badge">
            <i class="bi bi-check-circle-fill"></i>
            ${Utils.escapeHtml(crop)}
          </span>
        `).join('');
      } else {
        viewCropsTagList.innerHTML = `<span class="text-muted fst-italic" style="font-size: 0.9rem;">${I18n.getTranslation('farm_no_crops_selected')}</span>`;
      }
    }
  }

  /**
   * Populate edit form inputs
   */
  function populateForm(data) {
    if (inputFullName) inputFullName.value = data.fullName || '';
    if (inputMobileNumber) inputMobileNumber.value = data.mobileNumber || '';
    if (inputEmail) inputEmail.value = data.email || '';
    if (inputPreferredLanguage) inputPreferredLanguage.value = data.preferredLanguage || 'MR';

    if (inputState) inputState.value = data.state || 'Maharashtra';
    if (inputDistrict) inputDistrict.value = data.district || '';
    if (inputTaluka) inputTaluka.value = data.taluka || '';
    if (inputVillage) inputVillage.value = data.village || '';

    if (inputLandSize) inputLandSize.value = data.landSizeAcres !== null ? data.landSizeAcres : '';
    if (inputSoilType) inputSoilType.value = data.soilType || '';
    if (inputPrimaryCrops) inputPrimaryCrops.value = data.primaryCrops || '';
  }

  /**
   * Enable Edit Mode
   */
  function enableEditMode() {
    hideFeedback();

    // Toggle view vs edit containers
    personalViewGrid.classList.add('d-none');
    personalEditGrid.classList.remove('d-none');

    locationViewGrid.classList.add('d-none');
    locationEditGrid.classList.remove('d-none');

    landSoilViewGrid.classList.add('d-none');
    landSoilEditGrid.classList.remove('d-none');

    cropsViewContainer.classList.add('d-none');
    cropsEditContainer.classList.remove('d-none');

    viewModeActionBar.classList.add('d-none');
    editModeActionBar.classList.remove('d-none');

    if (inputFullName) inputFullName.focus();
  }

  /**
   * Cancel Edit Mode and restore original data
   */
  function cancelEdit() {
    hideFeedback();
    if (currentProfileData) {
      populateForm(currentProfileData);
    }

    personalViewGrid.classList.remove('d-none');
    personalEditGrid.classList.add('d-none');

    locationViewGrid.classList.remove('d-none');
    locationEditGrid.classList.add('d-none');

    landSoilViewGrid.classList.remove('d-none');
    landSoilEditGrid.classList.add('d-none');

    cropsViewContainer.classList.remove('d-none');
    cropsEditContainer.classList.add('d-none');

    viewModeActionBar.classList.remove('d-none');
    editModeActionBar.classList.add('d-none');
  }

  /**
   * Validate and save profile
   */
  async function saveProfile() {
    if (isSaving) return;
    hideFeedback();

    const fullName = inputFullName ? inputFullName.value.trim() : '';
    const email = inputEmail ? inputEmail.value.trim() : '';
    const preferredLanguage = inputPreferredLanguage ? inputPreferredLanguage.value : 'MR';
    const state = inputState ? inputState.value.trim() : 'Maharashtra';
    const district = inputDistrict ? inputDistrict.value.trim() : '';
    const taluka = inputTaluka ? inputTaluka.value.trim() : '';
    const village = inputVillage ? inputVillage.value.trim() : '';
    const landSizeStr = inputLandSize ? inputLandSize.value.trim() : '';
    const soilType = inputSoilType ? inputSoilType.value.trim() : '';
    const primaryCrops = inputPrimaryCrops ? inputPrimaryCrops.value.trim() : '';

    // Validations
    if (!fullName) {
      showFeedback(I18n.getTranslation('err_required'), 'danger');
      if (inputFullName) inputFullName.focus();
      return;
    }

    if (!district) {
      showFeedback(I18n.getTranslation('err_required'), 'danger');
      if (inputDistrict) inputDistrict.focus();
      return;
    }

    let landSizeAcres = null;
    if (landSizeStr) {
      const parsed = parseFloat(landSizeStr);
      if (isNaN(parsed) || parsed < 0) {
        showFeedback(I18n.getTranslation('err_invalid_land_size') || 'Please enter a valid land size in acres.', 'danger');
        if (inputLandSize) inputLandSize.focus();
        return;
      }
      landSizeAcres = parsed;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFeedback(I18n.getTranslation('err_invalid_email') || 'Please enter a valid email address.', 'danger');
        if (inputEmail) inputEmail.focus();
        return;
      }
    }

    const payload = {
      fullName,
      email: email || null,
      preferredLanguage,
      state,
      district,
      taluka: taluka || null,
      village: village || null,
      landSizeAcres,
      primaryCrops: primaryCrops || null,
      soilType: soilType || null
    };

    isSaving = true;
    if (saveProfileBtn) {
      saveProfileBtn.disabled = true;
      saveProfileBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> ${I18n.getTranslation('common_loading')}`;
    }

    try {
      const response = await Api.put('/api/v1/farmer/profile', payload, true);
      if (response && response.success && response.data) {
        currentProfileData = response.data;
        renderProfile(currentProfileData);
        populateForm(currentProfileData);

        // Update stored user details in Auth if language or name changed
        const currentUser = Auth.getUser();
        if (currentUser) {
          currentUser.fullName = currentProfileData.fullName;
          currentUser.preferredLanguage = currentProfileData.preferredLanguage;
          Auth.setUser(currentUser);
        }

        // Apply language if changed
        if (I18n.setLanguage && currentProfileData.preferredLanguage) {
          I18n.setLanguage(currentProfileData.preferredLanguage);
        }

        cancelEdit();
        showFeedback(I18n.getTranslation('farm_update_success'), 'success');
        Utils.showToast(I18n.getTranslation('farm_update_success'), 'success');
      } else {
        throw new Error(I18n.getTranslation('farm_update_failed'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      let errorMsg = error.message || I18n.getTranslation('farm_update_failed');
      showFeedback(errorMsg, 'danger');
      Utils.showToast(errorMsg, 'error');
    } finally {
      isSaving = false;
      if (saveProfileBtn) {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = `<i class="bi bi-check2-circle"></i> <span>${I18n.getTranslation('farm_btn_save')}</span>`;
      }
    }
  }

  function showLoading(show) {
    if (farmLoadingState) farmLoadingState.classList.toggle('d-none', !show);
  }

  function showFeedback(message, type = 'info') {
    if (!feedbackAlert) return;
    feedbackAlert.className = `alert alert-${type}`;
    feedbackAlert.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5"></i>
        <span>${Utils.escapeHtml(message)}</span>
      </div>
    `;
    feedbackAlert.classList.remove('d-none');
  }

  function hideFeedback() {
    if (feedbackAlert) feedbackAlert.classList.add('d-none');
  }
});
