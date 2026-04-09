import { signIn } from '../auth.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export default async function loginPage(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-ambient-orb orb-1"></div>
      <div class="auth-ambient-orb orb-2"></div>

      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <img src="/assets/evermor-logo-3d.png" alt="Evermore" class="auth-logo">
            <h1 class="auth-title">Welcome Back</h1>
            <p class="auth-subtitle">Enter your archive credentials</p>
          </div>

          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">mail</span>
                <input type="email" id="login-email" placeholder="you@example.com" required autocomplete="email">
              </div>
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">lock</span>
                <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <span class="material-symbols-rounded">visibility_off</span>
                </button>
              </div>
            </div>
            <button type="submit" class="btn-primary-full" id="login-btn">
              <span class="btn-text">Enter the Archive</span>
              <span class="btn-loader" style="display:none;">
                <span class="spinner"></span>
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an archive? <a href="#/signup" class="auth-link">Create One</a></p>
          </div>
        </div>

        <div class="auth-visual">
          <div class="auth-visual-content">
            <div class="auth-tagline">
              <span class="auth-tagline-label">The Eternal Archive</span>
              <h2>Your legacy.<br>Preserved <span class="text-shimmer">forever</span>.</h2>
              <p>Voice recordings, photographs, life philosophies — all secured with immutable fidelity for future generations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Toggle password visibility
  const toggleBtn = app.querySelector('.toggle-password');
  const passwordInput = app.querySelector('#login-password');
  toggleBtn?.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.querySelector('.material-symbols-rounded').textContent = isPassword ? 'visibility' : 'visibility_off';
  });

  // Form submit
  const form = app.querySelector('#login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = app.querySelector('#login-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    btn.disabled = true;

    try {
      const email = app.querySelector('#login-email').value;
      const password = passwordInput.value;
      await signIn(email, password);
      toast('Welcome back to the Archive', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.message || 'Invalid credentials', 'error');
      btnText.style.display = '';
      btnLoader.style.display = 'none';
      btn.disabled = false;
    }
  });
}
