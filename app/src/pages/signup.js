import { signUp } from '../auth.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export default async function signupPage(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-ambient-orb orb-1"></div>
      <div class="auth-ambient-orb orb-2"></div>

      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <img src="/assets/evermor-logo-3d.png" alt="Evermore" class="auth-logo">
            <h1 class="auth-title">Create Your Archive</h1>
            <p class="auth-subtitle">Begin preserving your legacy today</p>
          </div>

          <form id="signup-form" class="auth-form">
            <div class="form-group">
              <label for="signup-name">Full Name</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">person</span>
                <input type="text" id="signup-name" placeholder="Your full name" required autocomplete="name">
              </div>
            </div>
            <div class="form-group">
              <label for="signup-email">Email Address</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">mail</span>
                <input type="email" id="signup-email" placeholder="you@example.com" required autocomplete="email">
              </div>
            </div>
            <div class="form-group">
              <label for="signup-password">Password</label>
              <div class="input-wrapper">
                <span class="material-symbols-rounded input-icon">lock</span>
                <input type="password" id="signup-password" placeholder="Min. 8 characters" required minlength="8" autocomplete="new-password">
                <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                  <span class="material-symbols-rounded">visibility_off</span>
                </button>
              </div>
            </div>

            <div class="tier-selection">
              <p class="tier-label">Select Your Tier</p>
              <div class="tier-options">
                <label class="tier-option selected" data-tier="architect">
                  <input type="radio" name="tier" value="architect" checked>
                  <div class="tier-option-content">
                    <span class="tier-icon">🏛️</span>
                    <span class="tier-name">Founding Architect</span>
                    <span class="tier-price-tag">$250</span>
                  </div>
                </label>
                <label class="tier-option" data-tier="sovereign">
                  <input type="radio" name="tier" value="sovereign">
                  <div class="tier-option-content">
                    <span class="tier-icon">👑</span>
                    <span class="tier-name">Sovereign Heir</span>
                    <span class="tier-price-tag">$1,000</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" class="btn-primary-full" id="signup-btn">
              <span class="btn-text">Begin Your Legacy</span>
              <span class="btn-loader" style="display:none;">
                <span class="spinner"></span>
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an archive? <a href="#/login" class="auth-link">Sign In</a></p>
          </div>
        </div>

        <div class="auth-visual">
          <div class="auth-visual-content">
            <div class="auth-tagline">
              <span class="auth-tagline-label">Join the Movement</span>
              <h2>Every life is <span class="text-shimmer">a story</span> worth preserving.</h2>
              <p>Your voice, your wisdom, your legacy — secured immutably for the generations that follow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tier selection toggle
  const tierOptions = app.querySelectorAll('.tier-option');
  tierOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      tierOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });

  // Toggle password
  const toggleBtn = app.querySelector('.toggle-password');
  const passwordInput = app.querySelector('#signup-password');
  toggleBtn?.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.querySelector('.material-symbols-rounded').textContent = isPassword ? 'visibility' : 'visibility_off';
  });

  // Form submit
  const form = app.querySelector('#signup-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = app.querySelector('#signup-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    btn.disabled = true;

    try {
      const name = app.querySelector('#signup-name').value;
      const email = app.querySelector('#signup-email').value;
      const password = passwordInput.value;
      const tier = app.querySelector('input[name="tier"]:checked').value;

      await signUp(email, password, name);
      toast('Archive created! Check your email to confirm.', 'success');
      navigate('/onboarding');
    } catch (err) {
      toast(err.message || 'Signup failed', 'error');
      btnText.style.display = '';
      btnLoader.style.display = 'none';
      btn.disabled = false;
    }
  });
}
