import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser } from '../auth.js';
import { fetchRows, insertRow, updateRow, deleteRow } from '../supabase.js';
import { toast } from '../components/toast.js';
import { openModal } from '../components/modal.js';

const RELATIONSHIPS = ['Child', 'Spouse', 'Sibling', 'Parent', 'Grandchild', 'Friend', 'Other'];
const ACCESS_LEVELS = [
  { value: 'full', label: 'Full Access', desc: 'Can view everything in the archive' },
  { value: 'limited', label: 'Limited Access', desc: 'Can view stories and media, but not private items' },
  { value: 'stories_only', label: 'Stories Only', desc: 'Can only read published stories' },
];

export default async function heirsPage(app) {
  const user = getUser();

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Designated Heirs');

  main.innerHTML += `
    <div class="page-content heirs-content">
      <div class="heirs-intro card-glass">
        <div class="heirs-intro-icon">
          <span class="material-symbols-rounded">shield_person</span>
        </div>
        <div class="heirs-intro-text">
          <h3>Who inherits your legacy?</h3>
          <p>Designate trusted individuals who will receive access to your archive. Each heir can be given different access levels, and access is released based on your configured trigger settings.</p>
        </div>
        <button class="btn-accent" id="add-heir-btn">
          <span class="material-symbols-rounded">person_add</span>
          Add Heir
        </button>
      </div>

      <div class="heirs-grid" id="heirs-grid">
        <div class="loading-state">
          <span class="spinner-lg"></span>
          <p>Loading heirs...</p>
        </div>
      </div>
    </div>
  `;

  const heirsGrid = app.querySelector('#heirs-grid');

  async function loadHeirs() {
    try {
      const heirs = await fetchRows('heirs', { userId: user.id });

      if (heirs.length === 0) {
        heirsGrid.innerHTML = `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">group</span>
            <p>No heirs designated yet. Who should carry your legacy forward?</p>
          </div>
        `;
        return;
      }

      heirsGrid.innerHTML = heirs.map(heir => {
        const accessInfo = ACCESS_LEVELS.find(a => a.value === heir.access_level) || ACCESS_LEVELS[0];
        const statusClass = heir.status === 'accepted' ? 'status-active' : heir.status === 'revoked' ? 'status-revoked' : 'status-pending';

        return `
          <div class="heir-card card-glass">
            <div class="heir-card-avatar">
              <span class="material-symbols-rounded">person</span>
            </div>
            <div class="heir-card-info">
              <h4 class="heir-name">${heir.heir_name}</h4>
              <span class="heir-email">${heir.heir_email}</span>
              <div class="heir-badges">
                <span class="heir-badge">${heir.relationship}</span>
                <span class="heir-badge access-badge">${accessInfo.label}</span>
                <span class="heir-status ${statusClass}">${heir.status}</span>
              </div>
            </div>
            <div class="heir-card-actions">
              <button class="btn-icon-sm heir-edit" data-id="${heir.id}" aria-label="Edit">
                <span class="material-symbols-rounded">edit</span>
              </button>
              <button class="btn-icon-sm heir-revoke" data-id="${heir.id}" data-status="${heir.status}" aria-label="Toggle access">
                <span class="material-symbols-rounded">${heir.status === 'revoked' ? 'lock_open' : 'block'}</span>
              </button>
              <button class="btn-icon-sm heir-delete" data-id="${heir.id}" aria-label="Remove">
                <span class="material-symbols-rounded">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Delete
      heirsGrid.querySelectorAll('.heir-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Remove this heir from your archive?')) return;
          try {
            await deleteRow('heirs', btn.dataset.id);
            toast('Heir removed', 'info');
            loadHeirs();
          } catch (err) { toast('Failed to remove heir', 'error'); }
        });
      });

      // Revoke/Restore
      heirsGrid.querySelectorAll('.heir-revoke').forEach(btn => {
        btn.addEventListener('click', async () => {
          const newStatus = btn.dataset.status === 'revoked' ? 'pending' : 'revoked';
          try {
            await updateRow('heirs', btn.dataset.id, { status: newStatus });
            toast(newStatus === 'revoked' ? 'Access revoked' : 'Access restored', 'info');
            loadHeirs();
          } catch (err) { toast('Failed to update status', 'error'); }
        });
      });
    } catch (e) {
      heirsGrid.innerHTML = `<div class="empty-state"><p>Could not load heirs.</p></div>`;
    }
  }

  // Add heir modal
  app.querySelector('#add-heir-btn').addEventListener('click', () => {
    openModal({
      title: 'Add Designated Heir',
      size: 'md',
      body: `
        <form id="heir-form" class="modal-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="heir-name" class="input-glass" placeholder="Their full name" required>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="heir-email" class="input-glass" placeholder="Their email" required>
          </div>
          <div class="form-group">
            <label>Relationship</label>
            <select id="heir-relationship" class="input-glass">
              ${RELATIONSHIPS.map(r => `<option value="${r.toLowerCase()}">${r}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Access Level</label>
            ${ACCESS_LEVELS.map(a => `
              <label class="radio-option">
                <input type="radio" name="access" value="${a.value}" ${a.value === 'full' ? 'checked' : ''}>
                <div class="radio-content">
                  <span class="radio-label">${a.label}</span>
                  <span class="radio-desc">${a.desc}</span>
                </div>
              </label>
            `).join('')}
          </div>
          <button type="submit" class="btn-primary-full">Designate Heir</button>
        </form>
      `,
      onMount: (body) => {
        body.querySelector('#heir-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          try {
            await insertRow('heirs', {
              user_id: user.id,
              heir_name: body.querySelector('#heir-name').value.trim(),
              heir_email: body.querySelector('#heir-email').value.trim(),
              relationship: body.querySelector('#heir-relationship').value,
              access_level: body.querySelector('input[name="access"]:checked').value,
              status: 'pending',
            });
            toast('Heir designated successfully', 'success');
            const { closeModal } = await import('../components/modal.js');
            closeModal();
            loadHeirs();
          } catch (err) {
            toast('Failed to add heir', 'error');
          }
        });
      }
    });
  });

  loadHeirs();
}
