/**
 * Smart Krishi Sahayak - Utility Helper Functions
 */
const Utils = (() => {

  /**
   * Display toast notification
   */
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container-custom');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;
    
    let iconClass = 'bi-info-circle';
    if (type === 'error') iconClass = 'bi-exclamation-circle';
    if (type === 'success') iconClass = 'bi-check-circle';

    toast.innerHTML = `<i class="bi ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Toggle button loading state
   */
  function setLoadingButton(buttonElement, isLoading, originalText = '') {
    if (!buttonElement) return;
    if (isLoading) {
      buttonElement.dataset.originalText = buttonElement.innerHTML;
      buttonElement.disabled = true;
      buttonElement.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
    } else {
      buttonElement.disabled = false;
      buttonElement.innerHTML = buttonElement.dataset.originalText || originalText;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    showToast,
    setLoadingButton,
    escapeHtml
  };
})();
