/**
 * Smart Krishi Sahayak - Crop Disease & Pest Advisory UI Controller
 * Manages the Guided Flow, Advisory Library, Language Integration, and AI Connector.
 */

const CropDiseaseAdvisoryApp = (() => {
  let currentLanguage = 'EN';
  let activeTab = 'guided';
  let advisoryModalInstance = null;

  // Guided Flow State
  const guidedState = {
    selectedCropId: 'cotton',
    selectedParts: [],
    selectedSymptoms: [],
    customQuery: '',
    results: []
  };

  // Library Filter State
  const filterState = {
    keyword: '',
    cropId: 'all',
    category: 'all',
    affectedPart: 'all'
  };

  const dataModule = (typeof CropDiseaseAdvisoryData !== 'undefined')
    ? CropDiseaseAdvisoryData
    : (typeof window !== 'undefined' ? window.CropDiseaseAdvisoryData : null);

  function getLang() {
    if (typeof I18n !== 'undefined' && I18n.getCurrentLang) {
      return (I18n.getCurrentLang() || 'EN').toUpperCase();
    }
    return currentLanguage || 'EN';
  }

  function getLocalizedText(obj) {
    if (!obj) return '';
    const lang = getLang().toLowerCase();
    return obj[lang] || obj['en'] || Object.values(obj)[0] || '';
  }

  function getLocalizedList(obj) {
    if (!obj) return [];
    const lang = getLang().toLowerCase();
    return obj[lang] || obj['en'] || [];
  }

  function escapeHtml(str) {
    if (typeof Utils !== 'undefined' && Utils.escapeHtml) {
      return Utils.escapeHtml(str);
    }
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Initialize App
   */
  function init() {
    currentLanguage = getLang();

    // Initialize Bootstrap Modal
    const modalEl = document.getElementById('advisoryDetailModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      advisoryModalInstance = new bootstrap.Modal(modalEl);
    }

    setupAuthNav();
    setupTabs();
    setupGuidedFlow();
    setupLibraryFilters();
    setupAiConnector();

    // Language switch listener
    document.addEventListener('change', e => {
      if (e.target && e.target.classList.contains('lang-select')) {
        currentLanguage = e.target.value.toUpperCase();
        setTimeout(renderAll, 120);
      }
    });

    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);

    renderAll();
  }

  function setupAuthNav() {
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('navLoginBtn');
    const isAuth = typeof Auth !== 'undefined' && Auth.isAuthenticated && Auth.isAuthenticated();

    if (logoutBtn) {
      logoutBtn.style.display = isAuth ? 'inline-flex' : 'none';
      logoutBtn.addEventListener('click', () => {
        if (typeof Auth !== 'undefined' && Auth.logout) {
          Auth.logout();
        } else {
          window.location.href = 'login.html';
        }
      });
    }

    if (loginBtn) {
      loginBtn.style.display = isAuth ? 'none' : 'inline-flex';
    }
  }

  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '');
    if (['guided', 'library', 'ai-connector'].includes(hash)) {
      switchTab(hash);
    }
  }

  function setupTabs() {
    const tabBtns = document.querySelectorAll('.advisory-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });
  }

  function switchTab(tabId) {
    activeTab = tabId;
    window.location.hash = tabId;

    document.querySelectorAll('.advisory-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.advisory-tab-content').forEach(section => {
      if (section.id === `tab-${tabId}`) {
        section.classList.remove('d-none');
      } else {
        section.classList.add('d-none');
      }
    });

    if (tabId === 'library') {
      renderLibrary();
    } else if (tabId === 'guided') {
      renderGuidedFlow();
    }
  }

  function renderAll() {
    renderCropSelector();
    renderGuidedFlow();
    renderLibrary();
  }

  // ==========================================
  // GUIDED FLOW IMPLEMENTATION
  // Select Crop -> Select Symptoms -> View Issues -> Management Guidance
  // ==========================================

  function setupGuidedFlow() {
    // Crop Search inside Guided Flow
    const cropSearch = document.getElementById('guidedCropSearch');
    if (cropSearch) {
      cropSearch.addEventListener('input', e => {
        renderCropSelector(e.target.value);
      });
    }

    // Step 2 Buttons
    const btnFindMatches = document.getElementById('btnFindGuidedMatches');
    if (btnFindMatches) {
      btnFindMatches.addEventListener('click', () => {
        collectGuidedInputs();
        runGuidedMatch();
        // Scroll smoothly to Step 3
        const step3El = document.getElementById('guidedStep3');
        if (step3El) step3El.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const btnResetGuided = document.getElementById('btnResetGuided');
    if (btnResetGuided) {
      btnResetGuided.addEventListener('click', () => {
        resetGuidedFlow();
      });
    }
  }

  function renderCropSelector(searchQuery = '') {
    const container = document.getElementById('guidedCropSelector');
    if (!container || !dataModule) return;

    const crops = dataModule.getCropList();
    const q = (searchQuery || '').trim().toLowerCase();

    const filtered = crops.filter(c => {
      if (!q) return true;
      const matchEn = c.name.en.toLowerCase().includes(q);
      const matchMr = c.name.mr.toLowerCase().includes(q);
      const matchHi = c.name.hi.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      return matchEn || matchMr || matchHi || matchCat;
    });

    container.innerHTML = filtered.map(crop => {
      const isSelected = crop.id === guidedState.selectedCropId;
      const cropName = escapeHtml(getLocalizedText(crop.name));
      const cropCategory = escapeHtml(getLocalizedText(crop.categoryLabel));
      const season = escapeHtml(getLocalizedText(crop.seasonLabel));
      const cropIssues = dataModule.getAdvisoriesByCrop(crop.id).length;

      return `
        <div class="crop-select-card ${isSelected ? 'selected' : ''}" data-crop-id="${crop.id}">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="crop-card-icon"><i class="bi ${crop.icon || 'bi-flower1'}"></i></span>
            <span class="badge bg-light text-success fw-semibold border">${cropCategory}</span>
          </div>
          <h5 class="crop-card-title mb-1">${cropName}</h5>
          <div class="crop-card-subtitle text-muted small mb-2"><i class="bi bi-calendar3 me-1"></i>${season}</div>
          <div class="d-flex align-items-center justify-content-between pt-2 border-top">
            <span class="badge bg-success-subtle text-success small">${cropIssues} Known Issues</span>
            <span class="crop-card-radio"><i class="bi ${isSelected ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}"></i></span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to cards
    container.querySelectorAll('.crop-select-card').forEach(card => {
      card.addEventListener('click', () => {
        const cropId = card.getAttribute('data-crop-id');
        selectGuidedCrop(cropId);
      });
    });
  }

  function selectGuidedCrop(cropId) {
    guidedState.selectedCropId = cropId;
    guidedState.selectedParts = [];
    guidedState.selectedSymptoms = [];
    guidedState.results = [];

    renderCropSelector();
    renderSymptomSelector();

    // Update active crop display badge in step 2
    const crop = dataModule.getCropById(cropId);
    const activeBadge = document.getElementById('activeGuidedCropName');
    if (activeBadge && crop) {
      activeBadge.textContent = getLocalizedText(crop.name);
    }

    // Clear step 3 results
    const resultsContainer = document.getElementById('guidedResultsContainer');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-arrow-up-circle fs-3 text-success"></i>
          <p class="mt-2 mb-0" data-i18n="advisory_prompt_select_symptoms">Select observed plant parts and symptoms above, then click "Find Possible Issues".</p>
        </div>
      `;
    }
  }

  function renderSymptomSelector() {
    const partsContainer = document.getElementById('guidedPlantParts');
    const symptomsContainer = document.getElementById('guidedSymptomsList');
    if (!partsContainer || !symptomsContainer || !dataModule) return;

    const cropId = guidedState.selectedCropId;
    const cropAdvisories = dataModule.getAdvisoriesByCrop(cropId);

    // Collect all plant parts relevant for this crop
    const allParts = ['leaves', 'stem', 'fruit', 'root', 'flower', 'whole-plant'];
    const partLabels = {
      leaves: { en: 'Leaves & Foliage', mr: 'पाने व पालवी', hi: 'पत्तियां' },
      stem: { en: 'Stem / Branch / Trunk', mr: 'खोड, फांद्या व कांडी', hi: 'तना व शाखाएं' },
      fruit: { en: 'Fruit / Boll / Grain / Pod', mr: 'फळ, बोंड, शेंग, कणीस', hi: 'फल, गूलर, फली' },
      root: { en: 'Roots / Underground Rhizome', mr: 'मुळे व कंद (गड्डा)', hi: 'जड़ें व कंद' },
      flower: { en: 'Flowers & Buds', mr: 'फुले व पात्या', hi: 'फूल व कलियां' },
      'whole-plant': { en: 'Whole Plant Wilting / Stunting', mr: 'संपूर्ण झाड वाळणे / खुंटणे', hi: 'पूरा पौधा सूखना' }
    };

    partsContainer.innerHTML = allParts.map(part => {
      const isChecked = guidedState.selectedParts.includes(part);
      const label = escapeHtml(getLocalizedText(partLabels[part]));
      return `
        <label class="symptom-chip-label ${isChecked ? 'active' : ''}">
          <input type="checkbox" name="guidedPlantPart" value="${part}" ${isChecked ? 'checked' : ''} class="visually-hidden">
          <span>${label}</span>
        </label>
      `;
    }).join('');

    // Attach listeners to chips
    partsContainer.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => {
        collectGuidedInputs();
      });
    });

    // Extract unique observable symptoms from the crop's advisories
    const symptomOptions = [];
    cropAdvisories.forEach(entry => {
      const topSymptoms = entry.symptoms.en.slice(0, 3);
      topSymptoms.forEach((sEn, idx) => {
        symptomOptions.push({
          en: sEn,
          mr: entry.symptoms.mr[idx] || sEn,
          hi: entry.symptoms.hi[idx] || sEn,
          keyword: entry.symptomKeywords[idx] || entry.symptomKeywords[0] || 'symptom'
        });
      });
    });

    symptomsContainer.innerHTML = symptomOptions.map((symp, i) => {
      const text = escapeHtml(getLocalizedText(symp));
      const kw = escapeHtml(symp.keyword);
      return `
        <div class="col-12 col-md-6">
          <div class="symptom-check-card p-3 rounded-3 border bg-white h-100">
            <div class="form-check">
              <input class="form-check-input guided-symptom-checkbox" type="checkbox" value="${kw}" id="sympCheck_${i}">
              <label class="form-check-label small fw-medium text-dark cursor-pointer" for="sympCheck_${i}">
                ${text}
              </label>
            </div>
          </div>
        </div>
      `;
    }).join('');

    symptomsContainer.querySelectorAll('.guided-symptom-checkbox').forEach(chk => {
      chk.addEventListener('change', collectGuidedInputs);
    });
  }

  function collectGuidedInputs() {
    const partsChecked = Array.from(document.querySelectorAll('input[name="guidedPlantPart"]:checked')).map(el => el.value);
    guidedState.selectedParts = partsChecked;

    document.querySelectorAll('.symptom-chip-label').forEach(lbl => {
      const inp = lbl.querySelector('input');
      if (inp && inp.checked) {
        lbl.classList.add('active');
      } else {
        lbl.classList.remove('active');
      }
    });

    const symptomsChecked = Array.from(document.querySelectorAll('.guided-symptom-checkbox:checked')).map(el => el.value);
    guidedState.selectedSymptoms = symptomsChecked;

    const customInp = document.getElementById('guidedCustomQuery');
    guidedState.customQuery = customInp ? customInp.value : '';
  }

  function runGuidedMatch() {
    if (!dataModule) return;

    collectGuidedInputs();

    const matches = dataModule.matchGuidedSymptoms({
      cropId: guidedState.selectedCropId,
      affectedParts: guidedState.selectedParts,
      symptomKeywords: guidedState.selectedSymptoms,
      customSymptomQuery: guidedState.customQuery
    });

    guidedState.results = matches;
    renderGuidedResults();
  }

  function renderGuidedResults() {
    const container = document.getElementById('guidedResultsContainer');
    if (!container) return;

    if (!guidedState.results || guidedState.results.length === 0) {
      container.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center gap-3">
          <i class="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
          <div>
            <h6 class="fw-bold mb-1" data-i18n="advisory_no_matches_title">No exact match found based on chosen criteria.</h6>
            <p class="mb-0 small text-muted" data-i18n="advisory_no_matches_desc">Try selecting different plant parts or clearing symptoms. You may also consult your local KVK Agronomist directly.</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h5 class="fw-bold text-dark mb-0">
          <i class="bi bi-search text-success me-2"></i>
          <span>${guidedState.results.length} Potential Issues Found</span>
        </h5>
        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2">
          <i class="bi bi-info-circle me-1"></i> Non-Definitive Decision Support
        </span>
      </div>

      <div class="row g-3">
        ${guidedState.results.map((match, idx) => {
          const entry = match.entry;
          const name = escapeHtml(getLocalizedText(entry.name));
          const sciName = escapeHtml(entry.scientificName);
          const categoryClass = getCategoryBadgeClass(entry.category);
          const categoryLabel = escapeHtml(getLocalizedText(entry.categoryLabel));
          const rationale = escapeHtml(getLocalizedText(match.matchRationale));
          const symptomsList = getLocalizedList(match.matchedSymptoms);

          return `
            <div class="col-12 col-md-6">
              <div class="issue-result-card card h-100 shadow-sm border ${idx === 0 ? 'border-success' : 'border-light-subtle'}">
                <div class="card-header bg-white d-flex align-items-center justify-content-between pt-3 border-0">
                  <span class="badge ${categoryClass} px-2 py-1">${categoryLabel}</span>
                  <span class="badge bg-success text-white fw-bold">${match.matchScore}% Match Score</span>
                </div>
                <div class="card-body pt-1">
                  <h5 class="fw-bold text-dark mb-1">${name}</h5>
                  <div class="text-muted small fst-italic mb-3">${sciName}</div>

                  <div class="p-2 rounded bg-light border mb-3">
                    <div class="small fw-semibold text-secondary mb-1">
                      <i class="bi bi-check2-circle text-success me-1"></i> Based on Selected Symptoms:
                    </div>
                    <p class="small text-secondary mb-0">${rationale}</p>
                  </div>

                  <div class="mb-3">
                    <div class="small fw-bold text-dark mb-1">Observed Indicators:</div>
                    <ul class="list-unstyled small text-muted mb-0">
                      ${symptomsList.slice(0, 2).map(s => `<li><i class="bi bi-dot text-success me-1"></i>${escapeHtml(s)}</li>`).join('')}
                    </ul>
                  </div>

                  <button type="button" class="btn btn-outline-success w-100 fw-semibold d-flex align-items-center justify-content-center gap-2" onclick="CropDiseaseAdvisoryApp.openAdvisoryModal('${entry.id}')">
                    <i class="bi bi-journal-check"></i>
                    <span>View Management Guidance</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function resetGuidedFlow() {
    guidedState.selectedParts = [];
    guidedState.selectedSymptoms = [];
    guidedState.customQuery = '';
    guidedState.results = [];

    const customInp = document.getElementById('guidedCustomQuery');
    if (customInp) customInp.value = '';

    renderCropSelector();
    renderSymptomSelector();

    const resultsContainer = document.getElementById('guidedResultsContainer');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-arrow-up-circle fs-3 text-success"></i>
          <p class="mt-2 mb-0" data-i18n="advisory_prompt_select_symptoms">Select observed plant parts and symptoms above, then click "Find Possible Issues".</p>
        </div>
      `;
    }
  }

  function renderGuidedFlow() {
    renderCropSelector();
    renderSymptomSelector();
  }

  // ==========================================
  // ADVISORY LIBRARY (CATALOG BROWSER)
  // ==========================================

  function setupLibraryFilters() {
    const searchInp = document.getElementById('librarySearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', e => {
        filterState.keyword = e.target.value;
        renderLibrary();
      });
    }

    const cropSelect = document.getElementById('libraryCropFilter');
    if (cropSelect) {
      cropSelect.addEventListener('change', e => {
        filterState.cropId = e.target.value;
        renderLibrary();
      });
    }

    const categorySelect = document.getElementById('libraryCategoryFilter');
    if (categorySelect) {
      categorySelect.addEventListener('change', e => {
        filterState.category = e.target.value;
        renderLibrary();
      });
    }

    const partSelect = document.getElementById('libraryPartFilter');
    if (partSelect) {
      partSelect.addEventListener('change', e => {
        filterState.affectedPart = e.target.value;
        renderLibrary();
      });
    }

    const resetBtn = document.getElementById('btnResetLibraryFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterState.keyword = '';
        filterState.cropId = 'all';
        filterState.category = 'all';
        filterState.affectedPart = 'all';

        if (searchInp) searchInp.value = '';
        if (cropSelect) cropSelect.value = 'all';
        if (categorySelect) categorySelect.value = 'all';
        if (partSelect) partSelect.value = 'all';

        renderLibrary();
      });
    }
  }

  function renderLibrary() {
    const grid = document.getElementById('advisoryLibraryGrid');
    const countBadge = document.getElementById('advisoryCountBadge');
    if (!grid || !dataModule) return;

    // Populate Crop filter dropdown if needed
    const cropSelect = document.getElementById('libraryCropFilter');
    if (cropSelect && cropSelect.children.length <= 1) {
      const crops = dataModule.getCropList();
      crops.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = getLocalizedText(c.name);
        cropSelect.appendChild(opt);
      });
    }

    const filtered = dataModule.filterAdvisories(null, filterState);

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Entries`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5 bg-white rounded-3 border">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <h5 class="mt-3 fw-bold text-dark" data-i18n="advisory_no_entries">No entries matching your filter criteria.</h5>
            <p class="text-muted small" data-i18n="advisory_adjust_filters">Try clearing search terms or changing problem category.</p>
          </div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(entry => {
      const name = escapeHtml(getLocalizedText(entry.name));
      const cropName = escapeHtml(getLocalizedText(entry.cropName));
      const categoryClass = getCategoryBadgeClass(entry.category);
      const categoryLabel = escapeHtml(getLocalizedText(entry.categoryLabel));
      const affectedLabel = escapeHtml(getLocalizedText(entry.affectedPartsLabel));
      const symptoms = getLocalizedList(entry.symptoms);
      const sourceInst = escapeHtml(getLocalizedText(entry.authoritativeSource.institution));

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="advisory-card card h-100 shadow-sm border border-light-subtle">
            <div class="card-header bg-white d-flex align-items-center justify-content-between pt-3 border-0">
              <span class="badge bg-light text-dark border"><i class="bi bi-flower1 text-success me-1"></i>${cropName}</span>
              <span class="badge ${categoryClass}">${categoryLabel}</span>
            </div>
            <div class="card-body pt-1 d-flex flex-column">
              <h5 class="fw-bold text-dark mb-1">${name}</h5>
              <div class="text-muted small fst-italic mb-2">${escapeHtml(entry.scientificName)}</div>

              <div class="mb-2">
                <span class="badge bg-secondary-subtle text-secondary small">
                  <i class="bi bi-bullseye me-1"></i> ${affectedLabel}
                </span>
              </div>

              <p class="text-muted small mb-3 flex-grow-1">
                ${symptoms[0] ? escapeHtml(symptoms[0]) : ''}
              </p>

              <div class="pt-2 border-top mb-3">
                <div class="small text-secondary text-truncate" title="${sourceInst}">
                  <i class="bi bi-shield-check text-success me-1"></i> Source: ${sourceInst}
                </div>
              </div>

              <button type="button" class="btn btn-outline-success btn-sm w-100 fw-semibold mt-auto" onclick="CropDiseaseAdvisoryApp.openAdvisoryModal('${entry.id}')">
                <i class="bi bi-eye-fill me-1"></i> Full Advisory & Package of Practices
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getCategoryBadgeClass(category) {
    switch (category) {
      case 'disease':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'pest':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'deficiency':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      default:
        return 'bg-secondary-subtle text-secondary border';
    }
  }

  // ==========================================
  // DETAIL MODAL (STRUCTURED ENTRY DISPLAY)
  // ==========================================

  function openAdvisoryModal(advisoryId, aiPayload = null) {
    if (!dataModule) return;

    const entry = dataModule.getAdvisoryById(advisoryId);
    if (!entry) return;

    const modalTitle = document.getElementById('modalAdvisoryTitle');
    const modalScientific = document.getElementById('modalAdvisoryScientific');
    const modalCategoryBadge = document.getElementById('modalAdvisoryCategoryBadge');
    const modalCropBadge = document.getElementById('modalAdvisoryCropBadge');

    if (modalTitle) modalTitle.textContent = getLocalizedText(entry.name);
    if (modalScientific) modalScientific.textContent = entry.scientificName || '';

    if (modalCategoryBadge) {
      modalCategoryBadge.className = `badge ${getCategoryBadgeClass(entry.category)} px-3 py-2`;
      modalCategoryBadge.textContent = getLocalizedText(entry.categoryLabel);
    }

    if (modalCropBadge) {
      modalCropBadge.textContent = getLocalizedText(entry.cropName);
    }

    // AI Notice Banner
    const aiBanner = document.getElementById('modalAiNoticeBanner');
    if (aiBanner) {
      if (aiPayload && aiPayload.isAiIdentified) {
        aiBanner.classList.remove('d-none');
        aiBanner.innerHTML = `
          <div class="alert alert-info border border-info-subtle mb-0 d-flex align-items-center gap-3">
            <i class="bi bi-robot fs-2 text-primary"></i>
            <div>
              <div class="fw-bold mb-1">${escapeHtml(aiPayload.matchConfidenceBadge || 'AI Diagnostic Match')}</div>
              <div class="small">${escapeHtml(getLocalizedText(aiPayload.aiNotice))}</div>
            </div>
          </div>
        `;
      } else {
        aiBanner.classList.add('d-none');
      }
    }

    // Symptoms List
    const symptomsList = document.getElementById('modalSymptomsList');
    if (symptomsList) {
      const items = getLocalizedList(entry.symptoms);
      symptomsList.innerHTML = items.map(s => `<li>${escapeHtml(s)}</li>`).join('');
    }

    // Affected Parts
    const affectedPartsEl = document.getElementById('modalAffectedParts');
    if (affectedPartsEl) {
      affectedPartsEl.textContent = getLocalizedText(entry.affectedPartsLabel);
    }

    // Typical Conditions
    const conditionsEl = document.getElementById('modalTypicalConditions');
    if (conditionsEl) {
      conditionsEl.textContent = getLocalizedText(entry.typicalConditions);
    }

    // Prevention / Cultural Practices
    const preventionList = document.getElementById('modalPreventionList');
    if (preventionList) {
      const items = getLocalizedList(entry.prevention);
      preventionList.innerHTML = items.map(p => `<li>${escapeHtml(p)}</li>`).join('');
    }

    // Integrated Management: Cultural
    const mgmtCulturalList = document.getElementById('modalMgmtCulturalList');
    if (mgmtCulturalList && entry.integratedManagement && entry.integratedManagement.cultural) {
      const items = getLocalizedList(entry.integratedManagement.cultural);
      mgmtCulturalList.innerHTML = items.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    }

    // Integrated Management: Biological / Mechanical
    const mgmtBioList = document.getElementById('modalMgmtBioList');
    if (mgmtBioList && entry.integratedManagement && entry.integratedManagement.biologicalMechanical) {
      const items = getLocalizedList(entry.integratedManagement.biologicalMechanical);
      mgmtBioList.innerHTML = items.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    }

    // Integrated Management: Chemical Caution & CIBRC Guidance
    const chemicalCautionEl = document.getElementById('modalMgmtChemicalCaution');
    if (chemicalCautionEl && entry.integratedManagement && entry.integratedManagement.chemicalCautionGuidance) {
      chemicalCautionEl.textContent = getLocalizedText(entry.integratedManagement.chemicalCautionGuidance);
    }

    // Warning signs requiring expert consultation
    const expertSignsList = document.getElementById('modalExpertSignsList');
    if (expertSignsList && entry.expertConsultationSigns) {
      const items = getLocalizedList(entry.expertConsultationSigns);
      expertSignsList.innerHTML = items.map(w => `<li>${escapeHtml(w)}</li>`).join('');
    }

    // Authoritative Source Citation
    const sourceContainer = document.getElementById('modalAuthoritativeSourceContainer');
    if (sourceContainer && entry.authoritativeSource) {
      const inst = escapeHtml(getLocalizedText(entry.authoritativeSource.institution));
      const doc = escapeHtml(getLocalizedText(entry.authoritativeSource.referenceDocument));
      const url = entry.authoritativeSource.portalUrl || '#';
      const portalName = escapeHtml(entry.authoritativeSource.portalName || 'Official Agriculture Portal');

      sourceContainer.innerHTML = `
        <div class="p-3 rounded-3 bg-light border">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <span class="badge bg-success text-white"><i class="bi bi-patch-check-fill me-1"></i> Authoritative Source</span>
            ${url !== '#' ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-success"><i class="bi bi-box-arrow-up-right me-1"></i> ${portalName}</a>` : ''}
          </div>
          <div class="fw-bold text-dark small">${inst}</div>
          <div class="text-muted small">${doc}</div>
        </div>
      `;
    }

    // Safety Notice / Legal Disclaimer
    const safetyNoticeEl = document.getElementById('modalSafetyNoticeText');
    if (safetyNoticeEl && entry.safetyNotice) {
      safetyNoticeEl.textContent = getLocalizedText(entry.safetyNotice);
    }

    if (advisoryModalInstance) {
      advisoryModalInstance.show();
    }
  }

  // ==========================================
  // FUTURE AI READINESS CONNECTOR
  // ==========================================

  function setupAiConnector() {
    const btnSimulateAi = document.getElementById('btnSimulateAiMatch');
    const aiSampleSelect = document.getElementById('aiSamplePredictorSelect');

    if (btnSimulateAi && aiSampleSelect) {
      btnSimulateAi.addEventListener('click', () => {
        const val = aiSampleSelect.value;
        simulateAiDiagnosis(val);
      });
    }
  }

  function simulateAiDiagnosis(sampleKey) {
    if (!dataModule) return;

    let payload = null;

    switch (sampleKey) {
      case 'cotton_bollworm':
        payload = {
          predictedLabel: 'cotton_pink_bollworm',
          cropId: 'cotton',
          confidenceScore: 0.94,
          detectedSymptoms: ['punctured green boll', 'stained lint'],
          notes: 'AI Model detected exit holes and early locule damage in cotton green bolls.'
        };
        break;
      case 'soybean_rust':
        payload = {
          predictedLabel: 'soybean_rust',
          cropId: 'soybean',
          confidenceScore: 0.96,
          detectedSymptoms: ['pustules on lower leaf', 'reddish brown spores'],
          notes: 'AI Model identified volcanic-shaped pustules on lower leaf surface.'
        };
        break;
      case 'pomegranate_telya':
        payload = {
          predictedLabel: 'pomegranate_bacterial_blight',
          cropId: 'pomegranate',
          confidenceScore: 0.92,
          detectedSymptoms: ['oily black spots', 'rind cracking'],
          notes: 'AI Model recognized L-shaped dark lesions on pomegranate rind.'
        };
        break;
      case 'tomato_early_blight':
        payload = {
          predictedLabel: 'tomato_early_blight',
          cropId: 'tomato',
          confidenceScore: 0.95,
          detectedSymptoms: ['target board rings', 'chlorotic yellow halo'],
          notes: 'AI Model classified concentric target board lesions on lower tomato leaves.'
        };
        break;
      default:
        payload = {
          predictedLabel: 'onion_purple_blotch',
          cropId: 'onion',
          confidenceScore: 0.91,
          detectedSymptoms: ['purple sunken lesion', 'chlorotic leaf margin'],
          notes: 'AI Model detected purple lesions on onion foliage.'
        };
    }

    const adapted = dataModule.adaptAiDiagnosticResult(payload);
    if (adapted && adapted.entry) {
      openAdvisoryModal(adapted.entry.id, adapted);
    }
  }

  return {
    init,
    openAdvisoryModal,
    simulateAiDiagnosis,
    selectGuidedCrop,
    runGuidedMatch,
    resetGuidedFlow
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  CropDiseaseAdvisoryApp.init();
});
