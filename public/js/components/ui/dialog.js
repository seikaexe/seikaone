/**
 * SeikaOne.id - Modern Dialog System (ZyroDialog)
 * Replaces native window.confirm, window.alert, and window.prompt
 * Features: Dark backdrop-blur, semantic icons, animated cards, loading states, accessibility
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroDialog = factory();
    root.ZyroConfirm = root.ZyroDialog.confirm;
    root.ZyroAlert = root.ZyroDialog.alert;
    root.ZyroPrompt = root.ZyroDialog.prompt;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Ensure DOM container exists
  let backdropEl = null;

  function ensureBackdrop() {
    if (backdropEl && document.body.contains(backdropEl)) return backdropEl;

    backdropEl = document.createElement('div');
    backdropEl.id = 'zyroDialogBackdrop';
    backdropEl.className = 'zyro-modal-backdrop';
    backdropEl.setAttribute('role', 'dialog');
    backdropEl.setAttribute('aria-modal', 'true');
    document.body.appendChild(backdropEl);

    // Close on backdrop click (if allowed)
    backdropEl.addEventListener('click', (e) => {
      if (e.target === backdropEl && backdropEl.dataset.allowBackdropClose === 'true') {
        const cancelBtn = backdropEl.querySelector('.zyro-btn-secondary');
        if (cancelBtn) cancelBtn.click();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdropEl && backdropEl.classList.contains('show')) {
        const cancelBtn = backdropEl.querySelector('.zyro-btn-secondary') || backdropEl.querySelector('.zyro-btn-primary');
        if (cancelBtn) cancelBtn.click();
      }
    });

    return backdropEl;
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
   * Modern Confirmation Modal
   * Returns Promise<boolean>
   */
  function confirm(options) {
    return new Promise((resolve) => {
      const container = ensureBackdrop();
      
      let config = {
        title: 'Konfirmasi Tindakan',
        tag: 'KONFIRMASI',
        message: '',
        icon: 'fa-solid fa-triangle-exclamation',
        type: 'danger', // 'danger' | 'warning' | 'primary' | 'success'
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        isDestructive: false,
        details: []
      };

      if (typeof options === 'string') {
        config.message = options;
        const lower = options.toLowerCase();
        if (lower.includes('hapus') || lower.includes('delete') || lower.includes('keluar') || lower.includes('reset') || lower.includes('hentikan')) {
          config.isDestructive = true;
          config.type = 'danger';
          config.title = lower.includes('keluar') ? 'Konfirmasi Keluar' : (lower.includes('hapus') ? 'Konfirmasi Hapus' : 'Konfirmasi Tindakan');
          config.confirmText = lower.includes('keluar') ? 'Ya, Keluar' : (lower.includes('hapus') ? 'Ya, Hapus' : 'Lanjutkan');
        } else {
          config.type = 'primary';
        }
      } else if (typeof options === 'object' && options !== null) {
        config = { ...config, ...options };
        if (config.isDestructive) {
          config.type = 'danger';
        }
      }

      const iconClass = config.type === 'danger' ? 'danger' : (config.type === 'warning' ? 'warning' : (config.type === 'success' ? 'success' : 'info'));
      const confirmBtnClass = config.isDestructive ? 'zyro-btn-danger' : 'zyro-btn-primary';

      // Build breakdown HTML
      let breakdownHtml = '';
      if (Array.isArray(config.details) && config.details.length > 0) {
        breakdownHtml = `
          <div class="zyro-modal-details">
            ${config.details.map(item => `
              <div class="zyro-detail-row ${item.isTotal ? 'total' : ''}">
                <span>${escapeHtml(item.label)}</span>
                <b style="${item.color ? 'color:' + item.color + ';' : ''}">${escapeHtml(item.value)}</b>
              </div>
            `).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div class="zyro-modal-card">
          <div class="zyro-modal-head">
            <div class="zyro-modal-icon-badge ${iconClass}">
              <i class="${config.icon}"></i>
            </div>
            <div class="zyro-modal-head-text">
              <span class="zyro-modal-tag">${escapeHtml(config.tag)}</span>
              <h3 class="zyro-modal-title">${escapeHtml(config.title)}</h3>
            </div>
          </div>
          <div class="zyro-modal-desc">${config.message.includes('<') ? config.message : escapeHtml(config.message).replace(/\n/g, '<br>')}</div>
          ${breakdownHtml}
          <div class="zyro-modal-actions">
            <button type="button" class="zyro-btn zyro-btn-secondary" id="zyroCancelBtn">${escapeHtml(config.cancelText)}</button>
            <button type="button" class="zyro-btn ${confirmBtnClass}" id="zyroConfirmBtn">${escapeHtml(config.confirmText)}</button>
          </div>
        </div>
      `;

      container.dataset.allowBackdropClose = 'true';
      container.classList.add('show');
      document.body.style.overflow = 'hidden';

      const cancelBtn = container.querySelector('#zyroCancelBtn');
      const confirmBtn = container.querySelector('#zyroConfirmBtn');

      function cleanup(val) {
        container.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
          if (!container.classList.contains('show')) {
            container.innerHTML = '';
          }
        }, 250);
        resolve(val);
      }

      cancelBtn.addEventListener('click', () => cleanup(false));
      confirmBtn.addEventListener('click', () => {
        // Optional loading spinner state
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="zyro-btn-spinner"></span> Memproses...';
        setTimeout(() => cleanup(true), 120);
      });

      // Auto-focus confirm button
      setTimeout(() => confirmBtn.focus(), 50);
    });
  }

  /**
   * Modern Alert Modal
   * Returns Promise<void>
   */
  function alert(message, options = {}) {
    return new Promise((resolve) => {
      const container = ensureBackdrop();

      let config = {
        title: 'Pemberitahuan',
        tag: 'INFORMASI',
        message: String(message || ''),
        icon: 'fa-solid fa-circle-info',
        type: 'info',
        okText: 'Mengerti'
      };

      if (typeof options === 'string') {
        config.type = options;
      } else if (typeof options === 'object' && options !== null) {
        config = { ...config, ...options };
      }

      const lower = config.message.toLowerCase();
      if (!options.type) {
        if (lower.includes('berhasil') || lower.includes('sukses') || lower.includes('success')) {
          config.type = 'success';
          config.title = config.title === 'Pemberitahuan' ? 'Berhasil' : config.title;
          config.tag = 'SUKSES';
          config.icon = 'fa-solid fa-circle-check';
        } else if (lower.includes('gagal') || lower.includes('error') || lower.includes('salah') || lower.includes('ditolak')) {
          config.type = 'danger';
          config.title = config.title === 'Pemberitahuan' ? 'Perhatian' : config.title;
          config.tag = 'PERINGATAN';
          config.icon = 'fa-solid fa-triangle-exclamation';
        } else if (lower.includes('peringatan') || lower.includes('menunggak') || lower.includes('terkunci')) {
          config.type = 'warning';
          config.title = config.title === 'Pemberitahuan' ? 'Peringatan' : config.title;
          config.tag = 'PERINGATAN';
          config.icon = 'fa-solid fa-triangle-exclamation';
        }
      }

      const iconClass = config.type === 'danger' ? 'danger' : (config.type === 'warning' ? 'warning' : (config.type === 'success' ? 'success' : 'info'));

      container.innerHTML = `
        <div class="zyro-modal-card">
          <div class="zyro-modal-head">
            <div class="zyro-modal-icon-badge ${iconClass}">
              <i class="${config.icon}"></i>
            </div>
            <div class="zyro-modal-head-text">
              <span class="zyro-modal-tag">${escapeHtml(config.tag)}</span>
              <h3 class="zyro-modal-title">${escapeHtml(config.title)}</h3>
            </div>
          </div>
          <div class="zyro-modal-desc">${config.message.includes('<') ? config.message : escapeHtml(config.message).replace(/\n/g, '<br>')}</div>
          <div class="zyro-modal-actions">
            <button type="button" class="zyro-btn zyro-btn-primary" style="flex:1;" id="zyroAlertOkBtn">${escapeHtml(config.okText)}</button>
          </div>
        </div>
      `;

      container.dataset.allowBackdropClose = 'true';
      container.classList.add('show');
      document.body.style.overflow = 'hidden';

      const okBtn = container.querySelector('#zyroAlertOkBtn');
      function cleanup() {
        container.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
          if (!container.classList.contains('show')) {
            container.innerHTML = '';
          }
        }, 250);
        resolve();
      }

      okBtn.addEventListener('click', cleanup);
      setTimeout(() => okBtn.focus(), 50);
    });
  }

  /**
   * Modern Prompt Modal
   * Returns Promise<string | null>
   */
  function prompt(message, defaultValue = '', options = {}) {
    return new Promise((resolve) => {
      const container = ensureBackdrop();

      let config = {
        title: 'Input Diperlukan',
        tag: 'INPUT',
        message: String(message || ''),
        placeholder: 'Ketik di sini...',
        confirmText: 'Simpan',
        cancelText: 'Batal'
      };

      if (typeof options === 'object' && options !== null) {
        config = { ...config, ...options };
      }

      container.innerHTML = `
        <div class="zyro-modal-card">
          <div class="zyro-modal-head">
            <div class="zyro-modal-icon-badge info">
              <i class="fa-solid fa-pen-to-square"></i>
            </div>
            <div class="zyro-modal-head-text">
              <span class="zyro-modal-tag">${escapeHtml(config.tag)}</span>
              <h3 class="zyro-modal-title">${escapeHtml(config.title)}</h3>
            </div>
          </div>
          <div class="zyro-modal-desc">${config.message.includes('<') ? config.message : escapeHtml(config.message).replace(/\n/g, '<br>')}</div>
          <div class="zyro-prompt-input-wrap">
            <input type="text" class="zyro-prompt-input" id="zyroPromptVal" placeholder="${escapeHtml(config.placeholder)}" value="${escapeHtml(defaultValue)}">
          </div>
          <div class="zyro-modal-actions">
            <button type="button" class="zyro-btn zyro-btn-secondary" id="zyroPromptCancelBtn">${escapeHtml(config.cancelText)}</button>
            <button type="button" class="zyro-btn zyro-btn-primary" id="zyroPromptOkBtn">${escapeHtml(config.confirmText)}</button>
          </div>
        </div>
      `;

      container.dataset.allowBackdropClose = 'false';
      container.classList.add('show');
      document.body.style.overflow = 'hidden';

      const input = container.querySelector('#zyroPromptVal');
      const cancelBtn = container.querySelector('#zyroPromptCancelBtn');
      const okBtn = container.querySelector('#zyroPromptOkBtn');

      function cleanup(val) {
        container.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
          if (!container.classList.contains('show')) {
            container.innerHTML = '';
          }
        }, 250);
        resolve(val);
      }

      cancelBtn.addEventListener('click', () => cleanup(null));
      okBtn.addEventListener('click', () => cleanup(input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') cleanup(input.value);
      });

      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    });
  }

  // Intercept native browser alert and prompt transparently
  if (typeof window !== 'undefined') {
    window.alert = function (msg) {
      return alert(msg);
    };
    window.prompt = function (msg, defaultVal) {
      return prompt(msg, defaultVal);
    };
  }

  return {
    confirm,
    alert,
    prompt
  };
});
