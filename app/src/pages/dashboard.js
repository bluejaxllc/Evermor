import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getProfile, getUser } from '../auth.js';
import { fetchRows } from '../supabase.js';
import { navigate } from '../router.js';

const PROMPTS = [
  "What would you tell your grandchildren about finding happiness?",
  "Describe the moment you knew what truly mattered in life.",
  "What's the hardest lesson you've ever learned?",
  "If you could leave one piece of advice for the future, what would it be?",
  "What's a story about you that only you can tell?",
  "Describe a person who changed the course of your life.",
  "What does home mean to you?",
  "What are you most proud of that nobody knows about?"
];

export default async function dashboardPage(app) {
  const user = getUser();
  const profile = getProfile();
  const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  // Fetch stats
  let stats = { stories: 0, media: 0, voice: 0, timeline: 0, heirs: 0 };
  let recentActivity = [];

  try {
    const [stories, media, voice, timeline, heirs] = await Promise.all([
      fetchRows('stories', { userId: user.id }).catch(() => []),
      fetchRows('media', { userId: user.id }).catch(() => []),
      fetchRows('voice_recordings', { userId: user.id }).catch(() => []),
      fetchRows('timeline_events', { userId: user.id }).catch(() => []),
      fetchRows('heirs', { userId: user.id }).catch(() => []),
    ]);
    stats = {
      stories: stories.length,
      media: media.length,
      voice: voice.length,
      timeline: timeline.length,
      heirs: heirs.length
    };
    // Combine recent items for activity feed
    const all = [
      ...stories.map(s => ({ type: 'story', title: s.title, icon: 'auto_stories', date: s.created_at })),
      ...media.map(m => ({ type: 'media', title: m.file_name, icon: 'photo_library', date: m.created_at })),
      ...voice.map(v => ({ type: 'voice', title: v.title, icon: 'mic', date: v.created_at })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    recentActivity = all;
  } catch (e) { /* stats remain 0 */ }

  const totalItems = stats.stories + stats.media + stats.voice + stats.timeline;
  const completeness = Math.min(100, Math.round((totalItems / 20) * 100)); // 20 items = 100%

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Dashboard');

  main.innerHTML += `
    <div class="page-content dashboard-content">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h2>Welcome, ${profile?.full_name || 'Archivist'}</h2>
          <p>Your archive is ${completeness}% complete. Keep building your legacy.</p>
        </div>
        <div class="archive-score">
          <div class="score-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" class="score-bg" />
              <circle cx="60" cy="60" r="52" class="score-fill" style="stroke-dasharray: ${completeness * 3.267} 326.7" />
            </svg>
            <span class="score-value">${completeness}%</span>
          </div>
          <span class="score-label">Archive Health</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" data-nav="/stories">
          <div class="stat-icon"><span class="material-symbols-rounded">auto_stories</span></div>
          <div class="stat-info">
            <span class="stat-number">${stats.stories}</span>
            <span class="stat-label">Stories</span>
          </div>
        </div>
        <div class="stat-card" data-nav="/vault">
          <div class="stat-icon"><span class="material-symbols-rounded">photo_library</span></div>
          <div class="stat-info">
            <span class="stat-number">${stats.media}</span>
            <span class="stat-label">Media Files</span>
          </div>
        </div>
        <div class="stat-card" data-nav="/voice">
          <div class="stat-icon"><span class="material-symbols-rounded">mic</span></div>
          <div class="stat-info">
            <span class="stat-number">${stats.voice}</span>
            <span class="stat-label">Voice Recordings</span>
          </div>
        </div>
        <div class="stat-card" data-nav="/timeline">
          <div class="stat-icon"><span class="material-symbols-rounded">timeline</span></div>
          <div class="stat-info">
            <span class="stat-number">${stats.timeline}</span>
            <span class="stat-label">Life Events</span>
          </div>
        </div>
        <div class="stat-card" data-nav="/heirs">
          <div class="stat-icon"><span class="material-symbols-rounded">group</span></div>
          <div class="stat-info">
            <span class="stat-number">${stats.heirs}</span>
            <span class="stat-label">Designated Heirs</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions + Prompt -->
      <div class="dashboard-grid">
        <div class="quick-actions card-glass">
          <h3 class="card-title">Quick Actions</h3>
          <div class="actions-list">
            <button class="action-btn" data-nav="/voice">
              <span class="material-symbols-rounded">mic</span>
              <span>Record a Voice Message</span>
            </button>
            <button class="action-btn" data-nav="/stories">
              <span class="material-symbols-rounded">edit_note</span>
              <span>Write a Story</span>
            </button>
            <button class="action-btn" data-nav="/vault">
              <span class="material-symbols-rounded">cloud_upload</span>
              <span>Upload to Vault</span>
            </button>
            <button class="action-btn" data-nav="/timeline">
              <span class="material-symbols-rounded">add_circle</span>
              <span>Add Life Event</span>
            </button>
          </div>
        </div>

        <div class="prompt-card card-glass">
          <div class="prompt-icon">💡</div>
          <h3 class="prompt-title">Today's Prompt</h3>
          <p class="prompt-text">"${randomPrompt}"</p>
          <button class="btn-outline" data-nav="/stories">Start Writing</button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section card-glass">
        <h3 class="card-title">Recent Activity</h3>
        ${recentActivity.length > 0 ? `
          <div class="activity-list">
            ${recentActivity.map(item => `
              <div class="activity-item">
                <span class="material-symbols-rounded activity-icon">${item.icon}</span>
                <div class="activity-info">
                  <span class="activity-title">${item.title || 'Untitled'}</span>
                  <span class="activity-date">${formatRelativeTime(item.date)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">inventory_2</span>
            <p>Your archive is empty. Start by recording a voice message or writing your first story.</p>
          </div>
        `}
      </div>
    </div>
  `;

  // Navigation handlers
  app.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
