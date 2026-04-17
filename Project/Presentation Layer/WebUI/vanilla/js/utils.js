// ===== Utility Functions =====

// Icon helper - uses Lucide icons loaded via CDN
export function icon(name, className = 'w-4 h-4') {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

// Initialize all Lucide icons in a container
export function initIcons(container) {
  if (window.lucide) {
    window.lucide.createIcons({ nodes: container ? [container] : undefined });
  }
}

// Format price in VND
export function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ';
}

// Format date in Vietnamese
export function formatDate(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('vi-VN');
}

// Create dialog
export function showDialog(content, options = {}) {
  const { maxWidth = '', onClose } = options;
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <div class="dialog-content ${maxWidth}">
      <button class="dialog-close-btn" data-close>
        ${icon('x', 'w-5 h-5')}
      </button>
      ${content}
    </div>
  `;

  document.body.appendChild(backdrop);
  initIcons(backdrop);

  const close = () => {
    backdrop.remove();
    if (onClose) onClose();
  };

  backdrop.querySelector('[data-close]').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  return { close, element: backdrop };
}

// Confirm dialog
export function showConfirm(title, description, onConfirm) {
  const content = `
    <div class="dialog-header">
      <h3 class="dialog-title">${title}</h3>
      <p class="dialog-description">${description}</p>
    </div>
    <div class="dialog-footer">
      <button class="btn btn-outline" data-close>Hủy</button>
      <button class="btn btn-default" data-confirm>Xác nhận</button>
    </div>
  `;

  const dialog = showDialog(content);

  dialog.element.querySelector('[data-confirm]').addEventListener('click', () => {
    dialog.close();
    onConfirm();
  });
}

// Debounce
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Simple state management helper
export function createState(initialValue) {
  let value = initialValue;
  const listeners = [];

  return {
    get: () => value,
    set: (newValue) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
      listeners.forEach(fn => fn(value));
    },
    subscribe: (fn) => {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
  };
}
