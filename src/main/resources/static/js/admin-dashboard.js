/**
 * Smart Krishi Sahayak - Admin Dashboard Controller
 * Handles Management Console:
 * - Real-time Database Analytics with Chart.js
 * - Farmer User Management (Status toggle, Search)
 * - Multilingual Crop Catalog CRUD & Verified Advisories
 * - AI Chatbot Audit Trail
 * - Farmer Support Tickets / Reports Review & Status Updates
 * - User Login & Session Activity Trail with Timeout & Duration Tracking
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Enforce ADMIN role requirement
  if (!Auth.requireRole('ROLE_ADMIN')) return;

  const profileLoading = document.getElementById('profileLoading');
  const profileContent = document.getElementById('profileContent');
  const logoutBtn = document.getElementById('logoutBtn');

  // Chart instances
  let dailyActivityChartInstance = null;
  let queryChartInstance = null;
  let reportStatusChartInstance = null;
  let reportCategoryChartInstance = null;
  let langChartInstance = null;

  // Cached data
  let cachedReports = [];

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  // Setup tabs and event listeners
  setupTabs();
  setupEventListeners();

  // Load Admin Profile and initial Overview analytics
  await loadAdminProfile();
  await loadAnalyticsStats();

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
        if (targetTab === 'tab-reports') loadReports();
        if (targetTab === 'tab-activity') loadLoginActivities();
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
  // 2. Overview & Analytics Stats Loader (Detailed Analytics)
  // -------------------------------------------------------------
  async function loadAnalyticsStats() {
    try {
      const res = await Api.get('/api/v1/admin/analytics/detailed');
      if (res && res.success && res.data) {
        const stats = res.data;

        // Render Quick Stat Cards
        const totalFarmersEl = document.getElementById('statTotalFarmers');
        const totalQueriesEl = document.getElementById('statTotalQueries');
        const totalCropsEl = document.getElementById('statTotalCrops');
        const totalAdvisoriesEl = document.getElementById('statTotalAdvisories');
        const totalLoginsTodayEl = document.getElementById('statTotalLoginsToday');
        const activeSessionsEl = document.getElementById('statActiveSessions');
        const totalReportsEl = document.getElementById('statTotalReports');
        const pendingReportsEl = document.getElementById('statPendingReports');

        if (totalFarmersEl) totalFarmersEl.textContent = stats.totalFarmers || 0;
        if (totalQueriesEl) totalQueriesEl.textContent = stats.totalQueriesAnswered || 0;
        if (totalCropsEl) totalCropsEl.textContent = stats.totalCropsManaged || 0;
        if (totalAdvisoriesEl) totalAdvisoriesEl.textContent = stats.totalAdvisoriesPublished || 0;
        if (totalLoginsTodayEl) totalLoginsTodayEl.textContent = stats.totalLoginsToday || 0;
        if (activeSessionsEl) activeSessionsEl.textContent = stats.activeSessionsToday || 0;
        if (totalReportsEl) totalReportsEl.textContent = stats.totalReports || 0;
        if (pendingReportsEl) pendingReportsEl.textContent = stats.pendingReports || 0;

        // Render Visual Charts
        renderDailyActivityChart(stats.dailyLogins || [], stats.dailyRegistrations || []);
        renderQueryTrendChart(stats.dailyQueries || []);
        renderReportStatusChart(stats.reportStatusDistribution || {});
        renderReportCategoryChart(stats.reportCategoryDistribution || {});
        renderLanguageDistributionChart(stats.languageDistribution || {});
      }
    } catch (err) {
      console.error('Failed to load detailed analytics stats:', err);
    }
  }

  // CHART 1: Daily Logins & Farmer Registrations (Past 7 Days)
  function renderDailyActivityChart(dailyLogins, dailyRegistrations) {
    const ctx = document.getElementById('dailyActivityChart');
    if (!ctx) return;

    const dateMap = {};
    dailyLogins.forEach(d => { dateMap[d.date] = { logins: d.count, regs: 0 }; });
    dailyRegistrations.forEach(d => {
      if (!dateMap[d.date]) dateMap[d.date] = { logins: 0, regs: 0 };
      dateMap[d.date].regs = d.count;
    });

    const dates = Object.keys(dateMap).sort();
    const loginCounts = dates.map(d => dateMap[d].logins);
    const regCounts = dates.map(d => dateMap[d].regs);

    if (dailyActivityChartInstance) {
      dailyActivityChartInstance.destroy();
    }

    dailyActivityChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates.length ? dates : ['Past 7 Days'],
        datasets: [
          {
            label: 'Daily Logins',
            data: loginCounts.length ? loginCounts : [0],
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#1976d2',
            pointRadius: 4
          },
          {
            label: 'New Registrations',
            data: regCounts.length ? regCounts : [0],
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#2e7d32',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
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

  // CHART 2: Chatbot Inquiries Trend (Past 7 Days)
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
        labels: labels.length ? labels : ['Past 7 Days'],
        datasets: [{
          label: 'Daily Chatbot Inquiries',
          data: counts.length ? counts : [0],
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

  // CHART 3: Support Report / Complaint Status Distribution
  function renderReportStatusChart(dist) {
    const ctx = document.getElementById('reportStatusChart');
    if (!ctx) return;

    const pending = dist.PENDING || 0;
    const inProgress = dist.IN_PROGRESS || 0;
    const resolved = dist.RESOLVED || 0;
    const rejected = dist.REJECTED || 0;

    if (reportStatusChartInstance) {
      reportStatusChartInstance.destroy();
    }

    reportStatusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
        datasets: [{
          data: [pending, inProgress, resolved, rejected],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#9ca3af'],
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

  // CHART 4: Support Reports by Category
  function renderReportCategoryChart(dist) {
    const ctx = document.getElementById('reportCategoryChart');
    if (!ctx) return;

    const labels = ['Bug Report', 'Feature Req', 'Account', 'Crop Data', 'Other'];
    const data = [
      dist.BUG || 0,
      dist.FEATURE_REQUEST || 0,
      dist.ACCOUNT_ISSUE || 0,
      dist.CROP_DATA_ERROR || 0,
      dist.OTHER || 0
    ];

    if (reportCategoryChartInstance) {
      reportCategoryChartInstance.destroy();
    }

    reportCategoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tickets',
          data: data,
          backgroundColor: ['#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280'],
          borderRadius: 6
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

  // CHART 5: User Language Distribution
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
          btn.addEventListener('click', async () => {
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
  // 6. User Reports & Complaints Management
  // -------------------------------------------------------------
  async function loadReports() {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-success me-2"></div>Loading support tickets...</td></tr>`;

    const statusVal = document.getElementById('filterReportStatus')?.value || '';
    const catVal = document.getElementById('filterReportCategory')?.value || '';

    let url = '/api/v1/admin/reports?';
    if (statusVal) url += `status=${encodeURIComponent(statusVal)}&`;
    if (catVal) url += `category=${encodeURIComponent(catVal)}&`;

    try {
      const res = await Api.get(url);
      if (res && res.success && res.data) {
        cachedReports = res.data;
        if (cachedReports.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No support tickets found matching the selected filters.</td></tr>`;
          return;
        }

        tbody.innerHTML = cachedReports.map(r => {
          const statusClass = 'status-badge-' + (r.status || 'pending').toLowerCase().replace('_', '-');
          return `
            <tr>
              <td><span class="badge bg-dark">${Utils.escapeHtml(r.ticketNumber || '#' + r.id)}</span></td>
              <td>
                <div class="fw-semibold">${Utils.escapeHtml(r.userName || 'Farmer')}</div>
                <small class="text-muted">${Utils.escapeHtml(r.userMobile || '-')}</small>
              </td>
              <td><span class="badge bg-light text-dark border">${Utils.escapeHtml(r.category || 'OTHER')}</span></td>
              <td>
                <div class="fw-semibold text-truncate" style="max-width: 250px;">${Utils.escapeHtml(r.title || '')}</div>
                <small class="text-muted text-truncate d-block" style="max-width: 280px;">${Utils.escapeHtml(r.description || '')}</small>
              </td>
              <td><small class="text-muted">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</small></td>
              <td><span class="${statusClass}">${Utils.escapeHtml(r.status || 'PENDING')}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary btn-review-report" data-report-id="${r.id}">
                  <i class="bi bi-pencil-square me-1"></i> Review
                </button>
              </td>
            </tr>
          `;
        }).join('');

        document.querySelectorAll('.btn-review-report').forEach(btn => {
          btn.addEventListener('click', () => {
            const rid = parseInt(btn.getAttribute('data-report-id'), 10);
            const report = cachedReports.find(x => x.id === rid);
            if (report) openReportReviewModal(report);
          });
        });
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load reports.</td></tr>`;
    }
  }

  function openReportReviewModal(report) {
    document.getElementById('reviewReportId').value = report.id;
    document.getElementById('modalTicketNum').textContent = report.ticketNumber || ('#' + report.id);
    document.getElementById('modalFarmerName').textContent = report.userName || 'Farmer';
    document.getElementById('modalFarmerMobile').textContent = report.userMobile ? `(${report.userMobile})` : '';
    document.getElementById('modalCategoryBadge').textContent = report.category || 'OTHER';
    document.getElementById('modalCreatedAt').textContent = report.createdAt ? new Date(report.createdAt).toLocaleString() : '-';
    document.getElementById('modalTitle').textContent = report.title || '-';
    document.getElementById('modalDesc').textContent = report.description || '-';

    document.getElementById('reviewStatus').value = report.status || 'PENDING';
    document.getElementById('reviewRemarks').value = report.adminRemarks || '';
    document.getElementById('reportReviewError').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('reportReviewModal'));
    modal.show();
  }

  async function handleSaveReportReview() {
    const errEl = document.getElementById('reportReviewError');
    errEl.style.display = 'none';
    const reportId = document.getElementById('reviewReportId').value;
    const status = document.getElementById('reviewStatus').value;
    const adminRemarks = document.getElementById('reviewRemarks').value.trim();

    if (!adminRemarks) {
      errEl.textContent = 'Please enter admin remarks or resolution details for the farmer.';
      errEl.style.display = 'block';
      return;
    }

    try {
      const res = await Api.put(`/api/v1/admin/reports/${reportId}`, {
        status: status,
        adminRemarks: adminRemarks
      });
      if (res && res.success) {
        const modalEl = document.getElementById('reportReviewModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadReports();
        loadAnalyticsStats();
      }
    } catch (err) {
      errEl.textContent = err.message || 'Failed to update report status.';
      errEl.style.display = 'block';
    }
  }

  // -------------------------------------------------------------
  // 7. Login & Session Activity Trail
  // -------------------------------------------------------------
  async function loadLoginActivities() {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-success me-2"></div>Loading session activities...</td></tr>`;

    const range = document.getElementById('filterActivityRange')?.value || 'today';
    const role = document.getElementById('filterActivityRole')?.value || '';
    const search = document.getElementById('activitySearchInput')?.value.trim() || '';

    let url = `/api/v1/admin/login-activities?timeRange=${encodeURIComponent(range)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    try {
      const res = await Api.get(url);
      if (res && res.success && res.data) {
        const activities = res.data;
        if (activities.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No login activities recorded for the selected criteria.</td></tr>`;
          return;
        }

        tbody.innerHTML = activities.map(a => {
          const roleClass = a.role === 'ROLE_ADMIN' ? 'role-badge-admin' : 'role-badge-farmer';
          const statusClass = 'status-badge-' + (a.sessionStatus || 'active').toLowerCase().replace('_', '-');

          let durationText = '-';
          if (a.sessionStatus === 'ACTIVE') {
            durationText = '<span class="text-success fw-semibold"><i class="bi bi-broadcast"></i> Active Now</span>';
          } else if (a.sessionDurationSeconds !== null && a.sessionDurationSeconds !== undefined) {
            durationText = formatSeconds(a.sessionDurationSeconds);
          }

          const deviceBrief = simplifyUserAgent(a.userAgent);

          return `
            <tr>
              <td><strong>#${a.id}</strong></td>
              <td>
                <div class="fw-semibold">${Utils.escapeHtml(a.userName || 'User')}</div>
                <small class="text-muted">${Utils.escapeHtml(a.userMobile || '-')}</small>
              </td>
              <td><span class="role-badge ${roleClass}">${Utils.escapeHtml(a.role ? a.role.replace('ROLE_', '') : 'USER')}</span></td>
              <td><code>${Utils.escapeHtml(a.ipAddress || '-')}</code></td>
              <td><span title="${Utils.escapeHtml(a.userAgent || '')}">${Utils.escapeHtml(deviceBrief)}</span></td>
              <td><small>${a.loginTime ? new Date(a.loginTime).toLocaleString() : '-'}</small></td>
              <td><small>${a.logoutTime ? new Date(a.logoutTime).toLocaleString() : (a.sessionStatus === 'ACTIVE' ? '<em>In Session</em>' : '-')}</small></td>
              <td>${durationText}</td>
              <td><span class="${statusClass}">${Utils.escapeHtml(a.sessionStatus || 'ACTIVE')}</span></td>
            </tr>
          `;
        }).join('');
      }
    } catch (err) {
      console.error('Failed to load login activities:', err);
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">Failed to load login activity trail.</td></tr>`;
    }
  }

  function formatSeconds(secs) {
    if (secs < 60) return secs + 's';
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remainingSecs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }

  function simplifyUserAgent(ua) {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Edg/')) return 'Edge Browser';
    if (ua.includes('Chrome/')) return 'Chrome Browser';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('Mobile')) return 'Mobile Browser';
    return ua.length > 25 ? ua.substring(0, 25) + '...' : ua;
  }

  // -------------------------------------------------------------
  // 8. Modals & Event Listeners
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

    // Refresh chat queries
    const btnRefreshQueries = document.getElementById('btnRefreshQueries');
    if (btnRefreshQueries) {
      btnRefreshQueries.addEventListener('click', () => loadChatQueries());
    }

    // Crop Catalog Modals
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

    const btnSaveCrop = document.getElementById('btnSaveCrop');
    if (btnSaveCrop) {
      btnSaveCrop.addEventListener('click', handleSaveCrop);
    }

    const btnSaveGuidance = document.getElementById('btnSaveGuidance');
    if (btnSaveGuidance) {
      btnSaveGuidance.addEventListener('click', handleSaveGuidance);
    }

    // Reports filters & review modal
    const filterReportStatus = document.getElementById('filterReportStatus');
    if (filterReportStatus) filterReportStatus.addEventListener('change', () => loadReports());

    const filterReportCategory = document.getElementById('filterReportCategory');
    if (filterReportCategory) filterReportCategory.addEventListener('change', () => loadReports());

    const btnRefreshReports = document.getElementById('btnRefreshReports');
    if (btnRefreshReports) btnRefreshReports.addEventListener('click', () => loadReports());

    const btnSaveReportReview = document.getElementById('btnSaveReportReview');
    if (btnSaveReportReview) btnSaveReportReview.addEventListener('click', handleSaveReportReview);

    // Login Activity filters & search
    const filterActivityRange = document.getElementById('filterActivityRange');
    if (filterActivityRange) filterActivityRange.addEventListener('change', () => loadLoginActivities());

    const filterActivityRole = document.getElementById('filterActivityRole');
    if (filterActivityRole) filterActivityRole.addEventListener('change', () => loadLoginActivities());

    const btnSearchActivity = document.getElementById('btnSearchActivity');
    const activitySearchInput = document.getElementById('activitySearchInput');
    if (btnSearchActivity && activitySearchInput) {
      btnSearchActivity.addEventListener('click', () => loadLoginActivities());
      activitySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadLoginActivities();
      });
    }

    const btnRefreshActivity = document.getElementById('btnRefreshActivity');
    if (btnRefreshActivity) btnRefreshActivity.addEventListener('click', () => loadLoginActivities());
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
    document.getElementById('guidanceModalTitle').innerHTML = `<i class="bi bi-journal-plus me-2"></i> Add Advisory for ${Utils.escapeHtml(cropName)}`;
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
