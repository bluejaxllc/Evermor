import './styles/index.css';
import { route, navigate, resolve, setNotFound } from './router.js';
import { initAuth, isLoggedIn, onAuthChange } from './auth.js';

/* ── Lazy page imports ───────────────────────── */
const pages = {
  login:     () => import('./pages/login.js'),
  signup:    () => import('./pages/signup.js'),
  dashboard: () => import('./pages/dashboard.js'),
  vault:     () => import('./pages/vault.js'),
  stories:   () => import('./pages/stories.js'),
  voice:     () => import('./pages/voice.js'),
  timeline:  () => import('./pages/timeline.js'),
  heirs:     () => import('./pages/heirs.js'),
  profile:   () => import('./pages/profile.js'),
  settings:  () => import('./pages/settings.js'),
};

/* ── Auth guard ──────────────────────────────── */
function authGuard(loader) {
  return async (app, params) => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const mod = await loader();
    return mod.default(app, params);
  };
}

function guestOnly(loader) {
  return async (app, params) => {
    if (isLoggedIn()) {
      navigate('/dashboard');
      return;
    }
    const mod = await loader();
    return mod.default(app, params);
  };
}

/* ── Register routes ─────────────────────────── */
route('/login',     guestOnly(pages.login));
route('/signup',    guestOnly(pages.signup));
route('/dashboard', authGuard(pages.dashboard));
route('/vault',     authGuard(pages.vault));
route('/stories',   authGuard(pages.stories));
route('/voice',     authGuard(pages.voice));
route('/timeline',  authGuard(pages.timeline));
route('/heirs',     authGuard(pages.heirs));
route('/profile',   authGuard(pages.profile));
route('/settings',  authGuard(pages.settings));

/* Redirect root to dashboard or login */
route('/', async (app) => {
  navigate(isLoggedIn() ? '/dashboard' : '/login');
});

/* 404 */
setNotFound((app) => {
  app.innerHTML = `
    <div class="not-found-page">
      <div class="not-found-content">
        <span class="material-symbols-rounded not-found-icon">explore_off</span>
        <h1>404</h1>
        <p>This part of the archive doesn't exist yet.</p>
        <a href="#/dashboard" class="btn-outline">Return to Dashboard</a>
      </div>
    </div>
  `;
});

/* ── Boot ─────────────────────────────────────── */
async function boot() {
  // Show splash
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash-screen">
      <img src="/assets/evermor-logo-3d.png" alt="Evermore" class="splash-logo">
      <div class="splash-bar"><div class="splash-fill"></div></div>
      <p class="splash-text">Initializing the Archive...</p>
    </div>
  `;

  try {
    await initAuth();
  } catch (e) {
    console.error('Auth init failed:', e);
  }

  // Small delay for splash effect
  await new Promise(r => setTimeout(r, 600));

  // Navigate
  resolve();
}

boot();
