/**
 * SeikaOne.id - UI Badges & Skeleton Helpers
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroUIHelpers = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function renderBadge(label, color = '#38bdf8', icon = '') {
    const iconHtml = icon ? `<i class="${icon}"></i> ` : '';
    return `<span class="zyro-badge" style="background:${color}22;border:1px solid ${color}55;color:${color};">${iconHtml}${label}</span>`;
  }

  function renderStatusBadge(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'paid' || s === 'lunas' || s === 'completed' || s === 'active' || s === 'online') {
      return renderBadge('AKTIF / LUNAS', '#10b981', 'fa-solid fa-circle-check');
    }
    if (s === 'pending' || s === 'waiting') {
      return renderBadge('PENDING', '#f59e0b', 'fa-solid fa-clock');
    }
    if (s === 'expired' || s === 'failed' || s === 'overdue' || s === 'cancelled') {
      return renderBadge(s.toUpperCase(), '#ef4444', 'fa-solid fa-triangle-exclamation');
    }
    return renderBadge(status.toUpperCase(), '#64748b');
  }

  function renderSkeletonCard(height = '140px') {
    return `<div class="zyro-skeleton" style="width:100%;height:${height};border-radius:14px;margin-bottom:12px;"></div>`;
  }

  function renderSkeletonRows(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<div class="zyro-skeleton" style="width:100%;height:38px;border-radius:8px;margin-bottom:8px;"></div>`;
    }
    return html;
  }

  return {
    renderBadge,
    renderStatusBadge,
    renderSkeletonCard,
    renderSkeletonRows
  };
});
