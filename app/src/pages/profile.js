import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser, getProfile, upsertProfile } from '../auth.js';
import { uploadFile, getPublicUrl } from '../supabase.js';
import { toast } from '../components/toast.js';

export default async function profilePage(app) {
  const user = getUser();
  const profile = getProfile() || {};

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Profile');

  main.innerHTML += `
    <div class="page-content profile-content">
      <!-- Cover + Avatar -->
      <div class="profile-hero">
        <div class="profile-cover" id="profile-cover" style="${profile.cover_url ? `background-image: url(${profile.cover_url})` : ''}">
          <button class="cover-edit-btn" id="cover-edit-btn">
            <span class="material-symbols-rounded">photo_camera</span>
          </button>
          <input type="file" id="cover-input" accept="image/*" hidden>
        </div>
        <div class="profile-avatar-section">
          <div class="profile-avatar-large" id="profile-avatar">
            ${profile.avatar_url
              ? `<img src="${profile.avatar_url}" alt="${profile.full_name || ''}">`
              : `<span class="material-symbols-rounded">person</span>`
            }
            <button class="avatar-edit-btn" id="avatar-edit-btn">
              <span class="material-symbols-rounded">photo_camera</span>
            </button>
            <input type="file" id="avatar-input" accept="image/*" hidden>
          </div>
          <div class="profile-name-section">
            <h2 class="profile-display-name">${profile.full_name || 'Your Name'}</h2>
            <span class="profile-tier-badge">${profile.tier === 'sovereign' ? '👑 Sovereign Heir' : '🏛️ Founding Architect'}</span>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <form id="profile-form" class="profile-form card-glass">
        <h3 class="card-title">Personal Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="p-name">Full Name</label>
            <input type="text" id="p-name" class="input-glass" value="${profile.full_name || ''}" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label for="p-dob">Date of Birth</label>
            <input type="date" id="p-dob" class="input-glass" value="${profile.date_of_birth || ''}">
          </div>
          <div class="form-group full-width">
            <label for="p-bio">Bio</label>
            <textarea id="p-bio" class="input-glass" rows="3" placeholder="Tell the world who you are in a few sentences...">${profile.bio || ''}</textarea>
          </div>
          <div class="form-group full-width">
            <label for="p-motto">Life Motto</label>
            <input type="text" id="p-motto" class="input-glass" value="${profile.life_motto || ''}" placeholder="Your guiding principle...">
          </div>
        </div>
        <button type="submit" class="btn-accent">
          <span class="material-symbols-rounded">save</span>
          Save Changes
        </button>
      </form>
    </div>
  `;

  // Avatar upload
  const avatarBtn = app.querySelector('#avatar-edit-btn');
  const avatarInput = app.querySelector('#avatar-input');
  avatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const path = `${user.id}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
      await uploadFile('avatars', path, file);
      const url = getPublicUrl('avatars', path);
      await upsertProfile({ id: user.id, avatar_url: url });
      toast('Avatar updated', 'success');
      const avatarEl = app.querySelector('#profile-avatar');
      avatarEl.querySelector('img')?.remove();
      const img = document.createElement('img');
      img.src = url;
      avatarEl.prepend(img);
    } catch (err) {
      toast('Failed to upload avatar', 'error');
    }
  });

  // Cover upload
  const coverBtn = app.querySelector('#cover-edit-btn');
  const coverInput = app.querySelector('#cover-input');
  coverBtn.addEventListener('click', () => coverInput.click());
  coverInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const path = `${user.id}/cover_${Date.now()}.${file.name.split('.').pop()}`;
      await uploadFile('avatars', path, file);
      const url = getPublicUrl('avatars', path);
      await upsertProfile({ id: user.id, cover_url: url });
      toast('Cover photo updated', 'success');
      app.querySelector('#profile-cover').style.backgroundImage = `url(${url})`;
    } catch (err) {
      toast('Failed to upload cover', 'error');
    }
  });

  // Profile form
  app.querySelector('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await upsertProfile({
        id: user.id,
        full_name: app.querySelector('#p-name').value.trim(),
        date_of_birth: app.querySelector('#p-dob').value || null,
        bio: app.querySelector('#p-bio').value.trim(),
        life_motto: app.querySelector('#p-motto').value.trim(),
      });
      toast('Profile updated', 'success');
    } catch (err) {
      toast('Failed to save profile', 'error');
    }
  });
}
