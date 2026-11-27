/**
 * SeikaOne.id - Core Frontend Utilities
 * Defensive programming helpers, sanitization, and formatting
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.ZyroUtils = exports;
    if (typeof window !== 'undefined') {
      window.escapeHtml = window.escapeHtml || exports.escapeHtml;
      window.getSmartAvatar = window.getSmartAvatar || exports.getSmartAvatar;
      window.formatRupiah = window.formatRupiah || exports.formatRupiah;
      window.copyToClipboard = window.copyToClipboard || exports.copyToClipboard;
      window.debounce = window.debounce || exports.debounce;
      window.smoothThemeTransition = window.smoothThemeTransition || exports.smoothThemeTransition;
    }
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Escape HTML to prevent XSS injection
   */
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
   * Safe getter for nested object properties (defensive programming)
   */
  function safeGet(obj, path, fallback = undefined) {
    if (!obj || typeof obj !== 'object') return fallback;
    const keys = Array.isArray(path) ? path : String(path).split('.');
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return fallback;
      }
      current = current[key];
    }
    return current ?? fallback;
  }

  /**
   * Defensive check for non-empty arrays
   */
  function isValidArray(val) {
    return Array.isArray(val) && val.length > 0;
  }

  /**
   * Format numbers to IDR Rupiah currency
   */
  function formatRupiah(amount, withSymbol = true) {
    const num = Number(amount) || 0;
    const formatted = Math.round(num).toLocaleString('id-ID');
    return withSymbol ? `Rp ${formatted}` : formatted;
  }

  /**
   * Format date to Indonesian human-readable string
   */
  function formatDate(dateInput, withTime = true) {
    if (!dateInput) return '-';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      const options = {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      if (withTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return d.toLocaleDateString('id-ID', options);
    } catch (_) {
      return String(dateInput);
    }
  }

  /**
   * Mask email address for privacy
   */
  function maskEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return name[0] + '***@' + domain;
    return name.slice(0, 2) + '***' + name.slice(-1) + '@' + domain;
  }

  /**
   * Debounce helper
   */
  function debounce(fn, delay = 300) {
    let timeoutId = null;
    return function (...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }

  /**
   * Modern clipboard copy with fallback
   */
  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(String(text));
        return true;
      }
    } catch (_) {}
    
    // Fallback using textarea
    try {
      const textarea = document.createElement('textarea');
      textarea.value = String(text);
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      console.warn('[copyToClipboard error]:', e);
      return false;
    }
  }

  /**
   * Truncate string cleanly
   */
  function truncate(str, maxLength = 35) {
    if (!str) return '';
    const s = String(str);
    if (s.length <= maxLength) return s;
    return s.slice(0, maxLength - 3) + '...';
  }

  /**
   * Mobile Browser (Chrome/Safari) Lifecycle Recovery
   * Prevents freeze when switching apps or returning via bfcache
   */
  function setupMobileLifecycleRecovery() {
    function restoreScrollLocks() {
      const hasActiveModal = document.querySelector(
        '.zyro-modal-backdrop.show, .cp-modal-overlay.show, .modal.show, .role-sheet-backdrop.show, .zyro-select-wrap.open, .sidebar.on, .cp-sidebar.open, .adm-sidebar.open'
      );
      if (!hasActiveModal) {
        if (document.body) {
          document.body.style.overflow = '';
          document.body.classList.remove('sheet-open', 'modal-open', 'open');
        }
        if (document.documentElement) {
          document.documentElement.style.overflow = '';
        }
        const orphanBackdrops = document.querySelectorAll(
          '.zyro-select-backdrop:not(.show), .cp-sidebar-backdrop:not(.show), .role-sheet-backdrop:not(.show), .sb-ov:not(.on), .adm-sidebar-overlay:not(.open)'
        );
        orphanBackdrops.forEach(el => {
          el.style.pointerEvents = 'none';
        });
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          restoreScrollLocks();
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', () => {
        restoreScrollLocks();
      });
      window.addEventListener('focus', () => {
        restoreScrollLocks();
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupMobileLifecycleRecovery);
    } else {
      setupMobileLifecycleRecovery();
    }
  }

  /**
   * Universal Smart Avatar Generator:
   * Returns valid custom avatar, or generates an ultra-crisp modern initials gradient avatar (SVG data URI)
   */
  function getSmartAvatar(avatar, nameOrSeed = 'User') {
    if (avatar && typeof avatar === 'string') {
      const a = avatar.trim();
      if (a && 
          !a.includes('logo.png') && 
          !a.includes('anime-logo.webp') && 
          !a.includes('avatar.png') && 
          !a.includes('default-user') &&
          (a.startsWith('http://') || a.startsWith('https://') || a.startsWith('/uploads/') || a.startsWith('data:image/'))) {
        return a;
      }
    }

    const name = String(nameOrSeed || 'User');
    const clean = name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    let initials = 'U';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      initials = parts[0].slice(0, 2).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0][0].toUpperCase();
    }

    const palettes = [
      ['#0ea5e9', '#2563eb'], // Sky / Royal
      ['#10b981', '#059669'], // Emerald / Forest
      ['#8b5cf6', '#6366f1'], // Violet / Indigo
      ['#ec4899', '#be185d'], // Pink / Rose
      ['#f59e0b', '#d97706'], // Amber / Orange
      ['#06b6d4', '#0d9488'], // Cyan / Teal
      ['#f43f5e', '#e11d48'], // Rose / Red
      ['#a855f7', '#7e22ce'], // Purple
      ['#14b8a6', '#0f766e'], // Teal
      ['#3b82f6', '#1d4ed8']  // Blue
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    const color = palettes[Math.abs(hash) % palettes.length];
    const fontSize = initials.length > 1 ? '36' : '42';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color[0]}"/><stop offset="100%" stop-color="${color[1]}"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(#g)"/><circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/><text x="50" y="54" font-family="-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,sans-serif" font-size="${fontSize}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Universal Mobile Anti-Selection & Tap Highlight Cleanup
  if (typeof document !== 'undefined') {
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const anchor = sel.anchorNode;
      const el = anchor?.nodeType === 1 ? anchor : anchor?.parentElement;
      if (el && el.closest('button, a, [role="button"], .cp-sb-item, .zyro-bottom-nav, .nav, .navbar, .badge, .btn, .cat-pill')) {
        try { sel.removeAllRanges(); } catch (_) {}
      }
    });

    document.addEventListener('touchend', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('button, a, [role="button"], .cp-sb-item, .zyro-bottom-nav-item') : null;
      if (btn && typeof btn.blur === 'function') {
        setTimeout(() => {
          try { btn.blur(); } catch (_) {}
        }, 60);
      }
    }, { passive: true });
  }

  /**
   * Hardware-accelerated smooth theme transition (View Transitions API + reflow fallback)
   */
  function smoothThemeTransition(callback) {
    if (typeof callback !== 'function') return;
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      try {
        document.startViewTransition(function () {
          callback();
        });
        return;
      } catch (_) {}
    }
    if (typeof document !== 'undefined') {
      var rootEl = document.documentElement;
      var bodyEl = document.body;
      rootEl.classList.add('theme-transitioning', 'cp-theme-transitioning');
      if (bodyEl) bodyEl.classList.add('theme-transitioning', 'cp-theme-transitioning');
      void rootEl.offsetHeight;
      callback();
      clearTimeout(window.__zyroThemeTransTimer);
      window.__zyroThemeTransTimer = setTimeout(function () {
        rootEl.classList.remove('theme-transitioning', 'cp-theme-transitioning');
        if (bodyEl) bodyEl.classList.remove('theme-transitioning', 'cp-theme-transitioning');
      }, 320);
    } else {
      callback();
    }
  }

  return {
    escapeHtml,
    safeGet,
    isValidArray,
    formatRupiah,
    formatDate,
    maskEmail,
    debounce,
    copyToClipboard,
    truncate,
    getSmartAvatar,
    setupMobileLifecycleRecovery,
    smoothThemeTransition
  };
});

