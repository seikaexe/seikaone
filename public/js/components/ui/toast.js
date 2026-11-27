/**
 * SeikaOne.id - Modern Toast Notification System (ZyroToast)
 * High-performance, floating top-center toast with slide-in animations & auto-dismiss
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroToast = factory();
    // Seamless backward compatibility with existing showToast across all pages
    root.showToast = function (msg, type = true, duration = 4000) {
      return root.ZyroToast.show(msg, type, duration);
    };
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let containerEl = null;

  function ensureContainer() {
    if (containerEl && document.body.contains(containerEl)) return containerEl;

    containerEl = document.getElementById('zyroToastContainer');
    if (!containerEl) {
      containerEl = document.createElement('div');
      containerEl.id = 'zyroToastContainer';
      containerEl.className = 'zyro-toast-container';
      document.body.appendChild(containerEl);
    }
    return containerEl;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Display modern toast
   * @param {string} msg
   * @param {boolean|string} type ('success'|'error'|'warning'|'info' or boolean)
   * @param {number} duration
   */
  function show(msg, type = 'success', duration = 4000) {
    const container = ensureContainer();
    const message = String(msg || '');

    // Resolve type
    let resolvedType = 'info';
    if (type === true || type === 'success') {
      resolvedType = 'success';
    } else if (type === false || type === 'error') {
      resolvedType = 'error';
    } else if (typeof type === 'string') {
      resolvedType = type.toLowerCase();
    }

    // Auto-detect type from message if generic
    if (type === true && (message.toLowerCase().includes('gagal') || message.toLowerCase().includes('error'))) {
      resolvedType = 'error';
    }

    let icon = 'fa-solid fa-circle-info';
    let title = 'INFORMASI';

    if (resolvedType === 'success') {
      icon = 'fa-solid fa-circle-check';
      title = 'BERHASIL';
    } else if (resolvedType === 'error') {
      icon = 'fa-solid fa-triangle-exclamation';
      title = 'PERHATIAN';
    } else if (resolvedType === 'warning') {
      icon = 'fa-solid fa-circle-exclamation';
      title = 'PERINGATAN';
    }

    const toastItem = document.createElement('div');
    toastItem.className = `zyro-toast ${resolvedType}`;
    toastItem.setAttribute('role', 'alert');
    toastItem.innerHTML = `
      <div class="zyro-toast-icon">
        <i class="${icon}"></i>
      </div>
      <div class="zyro-toast-body">
        <div class="zyro-toast-title">${title}</div>
        <p class="zyro-toast-msg">${escapeHtml(message)}</p>
      </div>
      <button type="button" class="zyro-toast-close" title="Tutup">&times;</button>
    `;

    // Only allow max 3 toasts concurrently
    while (container.children.length >= 3) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(toastItem);

    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      toastItem.classList.add('closing');
      setTimeout(() => {
        if (toastItem.parentNode) {
          toastItem.parentNode.removeChild(toastItem);
        }
      }, 250);
    }

    const timer = setTimeout(dismiss, duration);

    toastItem.querySelector('.zyro-toast-close').addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      dismiss();
    });

    toastItem.addEventListener('click', () => {
      clearTimeout(timer);
      dismiss();
    });

    return toastItem;
  }

  return {
    show,
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info: (msg, dur) => show(msg, 'info', dur)
  };
});
