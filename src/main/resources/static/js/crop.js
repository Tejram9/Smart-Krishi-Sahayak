/**
 * Smart Krishi Sahayak - Crop Information Hub Module
 */
const CropApp = (() => {
  let allCrops = [];
  let currentLanguage = 'EN';
  let searchDebounceTimeout = null;
  let cropDetailModalInstance = null;

  // DOM Elements
  const elements = {
    loading: document.getElementById('cropsLoading'),
    empty: document.getElementById('cropsEmpty'),
    error: document.getElementById('cropsError'),
    grid: document.getElementById('cropGrid'),
    countBadge: document.getElementById('cropCountBadge'),
    searchInput: document.getElementById('cropSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    seasonFilter: document.getElementById('seasonFilter'),
    resetBtn: document.getElementById('resetFiltersBtn'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    retryBtn: document.getElementById('retryCropsBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    // Modal elements
    modal: document.getElementById('cropDetailModal'),
    modalLoading: document.getElementById('modalLoading'),
    modalContent: document.getElementById('modalContent'),
    modalCropName: document.getElementById('modalCropName'),
    modalMultilingualNames: document.getElementById('modalMultilingualNames'),
    modalCategoryBadge: document.getElementById('modalCategoryBadge'),
    modalSeasonBadge: document.getElementById('modalSeasonBadge'),
    modalDescription: document.getElementById('modalDescription'),
    modalSoil: document.getElementById('modalSoil'),
    modalWater: document.getElementById('modalWater'),
    modalAdvisoriesContainer: document.getElementById('modalAdvisoriesContainer'),
    modalAdvisoryCount: document.getElementById('modalAdvisoryCount')
  };

  /**
   * Check Authentication status and update Navbar
   */
  function checkAuth() {
    const isAuthed = (typeof Auth !== 'undefined' && Auth.isAuthenticated());
    const loginBtn = document.getElementById('loginNavBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardLink = document.getElementById('navDashboardLink');

    if (isAuthed) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (dashboardLink) dashboardLink.style.display = 'inline-flex';
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (dashboardLink) dashboardLink.style.display = 'none';
    }
    return true; // Allow guest access for crop hub & advisory
  }

  /**
   * Helper to get localized crop name
   */
  function getLocalizedName(crop, lang) {
    const l = (lang || currentLanguage || 'EN').toUpperCase();
    if (l === 'MR' && crop.nameMr) return crop.nameMr;
    if (l === 'HI' && crop.nameHi) return crop.nameHi;
    return crop.nameEn || crop.nameMr || crop.nameHi;
  }

  /**
   * Helper to get secondary multilingual subtitle
   */
  function getSecondaryNames(crop, lang) {
    const l = (lang || currentLanguage || 'EN').toUpperCase();
    if (l === 'MR') {
      return `${crop.nameEn} | ${crop.nameHi}`;
    } else if (l === 'HI') {
      return `${crop.nameEn} | ${crop.nameMr}`;
    } else {
      return `${crop.nameMr} | ${crop.nameHi}`;
    }
  }

  /**
   * UI State Switchers
   */
  function showLoading() {
    elements.loading.style.display = 'block';
    elements.empty.style.display = 'none';
    elements.error.style.display = 'none';
    elements.grid.style.display = 'none';
  }

  function showEmpty() {
    elements.loading.style.display = 'none';
    elements.empty.style.display = 'block';
    elements.error.style.display = 'none';
    elements.grid.style.display = 'none';
    elements.countBadge.textContent = '0 ' + I18n.getTranslation('crops_count_suffix', 'Crops');
  }

  function showError(msg) {
    elements.loading.style.display = 'none';
    elements.empty.style.display = 'none';
    elements.error.style.display = 'block';
    elements.grid.style.display = 'none';
    const errText = document.getElementById('errorMessageText');
    if (errText && msg) {
      errText.textContent = msg;
    }
  }

  function showContent() {
    elements.loading.style.display = 'none';
    elements.empty.style.display = 'none';
    elements.error.style.display = 'none';
    elements.grid.style.display = 'flex';
  }

  /**
   * Fetch crops from backend API
   */
  async function loadCrops() {
    if (!checkAuth()) return;

    showLoading();

    const keyword = elements.searchInput.value.trim();
    const category = elements.categoryFilter.value;
    const season = elements.seasonFilter.value;
    currentLanguage = I18n.getCurrentLang() || 'EN';

    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (season) params.append('season', season);
    if (currentLanguage) params.append('language', currentLanguage);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const response = await Api.get(`/api/v1/crops${queryString}`);
      if (response && response.success) {
        allCrops = response.data || [];
        renderCropCards(allCrops);
      } else {
        showError(response?.message || 'Failed to fetch crop data.');
      }
    } catch (error) {
      console.error('Error loading crops:', error);
      showError(error.message || 'Unable to connect to the server.');
    }
  }

  /**
   * Render crop cards into the DOM
   */
  function renderCropCards(crops) {
    if (!crops || crops.length === 0) {
      showEmpty();
      return;
    }

    elements.countBadge.textContent = `${crops.length} ${I18n.getTranslation('crops_count_suffix', 'Crops')}`;
    elements.grid.innerHTML = '';

    crops.forEach(crop => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-4';

      const localizedTitle = getLocalizedName(crop, currentLanguage);
      const secondaryTitle = getSecondaryNames(crop, currentLanguage);

      col.innerHTML = `
        <div class="crop-card">
          <div class="crop-card-header">
            <div>
              <h5 class="crop-title-main">${Utils.escapeHtml(localizedTitle)}</h5>
              <div class="crop-title-sub">${Utils.escapeHtml(secondaryTitle)}</div>
            </div>
            <span class="badge-category">${Utils.escapeHtml(crop.category || '')}</span>
          </div>

          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge-season">${Utils.escapeHtml(crop.suitableSeason || '')}</span>
          </div>

          <div class="crop-meta-grid">
            <div class="crop-meta-item">
              <div class="crop-meta-label">
                <i class="bi bi-layers text-success"></i> <span data-i18n="crop_meta_soil">Soil</span>
              </div>
              <div class="crop-meta-value text-truncate" title="${Utils.escapeHtml(crop.soilRequirements || '-')}">
                ${Utils.escapeHtml(crop.soilRequirements || '-')}
              </div>
            </div>
            <div class="crop-meta-item">
              <div class="crop-meta-label">
                <i class="bi bi-droplet-fill text-primary"></i> <span data-i18n="crop_meta_water">Water</span>
              </div>
              <div class="crop-meta-value text-truncate" title="${Utils.escapeHtml(crop.waterRequirement || '-')}">
                ${Utils.escapeHtml(crop.waterRequirement || '-')}
              </div>
            </div>
          </div>

          <p class="crop-desc-preview">${Utils.escapeHtml(crop.description || '')}</p>

          <button type="button" class="btn-view-crop mt-auto" onclick="CropApp.openCropModal(${crop.id})">
            <i class="bi bi-eye"></i> <span data-i18n="crop_btn_view_details">View Details & Advisories</span>
          </button>
        </div>
      `;

      elements.grid.appendChild(col);
    });

    showContent();
  }

  /**
   * Open & load crop details in the modal
   */
  async function openCropModal(cropId) {
    if (!cropDetailModalInstance) {
      cropDetailModalInstance = new bootstrap.Modal(elements.modal);
    }

    elements.modalLoading.style.display = 'block';
    elements.modalContent.style.display = 'none';
    cropDetailModalInstance.show();

    currentLanguage = I18n.getCurrentLang() || 'EN';

    try {
      const response = await Api.get(`/api/v1/crops/${cropId}?language=${currentLanguage}`);
      if (response && response.success && response.data) {
        renderModalContent(response.data);
      } else {
        elements.modalDescription.textContent = 'Crop details could not be loaded.';
        elements.modalLoading.style.display = 'none';
        elements.modalContent.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching crop details:', error);
      elements.modalDescription.textContent = error.message || 'Error loading crop details.';
      elements.modalLoading.style.display = 'none';
      elements.modalContent.style.display = 'block';
    }
  }

  /**
   * Populate modal with detailed crop agronomy and advisories
   */
  function renderModalContent(crop) {
    const localizedTitle = getLocalizedName(crop, currentLanguage);
    const secondaryTitle = getSecondaryNames(crop, currentLanguage);

    elements.modalCropName.textContent = localizedTitle;
    elements.modalMultilingualNames.textContent = secondaryTitle;
    elements.modalCategoryBadge.textContent = crop.category || '';
    elements.modalSeasonBadge.textContent = crop.suitableSeason || '';
    elements.modalDescription.textContent = crop.description || 'No description available.';
    elements.modalSoil.textContent = crop.soilRequirements || 'Standard farm soil';
    elements.modalWater.textContent = crop.waterRequirement || 'Standard irrigation schedule';

    // Advisories list
    const advisories = crop.verifiedContents || [];
    elements.modalAdvisoryCount.textContent = `${advisories.length} ${I18n.getTranslation('modal_advisories_count_suffix', 'Advisories')}`;

    elements.modalAdvisoriesContainer.innerHTML = '';
    if (advisories.length === 0) {
      elements.modalAdvisoriesContainer.innerHTML = `
        <div class="text-center py-3 text-muted">
          <i class="bi bi-info-circle fs-4 d-block mb-1"></i>
          <span data-i18n="modal_no_advisories">No verified advisories currently published for this crop.</span>
        </div>
      `;
    } else {
      advisories.forEach(advisory => {
        const item = document.createElement('div');
        item.className = 'advisory-item';
        item.innerHTML = `
          <div class="advisory-item-title">
            <span>${Utils.escapeHtml(advisory.title)}</span>
            <div class="d-flex gap-1">
              <span class="badge bg-light text-dark border">${Utils.escapeHtml(advisory.category || 'General')}</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle">${Utils.escapeHtml(advisory.language || '')}</span>
            </div>
          </div>
          <div class="advisory-item-body">${Utils.escapeHtml(advisory.contentBody)}</div>
        `;
        elements.modalAdvisoriesContainer.appendChild(item);
      });
    }

    elements.modalLoading.style.display = 'none';
    elements.modalContent.style.display = 'block';
  }

  /**
   * Reset all search and filter fields
   */
  function resetFilters() {
    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.categoryFilter.value = '';
    elements.seasonFilter.value = '';
    loadCrops();
  }

  /**
   * Bind DOM event listeners
   */
  function initEvents() {
    // Search input with debounce
    elements.searchInput.addEventListener('input', e => {
      const val = e.target.value;
      elements.clearSearchBtn.style.display = val ? 'block' : 'none';

      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(() => {
        loadCrops();
      }, 300);
    });

    // Clear search button
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.clearSearchBtn.style.display = 'none';
      loadCrops();
    });

    // Dropdown filters
    elements.categoryFilter.addEventListener('change', () => loadCrops());
    elements.seasonFilter.addEventListener('change', () => loadCrops());

    // Reset buttons
    elements.resetBtn.addEventListener('click', resetFilters);
    elements.emptyResetBtn.addEventListener('click', resetFilters);
    elements.retryBtn.addEventListener('click', loadCrops);

    // Logout
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', () => {
        Auth.logout();
      });
    }

    // Tabs & Mode Switching
    const tabCatBtn = document.getElementById('tabCatalogBtn');
    if (tabCatBtn) tabCatBtn.addEventListener('click', () => switchMode('catalog'));

    const tabRecBtn = document.getElementById('tabRecommendBtn');
    if (tabRecBtn) tabRecBtn.addEventListener('click', () => switchMode('recommend'));

    const standaloneForm = document.getElementById('standaloneRecForm');
    if (standaloneForm) {
      standaloneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        runStandaloneRecommendation();
      });
    }

    if (window.location.hash === '#recommend' || window.location.hash === '#recommendation') {
      switchMode('recommend');
    }
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#recommend' || window.location.hash === '#recommendation') {
        switchMode('recommend');
      } else {
        switchMode('catalog');
      }
    });

    // Language switcher handler (when i18n changes language)
    document.addEventListener('change', e => {
      if (e.target && e.target.classList.contains('lang-select')) {
        currentLanguage = e.target.value;
        renderCropCards(allCrops);
        if (hasRunStandaloneRec) {
          runStandaloneRecommendation();
        }
      }
    });
  }

  let hasRunStandaloneRec = false;

  function switchMode(mode) {
    const catalogSec = document.getElementById('cropCatalogSection');
    const recSec = document.getElementById('cropRecommendationSection');
    const tabCat = document.getElementById('tabCatalogBtn');
    const tabRec = document.getElementById('tabRecommendBtn');

    if (mode === 'recommend') {
      if (catalogSec) catalogSec.style.display = 'none';
      if (recSec) recSec.style.display = 'block';
      if (tabCat) tabCat.classList.remove('active');
      if (tabRec) tabRec.classList.add('active');
      if (window.location.hash !== '#recommend') {
        history.replaceState(null, '', '#recommend');
      }
      if (!hasRunStandaloneRec) {
        runStandaloneRecommendation();
      }
    } else {
      if (catalogSec) catalogSec.style.display = 'block';
      if (recSec) recSec.style.display = 'none';
      if (tabCat) tabCat.classList.add('active');
      if (tabRec) tabRec.classList.remove('active');
      if (window.location.hash === '#recommend') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }

  async function runStandaloneRecommendation() {
    hasRunStandaloneRec = true;
    const season = document.getElementById('standaloneRecSeason')?.value || 'Kharif';
    const soilType = document.getElementById('standaloneRecSoil')?.value || 'Black Soil';
    const waterAvailability = document.getElementById('standaloneRecWater')?.value || 'Medium';
    const district = document.getElementById('standaloneRecDistrict')?.value.trim() || 'Maharashtra';

    const loadingEl = document.getElementById('standaloneRecLoading');
    const emptyEl = document.getElementById('standaloneRecEmpty');
    const gridEl = document.getElementById('standaloneRecResultsGrid');

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) {
      gridEl.style.display = 'none';
      gridEl.innerHTML = '';
    }

    try {
      const activeLang = (currentLanguage || localStorage.getItem('sks_language') || localStorage.getItem('preferred_language') || 'EN').toUpperCase();
      const payload = {
        season,
        soilType,
        waterAvailability,
        district,
        language: activeLang
      };

      const res = await Api.post('/api/v1/advisory/recommend-crops', payload);
      if (loadingEl) loadingEl.style.display = 'none';

      if (res && res.success && res.data) {
        const crops = res.data;
        if (!crops || crops.length === 0) {
          if (emptyEl) emptyEl.style.display = 'block';
          return;
        }

        if (gridEl) {
          gridEl.innerHTML = crops.map(c => `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="rec-result-card">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h5 class="fw-bold text-success mb-0">${Utils.escapeHtml(getLocalizedName(c, currentLanguage))}</h5>
                    <div class="small text-muted">${Utils.escapeHtml(getSecondaryNames(c, currentLanguage))}</div>
                  </div>
                  <span class="rec-match-score flex-shrink-0">
                    <i class="bi bi-patch-check-fill me-1"></i> ${c.matchPercentage}%
                  </span>
                </div>
                <p class="text-dark small flex-grow-1 mb-3">${Utils.escapeHtml(c.recommendationReason)}</p>
                <div class="bg-light p-2 rounded mb-3 small text-muted">
                  <div class="d-flex justify-content-between mb-1">
                    <span><strong>Category:</strong> ${Utils.escapeHtml(c.category)}</span>
                    <span><strong>Season:</strong> ${Utils.escapeHtml(c.suitableSeason)}</span>
                  </div>
                  <div class="text-truncate"><strong>Soil:</strong> ${Utils.escapeHtml(c.soilRequirements || '-')}</div>
                  <div><strong>Water:</strong> ${Utils.escapeHtml(c.waterRequirement || '-')}</div>
                </div>
                <button type="button" class="btn btn-view-crop" onclick="CropApp.openCropModal(${c.cropId})">
                  <i class="bi bi-book-half"></i> Full Cultivation Details
                </button>
              </div>
            </div>
          `).join('');
          gridEl.style.display = 'flex';
        }
      } else {
        if (emptyEl) emptyEl.style.display = 'block';
      }
    } catch (err) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) {
        emptyEl.style.display = 'block';
        const p = emptyEl.querySelector('p');
        if (p) p.textContent = err.message || 'Failed to fetch recommendations.';
      }
    }
  }

  /**
   * Initialization
   */
  function init() {
    checkAuth();
    initEvents();
    loadCrops();
  }

  return {
    init,
    openCropModal,
    loadCrops,
    switchMode,
    runStandaloneRecommendation
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  CropApp.init();
});
