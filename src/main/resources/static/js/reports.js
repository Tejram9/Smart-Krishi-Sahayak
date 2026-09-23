/**
 * Smart Krishi Sahayak - Farmer Support & Complaints Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuthentication()) {
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }

  const reportsLoading = document.getElementById('reportsLoading');
  const reportsEmpty = document.getElementById('reportsEmpty');
  const reportsListContainer = document.getElementById('reportsListContainer');
  const btnRefreshReports = document.getElementById('btnRefreshReports');
  const newReportForm = document.getElementById('newReportForm');
  const btnSubmitReport = document.getElementById('btnSubmitReport');
  const modalAlertError = document.getElementById('modalAlertError');
  const pageAlertBanner = document.getElementById('pageAlertBanner');
  const pageAlertText = document.getElementById('pageAlertText');

  await loadReports();

  if (btnRefreshReports) {
    btnRefreshReports.addEventListener('click', async () => {
      await loadReports();
      showPageAlert('Reports list refreshed successfully.');
    });
  }

  if (newReportForm) {
    newReportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (modalAlertError) modalAlertError.style.display = 'none';

      const category = document.getElementById('reportCategory').value;
      const title = document.getElementById('reportTitle').value.trim();
      const description = document.getElementById('reportDescription').value.trim();

      if (!category || !title || !description) {
        showModalError('Please fill in all required fields.');
        return;
      }

      Utils.setLoadingButton(btnSubmitReport, true);

      try {
        const response = await Api.post('/api/v1/reports', {
          category,
          title,
          description
        }, true);

        if (response && response.success) {
          // Close Bootstrap modal
          const modalEl = document.getElementById('newReportModal');
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();

          newReportForm.reset();
          showPageAlert('Your report ticket has been submitted successfully. Administrative team will review it.');
          await loadReports();
        } else {
          showModalError(response?.message || 'Failed to submit report.');
        }
      } catch (error) {
        console.error('Error submitting report:', error);
        showModalError(error.message || 'Unable to submit report. Please try again.');
      } finally {
        Utils.setLoadingButton(btnSubmitReport, false);
      }
    });
  }

  async function loadReports() {
    reportsLoading.style.display = 'block';
    reportsEmpty.style.display = 'none';
    reportsListContainer.style.display = 'none';
    reportsListContainer.innerHTML = '';

    try {
      const response = await Api.get('/api/v1/reports/my', true);
      const reports = response?.data || [];

      if (!reports || reports.length === 0) {
        reportsLoading.style.display = 'none';
        reportsEmpty.style.display = 'block';
        return;
      }

      reports.forEach(report => {
        const card = createReportCard(report);
        reportsListContainer.appendChild(card);
      });

      reportsLoading.style.display = 'none';
      reportsListContainer.style.display = 'block';
    } catch (error) {
      console.error('Error loading reports:', error);
      reportsLoading.style.display = 'none';
      reportsListContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> Failed to load your reports. ${error.message}
        </div>
      `;
      reportsListContainer.style.display = 'block';
    }
  }

  function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';

    const statusBadgeClass = `status-${report.status}`;
    const formattedCreated = report.createdAt ? formatDateTime(report.createdAt) : 'Recently';
    const formattedResolved = report.resolvedAt ? formatDateTime(report.resolvedAt) : null;

    let adminSectionHtml = '';
    if (report.adminResponse) {
      adminSectionHtml = `
        <div class="admin-reply-box">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-success"><i class="bi bi-shield-check me-1"></i> Admin Resolution</span>
            ${formattedResolved ? `<small class="text-muted">(${formattedResolved})</small>` : ''}
          </div>
          <p class="mb-0 text-dark small">${escapeHtml(report.adminResponse)}</p>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
        <div>
          <span class="badge bg-light text-secondary border me-2">${escapeHtml(report.categoryDisplayName || report.category)}</span>
          <span class="status-badge ${statusBadgeClass}">${report.status.replace('_', ' ')}</span>
        </div>
        <small class="text-muted"><i class="bi bi-clock me-1"></i> ${formattedCreated}</small>
      </div>

      <h5 class="fw-bold text-dark mb-2">${escapeHtml(report.title)}</h5>
      <p class="text-secondary mb-2" style="white-space: pre-line;">${escapeHtml(report.description)}</p>

      ${adminSectionHtml}
    `;

    return card;
  }

  function showModalError(msg) {
    if (!modalAlertError) return;
    modalAlertError.textContent = msg;
    modalAlertError.style.display = 'block';
  }

  function showPageAlert(msg) {
    if (!pageAlertBanner) return;
    pageAlertText.textContent = msg;
    pageAlertBanner.style.display = 'block';
    setTimeout(() => {
      pageAlertBanner.style.display = 'none';
    }, 4000);
  }

  function formatDateTime(dtStr) {
    try {
      const d = new Date(dtStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dtStr;
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
