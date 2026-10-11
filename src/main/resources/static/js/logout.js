/**
 * Smart Krishi Sahayak - Logout Page Controller
 * Safely invalidates session, displays recap summary, and manages countdown redirect
 */
document.addEventListener('DOMContentLoaded', async () => {
  const recapUserName = document.getElementById('recapUserName');
  const recapUserRole = document.getElementById('recapUserRole');
  const recapLogoutTime = document.getElementById('recapLogoutTime');
  const countdownNumber = document.getElementById('countdownNumber');
  const countdownBarFill = document.getElementById('countdownBarFill');
  const btnRelogin = document.getElementById('btnRelogin');

  // Load last logged out user info from sessionStorage
  try {
    const raw = sessionStorage.getItem('sks_last_logged_out_user');
    if (raw) {
      const data = JSON.parse(raw);
      if (recapUserName && data.fullName) recapUserName.textContent = data.fullName;
      if (recapUserRole && data.role) {
        recapUserRole.textContent = data.role === 'ROLE_ADMIN' ? 'Administrator' : 'Farmer (बळीराजा)';
        if (data.role === 'ROLE_ADMIN') {
          recapUserRole.className = 'session-recap-value text-primary';
        }
      }
      if (recapLogoutTime && data.timestamp) recapLogoutTime.textContent = data.timestamp;
      // Clear out the temporary storage item after reading
      sessionStorage.removeItem('sks_last_logged_out_user');
    } else {
      if (recapUserName) recapUserName.textContent = 'Authenticated User';
      if (recapLogoutTime) recapLogoutTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    console.warn('Error reading logout session cache:', e);
  }

  // Double-check auth is completely cleared locally
  if (typeof Auth !== 'undefined') {
    Auth.clearAuth();
  } else {
    localStorage.removeItem('sks_jwt_token');
    localStorage.removeItem('sks_user_info');
  }

  // Manage 5-second countdown
  let secondsRemaining = 5;
  const totalSeconds = 5;

  const intervalId = setInterval(() => {
    secondsRemaining--;
    if (countdownNumber) {
      countdownNumber.textContent = secondsRemaining;
    }
    if (countdownBarFill) {
      const percentage = (secondsRemaining / totalSeconds) * 100;
      countdownBarFill.style.width = `${percentage}%`;
    }

    if (secondsRemaining <= 0) {
      clearInterval(intervalId);
      window.location.href = 'login.html?logged_out=true';
    }
  }, 1000);

  // If user clicks Log In Again, stop timer and go
  if (btnRelogin) {
    btnRelogin.addEventListener('click', (e) => {
      clearInterval(intervalId);
    });
  }
});
