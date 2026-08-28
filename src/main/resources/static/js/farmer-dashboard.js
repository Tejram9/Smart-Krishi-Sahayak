/**
 * Smart Krishi Sahayak - Farmer Dashboard Controller
 * Handles Farmer Profile, Live Weather Climate Advisory, and Crop Recommendation Assistant
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Enforce FARMER role requirement
  if (!Auth.requireRole('ROLE_FARMER')) return;

  const profileLoading = document.getElementById('profileLoading');
  const profileContent = document.getElementById('profileContent');
  const logoutBtn = document.getElementById('logoutBtn');

  let currentFarmerDistrict = 'Maharashtra';
  let currentFarmerLanguage = localStorage.getItem('sks_lang') || 'EN';

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  // Load Farmer Profile
  await loadFarmerProfile();

  // Load Live Weather Banner
  await loadWeatherAdvisory();

  // Setup Recommendation, Weather, and Disease Modals
  setupRecommendationModule();
  setupWeatherModal();
  setupDiseaseDetectionModule();

  // -------------------------------------------------------------
  // 1. Profile Loader
  // -------------------------------------------------------------
  async function loadFarmerProfile() {
    try {
      const response = await Api.get('/api/v1/farmer/profile');
      if (response && response.success && response.data) {
        const farmer = response.data;
        if (farmer.district) currentFarmerDistrict = farmer.district;
        if (farmer.preferredLanguage) currentFarmerLanguage = farmer.preferredLanguage;
        renderFarmerProfile(farmer);
      } else {
        showProfileError('Failed to fetch farmer profile.');
      }
    } catch (error) {
      console.error('Farmer profile error:', error);
      showProfileError(error.message || 'Unable to load profile.');
    }
  }

  function renderFarmerProfile(farmer) {
    if (profileLoading) profileLoading.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';

    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const mobileEl = document.getElementById('userMobile');
    const emailEl = document.getElementById('userEmail');
    const langEl = document.getElementById('userLang');
    const locEl = document.getElementById('userLocation');
    const landEl = document.getElementById('userLand');
    const cropsEl = document.getElementById('userCrops');
    const soilEl = document.getElementById('userSoil');

    if (avatarEl) avatarEl.textContent = (farmer.fullName || 'F').charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = farmer.fullName || 'Farmer';
    if (mobileEl) mobileEl.textContent = farmer.mobileNumber || 'N/A';
    if (emailEl) emailEl.textContent = farmer.email || 'N/A';
    if (langEl) langEl.textContent = farmer.preferredLanguage || 'EN';

    const locationParts = [farmer.village, farmer.taluka, farmer.district, farmer.state].filter(Boolean);
    if (locEl) locEl.textContent = locationParts.length ? locationParts.join(', ') : 'Not Specified';

    if (landEl) landEl.textContent = farmer.landSizeAcres ? `${farmer.landSizeAcres} Acres` : 'Not Specified';
    if (cropsEl) cropsEl.textContent = farmer.primaryCrops || 'Not Specified';
    if (soilEl) soilEl.textContent = farmer.soilType || 'Not Specified';
  }

  function showProfileError(msg) {
    if (profileLoading) profileLoading.innerHTML = `<div class="alert alert-danger">${Utils.escapeHtml(msg)}</div>`;
  }

  // -------------------------------------------------------------
  // 2. Weather Advisory Loader
  // -------------------------------------------------------------
  async function loadWeatherAdvisory() {
    try {
      const res = await Api.get(`/api/v1/advisory/weather?district=${encodeURIComponent(currentFarmerDistrict)}&language=${currentFarmerLanguage}`);
      if (res && res.success && res.data) {
        const w = res.data;
        const banner = document.getElementById('weatherBannerCard');
        if (banner) {
          banner.style.display = 'block';
          const locEl = document.getElementById('weatherLocation');
          const seasonEl = document.getElementById('weatherSeasonBadge');
          const tempEl = document.getElementById('weatherTempBadge');
          const condEl = document.getElementById('weatherCondition');
          const advEl = document.getElementById('weatherGeneralAdvisory');
          const humEl = document.getElementById('weatherHumidity');
          const rainEl = document.getElementById('weatherRainfall');
          const windEl = document.getElementById('weatherWindSpeed');
          const feelsEl = document.getElementById('weatherFeelsLike');
          const iconEl = document.getElementById('weatherMainIcon');
          const provEl = document.getElementById('weatherProviderBadge');

          if (locEl) locEl.textContent = w.location || 'Maharashtra';
          if (seasonEl) seasonEl.textContent = w.currentSeason || 'Current Season';
          if (tempEl) tempEl.textContent = w.temperature || (w.tempCelsius ? `${w.tempCelsius.toFixed(1)}°C` : '--°C');
          if (condEl) condEl.textContent = w.weatherCondition || 'Normal Conditions';
          if (advEl) advEl.textContent = w.generalAdvisory || '';
          if (humEl) humEl.textContent = w.humidity || (w.humidityPercent ? `${w.humidityPercent}%` : '--%');
          if (rainEl) rainEl.textContent = w.rainfallForecast || (w.precipitationMm !== undefined ? `${w.precipitationMm.toFixed(1)} mm` : '-- mm');
          if (windEl) windEl.textContent = w.windSpeed || (w.windSpeedKmh ? `${w.windSpeedKmh.toFixed(1)} km/h` : '-- km/h');
          if (feelsEl) feelsEl.textContent = w.feelsLikeCelsius !== undefined ? `${w.feelsLikeCelsius.toFixed(1)}°C` : (w.temperature || '--°C');
          if (iconEl && w.weatherIcon) {
            iconEl.className = `bi ${w.weatherIcon} me-2`;
          }
          if (provEl && w.provider) {
            provEl.innerHTML = `<i class="bi bi-broadcast me-1"></i> ${Utils.escapeHtml(w.provider)}`;
          }
        }
      }
    } catch (err) {
      console.warn('Weather advisory warning:', err);
    }
  }

  // -------------------------------------------------------------
  // 3. Crop Recommendation Assistant
  // -------------------------------------------------------------
  function setupRecommendationModule() {
    const btnOpen = document.getElementById('btnOpenRecModal');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('cropRecModal'));
        modal.show();
        // Trigger initial recommendation
        runRecommendation();
      });
    }

    const btnRun = document.getElementById('btnRunRecommendation');
    if (btnRun) {
      btnRun.addEventListener('click', runRecommendation);
    }
  }

  async function runRecommendation() {
    const season = document.getElementById('recSeason')?.value || 'Kharif';
    const soilType = document.getElementById('recSoil')?.value || 'Black Soil';
    const waterAvailability = document.getElementById('recWater')?.value || 'Medium';
    const loadingEl = document.getElementById('recResultsLoading');
    const container = document.getElementById('recResultsContainer');

    if (loadingEl) loadingEl.style.display = 'block';
    if (container) container.innerHTML = '';

    try {
      const payload = {
        season,
        soilType,
        waterAvailability,
        district: currentFarmerDistrict,
        language: currentFarmerLanguage
      };
      const res = await Api.post('/api/v1/advisory/recommend-crops', payload);
      if (loadingEl) loadingEl.style.display = 'none';

      if (res && res.success && res.data) {
        const crops = res.data;
        if (crops.length === 0) {
          container.innerHTML = `<div class="alert alert-warning">No crops found matching these specific conditions.</div>`;
          return;
        }

        container.innerHTML = crops.map(c => `
          <div class="rec-card">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="fw-bold text-success mb-0">${Utils.escapeHtml(c.nameEn)} (${Utils.escapeHtml(c.nameMr || '')} / ${Utils.escapeHtml(c.nameHi || '')})</h5>
              <span class="rec-score-badge"><i class="bi bi-patch-check-fill me-1"></i> ${c.matchPercentage}% Match</span>
            </div>
            <p class="mb-2 text-dark">${Utils.escapeHtml(c.recommendationReason)}</p>
            <div class="d-flex flex-wrap gap-2 small text-muted">
              <span><strong>Category:</strong> ${Utils.escapeHtml(c.category)}</span>
              <span>•</span>
              <span><strong>Water:</strong> ${Utils.escapeHtml(c.waterRequirement || 'Medium')}</span>
              <span>•</span>
              <span><strong>Soil:</strong> ${Utils.escapeHtml(c.soilRequirements || '-')}</span>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (container) container.innerHTML = `<div class="alert alert-danger">${err.message || 'Failed to fetch recommendations.'}</div>`;
    }
  }

  // -------------------------------------------------------------
  // 4. Weather Modal Loader
  // -------------------------------------------------------------
  function setupWeatherModal() {
    const btnOpen = document.getElementById('btnOpenWeatherModal');
    const btnBannerOpen = document.getElementById('btnBannerOpenWeatherModal');

    const openModalHandler = async () => {
      const modalEl = document.getElementById('weatherModal');
      if (!modalEl) return;
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      const detailsEl = document.getElementById('weatherModalDetails');
      detailsEl.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Loading local agricultural forecast...</p></div>`;

      try {
        const res = await Api.get(`/api/v1/advisory/weather?district=${encodeURIComponent(currentFarmerDistrict)}&language=${currentFarmerLanguage}`);
        if (res && res.success && res.data) {
          const w = res.data;
          detailsEl.innerHTML = `
            <div class="card border-0 bg-light mb-4 shadow-sm">
              <div class="card-body p-3">
                <div class="row align-items-center">
                  <div class="col-md-7">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <h4 class="fw-bold text-primary mb-0">${Utils.escapeHtml(w.location)}, ${Utils.escapeHtml(w.state)}</h4>
                      <span class="badge bg-primary">${Utils.escapeHtml(w.currentSeason)}</span>
                    </div>
                    <div class="text-secondary small mb-2"><i class="bi ${w.weatherIcon || 'bi-cloud-sun'} me-1"></i> ${Utils.escapeHtml(w.weatherCondition)}</div>
                    <div class="d-flex flex-wrap gap-3 small text-muted">
                      <span><i class="bi bi-broadcast me-1"></i> ${Utils.escapeHtml(w.provider || 'Live Forecast')}</span>
                      ${w.lastUpdated ? `<span><i class="bi bi-clock me-1"></i> Updated: ${new Date(w.lastUpdated).toLocaleTimeString()}</span>` : ''}
                    </div>
                  </div>
                  <div class="col-md-5 text-md-end mt-3 mt-md-0">
                    <div class="display-5 fw-bold text-dark">${Utils.escapeHtml(w.temperature)}</div>
                    <div class="small text-muted">
                      ${w.minTempCelsius !== undefined && w.maxTempCelsius !== undefined ? `Low: ${w.minTempCelsius.toFixed(1)}°C | High: ${w.maxTempCelsius.toFixed(1)}°C` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Metrics Row -->
            <div class="row g-2 text-center mb-4">
              <div class="col-6 col-md-3">
                <div class="p-2 border rounded bg-white shadow-sm">
                  <div class="small text-muted"><i class="bi bi-droplet-half text-primary me-1"></i> Humidity</div>
                  <div class="fw-bold fs-6 text-dark">${Utils.escapeHtml(w.humidity)}</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-2 border rounded bg-white shadow-sm">
                  <div class="small text-muted"><i class="bi bi-cloud-rain text-info me-1"></i> Rainfall</div>
                  <div class="fw-bold fs-6 text-dark">${Utils.escapeHtml(w.rainfallForecast)}</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-2 border rounded bg-white shadow-sm">
                  <div class="small text-muted"><i class="bi bi-wind text-secondary me-1"></i> Wind</div>
                  <div class="fw-bold fs-6 text-dark">${Utils.escapeHtml(w.windSpeed || '--')} ${w.windDirection ? `(${Utils.escapeHtml(w.windDirection)})` : ''}</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-2 border rounded bg-white shadow-sm">
                  <div class="small text-muted"><i class="bi bi-speedometer2 text-warning me-1"></i> Pressure</div>
                  <div class="fw-bold fs-6 text-dark">${w.pressureHpa ? `${w.pressureHpa.toFixed(0)} hPa` : '1013 hPa'}</div>
                </div>
              </div>
            </div>

            <div class="card border-primary-subtle mb-3 shadow-sm">
              <div class="card-header bg-primary-subtle fw-bold text-primary">
                <i class="bi bi-info-circle me-1"></i> Seasonal Agricultural Advisory
              </div>
              <div class="card-body">
                <p class="mb-0 text-dark">${Utils.escapeHtml(w.generalAdvisory)}</p>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <div class="card border-warning-subtle h-100 shadow-sm">
                  <div class="card-header bg-warning-subtle fw-bold text-warning-emphasis">
                    <i class="bi bi-exclamation-triangle me-1"></i> Active Pest & Disease Risks
                  </div>
                  <ul class="list-group list-group-flush small">
                    ${(w.pestDiseaseAlerts || []).map(p => `<li class="list-group-item">${Utils.escapeHtml(p)}</li>`).join('')}
                  </ul>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card border-success-subtle h-100 shadow-sm">
                  <div class="card-header bg-success-subtle fw-bold text-success">
                    <i class="bi bi-check2-circle me-1"></i> Recommended Field Operations
                  </div>
                  <ul class="list-group list-group-flush small">
                    ${(w.fieldWorkRecommendations || []).map(f => `<li class="list-group-item">${Utils.escapeHtml(f)}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `;
        }
      } catch (err) {
        detailsEl.innerHTML = `<div class="alert alert-danger">${err.message || 'Failed to load weather advisory.'}</div>`;
      }
    };

    if (btnOpen) btnOpen.addEventListener('click', openModalHandler);
    if (btnBannerOpen) btnBannerOpen.addEventListener('click', openModalHandler);
  }

  // -------------------------------------------------------------
  // 5. Plant Disease Detection Module
  // -------------------------------------------------------------
  function setupDiseaseDetectionModule() {
    const btnOpenDiseaseModal = document.getElementById('btnOpenDiseaseModal');
    const btnOpenDiseaseHistory = document.getElementById('btnOpenDiseaseHistory');
    const diseaseScanModalEl = document.getElementById('diseaseScanModal');
    const diseaseHistoryModalEl = document.getElementById('diseaseHistoryModal');
    const diseaseFileInput = document.getElementById('diseaseFileInput');
    const diseaseDropZone = document.getElementById('diseaseDropZone');
    const diseasePreviewContainer = document.getElementById('diseasePreviewContainer');
    const diseaseImagePreview = document.getElementById('diseaseImagePreview');
    const diseaseFileNameDisplay = document.getElementById('diseaseFileNameDisplay');
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    const btnRunDiseaseScan = document.getElementById('btnRunDiseaseScan');
    const diseaseScanLoading = document.getElementById('diseaseScanLoading');
    const diseaseScanResultContainer = document.getElementById('diseaseScanResultContainer');
    const diseaseCropSelect = document.getElementById('diseaseCropSelect');
    const diseaseNotes = document.getElementById('diseaseNotes');

    let diseaseScanModal = null;
    let diseaseHistoryModal = null;
    let selectedFile = null;

    if (diseaseScanModalEl && typeof bootstrap !== 'undefined') {
      diseaseScanModal = new bootstrap.Modal(diseaseScanModalEl);
    }
    if (diseaseHistoryModalEl && typeof bootstrap !== 'undefined') {
      diseaseHistoryModal = new bootstrap.Modal(diseaseHistoryModalEl);
    }

    if (btnOpenDiseaseModal) {
      btnOpenDiseaseModal.addEventListener('click', () => {
        resetDiseaseScanForm();
        if (diseaseScanModal) diseaseScanModal.show();
      });
    }

    if (btnOpenDiseaseHistory) {
      btnOpenDiseaseHistory.addEventListener('click', () => {
        loadDiseaseHistory();
        if (diseaseHistoryModal) diseaseHistoryModal.show();
      });
    }

    // Drop Zone Events
    if (diseaseDropZone && diseaseFileInput) {
      diseaseDropZone.addEventListener('click', () => diseaseFileInput.click());
      
      diseaseDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        diseaseDropZone.classList.add('bg-secondary-subtle');
      });

      diseaseDropZone.addEventListener('dragleave', () => {
        diseaseDropZone.classList.remove('bg-secondary-subtle');
      });

      diseaseDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        diseaseDropZone.classList.remove('bg-secondary-subtle');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleSelectedFile(e.dataTransfer.files[0]);
        }
      });

      diseaseFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleSelectedFile(e.target.files[0]);
        }
      });
    }

    if (btnRemoveImage) {
      btnRemoveImage.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelectedFile();
      });
    }

    function handleSelectedFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size must be less than 10MB.');
        return;
      }

      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (diseaseImagePreview) diseaseImagePreview.src = e.target.result;
        if (diseaseFileNameDisplay) diseaseFileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        if (diseasePreviewContainer) diseasePreviewContainer.style.display = 'block';
        if (diseaseDropZone) diseaseDropZone.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }

    function clearSelectedFile() {
      selectedFile = null;
      if (diseaseFileInput) diseaseFileInput.value = '';
      if (diseaseImagePreview) diseaseImagePreview.src = '#';
      if (diseasePreviewContainer) diseasePreviewContainer.style.display = 'none';
      if (diseaseDropZone) diseaseDropZone.style.display = 'block';
    }

    function resetDiseaseScanForm() {
      clearSelectedFile();
      if (diseaseNotes) diseaseNotes.value = '';
      if (diseaseScanResultContainer) {
        diseaseScanResultContainer.innerHTML = '';
        diseaseScanResultContainer.style.display = 'none';
      }
      if (diseaseScanLoading) diseaseScanLoading.style.display = 'none';
      const form = document.getElementById('diseaseScanForm');
      if (form) form.style.display = 'flex';
    }

    // Run Disease Scan
    if (btnRunDiseaseScan) {
      btnRunDiseaseScan.addEventListener('click', async () => {
        if (!selectedFile) {
          alert('Please choose or drop a leaf image to diagnose.');
          return;
        }

        const cropName = diseaseCropSelect ? diseaseCropSelect.value : 'General Crop';
        const notes = diseaseNotes ? diseaseNotes.value : '';

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('cropName', cropName);
        if (notes) formData.append('notes', notes);

        if (diseaseScanLoading) diseaseScanLoading.style.display = 'block';
        if (diseaseScanResultContainer) diseaseScanResultContainer.style.display = 'none';
        btnRunDiseaseScan.disabled = true;

        try {
          const res = await Api.upload('/api/v1/disease/detect', formData);
          if (res && res.success && res.data) {
            renderDiseaseResult(res.data);
          } else {
            alert(res?.message || 'Failed to analyze leaf image.');
          }
        } catch (error) {
          console.error('Disease scan error:', error);
          alert(error.message || 'Error occurred during disease detection.');
        } finally {
          if (diseaseScanLoading) diseaseScanLoading.style.display = 'none';
          btnRunDiseaseScan.disabled = false;
        }
      });
    }

    function renderDiseaseResult(d) {
      if (!diseaseScanResultContainer) return;

      const severityBadgeClass = d.severity === 'HIGH' ? 'bg-danger text-white' :
                                 d.severity === 'MEDIUM' ? 'bg-warning text-dark' :
                                 d.severity === 'LOW' ? 'bg-info text-dark' : 'bg-success text-white';

      diseaseScanResultContainer.innerHTML = `
        <div class="card border-0 shadow-sm mt-3">
          <div class="card-header bg-danger-subtle d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-danger fw-bold"><i class="bi bi-shield-check me-2"></i> Diagnosis Result</h5>
            <span class="badge ${severityBadgeClass} px-3 py-2 fs-6">Severity: ${Utils.escapeHtml(d.severity)}</span>
          </div>
          <div class="card-body">
            <div class="row align-items-center mb-4">
              <div class="col-md-4 text-center mb-3 mb-md-0">
                <img src="${d.imageUrl}" alt="Diagnosed Leaf" class="img-fluid rounded border shadow-sm" style="max-height: 180px; object-fit: cover;">
                <div class="small text-muted mt-1">Crop: <strong>${Utils.escapeHtml(d.cropName)}</strong></div>
              </div>
              <div class="col-md-8">
                <h4 class="text-dark fw-bold mb-1">${Utils.escapeHtml(d.diseaseName)}</h4>
                <p class="text-secondary small mb-2"><i class="bi bi-bug me-1"></i> <strong>Pathogen:</strong> ${Utils.escapeHtml(d.pathogen || 'N/A')}</p>
                <div class="mb-2">
                  <div class="d-flex justify-content-between small fw-semibold mb-1">
                    <span>Diagnostic Confidence</span>
                    <span class="text-success">${d.confidence}%</span>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-success progress-bar-striped" role="progressbar" style="width: ${d.confidence}%" aria-valuenow="${d.confidence}" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                </div>
                <div class="small text-muted fst-italic">
                  <i class="bi bi-cpu me-1"></i> ${Utils.escapeHtml(d.predictionProvider || 'Rule-Based Agricultural Expert Diagnostic Provider')}
                </div>
              </div>
            </div>

            <div class="card bg-light border-0 mb-3">
              <div class="card-body py-2">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-search text-primary me-1"></i> Observed Symptoms</h6>
                <p class="small text-muted mb-0">${Utils.escapeHtml(d.symptoms)}</p>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <div class="card border-success-subtle h-100">
                  <div class="card-header bg-success-subtle fw-bold text-success">
                    <i class="bi bi-flower1 me-1"></i> Organic & Biological Remedies
                  </div>
                  <div class="card-body small">
                    <p class="mb-0 text-secondary">${Utils.escapeHtml(d.organicRemedies)}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card border-warning-subtle h-100">
                  <div class="card-header bg-warning-subtle fw-bold text-warning-emphasis">
                    <i class="bi bi-capsule me-1"></i> Recommended Fungicide / Treatment
                  </div>
                  <div class="card-body small">
                    <p class="mb-0 text-secondary">${Utils.escapeHtml(d.chemicalRemedies)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card border-info-subtle mb-3">
              <div class="card-header bg-info-subtle fw-bold text-info-emphasis">
                <i class="bi bi-shield-check me-1"></i> Cultural Prevention & Good Agronomic Practices
              </div>
              <div class="card-body small">
                <p class="mb-0 text-secondary">${Utils.escapeHtml(d.preventiveMeasures)}</p>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-3">
              <button type="button" id="btnScanAnotherLeaf" class="btn btn-outline-danger">
                <i class="bi bi-arrow-repeat me-1"></i> Scan Another Leaf
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      diseaseScanResultContainer.style.display = 'block';

      const btnScanAnotherLeaf = document.getElementById('btnScanAnotherLeaf');
      if (btnScanAnotherLeaf) {
        btnScanAnotherLeaf.addEventListener('click', resetDiseaseScanForm);
      }
    }

    // Load History
    async function loadDiseaseHistory() {
      const historyLoading = document.getElementById('diseaseHistoryLoading');
      const historyContainer = document.getElementById('diseaseHistoryContainer');

      if (historyLoading) historyLoading.style.display = 'block';
      if (historyContainer) historyContainer.innerHTML = '';

      try {
        const res = await Api.get('/api/v1/disease/history');
        if (historyLoading) historyLoading.style.display = 'none';

        if (res && res.success && res.data && res.data.length > 0) {
          const list = res.data;
          historyContainer.innerHTML = `
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Leaf</th>
                    <th>Date & Time</th>
                    <th>Crop</th>
                    <th>Identified Disease</th>
                    <th>Severity</th>
                    <th>Confidence</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.map(item => `
                    <tr id="scan-row-${item.id}">
                      <td>
                        <img src="${item.imageUrl}" alt="Leaf" class="rounded border" style="width: 48px; height: 48px; object-fit: cover;">
                      </td>
                      <td class="small text-muted">${new Date(item.detectedAt).toLocaleString()}</td>
                      <td class="fw-semibold">${Utils.escapeHtml(item.cropName)}</td>
                      <td class="text-danger fw-semibold">${Utils.escapeHtml(item.diseaseName)}</td>
                      <td>
                        <span class="badge ${item.severity === 'HIGH' ? 'bg-danger' : item.severity === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success'}">
                          ${Utils.escapeHtml(item.severity)}
                        </span>
                      </td>
                      <td class="text-success fw-bold">${item.confidence}%</td>
                      <td class="text-end">
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary btn-view-history-detail" data-id="${item.id}" title="View Details">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button class="btn btn-outline-danger btn-delete-history-item" data-id="${item.id}" title="Delete Scan">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;

          // View Detail handler
          document.querySelectorAll('.btn-view-history-detail').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const id = e.currentTarget.getAttribute('data-id');
              try {
                const detailRes = await Api.get(`/api/v1/disease/${id}`);
                if (detailRes && detailRes.success && detailRes.data) {
                  if (diseaseHistoryModal) diseaseHistoryModal.hide();
                  resetDiseaseScanForm();
                  renderDiseaseResult(detailRes.data);
                  if (diseaseScanModal) diseaseScanModal.show();
                }
              } catch (err) {
                alert(err.message || 'Failed to load scan details.');
              }
            });
          });

          // Delete Scan handler
          document.querySelectorAll('.btn-delete-history-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const id = e.currentTarget.getAttribute('data-id');
              if (!confirm('Are you sure you want to delete this disease scan record?')) {
                return;
              }
              try {
                const delRes = await Api.delete(`/api/v1/disease/${id}`);
                if (delRes && delRes.success) {
                  const row = document.getElementById(`scan-row-${id}`);
                  if (row) row.remove();
                  // If table is now empty, reload history to show empty state
                  const remainingRows = document.querySelectorAll('#diseaseHistoryContainer tbody tr');
                  if (remainingRows.length === 0) {
                    loadDiseaseHistory();
                  }
                } else {
                  alert(delRes?.message || 'Failed to delete scan record.');
                }
              } catch (err) {
                alert(err.message || 'Failed to delete scan record.');
              }
            });
          });
        } else {
          historyContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
              <i class="bi bi-folder2-open display-4"></i>
              <p class="mt-2 mb-0">No past disease scans found. Click "Scan Leaf Now" to diagnose your first crop leaf!</p>
            </div>
          `;
        }
      } catch (error) {
        if (historyLoading) historyLoading.style.display = 'none';
        if (historyContainer) {
          historyContainer.innerHTML = `<div class="alert alert-danger">${error.message || 'Failed to load scan history.'}</div>`;
        }
      }
    }
  }
});

