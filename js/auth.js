// ---------- Config ----------
const API_BASE = 'http://127.0.0.1:8000/api';

// ---------- Redirect if already logged in ----------
if (localStorage.getItem('authToken') && window.location.pathname.includes('index')) {
  // Optional: auto-redirect logged-in users straight to their board
  // window.location.href = 'dashboard.html';
}

// ---------- Modal open/close ----------
const authOverlay = document.getElementById('authOverlay');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const switchAuthMode = document.getElementById('switchAuthMode');
const authError = document.getElementById('authError');
const openLogin = document.getElementById('openLogin');
const openSignup = document.getElementById('openSignup');
const closeAuth = document.getElementById('closeAuth');

let authMode = 'login'; // or 'signup'

function setAuthMode(mode) {
  authMode = mode;
  if (mode === 'login') {
    authTitle.textContent = 'Log in';
    authSubmit.textContent = 'Log in';
    switchAuthMode.textContent = 'Need an account? Sign up';
  } else {
    authTitle.textContent = 'Sign up';
    authSubmit.textContent = 'Create account';
    switchAuthMode.textContent = 'Already have an account? Log in';
  }
  authError.hidden = true;
}

function showAuthModal(mode) {
  setAuthMode(mode);
  authOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
  authOverlay.hidden = true;
  document.body.style.overflow = '';
  authForm.reset();
  authError.hidden = true;
}

if (openLogin) openLogin.addEventListener('click', () => showAuthModal('login'));
if (openSignup) openSignup.addEventListener('click', () => showAuthModal('signup'));
if (closeAuth) closeAuth.addEventListener('click', hideAuthModal);
if (authOverlay) {
  authOverlay.addEventListener('click', (e) => {
    if (e.target === authOverlay) hideAuthModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && authOverlay && !authOverlay.hidden) hideAuthModal();
});
if (switchAuthMode) {
  switchAuthMode.addEventListener('click', () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  });
}

// ---------- Submit handler ----------
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(authForm);
    const username = formData.get('username');
    const password = formData.get('password');

    const endpoint = authMode === 'login' ? '/login/' : '/signup/';

    authSubmit.disabled = true;
    authError.hidden = true;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        authError.textContent = data.detail || 'Something went wrong. Please try again.';
        authError.hidden = false;
        authSubmit.disabled = false;
        return;
      }

      // Success — store the token and username, then go to the dashboard
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('username', data.username);
      window.location.href = 'dashboard.html';

    } catch (err) {
      authError.textContent = 'Could not reach the server. Is it running?';
      authError.hidden = false;
      authSubmit.disabled = false;
    }
  });
}