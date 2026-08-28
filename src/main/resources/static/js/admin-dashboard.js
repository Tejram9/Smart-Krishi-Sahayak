/**
 * Smart Krishi Sahayak - Admin Dashboard Controller
 * Handles Management Console: User management, Crop Catalog CRUD, AI Chat Audit, and Chart.js Analytics
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Enforce ADMIN role requirement
  if (!Auth.requireRole('ROLE_ADMIN')) return;

  const profileLoading = document.getElementById('profileLoading');
  const profileContent = document.getElementById('profileContent');
  const logoutBtn = document.getElementById('logoutBtn');

  let queryChartInstance = null;
  let langChartInstance = null;

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  // Tab switching setup
  setupTabs();

  // Load Admin Profile and initial Overview stats
  await loadAdminProfile();
  await loadAnalyticsStats();

  // Setup search & buttons
  setupEventListeners();

  // -------------------------------------------------------------
  // Tab Navigation Logic
  // -------------------------------------------------------------
  function setupTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-pane').forEach(pane => {
          pane.style.display = 'none';
        });

        const activePane = document.getElementById(targetTab);
        if (activePane) {
          activePane.style.display = 'block';
        }

        // Trigger tab-specific loaders
        if (targetTab === 'tab-overview') loadAnalyticsStats();
        if (targetTab === 'tab-users') loadUsers();
        if (targetTab === 'tab-crops') loadCrops();
        if (targetTab === 'tab-chats') loadChatQueries();
      });
    });
  }

  // -------------------------------------------------------------
  // 1. Admin Profile Loader
  // -------------------------------------------------------------
  async function loadAdminProfile() {
    try {
      const response = await Api.get('/api/v1/auth/me');
      if (response && response.success && response.data) {
        renderAdminProfile(response.data);
      }
    } catch (error) {
      console.error('Admin profile error:', error);
    }
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

  // -------------------------------------------------------------
  // 2. Overview & Analytics Stats Loader (Chart.js)
  // -------------------------------------------------------------
  async function loadAnalyticsStats() {
    try {
      const res = await Api.get('/api/v1/admin/analytics/stats');
      if (res && res.success && res.data) {
        const stats = res.data;

        // Render Quick Stat Cards
        const totalFarmersEl = document.getElementById('statTotalFarmers');
        const totalQueriesEl = document.getElementById('statTotalQueries');
        const totalCropsEl = document.getElementById('statTotalCrops');
        const totalAdvisoriesEl = document.getElementById('statTotalAdvisories');

        if (totalFarmersEl) totalFarmersEl.textContent = stats.totalFarmers || 0;
        if (totalQueriesEl) totalQueriesEl.textContent = stats.totalQueriesAnswered || 0;
        if (totalCropsEl) totalCropsEl.textContent = stats.totalCropsManaged || 0;
        if (totalAdvisoriesEl) totalAdvisoriesEl.textContent = stats.totalAdvisoriesPublished || 0;

        // Render Query Trend Chart
        renderQueryTrendChart(stats.recentQueriesPerDay || []);

        // Render Language Distribution Chart
        renderLanguageDistributionChart(stats.languageDistribution || {});
      }
    } catch (err) {
      console.error('Failed to load analytics stats:', err);
    }
  }

  function renderQueryTrendChart(trendData) {
    const ctx = document.getElementById('queryTrendChart');
    if (!ctx) return;

    const labels = trendData.map(d => d.date);
    const counts = trendData.map(d => d.count);

    if (queryChartInstance) {
      queryChartInstance.destroy();
    }

    queryChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Chatbot Inquiries',
          data: counts,
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#2e7d32',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  function renderLanguageDistributionChart(langDist) {
    const ctx = document.getElementById('langDistChart');
    if (!ctx) return;

    const mr = langDist.MR || 0;
    const hi = langDist.HI || 0;
    const en = langDist.EN || 0;

    if (langChartInstance) {
      langChartInstance.destroy();
    }

    langChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Marathi (मराठी)', 'Hindi (हिंदी)', 'English (EN)'],
        datasets: [{
          data: [mr, hi, en],
          backgroundColor: ['#2e7d32', '#f57c00', '#1976d2'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 3. Farmer Users Management Loader
  // -------------------------------------------------------------
  async function loadUsers(searchQuery = '') {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-success me-2"></div>Loading users...</td></tr>`;

    try {
      const url = searchQuery ? `/api/v1/admin/users?search=${encodeURIComponent(searchQuery)}` : '/api/v1/admin/users';
      const res = await Api.get(url);

      if (res && res.success && res.data) {
        const users = res.data;
        if (users.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No users found matching your search.</td></tr>`;
          return;
        }

        tbody.innerHTML = users.map(u => `
          <tr>
            <td><strong>#${u.id}</strong></td>
            <td>
              <div class="fw-semibold">${Utils.escapeHtml(u.fullName || 'Farmer')}</div>
              <small class="text-muted">${Utils.escapeHtml(u.email || '')}</small>
            </td>
            <td>${Utils.escapeHtml(u.mobileNumber || '-')}</td>
            <td><span class="badge bg-light text-dark border">${u.preferredLanguage || 'EN'}</span></td>
            <td>${Utils.escapeHtml((u.district || '') + (u.village ? ', ' + u.village : '')) || 'Maharashtra'}</td>
            <td>${u.landSizeAcres ? u.landSizeAcres + ' Acres' : '-'}</td>
            <td>
              <span class="${u.enabled ? 'status-badge-active' : 'status-badge-disabled'}">
                ${u.enabled ? 'Active' : 'Disabled'}
              </span>
            </td>
            <td>
              <button class="btn btn-sm ${u.enabled ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-user" data-user-id="${u.id}" data-enabled="${u.enabled}">
                ${u.enabled ? '<i class="bi bi-person-x"></i> Disable' : '<i class="bi bi-person-check"></i> Enable'}
              </button>
            </td>
          </tr>
        `).join('');

        // Attach toggle listeners
        document.querySelectorAll('.btn-toggle-user').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const uid = btn.getAttribute('data-user-id');
            await toggleUserActiveStatus(uid);
          });
        });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Failed to load user accounts.</td></tr>`;
    }
  }

  async function toggleUserActiveStatus(userId) {
    try {
      const res = await Api.put(`/api/v1/admin/users/${userId}/toggle-status`, {});
      if (res && res.success) {
        // Refresh users list
        const searchVal = document.getElementById('userSearchInput')?.value || '';
        loadUsers(searchVal);
      }
    } catch (err) {
      alert('Error updating user status: ' + (err.message || 'Unknown error'));
    }
  }

  // -------------------------------------------------------------
  // 4. Crop Catalog Management Loader
  // -------------------------------------------------------------
  async function loadCrops() {
    const tbody = document.getElementById('cropsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-success me-2"></div>Loading crop catalog...</td></tr>`;

    try {
      const res = await Api.get('/api/v1/crops');
      if (res && res.success && res.data) {
        const crops = res.data;
        if (crops.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No crops in catalog. Click "+ Add New Crop" to create one.</td></tr>`;
          return;
        }

        tbody.innerHTML = crops.map(c => `
          <tr>
            <td><strong>#${c.id}</strong></td>
            <td>
              <div class="fw-bold text-success">${Utils.escapeHtml(c.nameEn)}</div>
              <small class="text-muted">${Utils.escapeHtml(c.nameMr || '')} / ${Utils.escapeHtml(c.nameHi || '')}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${Utils.escapeHtml(c.category || 'General')}</span></td>
            <td><span class="badge bg-success-subtle text-success border">${Utils.escapeHtml(c.suitableSeason || 'All')}</span></td>
            <td><small class="text-muted">${Utils.escapeHtml(c.soilRequirements || '-')}</small></td>
            <td><small class="text-muted">${Utils.escapeHtml(c.waterRequirement || '-')}</small></td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-add-guidance" data-crop-id="${c.id}" data-crop-name="${Utils.escapeHtml(c.nameEn)}" title="Add Verified Advisory">
                  <i class="bi bi-journal-plus"></i> Advisory
                </button>
                <button class="btn btn-outline-danger btn-delete-crop" data-crop-id="${c.id}" data-crop-name="${Utils.escapeHtml(c.nameEn)}" title="Delete Crop">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');

        // Attach action handlers
        document.querySelectorAll('.btn-add-guidance').forEach(btn => {
          btn.addEventListener('click', () => {
            const cropId = btn.getAttribute('data-crop-id');
            const cropName = btn.getAttribute('data-crop-name');
            openGuidanceModal(cropId, cropName);
          });
        });

        document.querySelectorAll('.btn-delete-crop').forEach(btn => {
          btn.addEventListener('click', async () => {
            const cropId = btn.getAttribute('data-crop-id');
            const cropName = btn.getAttribute('data-crop-name');
            if (confirm(`Are you sure you want to delete crop "${cropName}" and all associated verified advisories?`)) {
              await deleteCrop(cropId);
            }
          });
        });
      }
    } catch (err) {
      console.error('Failed to load crops:', err);
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load crops.</td></tr>`;
    }
  }

  async function deleteCrop(cropId) {
    try {
      const res = await Api.delete(`/api/v1/admin/crops/${cropId}`);
      if (res && res.success) {
        loadCrops();
        loadAnalyticsStats();
      }
    } catch (err) {
      alert('Error deleting crop: ' + (err.message || 'Unknown error'));
    }
  }

  // -------------------------------------------------------------
  // 5. AI Chat Queries Audit Trail
  // -------------------------------------------------------------
  async function loadChatQueries() {
    const tbody = document.getElementById('chatQueriesTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-success me-2"></div>Loading audit logs...</td></tr>`;

    try {
      const res = await Api.get('/api/v1/admin/chat-queries?limit=50');
      if (res && res.success && res.data) {
        const queries = res.data;
        if (queries.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No chatbot interactions recorded yet.</td></tr>`;
          return;
        }

        tbody.innerHTML = queries.map(q => `
          <tr>
            <td><small class="text-muted">${q.timestamp ? new Date(q.timestamp).toLocaleString() : '-'}</small></td>
            <td>
              <div class="fw-semibold">${Utils.escapeHtml(q.farmerName || 'Farmer')}</div>
              <small class="text-muted">${Utils.escapeHtml(q.farmerMobile || '')}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${q.language || 'EN'}</span></td>
            <td><div class="text-dark fw-medium" style="max-width: 320px;">${Utils.escapeHtml(q.queryText || '')}</div></td>
            <td><div class="text-muted small text-truncate" style="max-width: 380px;">${Utils.escapeHtml(q.aiResponseText || '')}</div></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error('Failed to load chat queries:', err);
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failed to load chat audit logs.</td></tr>`;
    }
  }

  // -------------------------------------------------------------
  // 6. Modals & Event Listeners
  // -------------------------------------------------------------
  function setupEventListeners() {
    // User search
    const userSearchBtn = document.getElementById('userSearchBtn');
    const userSearchInput = document.getElementById('userSearchInput');

    if (userSearchBtn && userSearchInput) {
      userSearchBtn.addEventListener('click', () => loadUsers(userSearchInput.value));
      userSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadUsers(userSearchInput.value);
      });
    }

    // Refresh queries button
    const btnRefreshQueries = document.getElementById('btnRefreshQueries');
    if (btnRefreshQueries) {
      btnRefreshQueries.addEventListener('click', () => loadChatQueries());
    }

    // Add Crop Modal
    const btnOpenAddCropModal = document.getElementById('btnOpenAddCropModal');
    if (btnOpenAddCropModal) {
      btnOpenAddCropModal.addEventListener('click', () => {
        document.getElementById('cropForm').reset();
        document.getElementById('cropFormId').value = '';
        document.getElementById('cropFormError').style.display = 'none';
        const modal = new bootstrap.Modal(document.getElementById('cropModal'));
        modal.show();
      });
    }

    // Save Crop Button
    const btnSaveCrop = document.getElementById('btnSaveCrop');
    if (btnSaveCrop) {
      btnSaveCrop.addEventListener('click', handleSaveCrop);
    }

    // Save Guidance Button
    const btnSaveGuidance = document.getElementById('btnSaveGuidance');
    if (btnSaveGuidance) {
      btnSaveGuidance.addEventListener('click', handleSaveGuidance);
    }
  }

  async function handleSaveCrop() {
    const errEl = document.getElementById('cropFormError');
    errEl.style.display = 'none';

    const payload = {
      nameEn: document.getElementById('cropNameEn').value.trim(),
      nameMr: document.getElementById('cropNameMr').value.trim(),
      nameHi: document.getElementById('cropNameHi').value.trim(),
      category: document.getElementById('cropCategory').value,
      suitableSeason: document.getElementById('cropSeason').value,
      soilRequirements: document.getElementById('cropSoil').value.trim(),
      waterRequirement: document.getElementById('cropWater').value.trim(),
      description: document.getElementById('cropDesc').value.trim()
    };

    if (!payload.nameEn || !payload.nameMr || !payload.nameHi) {
      errEl.textContent = 'Please fill in all multilingual crop names.';
      errEl.style.display = 'block';
      return;
    }

    try {
      const res = await Api.post('/api/v1/admin/crops', payload);
      if (res && res.success) {
        const modalEl = document.getElementById('cropModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadCrops();
        loadAnalyticsStats();
      }
    } catch (err) {
      errEl.textContent = err.message || 'Failed to save crop.';
      errEl.style.display = 'block';
    }
  }

  function openGuidanceModal(cropId, cropName) {
    document.getElementById('guidanceForm').reset();
    document.getElementById('guidanceCropId').value = cropId;
    document.getElementById('guidanceModalTitle').innerHTML = `<i class="bi bi-journal-plus me-2"></i> Add Advisory for ${cropName}`;
    document.getElementById('guidanceFormError').style.display = 'none';
    const modal = new bootstrap.Modal(document.getElementById('guidanceModal'));
    modal.show();
  }

  async function handleSaveGuidance() {
    const errEl = document.getElementById('guidanceFormError');
    errEl.style.display = 'none';

    const cropId = document.getElementById('guidanceCropId').value;
    const payload = {
      title: document.getElementById('guidanceTitle').value.trim(),
      contentBody: document.getElementById('guidanceBody').value.trim(),
      category: document.getElementById('guidanceCategory').value,
      language: document.getElementById('guidanceLanguage').value,
      published: document.getElementById('guidancePublished').checked
    };

    if (!payload.title || !payload.contentBody) {
      errEl.textContent = 'Please fill in title and advisory content.';
      errEl.style.display = 'block';
      return;
    }

    try {
      const res = await Api.post(`/api/v1/admin/crops/${cropId}/guidance`, payload);
      if (res && res.success) {
        const modalEl = document.getElementById('guidanceModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        alert('Verified advisory added successfully!');
        loadAnalyticsStats();
      }
    } catch (err) {
      errEl.textContent = err.message || 'Failed to save advisory.';
      errEl.style.display = 'block';
    }
  }
});
