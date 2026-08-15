/**
 * Smart Krishi Sahayak - Internationalization (i18n) Manager
 */
const I18n = (() => {
  const DEFAULT_LANG = 'EN';
  const LANG_STORAGE_KEY = 'sks_preferred_language';
  let translations = {};
  let currentLang = DEFAULT_LANG;

  async function loadLanguage(lang) {
    const langCode = (lang || DEFAULT_LANG).toLowerCase();
    try {
      const response = await fetch(`/lang/${langCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translation file for ${langCode}`);
      }
      translations = await response.json();
      currentLang = lang.toUpperCase();
      localStorage.setItem(LANG_STORAGE_KEY, currentLang);
      applyTranslations();
    } catch (error) {
      console.error('i18n error:', error);
    }
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.placeholder = translations[key];
      }
    });

    // Sync all dropdown selectors on the page
    document.querySelectorAll('.lang-select').forEach(select => {
      select.value = currentLang;
    });
  }

  function getTranslation(key) {
    return translations[key] || key;
  }

  function init() {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
    loadLanguage(savedLang);

    document.addEventListener('change', e => {
      if (e.target && e.target.classList.contains('lang-select')) {
        const newLang = e.target.value;
        loadLanguage(newLang);
      }
    });
  }

  return {
    init,
    loadLanguage,
    getTranslation,
    getCurrentLang: () => currentLang
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
});
