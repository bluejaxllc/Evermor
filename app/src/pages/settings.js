import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser, getProfile, signOut } from '../auth.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';
import { supabase } from '../supabase.js';

export default async function settingsPage(app) {
  const user = getUser();
  const profile = getProfile() || {};

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Settings');

  main.innerHTML += `
    <div class="page-content settings-content">
      <!-- Account Info -->
      <div class="settings-section card-glass">
        <h3 class="card-title">Account</h3>
        <div class="settings-row">
          <div class="settings-label">
            <span class="material-symbols-rounded">mail</span>
            <span>Email</span>
          </div>
          <span class="settings-value">${user.email}</span>
        </div>
        <div class="settings-row">
          <div class="settings-label">
            <span class="material-symbols-rounded">badge</span>
            <span>Archive Tier</span>
          </div>
          <span class="settings-value tier-value">${profile.tier === 'sovereign' ? '👑 Sovereign Heir' : '🏛️ Founding Architect'}</span>
        </div>
        <div class="settings-row">
          <div class="settings-label">
            <span class="material-symbols-rounded">calendar_today</span>
            <span>Member Since</span>
          </div>
          <span class="settings-value">${new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <!-- Change Password -->
      <div class="settings-section card-glass">
        <h3 class="card-title">Change Password</h3>
        <form id="password-form" class="settings-form">
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input type="password" id="new-password" class="input-glass" placeholder="Min. 8 characters" minlength="8" required>
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" class="input-glass" placeholder="Repeat new password" required>
          </div>
          <button type="submit" class="btn-outline">Update Password</button>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="settings-section card-glass danger-section">
        <h3 class="card-title danger-title">Danger Zone</h3>
        <p class="danger-desc">These actions are irreversible. Proceed with extreme caution.</p>
        <div class="danger-actions">
          <button class="btn-danger" id="sign-out-all">
            <span class="material-symbols-rounded">logout</span>
            Sign Out All Devices
          </button>
          <button class="btn-danger" id="delete-account">
            <span class="material-symbols-rounded">delete_forever</span>
            Delete Archive Permanently
          </button>
        </div>
      </div>
    </div>
  `;

  // Change password
  app.querySelector('#password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPw = app.querySelector('#new-password').value;
    const confirmPw = app.querySelector('#confirm-password').value;

    if (newPw !== confirmPw) {
      toast('Passwords do not match', 'error');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast('Password updated successfully', 'success');
      app.querySelector('#password-form').reset();
    } catch (err) {
      toast(err.message || 'Failed to update password', 'error');
    }
  });

  // Sign out all
  app.querySelector('#sign-out-all').addEventListener('click', async () => {
    if (!confirm('Sign out from all devices?')) return;
    try {
      await supabase.auth.signOut({ scope: 'global' });
      navigate('/login');
    } catch (err) {
      toast('Failed to sign out', 'error');
    }
  });

  // Delete account warning
  app.querySelector('#delete-account').addEventListener('click', () => {
    toast('Account deletion requires contacting support at hello@evermore.rip', 'warning', 6000);
  });
}
