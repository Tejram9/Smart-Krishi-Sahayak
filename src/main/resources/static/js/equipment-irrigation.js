/**
 * Smart Krishi Sahayak - Farm Equipment & Irrigation Guide UI Controller
 */

const EquipmentIrrigationApp = (() => {
  let currentLanguage = 'EN';
  let activeTab = 'equipment';
  let activeFlowStep = 1;
  let equipmentModalInstance = null;
  let irrigationModalInstance = null;

  // Cache data from data module
  const data = (typeof EquipmentIrrigationData !== 'undefined') ? EquipmentIrrigationData : (typeof window !== 'undefined' ? window.EquipmentIrrigationData : null);

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

  /**
   * Initialize App
   */
  function init() {
    currentLanguage = getLang();

    // Initialize Bootstrap Modals
    const equipModalEl = document.getElementById('equipmentDetailModal');
    if (equipModalEl && typeof bootstrap !== 'undefined') {
      equipmentModalInstance = new bootstrap.Modal(equipModalEl);
    }

    const irrigModalEl = document.getElementById('irrigationDetailModal');
    if (irrigModalEl && typeof bootstrap !== 'undefined') {
      irrigationModalInstance = new bootstrap.Modal(irrigModalEl);
    }

    // Set up tab listeners
    setupTabNavigation();

    // Set up filter and search listeners
    setupFilters();

    // Set up advisor form
    setupAdvisorForm();

    // Set up auth navbar (Login / Logout buttons)
    setupAuthNav();

    // Listen for language changes from I18n
    document.addEventListener('change', e => {
      if (e.target && e.target.classList.contains('lang-select')) {
        currentLanguage = e.target.value.toUpperCase();
        setTimeout(renderAll, 100);
      }
    });

    // Check URL hash
    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);

    // Initial render
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
    if (['equipment', 'irrigation', 'system-flow', 'advisor'].includes(hash)) {
      switchTab(hash, false);
    }
  }

  function setupTabNavigation() {
    document.querySelectorAll('[data-guide-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-guide-tab');
        switchTab(tab, true);
      });
    });
  }

  function switchTab(tab, updateHash) {
    activeTab = tab;
    if (updateHash) {
      window.location.hash = tab;
    }

    // Update tab button active states
    document.querySelectorAll('[data-guide-tab]').forEach(btn => {
      if (btn.getAttribute('data-guide-tab') === tab) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update section visibility
    document.querySelectorAll('.guide-tab-pane').forEach(pane => {
      if (pane.id === `pane-${tab}`) {
        pane.classList.remove('d-none');
        pane.classList.add('active-pane');
      } else {
        pane.classList.add('d-none');
        pane.classList.remove('active-pane');
      }
    });

    // Scroll to top of tab container
    const mainContainer = document.querySelector('.guide-main-content');
    if (mainContainer) {
      mainContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setupFilters() {
    const searchInput = document.getElementById('equipmentSearchInput');
    const clearBtn = document.getElementById('clearEquipSearchBtn');
    const categorySelect = document.getElementById('equipmentCategoryFilter');
    const sizeSelect = document.getElementById('equipmentSizeFilter');
    const resetBtn = document.getElementById('resetEquipFiltersBtn');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (clearBtn) {
          clearBtn.style.display = searchInput.value ? 'block' : 'none';
        }
        renderEquipmentList();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        renderEquipmentList();
        searchInput.focus();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', renderEquipmentList);
    }

    if (sizeSelect) {
      sizeSelect.addEventListener('change', renderEquipmentList);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        if (categorySelect) categorySelect.value = 'all';
        if (sizeSelect) sizeSelect.value = 'all';
        renderEquipmentList();
      });
    }

    // Irrigation filters
    const irrigSearchInput = document.getElementById('irrigationSearchInput');
    const irrigCategorySelect = document.getElementById('irrigationCategoryFilter');
    if (irrigSearchInput) {
      irrigSearchInput.addEventListener('input', renderIrrigationList);
    }
    if (irrigCategorySelect) {
      irrigCategorySelect.addEventListener('change', renderIrrigationList);
    }
  }

  function renderAll() {
    renderEquipmentList();
    renderIrrigationList();
    renderSystemFlow();
  }

  /**
   * Render Farm Equipment Grid
   */
  function renderEquipmentList() {
    if (!data) return;

    const grid = document.getElementById('equipmentGrid');
    const countBadge = document.getElementById('equipmentCountBadge');
    const emptyState = document.getElementById('equipmentEmptyState');
    const searchInput = document.getElementById('equipmentSearchInput');
    const categorySelect = document.getElementById('equipmentCategoryFilter');
    const sizeSelect = document.getElementById('equipmentSizeFilter');

    if (!grid) return;

    const keyword = searchInput ? searchInput.value : '';
    const category = categorySelect ? categorySelect.value : 'all';
    const size = sizeSelect ? sizeSelect.value : 'all';

    const items = data.filterEquipment(data.EQUIPMENT_LIST, keyword, category, size);

    if (countBadge) {
      const suffix = getLang() === 'MR' ? 'अवजारे' : (getLang() === 'HI' ? 'उपकरण' : 'Equipment');
      countBadge.textContent = `${items.length} ${suffix}`;
    }

    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    grid.innerHTML = items.map(item => {
      const name = getLocalizedText(item.name);
      const purpose = getLocalizedText(item.mainPurpose);
      const crops = getLocalizedList(item.suitableCrops).slice(0, 4).join(', ');
      const bestStage = getLocalizedText(item.bestUseStage);
      const powerSource = getLocalizedText(item.powerSource);

      const exploreBtnText = getLang() === 'MR' ? 'सविस्तर माहिती पहा' : (getLang() === 'HI' ? 'विस्तृत जानकारी देखें' : 'View Full Details');
      const cropsLabel = getLang() === 'MR' ? 'योग्य पिके' : (getLang() === 'HI' ? 'उपयुक्त फसलें' : 'Suitable Crops');
      const stageLabel = getLang() === 'MR' ? 'वापर टप्पा' : (getLang() === 'HI' ? 'उपयोग चरण' : 'Best Stage');

      return `
        <div class="col-12 col-md-6 col-lg-4 d-flex">
          <div class="guide-card w-100 d-flex flex-column">
            <div class="guide-card-header d-flex align-items-center justify-content-between mb-3">
              <div class="guide-card-icon-wrap">
                ${item.image}
              </div>
              <span class="guide-badge-category">${item.category}</span>
            </div>

            <h3 class="guide-card-title mb-1">${Utils.escapeHtml(name)}</h3>
            <span class="guide-card-badge-sub mb-2">${Utils.escapeHtml(item.badge)}</span>

            <p class="guide-card-desc mb-3">${Utils.escapeHtml(purpose)}</p>

            <div class="guide-meta-box mt-auto mb-3">
              <div class="guide-meta-row">
                <span class="guide-meta-label"><i class="bi bi-flower1 text-success"></i> ${cropsLabel}:</span>
                <span class="guide-meta-val text-truncate" title="${Utils.escapeHtml(crops)}">${Utils.escapeHtml(crops)}...</span>
              </div>
              <div class="guide-meta-row">
                <span class="guide-meta-label"><i class="bi bi-calendar-check text-primary"></i> ${stageLabel}:</span>
                <span class="guide-meta-val text-truncate" title="${Utils.escapeHtml(bestStage)}">${Utils.escapeHtml(bestStage)}</span>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between mb-3 px-1">
              <span class="badge bg-light text-success border border-success-subtle small fw-semibold">
                <i class="bi bi-patch-check-fill me-1"></i> ICAR / CIAE Verified
              </span>
              <span class="text-muted small">${item.authoritativeSource ? Utils.escapeHtml(item.authoritativeSource.standardCode || '') : ''}</span>
            </div>

            <button type="button" class="btn btn-custom-outline w-100 d-flex align-items-center justify-content-center gap-2" onclick="EquipmentIrrigationApp.openEquipmentModal('${item.id}')">
              <span>${exploreBtnText}</span>
              <i class="bi bi-arrow-right-short fs-5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Open Equipment Detail Modal
   */
  function openEquipmentModal(equipmentId) {
    if (!data) return;
    const item = data.EQUIPMENT_LIST.find(e => e.id === equipmentId);
    if (!item) return;

    const modalName = document.getElementById('modalEquipName');
    const modalCategory = document.getElementById('modalEquipCategory');
    const modalIcon = document.getElementById('modalEquipIconWrap');
    const modalPurpose = document.getElementById('modalEquipPurpose');
    const modalCrops = document.getElementById('modalEquipCrops');
    const modalStage = document.getElementById('modalEquipStage');
    const modalWorking = document.getElementById('modalEquipWorking');
    const modalSpecsTable = document.getElementById('modalEquipSpecsTable');
    const modalMaintenance = document.getElementById('modalEquipMaintenanceList');
    const modalSafety = document.getElementById('modalEquipSafetyList');
    const modalFarmSize = document.getElementById('modalEquipFarmSize');
    const modalSource = document.getElementById('modalEquipSourceContainer');

    if (modalName) modalName.textContent = getLocalizedText(item.name);
    if (modalCategory) modalCategory.textContent = item.category;
    if (modalIcon) modalIcon.innerHTML = item.image;
    if (modalPurpose) modalPurpose.textContent = getLocalizedText(item.mainPurpose);
    if (modalStage) modalStage.textContent = getLocalizedText(item.bestUseStage);
    if (modalWorking) modalWorking.textContent = getLocalizedText(item.basicWorking);
    if (modalFarmSize) modalFarmSize.textContent = getLocalizedText(item.suitableFarmSize);

    if (modalCrops) {
      const crops = getLocalizedList(item.suitableCrops);
      modalCrops.innerHTML = crops.map(c => `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 me-1 mb-1 rounded-pill">${Utils.escapeHtml(c)}</span>`).join('');
    }

    if (modalSpecsTable) {
      modalSpecsTable.innerHTML = item.keySpecifications.map(spec => `
        <tr>
          <th scope="row" class="text-muted fw-semibold py-2" style="width: 40%;">${Utils.escapeHtml(getLocalizedText(spec.label))}</th>
          <td class="fw-bold text-dark py-2">${Utils.escapeHtml(getLocalizedText(spec.value))}</td>
        </tr>
      `).join('');
    }

    if (modalMaintenance) {
      const maintenanceItems = getLocalizedList(item.maintenance);
      modalMaintenance.innerHTML = maintenanceItems.map(m => `
        <li class="mb-2 d-flex align-items-start gap-2">
          <i class="bi bi-wrench-adjustable text-success mt-1"></i>
          <span>${Utils.escapeHtml(m)}</span>
        </li>
      `).join('');
    }

    if (modalSafety) {
      const safetyItems = getLocalizedList(item.safetyTips);
      modalSafety.innerHTML = safetyItems.map(s => `
        <li class="mb-2 d-flex align-items-start gap-2">
          <i class="bi bi-shield-exclamation text-danger mt-1"></i>
          <span>${Utils.escapeHtml(s)}</span>
        </li>
      `).join('');
    }

    if (modalSource) {
      if (item.authoritativeSource) {
        const inst = getLocalizedText(item.authoritativeSource.institution);
        const ref = getLocalizedText(item.authoritativeSource.referenceDocument);
        const portal = item.authoritativeSource.portalName || '';
        const url = item.authoritativeSource.portalUrl || '';
        const std = item.authoritativeSource.standardCode || '';
        const notice = getLocalizedText(item.unavailableInfoNotice);

        const sourceLabel = getLang() === 'MR' ? 'अधिकृत कृषी व संशोधन स्रोत' : (getLang() === 'HI' ? 'आधिकारिक कृषि एवं शोध स्रोत' : 'Authoritative Agriculture & Research Source');
        const noticeTitle = getLang() === 'MR' ? 'क्षेत्र-विशिष्ट व बदलती माहिती सूचना' : (getLang() === 'HI' ? 'क्षेत्र-विशिष्ट एवं परिवर्तनशील विवरण सूचना' : 'Field-Specific / Site-Dependent Notice');

        modalSource.innerHTML = `
          <div class="p-3 rounded-3 bg-light border mb-3">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <span class="badge bg-success text-white px-2 py-1"><i class="bi bi-patch-check-fill me-1"></i> ${sourceLabel}</span>
              ${std ? `<span class="badge bg-secondary-subtle text-secondary border px-2 py-1">${Utils.escapeHtml(std)}</span>` : ''}
            </div>
            <div class="fw-bold text-dark small mb-1">${Utils.escapeHtml(inst)}</div>
            <div class="text-muted small mb-2">${Utils.escapeHtml(ref)}</div>
            ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-success btn-sm py-1 px-2 small"><i class="bi bi-box-arrow-up-right me-1"></i> ${Utils.escapeHtml(portal)}</a>` : ''}
          </div>

          ${notice ? `
            <div class="alert alert-warning d-flex align-items-start gap-2 p-3 mb-0" role="alert">
              <i class="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0 mt-1"></i>
              <div>
                <strong class="d-block text-dark small mb-1">${noticeTitle}:</strong>
                <span class="small text-secondary">${Utils.escapeHtml(notice)}</span>
              </div>
            </div>
          ` : ''}
        `;
      } else {
        modalSource.innerHTML = '';
      }
    }

    if (equipmentModalInstance) {
      equipmentModalInstance.show();
    }
  }

  /**
   * Render Irrigation Types Guide
   */
  function renderIrrigationList() {
    if (!data) return;

    const grid = document.getElementById('irrigationGrid');
    const searchInput = document.getElementById('irrigationSearchInput');
    const categorySelect = document.getElementById('irrigationCategoryFilter');

    if (!grid) return;

    const keyword = searchInput ? searchInput.value : '';
    const category = categorySelect ? categorySelect.value : 'all';

    const items = data.filterIrrigation(data.IRRIGATION_TYPES, keyword, category);

    grid.innerHTML = items.map(item => {
      const name = getLocalizedText(item.name);
      const howWorks = getLocalizedText(item.howItWorks);
      const crops = getLocalizedList(item.suitableCrops).slice(0, 5).join(', ');
      const soil = getLocalizedText(item.suitableSoil);
      const efficiency = item.waterRequirementEfficiency.efficiencyPercent;
      const saving = item.waterRequirementEfficiency.waterSavingPercent;

      const viewDetailsBtn = getLang() === 'MR' ? 'पूर्ण मार्गदर्शक पहा' : (getLang() === 'HI' ? 'पूरी गाइड देखें' : 'View Full Guide');
      const cropsLabel = getLang() === 'MR' ? 'शिफारस पिके' : (getLang() === 'HI' ? 'उपयुक्त फसलें' : 'Suitable Crops');
      const efficiencyLabel = getLang() === 'MR' ? 'पाणी कार्यक्षमता' : (getLang() === 'HI' ? 'जल दक्षता' : 'Efficiency');
      const subtypesList = getLocalizedList(item.subtypes);
      const subtypesLabel = getLang() === 'MR' ? 'उपकल्पना / प्रकार' : (getLang() === 'HI' ? 'उप-प्रकार / संबंधित' : 'Subtypes / Methods');

      return `
        <div class="col-12 col-lg-6 d-flex">
          <div class="guide-card w-100 d-flex flex-column">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center gap-3">
                <div class="guide-card-icon-wrap icon-wrap-blue">
                  ${item.image}
                </div>
                <div>
                  <h3 class="guide-card-title mb-0">${Utils.escapeHtml(name)}</h3>
                  <span class="guide-card-badge-sub">${Utils.escapeHtml(item.category)}</span>
                </div>
              </div>
              <div class="text-end">
                <span class="badge bg-primary px-3 py-2 rounded-pill fs-7 fw-bold">${efficiency} ${efficiencyLabel}</span>
              </div>
            </div>

            <p class="guide-card-desc mb-3">${Utils.escapeHtml(howWorks)}</p>

            <div class="guide-efficiency-banner mb-3 p-2 rounded bg-light border d-flex align-items-center gap-2">
              <i class="bi bi-droplet-half text-primary fs-5"></i>
              <span class="small fw-semibold text-dark">${Utils.escapeHtml(saving)}</span>
            </div>

            <div class="guide-meta-box mt-auto mb-3">
              ${subtypesList.length > 0 ? `
              <div class="guide-meta-row mb-1">
                <span class="guide-meta-label"><i class="bi bi-diagram-2 text-info"></i> ${subtypesLabel}:</span>
                <span class="guide-meta-val text-truncate" title="${Utils.escapeHtml(subtypesList.join(', '))}">${Utils.escapeHtml(subtypesList.join(', '))}</span>
              </div>
              ` : ''}
              <div class="guide-meta-row mb-1">
                <span class="guide-meta-label"><i class="bi bi-tree text-success"></i> ${cropsLabel}:</span>
                <span class="guide-meta-val text-truncate" title="${Utils.escapeHtml(crops)}">${Utils.escapeHtml(crops)}...</span>
              </div>
              <div class="guide-meta-row">
                <span class="guide-meta-label"><i class="bi bi-layers text-secondary"></i> Soil:</span>
                <span class="guide-meta-val text-truncate" title="${Utils.escapeHtml(soil)}">${Utils.escapeHtml(soil)}</span>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between mb-3 px-1">
              <span class="badge bg-light text-primary border border-primary-subtle small fw-semibold">
                <i class="bi bi-patch-check-fill me-1"></i> PMKSY / ICAR-IARI Verified
              </span>
              <span class="text-muted small">${item.authoritativeSource ? Utils.escapeHtml(item.authoritativeSource.standardCode || '') : ''}</span>
            </div>

            <button type="button" class="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2" onclick="EquipmentIrrigationApp.openIrrigationModal('${item.id}')">
              <span>${viewDetailsBtn}</span>
              <i class="bi bi-arrow-right-circle fs-6"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Open Irrigation Detail Modal
   */
  function openIrrigationModal(irrigationId) {
    if (!data) return;
    const item = data.IRRIGATION_TYPES.find(i => i.id === irrigationId);
    if (!item) return;

    const modalTitle = document.getElementById('modalIrrigTitle');
    const modalBadge = document.getElementById('modalIrrigBadge');
    const modalHowWorks = document.getElementById('modalIrrigHowWorks');
    const modalCrops = document.getElementById('modalIrrigCrops');
    const modalSoil = document.getElementById('modalIrrigSoil');
    const modalEfficiency = document.getElementById('modalIrrigEfficiency');
    const modalAdv = document.getElementById('modalIrrigAdvantages');
    const modalLim = document.getElementById('modalIrrigLimitations');
    const modalComp = document.getElementById('modalIrrigComponents');
    const modalMaint = document.getElementById('modalIrrigMaintenance');
    const modalWhen = document.getElementById('modalIrrigWhen');
    const modalSource = document.getElementById('modalIrrigSourceContainer');

    if (modalTitle) modalTitle.textContent = getLocalizedText(item.name);
    if (modalBadge) modalBadge.textContent = `${item.waterRequirementEfficiency.efficiencyPercent} Efficiency - ${item.category}`;
    if (modalHowWorks) modalHowWorks.textContent = getLocalizedText(item.howItWorks);
    if (modalSoil) modalSoil.textContent = getLocalizedText(item.suitableSoil);
    if (modalWhen) modalWhen.textContent = getLocalizedText(item.whenToChooseIt);

    if (modalEfficiency) {
      modalEfficiency.innerHTML = `
        <div class="row g-2 text-center">
          <div class="col-4">
            <div class="p-2 border rounded bg-white">
              <div class="text-muted small">Application Efficiency</div>
              <div class="fw-bold fs-6 text-primary">${item.waterRequirementEfficiency.efficiencyPercent}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 border rounded bg-white">
              <div class="text-muted small">Water Saving</div>
              <div class="fw-bold fs-6 text-success">${item.waterRequirementEfficiency.waterSavingPercent.split(' ')[0]}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="p-2 border rounded bg-white">
              <div class="text-muted small">Working Pressure</div>
              <div class="fw-bold fs-6 text-dark">${item.waterRequirementEfficiency.operatingPressure.split(' ')[0]}</div>
            </div>
          </div>
        </div>
        <p class="small text-muted mt-2 mb-0">${Utils.escapeHtml(getLocalizedText(item.waterRequirementEfficiency.details))}</p>
      `;
    }

    const modalSubtypes = document.getElementById('modalIrrigSubtypes');
    if (modalSubtypes) {
      const subtypes = getLocalizedList(item.subtypes);
      const subtypesLabel = getLang() === 'MR' ? 'उपकल्पना व संबंधित सिंचन प्रकार' : (getLang() === 'HI' ? 'उप-प्रकार एवं संबंधित सिंचाई विधियां' : 'Subtypes & Related Methods');
      if (subtypes && subtypes.length > 0) {
        modalSubtypes.innerHTML = `
          <div class="p-3 rounded-3 bg-light border mb-4">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-diagram-2 text-primary me-1"></i> ${subtypesLabel}</h6>
            <div class="d-flex flex-wrap gap-2">
              ${subtypes.map(s => `<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-7 fw-semibold"><i class="bi bi-check2-circle me-1"></i>${Utils.escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        `;
      } else {
        modalSubtypes.innerHTML = '';
      }
    }

    if (modalCrops) {
      const crops = getLocalizedList(item.suitableCrops);
      modalCrops.innerHTML = crops.map(c => `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 me-1 mb-1 rounded-pill">${Utils.escapeHtml(c)}</span>`).join('');
    }

    if (modalAdv) {
      const advs = getLocalizedList(item.advantages);
      modalAdv.innerHTML = advs.map(a => `<li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span>${Utils.escapeHtml(a)}</span></li>`).join('');
    }

    if (modalLim) {
      const lims = getLocalizedList(item.limitations);
      modalLim.innerHTML = lims.map(l => `<li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-exclamation-circle-fill text-warning mt-1"></i><span>${Utils.escapeHtml(l)}</span></li>`).join('');
    }

    if (modalComp) {
      modalComp.innerHTML = item.basicComponents.map(comp => `
        <div class="border rounded p-2 mb-2 bg-white">
          <div class="fw-bold text-dark small"><i class="bi bi-gear me-1 text-primary"></i> ${Utils.escapeHtml(getLocalizedText(comp.name))}</div>
          <div class="text-muted small">${Utils.escapeHtml(getLocalizedText(comp.purpose))}</div>
        </div>
      `).join('');
    }

    if (modalMaint) {
      const maints = getLocalizedList(item.maintenance);
      modalMaint.innerHTML = maints.map(m => `<li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-tools text-secondary mt-1"></i><span>${Utils.escapeHtml(m)}</span></li>`).join('');
    }

    if (modalSource) {
      if (item.authoritativeSource) {
        const inst = getLocalizedText(item.authoritativeSource.institution);
        const ref = getLocalizedText(item.authoritativeSource.referenceDocument);
        const portal = item.authoritativeSource.portalName || '';
        const url = item.authoritativeSource.portalUrl || '';
        const std = item.authoritativeSource.standardCode || '';
        const notice = getLocalizedText(item.unavailableInfoNotice);

        const sourceLabel = getLang() === 'MR' ? 'अधिकृत कृषी व संशोधन स्रोत' : (getLang() === 'HI' ? 'आधिकारिक कृषि एवं शोध स्रोत' : 'Authoritative Agriculture & Research Source');
        const noticeTitle = getLang() === 'MR' ? 'क्षेत्र-विशिष्ट व बदलती माहिती सूचना' : (getLang() === 'HI' ? 'क्षेत्र-विशिष्ट एवं परिवर्तनशील विवरण सूचना' : 'Field-Specific / Site-Dependent Notice');

        modalSource.innerHTML = `
          <div class="p-3 rounded-3 bg-light border mb-3">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <span class="badge bg-primary text-white px-2 py-1"><i class="bi bi-patch-check-fill me-1"></i> ${sourceLabel}</span>
              ${std ? `<span class="badge bg-secondary-subtle text-secondary border px-2 py-1">${Utils.escapeHtml(std)}</span>` : ''}
            </div>
            <div class="fw-bold text-dark small mb-1">${Utils.escapeHtml(inst)}</div>
            <div class="text-muted small mb-2">${Utils.escapeHtml(ref)}</div>
            ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm py-1 px-2 small"><i class="bi bi-box-arrow-up-right me-1"></i> ${Utils.escapeHtml(portal)}</a>` : ''}
          </div>

          ${notice ? `
            <div class="alert alert-warning d-flex align-items-start gap-2 p-3 mb-0" role="alert">
              <i class="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0 mt-1"></i>
              <div>
                <strong class="d-block text-dark small mb-1">${noticeTitle}:</strong>
                <span class="small text-secondary">${Utils.escapeHtml(notice)}</span>
              </div>
            </div>
          ` : ''}
        `;
      } else {
        modalSource.innerHTML = '';
      }
    }

    if (irrigationModalInstance) {
      irrigationModalInstance.show();
    }
  }

  /**
   * Render System Flow (7 Steps)
   */
  function renderSystemFlow() {
    if (!data) return;

    const pipelineContainer = document.getElementById('flowPipelineContainer');
    const detailsContainer = document.getElementById('flowDetailCard');

    if (!pipelineContainer || !detailsContainer) return;

    // Render Pipeline Nodes
    pipelineContainer.innerHTML = data.IRRIGATION_SYSTEM_FLOW.map(step => {
      const isActive = step.step === activeFlowStep;
      const title = getLocalizedText(step.title);
      return `
        <div class="flow-step-node ${isActive ? 'active' : ''}" onclick="EquipmentIrrigationApp.selectFlowStep(${step.step})">
          <div class="flow-step-circle">
            <span class="flow-step-num">${step.step}</span>
            <i class="bi ${step.icon}"></i>
          </div>
          <div class="flow-step-title">${Utils.escapeHtml(title)}</div>
        </div>
        ${step.step < 7 ? '<div class="flow-arrow"><i class="bi bi-arrow-right d-none d-md-inline"></i><i class="bi bi-arrow-down d-inline d-md-none"></i></div>' : ''}
      `;
    }).join('');

    // Render active step details
    const activeItem = data.IRRIGATION_SYSTEM_FLOW.find(s => s.step === activeFlowStep) || data.IRRIGATION_SYSTEM_FLOW[0];
    const title = getLocalizedText(activeItem.title);
    const role = getLocalizedText(activeItem.role);
    const explanation = getLocalizedText(activeItem.farmerExplanation);
    const tip = getLocalizedText(activeItem.farmerTip);
    const checks = getLocalizedList(activeItem.keyChecks);

    const tipLabel = getLang() === 'MR' ? 'शेतकरी सल्ला' : (getLang() === 'HI' ? 'किसान उपयोगी टिप' : 'Farmer Practical Tip');
    const checksLabel = getLang() === 'MR' ? 'महत्त्वाच्या तपासण्या' : (getLang() === 'HI' ? 'महत्वपूर्ण जांच' : 'Key Maintenance Checks');

    detailsContainer.innerHTML = `
      <div class="flow-detail-header d-flex align-items-center gap-3 mb-3 border-bottom pb-3">
        <div class="flow-step-circle-lg">
          <span>${activeItem.step}</span>
        </div>
        <div>
          <span class="badge bg-success-subtle text-success border border-success-subtle mb-1">Step ${activeItem.step} of 7</span>
          <h3 class="fw-bold text-dark m-0">${Utils.escapeHtml(title)}</h3>
          <p class="text-muted small m-0">${Utils.escapeHtml(role)}</p>
        </div>
      </div>

      <div class="flow-explanation mb-4">
        <h5 class="fw-bold text-dark"><i class="bi bi-info-circle text-primary me-2"></i>How It Functions:</h5>
        <p class="text-secondary fs-6" style="line-height: 1.7;">${Utils.escapeHtml(explanation)}</p>
      </div>

      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 bg-light border h-100">
            <h6 class="fw-bold text-success mb-2"><i class="bi bi-lightbulb-fill text-warning me-1"></i> ${tipLabel}</h6>
            <p class="small text-secondary m-0">${Utils.escapeHtml(tip)}</p>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 bg-light border h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-check2-square text-success me-1"></i> ${checksLabel}</h6>
            <ul class="list-unstyled small text-secondary m-0">
              ${checks.map(c => `<li class="mb-1"><i class="bi bi-check text-success me-1"></i>${Utils.escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="p-3 rounded-3 bg-light border mt-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
          <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
            <i class="bi bi-patch-check-fill me-1"></i> ${getLang() === 'MR' ? 'अधिकृत अभियांत्रिकी मानक' : (getLang() === 'HI' ? 'आधिकारिक इंजीनियरिंग मानक' : 'Authoritative Engineering Standard')}
          </span>
          <span class="badge bg-secondary-subtle text-secondary border px-2 py-1">BIS IS 13487 / PMKSY</span>
        </div>
        <p class="small text-secondary m-0 mt-1">${Utils.escapeHtml(getLocalizedText(activeItem.unavailableInfoNotice))}</p>
      </div>

      <div class="d-flex justify-content-between mt-4 pt-3 border-top">
        <button type="button" class="btn btn-outline-secondary btn-sm" ${activeItem.step === 1 ? 'disabled' : ''} onclick="EquipmentIrrigationApp.selectFlowStep(${activeItem.step - 1})">
          <i class="bi bi-chevron-left"></i> Previous Step
        </button>
        <span class="text-muted small align-self-center">Component ${activeItem.step} of 7</span>
        <button type="button" class="btn btn-custom-primary btn-sm" ${activeItem.step === 7 ? 'disabled' : ''} onclick="EquipmentIrrigationApp.selectFlowStep(${activeItem.step + 1})">
          Next Step <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;
  }

  function selectFlowStep(stepNum) {
    if (stepNum < 1 || stepNum > 7) return;
    activeFlowStep = stepNum;
    renderSystemFlow();
  }

  /**
   * "Which One Should I Choose?" Advisor
   */
  function setupAdvisorForm() {
    const form = document.getElementById('advisorForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const cropType = document.getElementById('advisorCropSelect').value;
      const soilType = document.getElementById('advisorSoilSelect').value;
      const waterAvailability = document.getElementById('advisorWaterSelect').value;
      const farmSize = document.getElementById('advisorSizeSelect').value;

      const result = data.calculateRecommendation({
        cropType,
        soilType,
        waterAvailability,
        farmSize
      });

      renderAdvisorResult(result);
    });
  }

  function renderAdvisorResult(result) {
    const resultContainer = document.getElementById('advisorResultContainer');
    if (!resultContainer) return;

    resultContainer.classList.remove('d-none');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const irrigName = getLocalizedText(result.primaryIrrigationName);
    const savingNote = getLocalizedText(result.waterSavingNote);
    const rationale = getLocalizedText(result.rationale);
    const subsidy = getLocalizedText(result.subsidyGuidance);
    const practicalTips = getLocalizedList(result.practicalTips);

    const matchLabel = getLang() === 'MR' ? 'सर्वोत्तम शिफारस केलेले सिंचन' : (getLang() === 'HI' ? 'सर्वोत्तम अनुशंसित सिंचाई' : 'Top Recommended Irrigation');
    const equipLabel = getLang() === 'MR' ? 'जमिनीच्या आकारानुसार आवश्यक कृषी यंत्रे' : (getLang() === 'HI' ? 'खेत के आकार हेतु उपयुक्त कृषि उपकरण' : 'Recommended Equipment for Your Farm Size');
    const subsidyLabel = getLang() === 'MR' ? 'सरकारी अनुदान व मदत' : (getLang() === 'HI' ? 'सरकारी सब्सिडी व सहायता' : 'Government Subsidy Support');

    resultContainer.innerHTML = `
      <div class="card border-success border-2 shadow-sm rounded-4 overflow-hidden">
        <div class="card-header bg-success text-white py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <span class="badge bg-white text-success fw-bold px-2 py-1 mb-1">Tailored Result</span>
            <h4 class="m-0 fw-bold"><i class="bi bi-patch-check-fill me-2"></i> ${matchLabel}: ${Utils.escapeHtml(irrigName)}</h4>
          </div>
          <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6 fw-bold">${Utils.escapeHtml(result.efficiencyBadge)}</span>
        </div>

        <div class="card-body p-4">
          <div class="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <i class="bi bi-droplet-half fs-4"></i>
            <div><strong>Water Saving:</strong> ${Utils.escapeHtml(savingNote)}</div>
          </div>

          <h5 class="fw-bold text-dark mb-2"><i class="bi bi-lightbulb-fill text-success me-2"></i>Why This Fits Your Farm:</h5>
          <p class="text-secondary fs-6 mb-4" style="line-height: 1.7;">${Utils.escapeHtml(rationale)}</p>

          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-gear-fill text-primary me-2"></i>${equipLabel}:</h5>
          <div class="row g-3 mb-4">
            ${result.recommendedEquipment.map(eq => `
              <div class="col-12 col-md-6 col-lg-3">
                <div class="p-3 border rounded-3 bg-light h-100">
                  <div class="fw-bold text-dark mb-1"><i class="bi bi-check2-circle text-success me-1"></i> ${Utils.escapeHtml(getLocalizedText(eq.name))}</div>
                  <div class="small text-muted">${Utils.escapeHtml(getLocalizedText(eq.note))}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="p-3 rounded-3 bg-warning-subtle border border-warning-subtle mb-4">
            <h6 class="fw-bold text-dark mb-1"><i class="bi bi-bank text-primary me-2"></i>${subsidyLabel}:</h6>
            <p class="small text-dark m-0" style="line-height: 1.6;">${Utils.escapeHtml(subsidy)}</p>
          </div>

          <h6 class="fw-bold text-dark mb-2">Practical Action Items:</h6>
          <ul class="small text-secondary ps-3 mb-0">
            ${practicalTips.map(tip => `<li class="mb-1">${Utils.escapeHtml(tip)}</li>`).join('')}
          </ul>

          ${result.authoritativeSource ? `
            <div class="p-3 rounded-3 bg-light border mt-4">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                <span class="badge bg-success text-white px-2 py-1"><i class="bi bi-patch-check-fill me-1"></i> ${getLang() === 'MR' ? 'अधिकृत स्रोत' : (getLang() === 'HI' ? 'आधिकारिक स्रोत' : 'Authoritative Source')}</span>
                <span class="badge bg-secondary-subtle text-secondary border px-2 py-1">${Utils.escapeHtml(result.authoritativeSource.standardCode || '')}</span>
              </div>
              <div class="fw-bold text-dark small">${Utils.escapeHtml(getLocalizedText(result.authoritativeSource.institution))}</div>
              <div class="text-muted small mb-2">${Utils.escapeHtml(getLocalizedText(result.authoritativeSource.referenceDocument))}</div>
              <a href="${result.authoritativeSource.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-success btn-sm py-1 px-2 small"><i class="bi bi-box-arrow-up-right me-1"></i> ${Utils.escapeHtml(result.authoritativeSource.portalName || 'Government Portal')}</a>
            </div>
          ` : ''}

          ${result.unavailableInfoNotice ? `
            <div class="alert alert-warning d-flex align-items-start gap-2 p-3 mt-3 mb-0" role="alert">
              <i class="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0 mt-1"></i>
              <div>
                <strong class="d-block text-dark small mb-1">${getLang() === 'MR' ? 'क्षेत्र-विशिष्ट माहिती सूचना' : (getLang() === 'HI' ? 'क्षेत्र-विशिष्ट जानकारी सूचना' : 'Field-Specific / Policy Notice')}:</strong>
                <span class="small text-secondary">${Utils.escapeHtml(getLocalizedText(result.unavailableInfoNotice))}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  return {
    init,
    switchTab,
    openEquipmentModal,
    openIrrigationModal,
    selectFlowStep
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  EquipmentIrrigationApp.init();
});
