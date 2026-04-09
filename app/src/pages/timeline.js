import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getUser } from '../auth.js';
import { fetchRows, insertRow, deleteRow } from '../supabase.js';
import { toast } from '../components/toast.js';
import { openModal } from '../components/modal.js';

const EVENT_CATS = [
  { value: 'birth', label: 'Birth', icon: '👶', color: '#A7FFEB' },
  { value: 'education', label: 'Education', icon: '🎓', color: '#80D8FF' },
  { value: 'career', label: 'Career', icon: '💼', color: '#FFD740' },
  { value: 'family', label: 'Family', icon: '❤️', color: '#FF8A80' },
  { value: 'milestone', label: 'Milestone', icon: '🏆', color: '#B388FF' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#CCFF90' },
];

export default async function timelinePage(app) {
  const user = getUser();

  app.innerHTML = `<div class="app-layout"></div>`;
  const layout = app.querySelector('.app-layout');
  renderSidebar(layout);

  const main = document.createElement('main');
  main.className = 'main-content';
  layout.appendChild(main);
  renderHeader(main, 'Life Timeline');

  main.innerHTML += `
    <div class="page-content timeline-content">
      <div class="timeline-toolbar">
        <p class="timeline-subtitle">Plot the milestones that defined your journey through life.</p>
        <button class="btn-accent" id="add-event-btn">
          <span class="material-symbols-rounded">add_circle</span>
          Add Life Event
        </button>
      </div>

      <div class="timeline-track" id="timeline-track">
        <div class="loading-state">
          <span class="spinner-lg"></span>
          <p>Loading your timeline...</p>
        </div>
      </div>
    </div>
  `;

  const track = app.querySelector('#timeline-track');

  async function loadTimeline() {
    try {
      const events = await fetchRows('timeline_events', { userId: user.id, orderBy: 'event_date', ascending: true });

      if (events.length === 0) {
        track.innerHTML = `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">timeline</span>
            <p>Your timeline is empty. Start by adding your birth as the first milestone.</p>
          </div>
        `;
        return;
      }

      track.innerHTML = `
        <div class="timeline-line-vertical"></div>
        ${events.map((ev, i) => {
          const cat = EVENT_CATS.find(c => c.value === ev.category) || EVENT_CATS[4];
          const side = i % 2 === 0 ? 'left' : 'right';
          const dateStr = ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
          return `
            <div class="tl-event tl-${side}">
              <div class="tl-dot" style="background: ${cat.color}; box-shadow: 0 0 15px ${cat.color}40;"></div>
              <div class="tl-card card-glass">
                <div class="tl-card-header">
                  <span class="tl-cat-badge" style="color: ${cat.color}">${cat.icon} ${cat.label}</span>
                  <button class="btn-icon-sm tl-delete" data-id="${ev.id}" aria-label="Delete">
                    <span class="material-symbols-rounded">close</span>
                  </button>
                </div>
                <h4 class="tl-card-title">${ev.title}</h4>
                ${ev.description ? `<p class="tl-card-desc">${ev.description}</p>` : ''}
                <span class="tl-card-date">${dateStr}</span>
              </div>
            </div>
          `;
        }).join('')}
      `;

      // Delete handlers
      track.querySelectorAll('.tl-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Remove this event from your timeline?')) return;
          try {
            await deleteRow('timeline_events', btn.dataset.id);
            toast('Event removed', 'info');
            loadTimeline();
          } catch (err) {
            toast('Failed to delete event', 'error');
          }
        });
      });
    } catch (e) {
      track.innerHTML = `<div class="empty-state"><p>Could not load timeline.</p></div>`;
    }
  }

  // Add event modal
  app.querySelector('#add-event-btn').addEventListener('click', () => {
    openModal({
      title: 'Add Life Event',
      size: 'md',
      body: `
        <form id="event-form" class="modal-form">
          <div class="form-group">
            <label>Event Title</label>
            <input type="text" id="ev-title" class="input-glass" placeholder="e.g. Graduated from MIT" required>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="ev-date" class="input-glass" required>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="ev-category" class="input-glass">
              ${EVENT_CATS.map(c => `<option value="${c.value}">${c.icon} ${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Description (optional)</label>
            <textarea id="ev-desc" class="input-glass" rows="3" placeholder="Tell the story behind this moment..."></textarea>
          </div>
          <button type="submit" class="btn-primary-full">Add to Timeline</button>
        </form>
      `,
      onMount: (body) => {
        body.querySelector('#event-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          try {
            await insertRow('timeline_events', {
              user_id: user.id,
              title: body.querySelector('#ev-title').value.trim(),
              event_date: body.querySelector('#ev-date').value,
              category: body.querySelector('#ev-category').value,
              description: body.querySelector('#ev-desc').value.trim(),
              icon: EVENT_CATS.find(c => c.value === body.querySelector('#ev-category').value)?.icon || '🏆',
            });
            toast('Life event added to your timeline', 'success');
            const { closeModal } = await import('../components/modal.js');
            closeModal();
            loadTimeline();
          } catch (err) {
            toast('Failed to add event', 'error');
          }
        });
      }
    });
  });

  loadTimeline();
}
