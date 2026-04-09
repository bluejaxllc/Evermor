import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser } from '../auth.js';
import { fetchRows, insertRow, updateRow, deleteRow } from '../supabase.js';
import { toast } from '../components/toast.js';
import { openModal } from '../components/modal.js';

const CATEGORIES = [
  { value: 'philosophy', label: 'Philosophy', icon: '🧠' },
  { value: 'memory', label: 'Memory', icon: '💭' },
  { value: 'lesson', label: 'Life Lesson', icon: '📖' },
  { value: 'letter', label: 'Letter', icon: '✉️' },
  { value: 'wisdom', label: 'Wisdom', icon: '💡' },
];

export default async function storiesPage(app) {
  const user = getUser();

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Stories');

  main.innerHTML += `
    <div class="page-content stories-content">
      <div class="stories-toolbar">
        <div class="category-tabs">
          <button class="cat-tab active" data-cat="all">All</button>
          ${CATEGORIES.map(c => `<button class="cat-tab" data-cat="${c.value}">${c.icon} ${c.label}</button>`).join('')}
        </div>
        <button class="btn-accent" id="new-story-btn">
          <span class="material-symbols-rounded">edit_note</span>
          Write New Story
        </button>
      </div>

      <div class="stories-list" id="stories-list">
        <div class="loading-state">
          <span class="spinner-lg"></span>
          <p>Loading your stories...</p>
        </div>
      </div>
    </div>

    <!-- Story Editor (hidden by default) -->
    <div class="story-editor-overlay" id="story-editor" style="display:none;">
      <div class="story-editor">
        <div class="editor-toolbar">
          <button class="btn-ghost" id="editor-back">
            <span class="material-symbols-rounded">arrow_back</span>
            Back
          </button>
          <div class="editor-meta">
            <select id="editor-category" class="editor-select">
              ${CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${c.label}</option>`).join('')}
            </select>
            <label class="editor-toggle">
              <input type="checkbox" id="editor-private">
              <span class="material-symbols-rounded">lock</span>
              Private
            </label>
          </div>
          <button class="btn-accent" id="editor-save">
            <span class="material-symbols-rounded">save</span>
            Save
          </button>
        </div>
        <input type="text" id="editor-title" class="editor-title-input" placeholder="Give your story a title...">
        <textarea id="editor-content" class="editor-content-input" placeholder="Start writing your story...&#10;&#10;Pour your heart out. Share your wisdom, memories, or a letter to someone you love. This will live forever."></textarea>
        <div class="editor-stats">
          <span id="word-count">0 words</span>
          <span id="read-time">0 min read</span>
        </div>
      </div>
    </div>
  `;

  const storiesList = app.querySelector('#stories-list');
  const editorOverlay = app.querySelector('#story-editor');
  let stories = [];
  let currentCat = 'all';
  let editingId = null;

  async function loadStories() {
    try {
      stories = await fetchRows('stories', { userId: user.id });
      renderStories();
    } catch (e) {
      storiesList.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">auto_stories</span>
          <p>You haven't written any stories yet. Your words are the most powerful legacy you can leave behind.</p>
          <button class="btn-outline" id="empty-write-btn">Write Your First Story</button>
        </div>
      `;
      storiesList.querySelector('#empty-write-btn')?.addEventListener('click', () => openEditor());
    }
  }

  function renderStories() {
    const filtered = currentCat === 'all' ? stories : stories.filter(s => s.category === currentCat);

    if (filtered.length === 0) {
      storiesList.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">auto_stories</span>
          <p>${currentCat === 'all' ? 'No stories yet. Start writing your legacy.' : `No ${currentCat} stories found.`}</p>
        </div>
      `;
      return;
    }

    storiesList.innerHTML = filtered.map(story => {
      const cat = CATEGORIES.find(c => c.value === story.category);
      const wordCount = (story.content || '').split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      const preview = (story.content || '').slice(0, 180) + ((story.content || '').length > 180 ? '...' : '');

      return `
        <div class="story-card" data-id="${story.id}">
          <div class="story-card-header">
            <span class="story-cat-badge">${cat?.icon || '📝'} ${cat?.label || story.category}</span>
            ${story.is_private ? '<span class="material-symbols-rounded story-lock">lock</span>' : ''}
          </div>
          <h3 class="story-card-title">${story.title || 'Untitled'}</h3>
          <p class="story-card-preview">${preview}</p>
          <div class="story-card-footer">
            <span class="story-card-meta">${wordCount} words • ${readTime} min read</span>
            <span class="story-card-date">${new Date(story.created_at).toLocaleDateString()}</span>
          </div>
          <div class="story-card-actions">
            <button class="btn-icon-sm story-edit" data-id="${story.id}" aria-label="Edit">
              <span class="material-symbols-rounded">edit</span>
            </button>
            <button class="btn-icon-sm story-delete" data-id="${story.id}" aria-label="Delete">
              <span class="material-symbols-rounded">delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Edit handlers
    storiesList.querySelectorAll('.story-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const story = stories.find(s => s.id === btn.dataset.id);
        if (story) openEditor(story);
      });
    });

    // Delete handlers
    storiesList.querySelectorAll('.story-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Delete this story permanently?')) return;
        try {
          await deleteRow('stories', btn.dataset.id);
          toast('Story deleted', 'info');
          loadStories();
        } catch (err) {
          toast('Failed to delete story', 'error');
        }
      });
    });

    // Click to view/edit
    storiesList.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => {
        const story = stories.find(s => s.id === card.dataset.id);
        if (story) openEditor(story);
      });
    });
  }

  function openEditor(story = null) {
    editingId = story?.id || null;
    app.querySelector('#editor-title').value = story?.title || '';
    app.querySelector('#editor-content').value = story?.content || '';
    app.querySelector('#editor-category').value = story?.category || 'memory';
    app.querySelector('#editor-private').checked = story?.is_private || false;
    editorOverlay.style.display = 'flex';
    updateWordCount();
    app.querySelector('#editor-title').focus();
  }

  function closeEditor() {
    editorOverlay.style.display = 'none';
    editingId = null;
  }

  function updateWordCount() {
    const text = app.querySelector('#editor-content').value;
    const words = text.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    app.querySelector('#word-count').textContent = `${words} words`;
    app.querySelector('#read-time').textContent = `${readTime} min read`;
  }

  // Editor events
  app.querySelector('#editor-back').addEventListener('click', closeEditor);
  app.querySelector('#editor-content').addEventListener('input', updateWordCount);

  app.querySelector('#editor-save').addEventListener('click', async () => {
    const title = app.querySelector('#editor-title').value.trim();
    const content = app.querySelector('#editor-content').value.trim();
    const category = app.querySelector('#editor-category').value;
    const is_private = app.querySelector('#editor-private').checked;

    if (!title && !content) {
      toast('Write something before saving', 'warning');
      return;
    }

    try {
      if (editingId) {
        await updateRow('stories', editingId, { title, content, category, is_private, updated_at: new Date().toISOString() });
        toast('Story updated', 'success');
      } else {
        await insertRow('stories', { user_id: user.id, title, content, category, is_private });
        toast('Story saved to your archive', 'success');
      }
      closeEditor();
      loadStories();
    } catch (err) {
      toast('Failed to save story', 'error');
    }
  });

  // New story button
  app.querySelector('#new-story-btn').addEventListener('click', () => openEditor());

  // Category tabs
  app.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      app.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCat = tab.dataset.cat;
      renderStories();
    });
  });

  loadStories();
}
