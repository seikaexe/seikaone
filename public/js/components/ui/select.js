/**
 * SeikaOne.id - Custom Select & Mobile Bottom-Sheet Dropdown (ZyroSelect)
 * Replaces native HTML <select> elements with an aesthetic, touch-friendly UI
 * Supports desktop popover & mobile sliding bottom-sheet with two-way sync
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroSelect = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let sharedBackdrop = null;

  function getSharedBackdrop() {
    if (sharedBackdrop && document.body.contains(sharedBackdrop)) return sharedBackdrop;
    sharedBackdrop = document.getElementById('zyroSelectBackdrop');
    if (!sharedBackdrop) {
      sharedBackdrop = document.createElement('div');
      sharedBackdrop.id = 'zyroSelectBackdrop';
      sharedBackdrop.className = 'zyro-select-backdrop';
      document.body.appendChild(sharedBackdrop);
    }
    return sharedBackdrop;
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

  const enhancedSelects = new WeakMap();

  /**
   * Enhance a single native <select> element
   * @param {HTMLSelectElement} selectEl
   */
  function enhance(selectEl) {
    if (!selectEl || selectEl.tagName !== 'SELECT') return null;
    if (enhancedSelects.has(selectEl)) return enhancedSelects.get(selectEl);
    if (selectEl.dataset.noEnhance === 'true') return null;

    // Hide native select
    selectEl.style.display = 'none';

    // Create wrapper
    const wrap = document.createElement('div');
    wrap.className = 'zyro-select-wrap';
    if (selectEl.className) {
      wrap.classList.add(...selectEl.className.split(' ').filter(c => c && c !== 'zyro-select-hidden'));
    }

    // Insert wrapper right after select
    selectEl.parentNode.insertBefore(wrap, selectEl.nextSibling);

    // Build trigger
    const trigger = document.createElement('div');
    trigger.className = 'zyro-select-trigger';
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.innerHTML = `
      <div class="zyro-select-trigger-content">
        <span class="zyro-select-trigger-label">Pilih Opsi...</span>
      </div>
      <i class="fa-solid fa-chevron-down zyro-select-chevron"></i>
    `;
    wrap.appendChild(trigger);

    // Build menu
    const menu = document.createElement('div');
    menu.className = 'zyro-select-menu';
    menu.setAttribute('role', 'listbox');
    wrap.appendChild(menu);

    const backdrop = getSharedBackdrop();

    function renderOptions() {
      menu.innerHTML = '';

      // On mobile, add bottom sheet header & pill
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const titleText = selectEl.getAttribute('aria-label') || 
                          (selectEl.previousElementSibling && selectEl.previousElementSibling.tagName === 'LABEL' ? selectEl.previousElementSibling.innerText : 'Pilih Opsi');
        
        const sheetHeader = document.createElement('div');
        sheetHeader.innerHTML = `
          <div class="zyro-select-sheet-pill"></div>
          <div class="zyro-select-sheet-header">
            <h4 class="zyro-select-sheet-title">${escapeHtml(titleText)}</h4>
            <button type="button" class="zyro-select-sheet-close" aria-label="Tutup">&times;</button>
          </div>
        `;
        menu.appendChild(sheetHeader);

        sheetHeader.querySelector('.zyro-select-sheet-close').addEventListener('click', (e) => {
          e.stopPropagation();
          closeMenu();
        });
      }

      const children = Array.from(selectEl.children);
      const selectedVal = selectEl.value;

      children.forEach(child => {
        if (child.tagName === 'OPTGROUP') {
          const groupHeader = document.createElement('div');
          groupHeader.className = 'zyro-select-optgroup';
          groupHeader.innerText = child.label;
          menu.appendChild(groupHeader);

          Array.from(child.children).forEach(opt => {
            renderSingleOption(opt);
          });
        } else if (child.tagName === 'OPTION') {
          renderSingleOption(child);
        }
      });

      function renderSingleOption(opt) {
        if (opt.style.display === 'none') return;
        const isSelected = opt.value === selectedVal;
        const optItem = document.createElement('div');
        optItem.className = `zyro-select-option ${isSelected ? 'selected' : ''}`;
        optItem.setAttribute('role', 'option');
        optItem.setAttribute('data-value', opt.value);

        const iconHtml = opt.dataset.icon ? `<i class="${opt.dataset.icon}" style="margin-right:8px;color:var(--z-primary);"></i>` : '';
        const badgeHtml = opt.dataset.badge ? `<span class="zyro-badge" style="background:${opt.dataset.badgeBg || 'rgba(14,165,233,0.18)'};color:${opt.dataset.badgeColor || '#38bdf8'};font-size:0.68rem;padding:2px 6px;">${escapeHtml(opt.dataset.badge)}</span>` : '';

        optItem.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
            ${iconHtml}
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(opt.text)}</span>
            ${badgeHtml}
          </div>
          <i class="fa-solid fa-check zyro-opt-check"></i>
        `;

        optItem.addEventListener('click', (e) => {
          e.stopPropagation();
          selectValue(opt.value);
        });

        menu.appendChild(optItem);
      }

      updateTriggerLabel();
    }

    function updateTriggerLabel() {
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      const labelEl = trigger.querySelector('.zyro-select-trigger-label');
      if (selectedOption && labelEl) {
        labelEl.innerText = selectedOption.text;
      }
    }

    function openMenu() {
      // Close other open selects first
      document.querySelectorAll('.zyro-select-wrap.open').forEach(el => {
        if (el !== wrap) el.classList.remove('open');
      });

      renderOptions();
      wrap.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');

      if (window.innerWidth <= 768) {
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMenu() {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('show');
      if (!document.querySelector('.zyro-modal-backdrop.show, .cp-modal-overlay.show')) {
        document.body.style.overflow = '';
      }
    }

    function selectValue(val) {
      if (selectEl.value !== val) {
        selectEl.value = val;
        // Dispatch standard DOM events
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        // Execute inline onchange if present
        if (typeof selectEl.onchange === 'function') {
          selectEl.onchange(new Event('change'));
        }
      }
      updateTriggerLabel();
      closeMenu();
    }

    // Toggle on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrap.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      } else if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target) && wrap.classList.contains('open')) {
        closeMenu();
      }
    });

    backdrop.addEventListener('click', () => {
      if (wrap.classList.contains('open')) closeMenu();
    });

    // Listen to external changes to selectEl
    selectEl.addEventListener('change', () => {
      updateTriggerLabel();
    });

    // Hook programmatic value changes so selectEl.value = '...' updates trigger label automatically
    try {
      const origDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
      if (origDescriptor && origDescriptor.set) {
        Object.defineProperty(selectEl, 'value', {
          get() {
            return origDescriptor.get.call(this);
          },
          set(newVal) {
            origDescriptor.set.call(this, newVal);
            updateTriggerLabel();
          },
          configurable: true
        });
      }
    } catch (e) {
      // Fallback silently if property definition is restricted
    }

    // Initial render
    updateTriggerLabel();

    const controller = {
      sync: () => {
        renderOptions();
        updateTriggerLabel();
      },
      open: openMenu,
      close: closeMenu,
      destroy: () => {
        try {
          delete selectEl.value;
        } catch (e) {}
        wrap.remove();
        selectEl.style.display = '';
        enhancedSelects.delete(selectEl);
      }
    };

    enhancedSelects.set(selectEl, controller);
    return controller;
  }

  /**
   * Auto-enhance all native selects on page
   */
  function initAll(selector = 'select:not([data-no-enhance])') {
    const list = document.querySelectorAll(selector);
    list.forEach(el => {
      // Don't enhance admin forms (.f-in) or already hidden selects unless explicitly requested
      if (el.dataset.noEnhance === 'true' || el.classList.contains('f-in')) return;
      if (el.style.display !== 'none' || el.classList.contains('warr-in') || el.dataset.enhance === 'true') {
        enhance(el);
      }
    });
  }

  // Auto-init on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initAll());
    } else {
      setTimeout(() => initAll(), 50);
    }
  }

  return {
    enhance,
    initAll,
    sync: (el) => {
      const ctrl = enhancedSelects.get(el);
      if (ctrl) ctrl.sync();
    }
  };
});
