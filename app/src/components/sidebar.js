import { navigate, currentPath } from '../router.js';
import { getProfile, signOut } from '../auth.js';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/vault', icon: 'photo_library', label: 'The Vault' },
  { path: '/stories', icon: 'auto_stories', label: 'Stories' },
  { path: '/voice', icon: 'mic', label: 'Voice' },
  { path: '/timeline', icon: 'timeline', label: 'Timeline' },
  { path: '/heirs', icon: 'group', label: 'Heirs' },
];

const BOTTOM_ITEMS = [
  { path: '/profile', icon: 'person', label: 'Profile' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export function renderSidebar(container) {
  const profile = getProfile();
  const active = currentPath();

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img src="/assets/evermor-logo-3d.png" alt="Evermore" class="sidebar-logo-img">
      </div>
    </div>

    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(item => `
        <a href="#${item.path}" class="nav-item ${active === item.path ? 'active' : ''}" data-path="${item.path}">
          <span class="material-symbols-rounded">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
    </nav>

    <div class="sidebar-spacer"></div>

    <nav class="sidebar-bottom">
      ${BOTTOM_ITEMS.map(item => `
        <a href="#${item.path}" class="nav-item ${active === item.path ? 'active' : ''}" data-path="${item.path}">
          <span class="material-symbols-rounded">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
      <button class="nav-item nav-signout" id="btn-signout">
        <span class="material-symbols-rounded">logout</span>
        <span class="nav-label">Sign Out</span>
      </button>
    </nav>

    <div class="sidebar-user">
      <div class="sidebar-avatar">
        ${profile?.avatar_url
          ? `<img src="${profile.avatar_url}" alt="">`
          : `<span class="material-symbols-rounded">person</span>`
        }
      </div>
      <div class="sidebar-user-info">
        <span class="sidebar-user-name">${profile?.full_name || 'Archivist'}</span>
        <span class="sidebar-user-tier">${profile?.tier === 'sovereign' ? 'Sovereign Heir' : 'Founding Architect'}</span>
      </div>
    </div>
  `;

  container.prepend(sidebar);

  // Sign-out handler
  const signoutBtn = sidebar.querySelector('#btn-signout');
  signoutBtn?.addEventListener('click', async () => {
    await signOut();
    navigate('/login');
  });

  return sidebar;
}

export function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar?.classList.toggle('open');
}
