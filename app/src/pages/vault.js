import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser } from '../auth.js';
import { fetchRows, insertRow, deleteRow, uploadFile, getPublicUrl } from '../supabase.js';
import { toast } from '../components/toast.js';
import { openModal } from '../components/modal.js';

export default async function vaultPage(app) {
  const user = getUser();

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'The Vault');

  main.innerHTML += `
    <div class="page-content vault-content">
      <div class="vault-toolbar">
        <div class="vault-filters">
          <button class="filter-chip active" data-filter="all">All</button>
          <button class="filter-chip" data-filter="image">Photos</button>
          <button class="filter-chip" data-filter="document">Documents</button>
          <button class="filter-chip" data-filter="video">Videos</button>
        </div>
        <div class="vault-actions">
          <button class="btn-icon" id="vault-grid-view" aria-label="Grid view">
            <span class="material-symbols-rounded">grid_view</span>
          </button>
          <button class="btn-icon" id="vault-list-view" aria-label="List view">
            <span class="material-symbols-rounded">view_list</span>
          </button>
          <button class="btn-accent" id="vault-upload-btn">
            <span class="material-symbols-rounded">cloud_upload</span>
            Upload Files
          </button>
        </div>
      </div>

      <!-- Drop Zone -->
      <div class="drop-zone" id="drop-zone">
        <div class="drop-zone-content">
          <span class="material-symbols-rounded drop-icon">cloud_upload</span>
          <p class="drop-title">Drag files here to upload</p>
          <p class="drop-subtitle">or click the Upload button • Photos, Documents, Videos</p>
        </div>
        <input type="file" id="file-input" multiple accept="image/*,video/*,.pdf,.doc,.docx,.txt" hidden>
      </div>

      <!-- Media Grid -->
      <div class="media-grid" id="media-grid">
        <div class="loading-state">
          <span class="spinner-lg"></span>
          <p>Loading your vault...</p>
        </div>
      </div>
    </div>
  `;

  const mediaGrid = app.querySelector('#media-grid');
  const dropZone = app.querySelector('#drop-zone');
  const fileInput = app.querySelector('#file-input');
  let currentFilter = 'all';
  let viewMode = 'grid';
  let mediaItems = [];

  // Load media
  async function loadMedia() {
    try {
      mediaItems = await fetchRows('media', { userId: user.id });
      renderMedia();
    } catch (e) {
      mediaGrid.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">photo_library</span>
          <p>Your vault is empty. Upload your first photos or documents to begin preserving your legacy.</p>
        </div>
      `;
    }
  }

  function renderMedia() {
    const filtered = currentFilter === 'all'
      ? mediaItems
      : mediaItems.filter(m => m.file_type === currentFilter);

    if (filtered.length === 0) {
      mediaGrid.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">photo_library</span>
          <p>${currentFilter === 'all' ? 'Your vault is empty. Upload files to begin.' : `No ${currentFilter} files found.`}</p>
        </div>
      `;
      return;
    }

    mediaGrid.className = `media-grid ${viewMode}`;
    mediaGrid.innerHTML = filtered.map(item => `
      <div class="media-card" data-id="${item.id}">
        <div class="media-preview">
          ${item.file_type === 'image'
            ? `<img src="${getPublicUrl('media', item.file_path)}" alt="${item.caption || item.file_name}" loading="lazy">`
            : `<div class="media-file-icon">
                <span class="material-symbols-rounded">${item.file_type === 'video' ? 'videocam' : 'description'}</span>
              </div>`
          }
        </div>
        <div class="media-info">
          <span class="media-name">${item.file_name}</span>
          <span class="media-meta">${formatFileSize(item.file_size)} ${item.year ? `• ${item.year}` : ''}</span>
        </div>
        <div class="media-actions">
          <button class="btn-icon-sm media-delete" data-id="${item.id}" data-path="${item.file_path}" aria-label="Delete">
            <span class="material-symbols-rounded">delete</span>
          </button>
        </div>
      </div>
    `).join('');

    // Delete handlers
    mediaGrid.querySelectorAll('.media-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!confirm('Delete this file from your archive?')) return;
        try {
          await deleteRow('media', id);
          toast('File removed from vault', 'info');
          loadMedia();
        } catch (err) {
          toast('Failed to delete file', 'error');
        }
      });
    });

    // Lightbox for images
    mediaGrid.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        const item = mediaItems.find(m => m.id === card.dataset.id);
        if (item?.file_type === 'image') {
          openModal({
            title: item.caption || item.file_name,
            size: 'lg',
            body: `
              <div class="lightbox">
                <img src="${getPublicUrl('media', item.file_path)}" alt="${item.file_name}">
                ${item.caption ? `<p class="lightbox-caption">${item.caption}</p>` : ''}
              </div>
            `
          });
        }
      });
    });
  }

  // Upload handler
  async function handleFiles(files) {
    for (const file of files) {
      const fileType = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('video/') ? 'video' : 'document';
      const path = `${user.id}/${Date.now()}_${file.name}`;

      try {
        toast(`Uploading ${file.name}...`, 'info', 2000);
        await uploadFile('media', path, file);
        await insertRow('media', {
          user_id: user.id,
          file_name: file.name,
          file_path: path,
          file_type: fileType,
          file_size: file.size,
        });
        toast(`${file.name} uploaded successfully`, 'success');
      } catch (err) {
        toast(`Failed to upload ${file.name}`, 'error');
      }
    }
    loadMedia();
  }

  // File input
  app.querySelector('#vault-upload-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-active'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    handleFiles(e.dataTransfer.files);
  });

  // Filter chips
  app.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      app.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderMedia();
    });
  });

  // View toggle
  app.querySelector('#vault-grid-view').addEventListener('click', () => { viewMode = 'grid'; renderMedia(); });
  app.querySelector('#vault-list-view').addEventListener('click', () => { viewMode = 'list'; renderMedia(); });

  loadMedia();
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
