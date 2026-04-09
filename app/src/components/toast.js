/* ── Toast Notification System ──────────────── */

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {string} message 
 * @param {'success'|'error'|'info'|'warning'} type 
 * @param {number} duration - ms
 */
export function toast(message, type = 'info', duration = 4000) {
  const container = ensureContainer();

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="material-symbols-rounded toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">
      <span class="material-symbols-rounded">close</span>
    </button>
  `;

  container.appendChild(el);

  // Trigger enter animation
  requestAnimationFrame(() => el.classList.add('show'));

  // Auto-dismiss
  const timer = setTimeout(() => dismiss(el), duration);

  // Manual dismiss
  el.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    dismiss(el);
  });
}

function dismiss(el) {
  el.classList.remove('show');
  el.classList.add('hide');
  el.addEventListener('animationend', () => el.remove());
}
