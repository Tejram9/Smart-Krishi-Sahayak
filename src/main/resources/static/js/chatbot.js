/**
 * Smart Krishi Sahayak - Farmer Chatbot Controller (Step 5G Polished)
 *
 * Implements a rich messaging UX:
 * - Active session persistence across reloads (sessionStorage)
 * - Deferred session creation (created only when first message is sent)
 * - Real-time client-side session search & filtering
 * - Shimmer skeleton loaders & graceful retry handlers
 * - Race-condition guard for rapid session switching
 * - Polished empty states & multilingual prompt chips
 * - Standardized expert referral alert cards
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuthentication()) return;

  const ACTIVE_SESSION_STORAGE_KEY = 'sks_active_chat_session_id';

  // DOM Elements
  const sessionsList = document.getElementById('sessionsList');
  const sessionCountBadge = document.getElementById('sessionCountBadge');
  const sessionSearchInput = document.getElementById('sessionSearchInput');
  const messagesContainer = document.getElementById('messagesContainer');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const chatSidebar = document.getElementById('chatSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const currentSessionTitle = document.getElementById('currentSessionTitle');
  const activeLangBadge = document.getElementById('activeLangBadge');
  const charCounter = document.getElementById('charCounter');

  // Application State
  let sessions = [];
  let filteredSessions = [];
  let currentSessionId = null;
  let isSending = false;
  let latestMessageRequestId = 0;

  // Initialize Chatbot App
  init();

  function init() {
    updateLanguageBadge();

    // Event Listeners
    if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
    if (newChatBtn) newChatBtn.addEventListener('click', handleNewChat);
    if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

    if (sidebarToggleBtn) {
      sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    // Client-side search filter
    if (sessionSearchInput) {
      sessionSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterSessions(query);
      });
    }

    // Auto-expanding input & counter
    if (messageInput) {
      messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        const len = messageInput.value.length;
        if (charCounter) charCounter.textContent = `${len} / 2000`;
      });

      // Enter to send, Shift+Enter for newline
      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });
    }

    // Language switcher synchronization
    document.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('lang-select')) {
        updateLanguageBadge();
        if (!currentSessionId || messagesContainer.querySelector('.chat-welcome-card')) {
          renderWelcomeScreen();
        }
      }
    });

    // Keyboard navigation on sessions list
    if (sessionsList) {
      sessionsList.addEventListener('keydown', (e) => {
        const items = Array.from(sessionsList.querySelectorAll('.session-item'));
        const currentIndex = items.indexOf(document.activeElement);
        if (currentIndex === -1) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = items[currentIndex + 1] || items[0];
          next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = items[currentIndex - 1] || items[items.length - 1];
          prev.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = Number(document.activeElement.dataset.sessionId);
          if (id) selectSession(id);
        }
      });
    }

    // Load initial sessions
    loadSessions();
  }

  function updateLanguageBadge() {
    const lang = I18n.getCurrentLang ? I18n.getCurrentLang() : 'EN';
    if (activeLangBadge) {
      activeLangBadge.textContent = lang;
      activeLangBadge.className = `badge session-badge-lang lang-${lang} px-2 py-1 fw-bold border`;
    }
  }

  function toggleSidebar() {
    if (chatSidebar) chatSidebar.classList.toggle('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
  }

  function closeSidebar() {
    if (chatSidebar) chatSidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  /**
   * Load all chat sessions from API
   */
  async function loadSessions() {
    renderSessionsSkeleton();

    try {
      const response = await Api.get('/api/v1/chat/sessions', true);
      sessions = (response && response.success && Array.isArray(response.data)) ? response.data : [];
      filteredSessions = [...sessions];

      if (sessionCountBadge) {
        sessionCountBadge.textContent = sessions.length;
      }

      renderSessionsList();

      if (sessions.length > 0) {
        // Check if there is a saved active session from sessionStorage
        const savedId = Number(sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY));
        const matchedSession = sessions.find(s => s.id === savedId);

        if (matchedSession) {
          selectSession(matchedSession.id);
        } else {
          // Select most recently updated session
          selectSession(sessions[0].id);
        }
      } else {
        // No sessions yet -> show welcome screen
        currentSessionId = null;
        sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        renderWelcomeScreen();
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      renderSessionsError(error);
      renderWelcomeScreen();
    }
  }

  function filterSessions(query) {
    if (!query) {
      filteredSessions = [...sessions];
    } else {
      filteredSessions = sessions.filter(s => {
        const title = (s.sessionTitle || '').toLowerCase();
        const lang = (s.language || '').toLowerCase();
        return title.includes(query) || lang.includes(query);
      });
    }
    renderSessionsList();
  }

  /**
   * Render the list of chat sessions in the sidebar
   */
  function renderSessionsList() {
    if (!sessionsList) return;

    if (sessions.length === 0) {
      sessionsList.innerHTML = `
        <div class="empty-sessions-box">
          <i class="bi bi-chat-square-dots empty-sessions-icon"></i>
          <p class="mb-2 fw-semibold" style="font-size: 0.9rem;">${I18n.getTranslation('chat_no_history')}</p>
          <button class="btn btn-sm btn-outline-success mt-2" onclick="document.getElementById('newChatBtn').click()">
            <i class="bi bi-plus-lg"></i> ${I18n.getTranslation('chat_start_new_conversation')}
          </button>
        </div>
      `;
      return;
    }

    if (filteredSessions.length === 0) {
      sessionsList.innerHTML = `
        <div class="p-3 text-center text-muted" style="font-size: 0.85rem;">
          <i class="bi bi-search mb-1" style="font-size: 1.2rem; display: block; opacity: 0.6;"></i>
          ${I18n.getTranslation('chat_no_search_results')}
        </div>
      `;
      return;
    }

    sessionsList.innerHTML = filteredSessions.map(session => {
      const isActive = session.id === currentSessionId;
      const formattedDate = formatDate(session.updatedAt || session.createdAt);
      const title = Utils.escapeHtml(session.sessionTitle || I18n.getTranslation('chat_session_default_title'));
      const lang = session.language || 'MR';
      const msgCount = session.messageCount !== undefined ? session.messageCount : '';

      return `
        <div class="session-item ${isActive ? 'active' : ''}"
             data-session-id="${session.id}"
             role="option"
             aria-selected="${isActive ? 'true' : 'false'}"
             tabindex="0">
          <div class="session-item-title">${title}</div>
          <div class="session-item-meta">
            <span><i class="bi bi-clock"></i> ${formattedDate}</span>
            <span class="d-flex align-items-center gap-1">
              ${msgCount ? `<span class="badge bg-light text-dark border">${msgCount} msgs</span>` : ''}
              <span class="session-badge-lang lang-${lang}">${lang}</span>
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to session items
    sessionsList.querySelectorAll('.session-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = Number(el.dataset.sessionId);
        selectSession(id);
      });
    });
  }

  /**
   * Select a session and load its messages
   */
  async function selectSession(sessionId) {
    if (isSending) return; // Do not interrupt in-flight message send

    currentSessionId = sessionId;
    sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId);
    closeSidebar();
    renderSessionsList();

    const selectedSession = sessions.find(s => s.id === sessionId);
    if (currentSessionTitle && selectedSession) {
      currentSessionTitle.textContent = selectedSession.sessionTitle || I18n.getTranslation('chat_page_title');
    }

    const thisRequestId = ++latestMessageRequestId;
    renderMessagesSkeleton();

    try {
      const response = await Api.get(`/api/v1/chat/sessions/${sessionId}/messages`, true);

      // Guard against race conditions if user switched sessions rapidly
      if (thisRequestId !== latestMessageRequestId) return;

      const messages = (response && response.success && Array.isArray(response.data)) ? response.data : [];

      if (messages.length === 0) {
        renderWelcomeScreen();
      } else {
        renderMessages(messages);
      }
    } catch (error) {
      if (thisRequestId !== latestMessageRequestId) return;
      console.error('Failed to load session messages:', error);
      renderMessagesError(sessionId, error);
    }
  }

  /**
   * Handle "+ New Chat" button click (Deferred session creation)
   */
  function handleNewChat() {
    if (isSending) return;

    closeSidebar();
    currentSessionId = null;
    sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);

    if (currentSessionTitle) {
      currentSessionTitle.textContent = I18n.getTranslation('chat_page_title');
    }

    renderSessionsList();
    renderWelcomeScreen();
    if (messageInput) messageInput.focus();
  }

  /**
   * Render the welcome screen with suggestions
   */
  function renderWelcomeScreen() {
    if (!messagesContainer) return;

    const currentLang = I18n.getCurrentLang ? I18n.getCurrentLang() : 'EN';
    let suggestions = [];

    if (currentLang === 'MR') {
      suggestions = [
        { icon: 'bi-flower1', text: 'काळ्या जमिनीत कोणती पिके चांगली येतात?' },
        { icon: 'bi-droplet-fill', text: 'कापसासाठी सिंचन व्यवस्थापन कसे करावे?' },
        { icon: 'bi-bug-fill', text: 'सोयाबीनवरील कीड नियंत्रणासाठी जैविक उपाय काय आहेत?' }
      ];
    } else if (currentLang === 'HI') {
      suggestions = [
        { icon: 'bi-flower1', text: 'काली मिट्टी में कौन सी फसलें अच्छी होती हैं?' },
        { icon: 'bi-droplet-fill', text: 'गेहूं की सिंचाई कैसे करनी चाहिए?' },
        { icon: 'bi-bug-fill', text: 'कपास में कीट नियंत्रण के जैविक उपाय क्या हैं?' }
      ];
    } else {
      suggestions = [
        { icon: 'bi-flower1', text: 'What crops are suitable for black soil?' },
        { icon: 'bi-droplet-fill', text: 'How should I manage irrigation for cotton?' },
        { icon: 'bi-bug-fill', text: 'What are natural remedies for soybean pest control?' }
      ];
    }

    const suggestionsHtml = suggestions.map(item => `
      <div class="prompt-chip" role="button" tabindex="0" data-prompt="${Utils.escapeHtml(item.text)}">
        <i class="bi ${item.icon}"></i>
        <span>${Utils.escapeHtml(item.text)}</span>
      </div>
    `).join('');

    messagesContainer.innerHTML = `
      <div class="chat-welcome-card">
        <div class="welcome-icon-box">
          <i class="bi bi-robot"></i>
        </div>
        <h2 class="chat-welcome-title">${I18n.getTranslation('chat_welcome_title')}</h2>
        <p class="chat-welcome-desc">${I18n.getTranslation('chat_welcome_desc')}</p>
        
        <div class="text-start mb-2">
          <span class="fw-bold text-muted text-uppercase" style="font-size: 0.78rem;">${I18n.getTranslation('chat_suggestions_title')}</span>
        </div>
        <div class="prompt-suggestions-grid">
          ${suggestionsHtml}
        </div>
      </div>
    `;

    // Attach click listeners to prompt chips
    messagesContainer.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.dataset.prompt;
        if (messageInput) {
          messageInput.value = promptText;
          messageInput.style.height = 'auto';
          messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
          if (charCounter) charCounter.textContent = `${promptText.length} / 2000`;
          handleSendMessage();
        }
      });
    });
  }

  /**
   * Render all chat messages chronologically
   */
  function renderMessages(messages) {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
      appendMessage(msg.sender, msg.message || msg.messageText, msg.timestamp || msg.createdAt);
    });
    scrollToBottom();
  }

  /**
   * Append a single message bubble to the container
   */
  function appendMessage(sender, text, timestamp) {
    if (!messagesContainer) return;

    // Remove welcome card if present
    const welcomeCard = messagesContainer.querySelector('.chat-welcome-card');
    if (welcomeCard) {
      welcomeCard.remove();
    }

    const isUser = sender === 'USER';
    const timeStr = formatTime(timestamp);

    const messageRow = document.createElement('div');
    messageRow.className = `message-row ${isUser ? 'message-row-user' : 'message-row-ai'}`;

    const avatarHtml = isUser
      ? `<div class="message-avatar message-avatar-user"><i class="bi bi-person-fill"></i></div>`
      : `<div class="message-avatar message-avatar-ai"><i class="bi bi-robot"></i></div>`;

    const formattedContent = isUser ? Utils.escapeHtml(text) : formatAiMessageText(text);

    messageRow.innerHTML = `
      ${avatarHtml}
      <div class="message-content-wrapper">
        <div class="message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-ai'}">
          ${formattedContent}
        </div>
        <div class="message-time">${timeStr}</div>
      </div>
    `;

    messagesContainer.appendChild(messageRow);
    scrollToBottom();
  }

  /**
   * Format AI message body, recognizing markdown lists, line breaks, and expert referral notices
   */
  function formatAiMessageText(rawText) {
    if (!rawText) return '';

    const lines = rawText.split('\n');
    let html = '';
    let inList = false;
    let referralLines = [];
    let isReferralBlock = false;

    // Detect expert referral section keywords
    const referralKeywords = [
      'महत्त्वाचे:', 'महत्वपूर्ण:', 'important:', 'krishi seva kendra',
      'कृषी सेवा केंद्र', 'कृषि सेवा केंद्र', 'expert guidance'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const isReferralLine = referralKeywords.some(kw => line.toLowerCase().startsWith(kw) || line.toLowerCase().includes(kw));

      if (isReferralLine && !isReferralBlock && i >= lines.length - 3) {
        isReferralBlock = true;
      }

      if (isReferralBlock) {
        if (line) referralLines.push(line);
        continue;
      }

      if (!line) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        continue;
      }

      // Check for bullet list items
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        const itemContent = line.substring(2);
        html += `<li>${formatInlineMarkup(itemContent)}</li>`;
      } else if (/^(\d+|[०-९]+)[\.\)]\s/.test(line)) {
        // Numbered list items (e.g. 1. or १.)
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        const itemContent = line.replace(/^(\d+|[०-९]+)[\.\)]\s/, '');
        html += `<li>${formatInlineMarkup(itemContent)}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<p>${formatInlineMarkup(line)}</p>`;
      }
    }

    if (inList) {
      html += '</ul>';
    }

    // Render expert referral card if present
    if (referralLines.length > 0) {
      const referralContent = referralLines.map(l => formatInlineMarkup(l)).join('<br>');
      html += `
        <div class="expert-referral-box">
          <i class="bi bi-shield-exclamation expert-referral-icon"></i>
          <div>${referralContent}</div>
        </div>
      `;
    }

    return html;
  }

  function formatInlineMarkup(text) {
    let escaped = Utils.escapeHtml(text);
    // Bold: **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return escaped;
  }

  /**
   * Show typing indicator while awaiting AI response
   */
  function showTypingIndicator() {
    if (!messagesContainer) return;
    hideTypingIndicator();

    const indicatorRow = document.createElement('div');
    indicatorRow.id = 'typingIndicatorRow';
    indicatorRow.className = 'message-row message-row-ai';
    indicatorRow.innerHTML = `
      <div class="message-avatar message-avatar-ai"><i class="bi bi-robot"></i></div>
      <div class="message-content-wrapper">
        <div class="typing-indicator-box">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <span class="typing-label">${I18n.getTranslation('chat_thinking')}</span>
        </div>
      </div>
    `;

    messagesContainer.appendChild(indicatorRow);
    scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicatorRow');
    if (indicator) indicator.remove();
  }

  /**
   * Handle sending a message
   */
  async function handleSendMessage() {
    if (isSending) return;
    if (!messageInput) return;

    const text = messageInput.value.trim();
    if (!text) return;

    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    if (charCounter) charCounter.textContent = '0 / 2000';

    isSending = true;
    if (sendBtn) sendBtn.disabled = true;

    // Render user message immediately
    appendMessage('USER', text, new Date().toISOString());

    // Show typing indicator
    showTypingIndicator();

    try {
      // 1. If no active session exists, create one first
      if (!currentSessionId) {
        const sessionRes = await Api.post('/api/v1/chat/sessions', null, true);
        if (sessionRes && sessionRes.success && sessionRes.data) {
          currentSessionId = sessionRes.data.id;
          sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, currentSessionId);
          sessions.unshift(sessionRes.data);
          filteredSessions = [...sessions];
          if (sessionCountBadge) sessionCountBadge.textContent = sessions.length;
          renderSessionsList();
          if (currentSessionTitle) {
            currentSessionTitle.textContent = sessionRes.data.sessionTitle || I18n.getTranslation('chat_session_default_title');
          }
        } else {
          throw new Error(I18n.getTranslation('chat_error_session_create'));
        }
      }

      // 2. Send message to active session
      const lang = I18n.getCurrentLang ? I18n.getCurrentLang() : 'MR';
      const payload = {
        message: text,
        language: lang
      };

      const response = await Api.post(`/api/v1/chat/sessions/${currentSessionId}/messages`, payload, true);

      hideTypingIndicator();

      if (response && response.success && response.data && response.data.aiMessage) {
        const aiMsg = response.data.aiMessage;
        appendMessage('AI', aiMsg.message, aiMsg.timestamp || new Date().toISOString());

        // Update session item in list and title if first message
        const s = sessions.find(item => item.id === currentSessionId);
        if (s) {
          s.updatedAt = new Date().toISOString();
          if (s.messageCount !== undefined) s.messageCount += 2;
          if (s.sessionTitle && s.sessionTitle.startsWith('Chat Session -')) {
            const shortTitle = text.length > 50 ? text.substring(0, 47) + '...' : text;
            s.sessionTitle = shortTitle;
            if (currentSessionTitle) currentSessionTitle.textContent = shortTitle;
          }
          renderSessionsList();
        }
      } else {
        throw new Error(I18n.getTranslation('chat_error_failed_send'));
      }
    } catch (error) {
      console.error('Chat error:', error);
      hideTypingIndicator();
      
      let errorMsg = I18n.getTranslation('chat_error_failed_send');
      if (error.status === 401) {
        errorMsg = I18n.getTranslation('err_session_expired');
      } else if (error.status === 403) {
        errorMsg = I18n.getTranslation('err_access_denied');
      } else if (error.status === 503 || error.status === 500) {
        errorMsg = I18n.getTranslation('crops_error_desc');
      } else if (error.message) {
        errorMsg = error.message;
      }

      Utils.showToast(errorMsg, 'error');

      // Append friendly error note in conversation
      const errorRow = document.createElement('div');
      errorRow.className = 'message-row message-row-ai';
      errorRow.innerHTML = `
        <div class="message-avatar message-avatar-ai"><i class="bi bi-exclamation-triangle-fill text-danger"></i></div>
        <div class="message-content-wrapper">
          <div class="message-bubble message-bubble-ai border-danger-subtle bg-danger-subtle text-danger">
            ${Utils.escapeHtml(errorMsg)}
          </div>
        </div>
      `;
      messagesContainer.appendChild(errorRow);
      scrollToBottom();
    } finally {
      isSending = false;
      if (sendBtn) sendBtn.disabled = false;
      if (messageInput) messageInput.focus();
    }
  }

  /**
   * Shimmer skeleton for loading sessions
   */
  function renderSessionsSkeleton() {
    if (!sessionsList) return;
    sessionsList.innerHTML = `
      <div class="skeleton-session-item">
        <div class="skeleton-box skeleton-line skeleton-line-title"></div>
        <div class="skeleton-box skeleton-line skeleton-line-meta"></div>
      </div>
      <div class="skeleton-session-item">
        <div class="skeleton-box skeleton-line skeleton-line-title"></div>
        <div class="skeleton-box skeleton-line skeleton-line-meta"></div>
      </div>
      <div class="skeleton-session-item">
        <div class="skeleton-box skeleton-line skeleton-line-title"></div>
        <div class="skeleton-box skeleton-line skeleton-line-meta"></div>
      </div>
    `;
  }

  /**
   * Shimmer skeleton for loading messages
   */
  function renderMessagesSkeleton() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = `
      <div class="message-row message-row-ai">
        <div class="message-avatar message-avatar-ai"><i class="bi bi-robot"></i></div>
        <div class="message-content-wrapper" style="width: 60%;">
          <div class="skeleton-session-item" style="background: white; border: 1px solid var(--border-color);">
            <div class="skeleton-box skeleton-line" style="width: 90%; height: 14px;"></div>
            <div class="skeleton-box skeleton-line" style="width: 70%; height: 14px;"></div>
          </div>
        </div>
      </div>
      <div class="text-center py-2 text-muted" style="font-size: 0.82rem;">
        <span class="spinner-border spinner-border-sm text-success me-1"></span>
        ${I18n.getTranslation('chat_loading_messages')}
      </div>
    `;
  }

  /**
   * Error state for sessions loading failure
   */
  function renderSessionsError(error) {
    if (!sessionsList) return;
    sessionsList.innerHTML = `
      <div class="p-3 text-center text-muted" style="font-size: 0.85rem;">
        <i class="bi bi-exclamation-circle text-danger mb-2" style="font-size: 1.4rem; display: block;"></i>
        <p class="mb-2">${I18n.getTranslation('chat_error_failed_load')}</p>
        <button id="retrySessionsBtn" class="btn-retry-chat">
          <i class="bi bi-arrow-clockwise"></i> ${I18n.getTranslation('chat_retry')}
        </button>
      </div>
    `;

    const retryBtn = document.getElementById('retrySessionsBtn');
    if (retryBtn) retryBtn.addEventListener('click', loadSessions);
  }

  /**
   * Error state for messages loading failure
   */
  function renderMessagesError(sessionId, error) {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = `
      <div class="p-5 text-center text-muted">
        <i class="bi bi-exclamation-triangle text-danger mb-2" style="font-size: 2rem; display: block;"></i>
        <h4 class="text-dark fw-bold mb-2">${I18n.getTranslation('chat_error_failed_load')}</h4>
        <p class="text-muted mb-3" style="font-size: 0.9rem;">${Utils.escapeHtml(error.message || I18n.getTranslation('crops_error_desc'))}</p>
        <button id="retryMessagesBtn" class="btn-retry-chat">
          <i class="bi bi-arrow-clockwise"></i> ${I18n.getTranslation('chat_retry')}
        </button>
      </div>
    `;

    const retryBtn = document.getElementById('retryMessagesBtn');
    if (retryBtn) retryBtn.addEventListener('click', () => selectSession(sessionId));
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }
});
