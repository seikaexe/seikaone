/**
 * SeikaOne.id - Module: Product Grid Renderer
 * Defensive rendering of product cards, badges, stock indicators, and pricing
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroProductGrid = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function renderGrid(container, products, onSelectProduct) {
    if (!container) return;

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--z-text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 12px; color: var(--z-text-dim);">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0 0 6px 0;">Tidak Ada Produk Ditemukan</h4>
          <p style="font-size: 0.85rem; margin: 0;">Silakan pilih kategori lain atau periksa kembali kata kunci pencarian Anda.</p>
        </div>
      `;
      return;
    }

    const html = products.map(prod => {
      const id = prod?.id ?? '';
      const name = ZyroUtils.escapeHtml(prod?.name ?? 'Produk Digital');
      const category = ZyroUtils.escapeHtml(prod?.category ?? 'Umum');
      const price = ZyroUtils.formatRupiah(prod?.price ?? 0);
      const isOutOfStock = Boolean(prod?.isOutOfStock || prod?.stock === 0);
      const stockBadge = isOutOfStock
        ? `<span class="zyro-badge" style="background:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.35);color:#ef4444;">HABIS</span>`
        : `<span class="zyro-badge" style="background:rgba(16,185,129,0.18);border:1px solid rgba(16,185,129,0.35);color:#10b981;">TERSEDIA</span>`;
      
      const imageSrc = prod?.image || 'assets/banners/banner-vps-panel.webp';

      return `
        <div class="prod-card" data-id="${id}" style="cursor:pointer;transition:transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="position:relative;border-radius:12px;overflow:hidden;margin-bottom:12px;aspect-ratio:16/9;background:#0d1829;">
            <img src="${imageSrc}" alt="${name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
            <div style="position:absolute;top:8px;right:8px;">${stockBadge}</div>
          </div>
          <div style="font-size:0.75rem;color:var(--z-primary);font-weight:700;text-transform:uppercase;margin-bottom:4px;">${category}</div>
          <h4 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0 0 8px 0;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${name}">${name}</h4>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);">
            <div style="font-weight:900;color:var(--z-primary);font-size:1.05rem;font-family:'JetBrains Mono',monospace;">${price}</div>
            <button type="button" class="zyro-btn zyro-btn-primary" style="padding:6px 12px;font-size:0.75rem;min-height:34px;" ${isOutOfStock ? 'disabled' : ''}>
              ${isOutOfStock ? 'Habis' : 'Order'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    if (typeof onSelectProduct === 'function') {
      container.querySelectorAll('.prod-card').forEach(card => {
        card.addEventListener('click', () => {
          const prodId = card.dataset.id;
          const found = products.find(p => String(p?.id) === String(prodId));
          if (found) onSelectProduct(found);
        });
      });
    }
  }

  return { renderGrid };
});
