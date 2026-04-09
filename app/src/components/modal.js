/* ── Reusable Modal Component ─────────────── */

let activeModal = null;

/**
 * Open a modal
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.body - HTML string
 * @param {string} opts.size - 'sm' | 'md' | 'lg'
 * @param {Function} opts.onMount - called with modal content element
 * @param {Function} opts.onClose
 */
export function openModal({ title, body, size = 'md', onMount, onClose } = {}) {
  closeModal(); // Close any existing

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-${size}">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" aria-label="Close">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>
      <div class="modal-body">${body}</div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeModal = overlay;

  // Enter animation
  requestAnimationFrame(() => overlay.classList.add('show'));

  // Close handlers
  overlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', escHandler);

  // Store cleanup
  overlay._escHandler = escHandler;
  overlay._onClose = onClose;

  // Call onMount with the modal body
  if (onMount) {
    const modalBody = overlay.querySelector('.modal-body');
    onMount(modalBody);
  }

  return overlay;
}

export function closeModal() {
  if (!activeModal) return;

  const overlay = activeModal;
  document.removeEventListener('keydown', overlay._escHandler);

  overlay.classList.remove('show');
  overlay.classList.add('hide');

  overlay.addEventListener('animationend', () => {
    overlay.remove();
    if (overlay._onClose) overlay._onClose();
  }, { once: true });

  activeModal = null;
}
