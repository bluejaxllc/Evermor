import { getProfile } from '../auth.js';
import { toggleMobileSidebar } from './sidebar.js';

export function renderHeader(container, title) {
  const profile = getProfile();
  
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="header-left">
      <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle navigation">
        <span class="material-symbols-rounded">menu</span>
      </button>
      <h1 class="header-title">${title}</h1>
    </div>
    <div class="header-right">
      <div class="header-search">
        <span class="material-symbols-rounded">search</span>
        <input type="text" placeholder="Search your archive..." id="global-search">
      </div>
      <button class="header-icon-btn" aria-label="Notifications">
        <span class="material-symbols-rounded">notifications</span>
        <span class="notif-dot"></span>
      </button>
      <div class="header-avatar">
        ${profile?.avatar_url
          ? `<img src="${profile.avatar_url}" alt="${profile.full_name || ''}">`
          : `<span class="material-symbols-rounded">person</span>`
        }
      </div>
    </div>
  `;

  container.appendChild(header);

  // Mobile menu toggle
  header.querySelector('#mobile-toggle')?.addEventListener('click', toggleMobileSidebar);

  return header;
}
