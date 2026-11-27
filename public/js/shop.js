// SeikaOne.id - Main Store Script
const autoBase = window.location.origin;
const HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };
let isDark = (localStorage.getItem('seika_theme') || 'dark') === 'dark';
let _currentDetailKey = null;
let _currentUser = null;
let _authToken = localStorage.getItem('seika_user_token') || localStorage.getItem('user_token') || sessionStorage.getItem('seika_user_token') || sessionStorage.getItem('user_token') || null;
let _googleClientId = '';

function applyTheme() {
  if (typeof applyStoreTheme === 'function') {
    applyStoreTheme(isDark ? 'dark' : 'light');
    return;
  }
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', isDark);
  if (document.body) document.body.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  document.documentElement.style.removeProperty('background-color');
  document.documentElement.style.removeProperty('color');
  const btn = document.getElementById('themeBtn');
  if (btn) {
    const icon = btn.querySelector('i');
    const isSpinning = icon && icon.classList.contains('cp-theme-spin');
    if (icon) {
      icon.className = (isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon') + (isSpinning ? ' cp-theme-spin' : '');
    } else {
      btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  }
  if (typeof window.syncZyroLogos === 'function') window.syncZyroLogos();
}

// Inherit or bind unified toggleTheme
if (typeof window.toggleTheme !== 'function') {
  window.toggleTheme = function() {
    const cur = localStorage.getItem('seika_theme') || document.documentElement.getAttribute('data-theme') || (document.body && document.body.classList.contains('dark') ? 'dark' : 'light');
    const tgt = cur === 'dark' ? 'light' : 'dark';
    const executeTheme = function() {
      if (typeof applyStoreTheme === 'function') {
        applyStoreTheme(tgt);
      } else {
        isDark = (tgt === 'dark');
        applyTheme();
      }
    };
    if (window.smoothThemeTransition) {
      window.smoothThemeTransition(executeTheme);
    } else if (document.startViewTransition) {
      document.startViewTransition(executeTheme);
    } else {
      executeTheme();
    }
  };
}

function toggleSidebar(forceState) {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOv');
  if (sb && ov) {
    const isOpen = forceState !== undefined ? forceState : !sb.classList.contains('on');
    sb.classList.toggle('on', isOpen);
    ov.classList.toggle('on', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
}

const notifLog = [];
function showToast(msg, type = 'info', duration = 2800) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const icons = { info: 'fa-circle-info', success: 'fa-circle-check', warn: 'fa-triangle-exclamation' };
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="toast-icon ${type}"><i class="fa-solid ${icons[type]}"></i></div><div class="toast-msg">${msg}</div>`;
  stack.appendChild(el);
  requestAnimationFrame(() => { el.classList.add('show'); });
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 400);
  }, duration);

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  notifLog.unshift({ msg, type, time: timeStr });
  renderNotifPanel();
  const badge = document.getElementById('notif-badge');
  if (badge) badge.style.display = 'block';
}

function handleLockedMenu(e, name) {
  try {
    const raw = localStorage.getItem('seika_user_data');
    if (raw) {
      const u = JSON.parse(raw);
      const role = (u && u.role) ? String(u.role).toLowerCase() : '';
      const email = (u && u.email) ? String(u.email).toLowerCase() : '';
      if (email === 'gilangx288@gmail.com' || ['owner', 'ceo', 'adp', 'admin'].includes(role) || sessionStorage.getItem('zyro_h2h_unlocked') === '1') {
        return true;
      }
    }
  } catch (_) {}

  if (e && e.preventDefault) e.preventDefault();
  if (typeof showToast === 'function') {
    showToast('🔒 ' + (name || 'Menu ini') + ' sedang dikunci sementara untuk tahap pemeliharaan & perbaikan sistem.', 'warn', 4000);
  } else {
    alert('🔒 ' + (name || 'Menu ini') + ' sedang dikunci sementara untuk tahap pemeliharaan & perbaikan sistem. Segera hadir kembali!');
  }
  return false;
}
window.handleLockedMenu = handleLockedMenu;

function renderNotifPanel() {
  const list = document.getElementById('np-list');
  if (!list) return;
  const icons = { info: 'fa-circle-info', success: 'fa-circle-check', warn: 'fa-triangle-exclamation' };
  if (!notifLog.length) {
    list.innerHTML = '<div class="np-empty"><i class="fa-regular fa-bell-slash"></i> Belum ada notifikasi</div>';
    return;
  }
  list.innerHTML = notifLog.map(n => `
    <div class="np-item">
      <div class="np-ico ${n.type}"><i class="fa-solid ${icons[n.type]}"></i></div>
      <div><div class="np-msg">${n.msg}</div><div class="np-time">${n.time}</div></div>
    </div>`).join('');
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  const csPanel = document.getElementById('cs-panel');
  if (csPanel) csPanel.classList.remove('on');
  if (panel) {
    panel.classList.toggle('on');
    if (panel.classList.contains('on')) {
      const badge = document.getElementById('notif-badge');
      if (badge) badge.style.display = 'none';
    }
  }
}

function toggleCsPanel() {
  const csPanel = document.getElementById('cs-panel');
  const notifPanel = document.getElementById('notif-panel');
  if (notifPanel) notifPanel.classList.remove('on');
  if (csPanel) csPanel.classList.toggle('on');
}

function clearNotifs() {
  notifLog.length = 0;
  renderNotifPanel();
}

// Consolidated Global Click Listener for Menus, Dropdowns, and Modal Backdrops
document.addEventListener('click', e => {
  const target = e.target;

  // 1. Notif Panel (close when clicking outside)
  const panel = document.getElementById('notif-panel');
  const btn = document.getElementById('notif-btn');
  if (panel && panel.classList.contains('on') && !panel.contains(target) && (!btn || !btn.contains(target))) {
    panel.classList.remove('on');
  }

  // 2. CS Quick Panel (close when clicking outside)
  const csPanel = document.getElementById('cs-panel');
  const csBtn = document.getElementById('cs-btn');
  if (csPanel && csPanel.classList.contains('on') && !csPanel.contains(target) && (!csBtn || !csBtn.contains(target))) {
    csPanel.classList.remove('on');
  }

  // 3. User Dropdown Menu (close when clicking outside)
  const dropdown = document.getElementById('userDropdownMenu');
  const pill = document.getElementById('userNavPill');
  if (dropdown && dropdown.style.display !== 'none') {
    if (!dropdown.contains(target) && (!pill || !pill.contains(target))) {
      dropdown.style.display = 'none';
    }
  }

  // 4. Modal Backdrops (close when clicking outside sheet/card)
  const lbModal = document.getElementById('leaderboardModal');
  const warrModal = document.getElementById('warrantyModal');
  const authModal = document.getElementById('authModal');
  const ordersModal = document.getElementById('userOrdersModal');
  const addonModal = document.getElementById('addonInfoModal');
  const settModal = document.getElementById('accountSettingsModal');

  if (target === lbModal && typeof closeLeaderboardModal === 'function') closeLeaderboardModal();
  if (target === warrModal && typeof closeWarrantyModal === 'function') closeWarrantyModal();
  if (target === authModal && typeof closeAuthModal === 'function') closeAuthModal();
  if (target === ordersModal && typeof closeUserOrdersModal === 'function') closeUserOrdersModal();
  if (target === addonModal && typeof closeAddonInfoModal === 'function') closeAddonInfoModal();
  if (target === settModal && typeof closeAccountSettingsModal === 'function') closeAccountSettingsModal();
});

/* LIGHTBOX */
function openLightbox(src) {
  let lb = document.getElementById('img-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'img-lightbox';
    lb.innerHTML = '<img id="img-lightbox-img" alt="Preview"><button id="img-lightbox-close"><i class="fa-solid fa-xmark"></i></button>';
    document.body.appendChild(lb);
    document.getElementById('img-lightbox-close').onclick = closeLightbox;
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }
  document.getElementById('img-lightbox-img').src = src;
  lb.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('img-lightbox');
  if (lb) lb.classList.remove('on');
  document.body.style.overflow = '';
}

/* MODAL SLIDER */
let mdSlideIdx = 0;
let mdSlideTotal = 0;

function buildSlide(src, idx, item) {
  const slide = document.createElement('div');
  slide.className = 'md-slide';

  // If item is Account Premium (apk prem), show the HD app icon in the modal slider
  const isApk = item && item.category && (item.category.toLowerCase().includes('account') || item.category.toLowerCase().includes('akun'));
  if (isApk && typeof renderApkPremHeader === 'function') {
    slide.innerHTML = renderApkPremHeader(item, '');
    slide.classList.add('ptero-modal-slide');
    return slide;
  }

  // If item is Script / Source Code, render sleek tailored vector header instead of generic banner
  const catLow = (item && item.category || '').toLowerCase();
  const prodLow = (item && (item.name || item.produk || item.produkid) || '').toLowerCase();
  const isScript = catLow.includes('script') || catLow.includes('source code') || catLow.includes('sc ') || prodLow.startsWith('sc-') || prodLow.includes('script') || prodLow.includes('source code');
  if (isScript && typeof renderCustomProductHeader === 'function') {
    slide.innerHTML = renderCustomProductHeader(item, item.category || 'Script Bot & Website', '');
    slide.classList.add('ptero-modal-slide');
    return slide;
  }

  // If item has no extra images and uses catbox/roles/banner/default white raster preview, render sleek vector header
  const hasExtra = item && item.extraImgs && item.extraImgs.length > 0;
  const isGenericOrWhite = !src || src.includes('absl2t') || src.includes('assets/roles/') || src.includes('assets/banners/') || src === 'assets/logo.png';
  if (item && !hasExtra && isGenericOrWhite && typeof renderCustomProductHeader === 'function') {
    slide.innerHTML = renderCustomProductHeader(item, item.category, '');
    slide.classList.add('ptero-modal-slide');
    return slide;
  }

  const img = document.createElement('img');
  img.alt = 'Preview ' + (idx + 1);
  img.loading = idx === 0 ? 'eager' : 'lazy';
  img.src = src;
  img.onerror = () => { img.src = 'https://files.catbox.moe/b1k7l4.jpeg'; };

  const expandBtn = document.createElement('button');
  expandBtn.className = 'md-expand-btn';
  expandBtn.title = 'Lihat gambar penuh';
  expandBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
  expandBtn.onclick = (e) => {
    e.stopPropagation();
    openLightbox(img.src);
  };

  slide.appendChild(img);
  slide.appendChild(expandBtn);
  return slide;
}

function buildModalSlider(images, item) {
  const wrap = document.getElementById('md-slider-wrap');
  const track = document.getElementById('md-slider-track');
  mdSlideIdx = 0;
  mdSlideTotal = images.length;

  track.innerHTML = '';
  wrap.querySelectorAll('.md-slider-nav,.md-slider-dots').forEach(el => el.remove());

  images.forEach((src, i) => {
    track.appendChild(buildSlide(src, i, item));
  });

  if (mdSlideTotal > 1) {
    const navL = document.createElement('button');
    navL.className = 'md-slider-nav left';
    navL.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    navL.onclick = () => mdSliderNav(-1);
    wrap.appendChild(navL);

    const navR = document.createElement('button');
    navR.className = 'md-slider-nav right';
    navR.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    navR.onclick = () => mdSliderNav(1);
    wrap.appendChild(navR);

    const dotsEl = document.createElement('div');
    dotsEl.className = 'md-slider-dots';
    dotsEl.id = 'md-slider-dots';
    for (let i = 0; i < mdSlideTotal; i++) {
      const d = document.createElement('div');
      d.className = 'md-slider-dot' + (i === 0 ? ' act' : '');
      d.onclick = (() => { const idx = i; return () => mdSliderGo(idx); })();
      dotsEl.appendChild(d);
    }
    wrap.appendChild(dotsEl);
  }

  mdSliderGo(0);
}

function mdSliderGo(idx) {
  mdSlideIdx = ((idx % mdSlideTotal) + mdSlideTotal) % mdSlideTotal;
  const track = document.getElementById('md-slider-track');
  if (track) track.style.transform = `translateX(-${mdSlideIdx * 100}%)`;
  const dotsEl = document.getElementById('md-slider-dots');
  if (dotsEl) {
    dotsEl.querySelectorAll('.md-slider-dot').forEach((d, i) => d.classList.toggle('act', i === mdSlideIdx));
  }
}

function mdSliderNav(dir) { mdSliderGo(mdSlideIdx + dir); }

const _itemStore = {};

function makeShareToken(name, id) {
  return btoa(unescape(encodeURIComponent(name + '|||' + id)));
}

function parseShareToken(token) {
  try {
    const decoded = decodeURIComponent(escape(atob(token)));
    const parts = decoded.split('|||');
    return { name: parts[0], id: parts[1] };
  } catch (e) { return null; }
}

function shareProduct() {
  if (!_currentDetailKey) return;
  const d = _itemStore[_currentDetailKey];
  if (!d) return;
  const token = makeShareToken(d.name, d.produkid);
  const url = window.location.origin + window.location.pathname + '?p=' + token;
  if (navigator.share) {
    navigator.share({ title: d.name, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link produk berhasil disalin!', 'success', 2200);
    }).catch(() => {
      showToast('Gagal menyalin link', 'warn', 2000);
    });
  }
}

function openDetailById(key) {
  const d = _itemStore[key];
  if (!d) return;

  _currentDetailKey = key;

  const images = [d.img];
  if (d.extraImgs && d.extraImgs.length) {
    d.extraImgs.forEach(src => { if (src) images.push(src); });
  }
  buildModalSlider(images, d);

  document.getElementById('md-title').textContent = d.name;
  if (d.isDiscounted) {
    document.getElementById('md-price').innerHTML = `
      <span style="text-decoration:line-through;color:var(--t3);font-size:0.88rem;margin-right:6px;">Rp ${d.originalPrice}</span>
      <span style="color:#ec4899;font-weight:900;">Rp ${d.price}</span>
      <span class="badge-pill" style="background:rgba(236,72,153,0.18);color:#ec4899;font-size:0.75rem;margin-left:6px;font-weight:700;"><i class="fa-solid fa-tags"></i> ${d.discountBadge}</span>
    `;
  } else {
    document.getElementById('md-price').textContent = d.price_premium 
      ? 'Mulai Rp ' + d.price + ' (Standar / Premium)' 
      : 'Rp ' + d.price;
  }
  document.getElementById('md-desc').textContent = (d.desc || '').replace(/\/n/g, '\n');
  document.getElementById('md-stok').textContent = d.stok;

  const isSold = String(d.stok).toLowerCase() === 'sold' || String(d.stok) === '0';
  const isMaint = String(d.stok).toLowerCase().includes('maint') || (d.category && d.category.toLowerCase().includes('nokos'));
  const effectiveBasePrice = d.originalRawPrice || d.rawPrice;
  const orderUrl = '/payment?id=' + encodeURIComponent(d.produkid) + '&nama=' + encodeURIComponent(d.name) + '&harga=' + encodeURIComponent(effectiveBasePrice) + '&category=' + encodeURIComponent(d.category || '');
  const btn = document.getElementById('md-order-btn');

  if (isMaint) {
    btn.removeAttribute('href');
    btn.onclick = null;
    btn.className = 'btn-order sold-out';
    btn.style.background = 'rgba(245,158,11,0.2)';
    btn.style.borderColor = 'rgba(245,158,11,0.5)';
    btn.style.color = '#f59e0b';
    btn.innerHTML = '<i class="fa-solid fa-screwdriver-wrench"></i> Sedang Maintenance';
  } else if (isSold) {
    btn.removeAttribute('href');
    btn.onclick = null;
    btn.className = 'btn-order sold-out';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.innerHTML = '<i class="fa-solid fa-ban"></i> Stok Habis';
  } else {
    btn.setAttribute('href', orderUrl);
    btn.onclick = function(e) {
      e.preventDefault();
      closeDetail();
      window.location.href = orderUrl;
    };
    btn.className = 'btn-order';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    btn.innerHTML = '<i class="fa-solid fa-cart-arrow-down"></i> Order Sekarang';
  }

  document.getElementById('detailModal').classList.add('on');
  lockBodyScroll();
}

function closeDetail() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.remove('on');
  unlockBodyScroll();
  _currentDetailKey = null;
  closeLightbox();
}

let _bodyScrollPos = 0;
let _bodyScrollLockCount = 0;

function lockBodyScroll() {
  if (_bodyScrollLockCount === 0) {
    _bodyScrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_bodyScrollPos}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  _bodyScrollLockCount++;
}

function unlockBodyScroll() {
  _bodyScrollLockCount = Math.max(0, _bodyScrollLockCount - 1);
  if (_bodyScrollLockCount === 0) {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    const topStr = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    if (topStr) {
      const scrollY = parseInt(topStr || '0', 10) * -1;
      window.scrollTo(0, scrollY);
    }
  }
}

window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;

/* PROMO BANNER CAROUSEL */
let promoIdx = 0;
let promoTotal = 0;
let promoTimer = null;

function initPromoSlider() {
  const slides = document.querySelectorAll('#promo-track .promo-slide');
  promoTotal = slides.length;
  if (!promoTotal) return;
  const dotsEl = document.getElementById('promo-dots');
  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < promoTotal; i++) {
      const d = document.createElement('div');
      d.className = 'promo-dot' + (i === 0 ? ' act' : '');
      d.onclick = () => goPromo(i);
      dotsEl.appendChild(d);
    }
  }
  const track = document.getElementById('promo-track');
  let tx0 = 0;
  if (track) {
    track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = tx0 - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 30) { diff > 0 ? promoNav(1) : promoNav(-1); }
    }, { passive: true });
  }
  goPromo(0);
  startPromoAuto();
}

function goPromo(idx) {
  if (!promoTotal) return;
  promoIdx = ((idx % promoTotal) + promoTotal) % promoTotal;
  const track = document.getElementById('promo-track');
  if (track) track.style.transform = `translateX(-${promoIdx * 100}%)`;
  document.querySelectorAll('.promo-dot').forEach((d, i) => d.classList.toggle('act', i === promoIdx));
}

function promoNav(dir) {
  goPromo(promoIdx + dir);
  resetPromoAuto();
}

function startPromoAuto() {
  if (promoTimer) clearInterval(promoTimer);
  promoTimer = setInterval(() => {
    if (document.hidden) return;
    goPromo(promoIdx + 1);
  }, 3800);
}

function resetPromoAuto() {
  startPromoAuto();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (promoTimer) clearInterval(promoTimer);
  } else {
    startPromoAuto();
  }
});

/* CATEGORY FILTER */
function filterCat(id, el) {
  document.querySelectorAll('.cat-pill').forEach(c => c.classList.remove('act'));
  if (el) {
    el.classList.add('act');
    el.classList.add('ripple');
    setTimeout(() => el.classList.remove('ripple'), 400);
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch(e) {}
  }
  if (typeof pauseCategoryAutoScroll === 'function') {
    pauseCategoryAutoScroll(6000);
  }
  document.querySelectorAll('.shop-section').forEach(s => {
    const show = id === 'all' || s.dataset.cat === id;
    if (show) {
      s.style.display = 'block';
      s.style.animation = 'fadeUp .35s cubic-bezier(.22,1,.36,1) both';
    } else {
      s.style.display = 'none';
      s.style.animation = '';
    }
  });
}

function filterCategory(catName) {
  if (!catName) return;
  const targetId = catName.replace(/\s+/g, '_');
  const pill = document.querySelector(`.cat-pill[data-catid="${targetId}"]`);
  filterCat(targetId, pill);
  const targetSection = document.querySelector(`.shop-section[data-cat="${targetId}"]`);
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.filterCategory = filterCategory;

/* LAYOUT TOGGLE (HORIZONTAL ROW vs GRID) */
const catLayouts = {};
function toggleCatLayout(catId) {
  const section = document.querySelector(`.shop-section[data-cat="${catId}"]`);
  if (!section) return;
  const isDesk = window.innerWidth >= 768;
  const current = catLayouts[catId] || localStorage.getItem('zyro_layout_' + catId) || (isDesk ? 'vertical' : 'horizontal');
  const newLayout = current === 'horizontal' ? 'vertical' : 'horizontal';
  catLayouts[catId] = newLayout;
  localStorage.setItem('zyro_layout_' + catId, newLayout);

  const btn = section.querySelector('.btn-layout-toggle');
  const btnIcon = btn ? btn.querySelector('i') : null;
  const container = section.querySelector('.prod-container');
  if (!container) return;

  if (btn) {
    btn.classList.add('lt-spin');
    setTimeout(() => btn.classList.remove('lt-spin'), 400);
    btn.classList.toggle('lt-active', newLayout === 'vertical');
  }

  const cards = container.querySelectorAll('.prod-card');
  cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'scale(.94)'; });

  setTimeout(() => {
    if (newLayout === 'vertical') {
      container.className = 'shop-grid prod-container';
      if (btnIcon) btnIcon.className = 'fa-solid fa-grip';
      if (btn) btn.title = 'Tampilan horizontal';
    } else {
      container.className = 'prod-row prod-container';
      if (btnIcon) btnIcon.className = 'fa-solid fa-table-columns';
      if (btn) btn.title = 'Tampilan vertikal (Grid)';
    }
    const newCards = container.querySelectorAll('.prod-card');
    requestAnimationFrame(() => {
      newCards.forEach(c => {
        c.style.opacity = '1';
        c.style.transform = 'scale(1)';
      });
    });
  }, 160);
}

function getBadge(item, idx) {
  const stokStr = String(item.stok).toLowerCase();
  if (stokStr.includes('maint')) return { label: '<i class="fa-solid fa-screwdriver-wrench"></i> Maint.', cls: 'pb-maint' };
  if (stokStr === '0' || stokStr === 'sold') return { label: 'Sold Out', cls: 'pb-sold' };
  if (idx === 0) return { label: '<i class="fa-solid fa-fire"></i> Hot', cls: 'pb-hot' };
  if (idx === 1) return { label: '<i class="fa-solid fa-star"></i> New', cls: 'pb-new' };
  return null;
}

function catIcon(cat) {
  const map = {
    'role': 'fa-solid fa-id-badge',
    'publik': 'fa-solid fa-users',
    'private': 'fa-solid fa-user-shield',
    'enterprise': 'fa-solid fa-building-shield',
    'premium': 'fa-solid fa-crown',
    'pterodactyl': 'fa-solid fa-server',
    'panel': 'fa-solid fa-server',
    'youtube': 'fa-brands fa-youtube',
    'spotify': 'fa-brands fa-spotify',
    'netflix': 'fa-brands fa-netflix',
    'canva': 'fa-solid fa-palette',
    'capcut': 'fa-solid fa-video',
    'vps': 'fa-solid fa-hard-drive',
    'virtual': 'fa-solid fa-hard-drive',
    'script': 'fa-solid fa-code',
    'bot': 'fa-solid fa-robot',
    'hosting': 'fa-solid fa-globe',
    'cpanel': 'fa-solid fa-cloud',
    'nokos': 'fa-solid fa-sim-card',
    'nomor': 'fa-solid fa-sim-card',
    'otp': 'fa-solid fa-comment-sms'
  };
  const low = cat.toLowerCase();
  for (const k in map) { if (low.includes(k)) return map[k]; }
  return 'fa-solid fa-layer-group';
}

function renderApkPremHeader(item, badgeHtml) {
  const imgSrc = item.preview || 'assets/logo.png';
  let defaultBadge = badgeHtml;
  if (!defaultBadge) {
    defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-circle-check"></i> RESMI</div>';
  }

  return `
    <div class="prod-img-wrap apk-card-header">
      ${defaultBadge}
      <div class="apk-icon-frame">
        <img class="apk-logo-img" src="${imgSrc}" alt="${item.produk || ''}" loading="lazy" decoding="async" onerror="this.src='assets/logo.png'">
      </div>
    </div>
  `;
}

function renderCustomProductHeader(item, cat, badgeHtml) {
  const cLow = (cat || '').toLowerCase();
  const pLow = (item.produk || item.name || '').toLowerCase();

  let iconClass = 'fa-server';
  let tierKey = 'legal_public';
  let brandTitle = 'SEIKAONE';
  let brandSub = 'OFFICIAL PRODUCT';
  let defaultBadge = badgeHtml;

  // 1. VPS Legal Indonesia
  if (cLow.includes('vps') && (cLow.includes('indo') || pLow.includes('indo'))) {
    iconClass = 'fa-server';
    tierKey = 'vps_indo';
    brandTitle = 'VPS INDONESIA';
    brandSub = 'DEDICATED KVM • 1-3 GBPS';
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-bolt"></i> INDO KVM</div>';
  }
  // 2. Virtual Private Server (DO / Global)
  else if (cLow.includes('vps') || cLow.includes('virtual private server') || pLow.includes('vps do')) {
    iconClass = 'fa-cloud';
    tierKey = 'vps_global';
    brandTitle = 'VPS CLOUD DO';
    brandSub = 'NVME HIGH FREQ • 4TB';
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-globe"></i> GLOBAL</div>';
  }
  // 3. Role Legal - Enterprise
  else if (cLow.includes('role') && (cLow.includes('enterprise') || cLow.includes('enter') || pLow.includes('enterprise'))) {
    tierKey = 'role_enterprise';
    brandTitle = 'ROLE ENTERPRISE';
    if (pLow.includes('partner') || pLow.includes('pt')) {
      iconClass = 'fa-building-shield';
      brandSub = 'ENTERPRISE PARTNER';
    } else {
      iconClass = 'fa-building';
      brandSub = 'ENTERPRISE RESELLER';
    }
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-crown"></i> ULTRA HOST</div>';
  }
  // 4. Role Legal - Premium
  else if (cLow.includes('role') && (cLow.includes('prem') || pLow.includes('premium'))) {
    tierKey = 'role_premium';
    brandTitle = 'ROLE PREMIUM';
    if (pLow.includes('owner')) {
      iconClass = 'fa-crown';
      brandSub = 'PREMIUM OWNER';
    } else if (pLow.includes('partner') || pLow.includes('pt')) {
      iconClass = 'fa-handshake-angle';
      brandSub = 'PREMIUM PARTNER';
    } else {
      iconClass = 'fa-gem';
      brandSub = 'PREMIUM HIGH-CORE';
    }
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-award"></i> TOP TIER</div>';
  }
  // 5. Role Legal - Private
  else if (cLow.includes('role') && (cLow.includes('private') || cLow.includes('privat') || pLow.includes('private'))) {
    tierKey = 'role_private';
    brandTitle = 'ROLE PRIVATE';
    if (pLow.includes('partner') || pLow.includes('pt')) {
      iconClass = 'fa-handshake';
      brandSub = 'PRIVATE PARTNER';
    } else {
      iconClass = 'fa-user-lock';
      brandSub = 'PRIVATE RESELLER';
    }
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-lock"></i> NO PAJAK</div>';
  }
  // 6. Role Legal - Public
  else if (cLow.includes('role') && (cLow.includes('pub') || pLow.includes('public') || pLow.includes('publik'))) {
    tierKey = 'role_public';
    brandTitle = 'ROLE PUBLIC';
    if (pLow.includes('owner')) {
      iconClass = 'fa-crown';
      brandSub = 'PUBLIC OWNER';
    } else if (pLow.includes('adp') || pLow.includes('admin')) {
      iconClass = 'fa-user-shield';
      brandSub = 'PUBLIC ADMIN';
    } else if (pLow.includes('partner') || pLow.includes('pt')) {
      iconClass = 'fa-handshake';
      brandSub = 'PUBLIC PARTNER';
    } else {
      iconClass = 'fa-store';
      brandSub = 'PUBLIC RESELLER';
    }
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-users"></i> PUBLIC</div>';
  }
  // 7. Panel Pterodactyl Legal Tiers (fallback for standalone category or modal preview)
  else if (cLow.includes('panel') || cLow.includes('ptero')) {
    if (cLow.includes('enterprise') || pLow.includes('enterprise')) {
      tierKey = 'legal_enterprise';
      brandTitle = 'PTERODACTYL';
      brandSub = 'ENTERPRISE ULTRA';
      iconClass = 'fa-building';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-crown"></i> ENTERPRISE</div>';
    } else if (cLow.includes('prem') || pLow.includes('premium')) {
      tierKey = 'legal_premium';
      brandTitle = 'PTERODACTYL';
      brandSub = 'HIGH-CORE PREMIUM';
      iconClass = 'fa-crown';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-bolt"></i> ULTIMATE</div>';
    } else if (cLow.includes('private') || pLow.includes('private')) {
      tierKey = 'legal_private';
      brandTitle = 'PTERODACTYL';
      brandSub = 'DEDICATED PRIVATE';
      iconClass = 'fa-shield-halved';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-shield"></i> DEDICATED</div>';
    } else {
      tierKey = 'legal_public';
      brandTitle = 'PTERODACTYL';
      brandSub = 'SHARED PUBLIC';
      iconClass = 'fa-globe';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-fire"></i> BEST SELLER</div>';
    }
  }
  // 8. Nomor Kosong (Nokos OTP)
  else if (cLow.includes('nokos') || cLow.includes('nomor') || pLow.includes('nokos')) {
    tierKey = 'nokos_otp';
    iconClass = 'fa-sim-card';
    brandTitle = 'NOKOS OTP';
    brandSub = 'INSTANT SMS OTP';
    if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-sold"><i class="fa-solid fa-wrench"></i> MAINT</div>';
  }
  // 9. Script & Source Code
  else if (cLow.includes('script') || cLow.includes('source code') || cLow.includes('sc ') || pLow.includes('script') || pLow.includes('source code') || pLow.startsWith('sc-')) {
    if (pLow.includes('jhonaley') || (pLow.includes('create') && pLow.includes('panel'))) {
      tierKey = 'script_ptero';
      iconClass = 'fa-solid fa-server';
      brandTitle = 'CREATE PANEL V6.5';
      brandSub = 'JHONALEY • AUTO SERVER & USER';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-server"></i> V6.5 JHONALEY</div>';
    } else if (pLow.includes('zyrostore') || (pLow.includes('website') && pLow.includes('source code')) || pLow.includes('sc-website')) {
      tierKey = 'script_zyroweb';
      iconClass = 'fa-solid fa-store';
      brandTitle = 'WEB SEIKAONE.ID';
      brandSub = 'FULLSTACK EXPRESS • AUTO ORDER & PANEL';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-solid fa-crown"></i> OFFICIAL WEB</div>';
    } else if (pLow.includes('noktel') || pLow.includes('nokos') || pLow.includes('otp')) {
      tierKey = 'script_noktel';
      iconClass = 'fa-solid fa-sim-card';
      brandTitle = 'AUTO ORDER NOKTEL';
      brandSub = 'BOT TELEGRAM • OTP VIRTUAL NUMBER';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-bolt"></i> NOKTEL AUTO</div>';
    } else if (pLow.includes('wa') || pLow.includes('whatsapp') || pLow.includes('baileys')) {
      tierKey = 'script_whatsapp';
      iconClass = 'fa-brands fa-whatsapp';
      brandTitle = 'BOT MD WHATSAPP';
      brandSub = 'BAILEYS • MULTI-DEVICE PAIRING';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-hot"><i class="fa-brands fa-whatsapp"></i> BOT WHATSAPP</div>';
    } else if (pLow.includes('tele') || pLow.includes('telegram')) {
      tierKey = 'script_telegram';
      iconClass = 'fa-brands fa-telegram';
      brandTitle = 'BOT MD TELEGRAM';
      brandSub = 'TELEGRAF • MULTI-DEVICE BOT';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-brands fa-telegram"></i> BOT TELEGRAM</div>';
    } else {
      tierKey = 'script_source';
      iconClass = 'fa-solid fa-code';
      brandTitle = 'SOURCE CODE';
      brandSub = 'INSTANT DOWNLOAD • FULL SC';
      if (!defaultBadge) defaultBadge = '<div class="prod-badge pb-new"><i class="fa-solid fa-code"></i> SCRIPT BOT</div>';
    }
  }
  // 10. Fallback
  else {
    iconClass = 'fa-cube';
    tierKey = 'legal_public';
    brandTitle = (cat || 'SEIKAONE').toUpperCase();
    brandSub = 'OFFICIAL PRODUCT';
  }

  return `
    <div class="prod-img-wrap ptero-card-header">
      ${defaultBadge || ''}
      <div class="ptero-header-brand">
        <div class="ptero-icon-circle ${tierKey}">
          <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="ptero-brand-text">
          <span class="ptero-brand-title">${brandTitle}</span>
          <span class="ptero-brand-sub ${tierKey}">${brandSub}</span>
        </div>
      </div>
    </div>
  `;
}

function getProductTagline(item, cat) {
  const cLow = (cat || '').toLowerCase();
  const pLow = (item.produk || '').toLowerCase();

  if (cLow.includes('vps') && (cLow.includes('indo') || pLow.includes('indo'))) {
    return '<i class="fa-solid fa-network-wired" style="color:var(--blue)"></i> Dedicated IP Publik • 1-3 Gbps Nonstop';
  }
  if (cLow.includes('vps') || cLow.includes('virtual private server')) {
    return '<i class="fa-solid fa-cloud" style="color:var(--sky)"></i> NVMe High Frequency • 4 TB Transfer Data';
  }
  if (cLow.includes('role') && (cLow.includes('enterprise') || cLow.includes('enter') || pLow.includes('enterprise'))) {
    return '<i class="fa-solid fa-building" style="color:var(--purple)"></i> NVMe Gen4 Storage • Domain @zyrodevv.web.id';
  }
  if (cLow.includes('role') && (cLow.includes('prem') || pLow.includes('premium'))) {
    return '<i class="fa-solid fa-crown" style="color:var(--amber)"></i> High-Core Ultimate • Prioritas Akses Utama';
  }
  if (cLow.includes('role') && (cLow.includes('private') || cLow.includes('privat') || pLow.includes('private'))) {
    return '<i class="fa-solid fa-lock" style="color:var(--green)"></i> Dedicated Slice • Domain @private.zyrostore.id';
  }
  if (cLow.includes('role') && (cLow.includes('pub') || pLow.includes('public') || pLow.includes('publik'))) {
    return '<i class="fa-solid fa-users" style="color:var(--blue)"></i> Create User & Panel • Server Legal Indonesia';
  }
  if (cLow.includes('account') || cLow.includes('akun') || pLow.includes('viu') || pLow.includes('canva')) {
    return '<i class="fa-solid fa-circle-check" style="color:var(--rose)"></i> Akun Resmi Legal • Full Garansi & Instant';
  }
  if (cLow.includes('nokos') || cLow.includes('nomor')) {
    return '<i class="fa-solid fa-sim-card" style="color:var(--teal)"></i> OTP Masuk Otomatis • Garansi Saldo / Ganti';
  }
  if (cLow.includes('script') || cLow.includes('source code') || cLow.includes('sc ') || pLow.includes('script') || pLow.includes('source code') || pLow.startsWith('sc-')) {
    if (pLow.includes('jhonaley') || (pLow.includes('create') && pLow.includes('panel'))) {
      return '<i class="fa-solid fa-server" style="color:var(--sky,#0ea5e9)"></i> Auto Create Server & User Pterodactyl • Multi Egg';
    }
    if (pLow.includes('zyrostore') || pLow.includes('sc-website')) {
      return '<i class="fa-solid fa-crown" style="color:var(--amber,#f59e0b)"></i> Fullstack Web + Auto Order Ptero + Dashboard Admin';
    }
    if (pLow.includes('noktel') || pLow.includes('nokos') || pLow.includes('otp')) {
      return '<i class="fa-solid fa-sim-card" style="color:var(--teal,#14b8a6)"></i> Bot Auto Order Nomor Virtual / Nokos OTP Telegram';
    }
    if (pLow.includes('wa') || pLow.includes('whatsapp') || pLow.includes('baileys')) {
      return '<i class="fa-brands fa-whatsapp" style="color:var(--green,#22c55e)"></i> Support Pairing Code • Downloader, AI & Game Seru';
    }
    if (pLow.includes('tele') || pLow.includes('telegram')) {
      return '<i class="fa-brands fa-telegram" style="color:var(--blue,#3b82f6)"></i> Downloader TikTok/IG/YT • AI Chatbot & Grup Bot';
    }
    return '<i class="fa-solid fa-code" style="color:var(--emerald,#10b981)"></i> Full Source Code • Instant Download 24/7';
  }
  return '<i class="fa-solid fa-check" style="color:var(--a)"></i> Layanan Resmi SeikaOne • Garansi Penuh';
}

const CAT_PALETTES = [
  { bg: 'rgba(14,165,233,.12)', col: '#0ea5e9', pillBg: 'rgba(14,165,233,.12)', pillCol: '#0369a1', pillBor: 'rgba(14,165,233,.35)' },
  { bg: 'rgba(139,92,246,.12)', col: '#8b5cf6', pillBg: 'rgba(139,92,246,.12)', pillCol: '#6d28d9', pillBor: 'rgba(139,92,246,.35)' },
  { bg: 'rgba(20,184,166,.12)', col: '#14b8a6', pillBg: 'rgba(20,184,166,.12)', pillCol: '#0f766e', pillBor: 'rgba(20,184,166,.35)' },
  { bg: 'rgba(244,63,94,.1)', col: '#f43f5e', pillBg: 'rgba(244,63,94,.1)', pillCol: '#be123c', pillBor: 'rgba(244,63,94,.35)' },
  { bg: 'rgba(245,158,11,.12)', col: '#f59e0b', pillBg: 'rgba(245,158,11,.12)', pillCol: '#b45309', pillBor: 'rgba(245,158,11,.35)' },
  { bg: 'rgba(34,197,94,.12)', col: '#22c55e', pillBg: 'rgba(34,197,94,.12)', pillCol: '#15803d', pillBor: 'rgba(34,197,94,.35)' }
];

function animateCountUp(container, target, isNum, pillStyle) {
  if (!container) return;
  const pill = container.querySelector('.tx-pill');
  if (container._animTimer) {
    clearInterval(container._animTimer);
    container._animTimer = null;
  }
  if (pill && pill._animTimer) {
    clearInterval(pill._animTimer);
    pill._animTimer = null;
  }
  if (!isNum) {
    if (pill) { pill.innerHTML = `<i class="${pillStyle.icon}" style="font-size:.65rem;"></i> ${target}`; }
    container.classList.add('animated');
    return;
  }
  const num = parseInt(String(target).replace(/\D/g, ''));
  if (isNaN(num)) {
    if (pill) pill.innerHTML = `<i class="${pillStyle.icon}" style="font-size:.65rem;"></i> ${target}`;
    return;
  }
  let start = 0;
  const step = Math.max(1, Math.ceil(num / 40));
  if (pill) pill.innerHTML = `<i class="${pillStyle.icon}" style="font-size:.65rem;"></i> 0`;
  container.classList.add('animated');
  container._animTimer = setInterval(() => {
    start = Math.min(start + step, num);
    if (pill) pill.innerHTML = `<i class="${pillStyle.icon}" style="font-size:.65rem;"></i> ${start.toLocaleString('id-ID')}`;
    if (start >= num) {
      clearInterval(container._animTimer);
      container._animTimer = null;
    }
  }, 25);
}

let lastKnownUserCount = 0;

function updateUserCountDisplay(count, animate = false) {
  if (!count || isNaN(count)) return;
  const num = parseInt(count, 10);
  window.currentStoreTotalUsers = num;
  try { localStorage.setItem('zyro_total_users', num); } catch (_) {}

  const userEl = document.getElementById('total-users');
  if (userEl) {
    const pill = userEl.querySelector('.tx-pill');
    if (pill) {
      if (pill._animTimer) {
        clearInterval(pill._animTimer);
        pill._animTimer = null;
      }
      if (userEl._animTimer) {
        clearInterval(userEl._animTimer);
        userEl._animTimer = null;
      }

      const currentDomNum = parseInt(pill.textContent.replace(/\D/g, ''), 10) || lastKnownUserCount;

      if (animate && (!userEl.classList.contains('animated') || lastKnownUserCount === 0)) {
        lastKnownUserCount = num;
        if (currentDomNum && Math.abs(currentDomNum - num) <= 100 && currentDomNum !== num) {
          animateCountBetween(pill, currentDomNum, num, 'fa-solid fa-users');
          userEl.classList.add('animated');
        } else if (currentDomNum === num) {
          pill.innerHTML = `<i class="fa-solid fa-users" style="font-size:.65rem;"></i> ${num.toLocaleString('id-ID')}`;
          userEl.classList.add('animated');
        } else {
          animateCountUp(userEl, num, true, { icon: 'fa-solid fa-users' });
        }
      } else if (lastKnownUserCount && lastKnownUserCount !== num) {
        animateCountBetween(pill, lastKnownUserCount, num, 'fa-solid fa-users');
        lastKnownUserCount = num;
        userEl.classList.add('animated');
      } else {
        lastKnownUserCount = num;
        pill.innerHTML = `<i class="fa-solid fa-users" style="font-size:.65rem;"></i> ${num.toLocaleString('id-ID')}`;
        userEl.classList.add('animated');
      }
    }
  }

  const sUsers = document.getElementById('statStripUsers');
  if (sUsers) {
    sUsers.textContent = num.toLocaleString('id-ID') + '+';
  }

  const sbMemberBadge = document.getElementById('sbMemberCountBadge');
  if (sbMemberBadge) {
    sbMemberBadge.textContent = `${num.toLocaleString('id-ID')} MEMBER`;
  }
  const elSb = document.getElementById('sbTotalUsers');
  if (elSb) {
    elSb.textContent = num.toLocaleString('id-ID');
  }
  document.querySelectorAll('.sb-member-count-badge').forEach(b => {
    b.textContent = `${num.toLocaleString('id-ID')} MEMBER`;
  });
}

function animateCountBetween(pill, fromNum, toNum, iconClass) {
  if (!pill) return;
  if (pill._animTimer) {
    clearInterval(pill._animTimer);
    pill._animTimer = null;
  }
  if (fromNum === toNum) {
    pill.innerHTML = `<i class="${iconClass}" style="font-size:.65rem;"></i> ${toNum.toLocaleString('id-ID')}`;
    return;
  }
  let current = fromNum;
  const step = toNum > fromNum ? 1 : -1;
  const diff = Math.abs(toNum - fromNum);
  const intervalTime = Math.max(25, Math.floor(800 / (diff || 1)));

  pill.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
  pill.style.transform = 'scale(1.12)';
  pill.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.65)';

  pill._animTimer = setInterval(() => {
    current += step;
    pill.innerHTML = `<i class="${iconClass}" style="font-size:.65rem;"></i> ${current.toLocaleString('id-ID')}`;
    if (current === toNum) {
      clearInterval(pill._animTimer);
      pill._animTimer = null;
      setTimeout(() => {
        pill.style.transform = '';
        pill.style.boxShadow = '';
      }, 350);
    }
  }, intervalTime);
}

/* TYPEWRITER LOOP */
function startTypewriterLoop(el, texts, speed = 55) {
  if (!el || !texts || !texts.length) return;
  let textIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  el.innerHTML = '<span class="tw-text"></span><span class="tw-cursor"></span>';
  const textSpan = el.querySelector('.tw-text');

  function tick() {
    if (!document.body.contains(el)) return;
    if (document.hidden) {
      setTimeout(tick, 1000);
      return;
    }
    const fullText = texts[textIdx];
    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    const currentStr = fullText.substring(0, charIdx);
    if (textSpan) {
      textSpan.textContent = currentStr;
    } else {
      el.innerHTML = `${currentStr}<span class="tw-cursor"></span>`;
    }

    let delay = isDeleting ? speed / 2 : speed;

    if (!isDeleting && charIdx === fullText.length) {
      delay = 2200; // pause at end of sentence
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      textIdx = (textIdx + 1) % texts.length;
      delay = 400; // pause before next sentence
    }

    setTimeout(tick, delay);
  }
  tick();
}

function tryOpenFromUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('p');
  if (!token) return;
  const parsed = parseShareToken(token);
  if (!parsed || !parsed.id) return;
  const targetId = parsed.id;
  for (const key in _itemStore) {
    if (_itemStore[key].produkid === targetId) {
      openDetailById(key);
      return;
    }
  }
}

function resolveCategoryDiscount(categoryName) {
  if (!window.categoryDiscounts || !categoryName) return null;
  if (window.categoryDiscounts[categoryName] && window.categoryDiscounts[categoryName].active) {
    return window.categoryDiscounts[categoryName];
  }
  const cleanTarget = String(categoryName).trim().toLowerCase();
  for (const [key, val] of Object.entries(window.categoryDiscounts)) {
    if (val && val.active) {
      const cleanKey = key.trim().toLowerCase();
      if (cleanKey === cleanTarget || cleanTarget.includes(cleanKey) || cleanKey.includes(cleanTarget)) {
        return val;
      }
    }
  }
  return null;
}

async function loadData() {
  let hasRenderedCached = false;
  let cachedProductsRaw = null;
  try {
    const cachedDiscounts = sessionStorage.getItem('zyro_cached_cat_discounts');
    if (cachedDiscounts) {
      window.categoryDiscounts = JSON.parse(cachedDiscounts);
    }
    cachedProductsRaw = sessionStorage.getItem('zyro_cached_products') || localStorage.getItem('zyro_cached_products');
    if (cachedProductsRaw) {
      const parsed = JSON.parse(cachedProductsRaw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        renderGrid(parsed);
        hasRenderedCached = true;
        hideLoader();
      }
    }
  } catch (e) {}

  try {
    let resProd = null;
    let dataProd = null;

    // Fetch with generous timeout (15s) and automatic 1x retry
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        resProd = await fetch(`${autoBase}/all/product`, { 
          headers: HEADERS,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (resProd.ok) {
          dataProd = await resProd.json();
          if (dataProd && dataProd.status && dataProd.result) break;
        }
      } catch (fetchErr) {
        if (attempt === 1) await new Promise(r => setTimeout(r, 800));
      }
    }

    if (dataProd && dataProd.status && dataProd.result) {
      const newProductsRaw = JSON.stringify(dataProd.result);
      const isDataIdentical = Boolean(cachedProductsRaw && cachedProductsRaw === newProductsRaw);

      if (dataProd.categoryDiscounts) {
        window.categoryDiscounts = dataProd.categoryDiscounts;
        try {
          sessionStorage.setItem('zyro_cached_cat_discounts', JSON.stringify(dataProd.categoryDiscounts));
          localStorage.setItem('zyro_cached_cat_discounts', JSON.stringify(dataProd.categoryDiscounts));
        } catch (e) {}
      }
      try {
        sessionStorage.setItem('zyro_cached_products', newProductsRaw);
        localStorage.setItem('zyro_cached_products', newProductsRaw);
      } catch (e) {}

      // Zero-Flicker Protection: If already rendered from cache and data hasn't changed, skip re-render!
      if (!hasRenderedCached || !isDataIdentical) {
        renderGrid(dataProd.result);
      }
      hideLoader();
    } else if (!hasRenderedCached) {
      throw new Error('Status false');
    }

    try {
      const resStats = await fetch(`${autoBase}/all/transaksi-done`, { headers: HEADERS });
      const dataStats = await resStats.json();
      if (dataStats.status) {
        const el = document.getElementById('total-sukses');
        const numSukses = Number(dataStats.total_transaksi || 0);
        animateCountUp(el, numSukses, true, { icon: 'fa-solid fa-arrow-up-right-dots' });
        const sTrx = document.getElementById('statStripTrx');
        if (sTrx) sTrx.textContent = numSukses.toLocaleString('id-ID') + '+';
      }
    } catch (e) {
      const el = document.getElementById('total-sukses');
      animateCountUp(el, 0, true, { icon: 'fa-solid fa-arrow-up-right-dots' });
    }

    try {
      const resUStats = await fetch('/api/realtime/stats');
      const dataUStats = await resUStats.json();
      if (dataUStats && dataUStats.totalUsers) {
        updateUserCountDisplay(dataUStats.totalUsers, true);
      }
    } catch (_) {}
  } catch (err) {
    console.error(err);
    if (!hasRenderedCached) {
      document.getElementById('product-display').innerHTML = `
        <div class="empty-box">
          <i class="fa-solid fa-triangle-exclamation" style="color:var(--rose);"></i>
          <p>Gagal memuat produk dari server.</p>
          <button class="btn-detail" style="width:fit-content;margin:12px auto 0;" onclick="location.reload()">Coba Lagi</button>
        </div>`;
    }
    hideLoader();
  }
}

function renderGrid(result) {
  const isDesk = window.innerWidth >= 768;
  const menu = document.getElementById('category-menu');
  const display = document.getElementById('product-display');

  const menuFrag = document.createDocumentFragment();
  const displayFrag = document.createDocumentFragment();

  const allPill = document.createElement('div');
  allPill.className = 'cat-pill act';
  allPill.textContent = 'Semua';
  allPill.onclick = function() { filterCat('all', this); };
  menuFrag.appendChild(allPill);

  // Respect category sequence configured in Admin Panel (or server-provided order)
  const cats = Object.keys(result);
  let totalProd = 0;

  const isCreamEngine = (window._themeEngine !== 'classic');
  let panelSectionRendered = false;

  cats.forEach((cat, catIdx) => {
    const isPanel = cat.toLowerCase().includes('panel') && !cat.toLowerCase().includes('role');
    const isNokos = cat.toLowerCase().includes('nokos') || cat.toLowerCase().includes('nomor');

    // In Cream Theme, consolidate all 4 panel tiers into 1 unified section with cards BERJEJER (side-by-side)
    if (isCreamEngine && isPanel) {
      if (panelSectionRendered) return;
      panelSectionRendered = true;

      const catId = 'Hosting_Panel_Pterodactyl';

      // Category Pill in top bar
      const pill = document.createElement('div');
      pill.className = 'cat-pill';
      pill.textContent = 'Panel Pterodactyl';
      pill.dataset.catid = catId;
      pill.onclick = function() { filterCat(catId, this); };
      menuFrag.appendChild(pill);

      // Section
      const section = document.createElement('div');
      section.className = 'shop-section';
      section.dataset.cat = catId;

      const catHd = document.createElement('div');
      catHd.className = 'shop-cat-hd';
      catHd.innerHTML = `
        <div class="shop-cat-icon">
          <i class="fa-solid fa-server"></i>
        </div>
        <div class="shop-cat-name">Hosting Panel Pterodactyl</div>
        <div class="cat-label-pill">4 Tier Pilihan</div>
        <span class="panel-live-pill" id="panel-status-unified"><i class="fa-solid fa-circle-check"></i> Server Online</span>
      `;
      section.appendChild(catHd);

      // Berjejer horizontal row (matching VPS layout)
      const row = document.createElement('div');
      row.className = 'prod-row prod-container';

      const panelTiers = [
        {
          tierKey: 'legal_public',
          name: 'Panel Publik Shared',
          badgeText: 'BEST SELLER',
          badgeCls: 'pb-hot',
          badgeIcon: 'fa-fire',
          mainIcon: 'fa-globe',
          brandTitle: 'PTERODACTYL',
          brandSub: 'SHARED PUBLIC',
          priceFormatted: '1.000',
          rateLabel: 'Rp 1.000 / GB',
          rangeLabel: '1 GB – Unli (10k)',
          specSummary: 'RAM 1 - 10 GB + Unli • CPU 50-250%',
          tagline: 'Cocok untuk Bot WA & Node.js'
        },
        {
          tierKey: 'legal_private',
          name: 'Panel Private Dedicated',
          badgeText: 'DEDICATED',
          badgeCls: 'pb-new',
          badgeIcon: 'fa-shield-halved',
          mainIcon: 'fa-shield-halved',
          brandTitle: 'PTERODACTYL',
          brandSub: 'DEDICATED PRIVATE',
          priceFormatted: '4.000',
          rateLabel: 'Dedicated Slice',
          rangeLabel: '1 GB – Unli (25k)',
          specSummary: 'RAM 1 - 10 GB + Unli • Dedicated Slice',
          tagline: 'Domain @private.zyrostore.id'
        },
        {
          tierKey: 'legal_enterprise',
          name: 'Panel Enterprise Ultra',
          badgeText: 'ENTERPRISE',
          badgeCls: 'pb-hot',
          badgeIcon: 'fa-crown',
          mainIcon: 'fa-building',
          brandTitle: 'PTERODACTYL',
          brandSub: 'ENTERPRISE ULTRA',
          priceFormatted: '5.000',
          rateLabel: '3x NVMe Gen4',
          rangeLabel: '1 GB – Unli (26k)',
          specSummary: 'RAM 1 - 10 GB + Unli • 3x NVMe Storage',
          tagline: 'Domain @zyrodevv.web.id'
        },
        {
          tierKey: 'legal_premium',
          name: 'Panel Premium High-Core',
          badgeText: 'ULTIMATE',
          badgeCls: 'pb-new',
          badgeIcon: 'fa-bolt',
          mainIcon: 'fa-crown',
          brandTitle: 'PTERODACTYL',
          brandSub: 'HIGH-CORE PREMIUM',
          priceFormatted: '5.000',
          rateLabel: 'Priority Host',
          rangeLabel: '1 GB – Unli (30k)',
          specSummary: 'RAM 1 - 10 GB + Unli • Priority Host',
          tagline: 'Performa Skala Produksi'
        }
      ];

      panelTiers.forEach((tier) => {
        const card = document.createElement('div');
        card.className = 'prod-card';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.innerHTML = `
          <div class="prod-img-wrap ptero-card-header">
            <div class="prod-badge ${tier.badgeCls}"><i class="fa-solid ${tier.badgeIcon}"></i> ${tier.badgeText}</div>
            <div class="ptero-header-brand">
              <div class="ptero-icon-circle ${tier.tierKey}">
                <i class="fa-solid ${tier.mainIcon}"></i>
              </div>
              <div class="ptero-brand-text">
                <span class="ptero-brand-title">${tier.brandTitle}</span>
                <span class="ptero-brand-sub ${tier.tierKey}">${tier.brandSub}</span>
              </div>
            </div>
          </div>
          <div class="prod-body">
            <div class="prod-name">${tier.name}</div>
            <div class="ptero-price-card">
              <div class="ptero-price-head">
                <span class="ptero-price-eyebrow">Mulai dari</span>
                <span class="ptero-price-rate-pill">${tier.rateLabel}</span>
              </div>
              <div class="ptero-price-main">
                <span class="ptero-price-curr">Rp</span>
                <span class="ptero-price-val">${tier.priceFormatted}</span>
                <span class="ptero-price-unit">/bln</span>
              </div>
              <div class="ptero-price-range">
                <i class="fa-solid fa-layer-group"></i> ${tier.rangeLabel}
              </div>
            </div>
            <div class="prod-stok">
              <i class="fa-solid fa-microchip"></i> ${tier.specSummary}
            </div>
            <div class="ptero-card-tagline">
              ${tier.tagline}
            </div>
            <button type="button" class="btn-detail" onclick="if(window.PanelConfigModal){window.PanelConfigModal.open('${tier.tierKey}');}else{alert('Memuat modul konfigurasi...');}">
              <i class="fa-solid fa-sliders"></i> Atur Spek & Beli
            </button>
          </div>
        `;
        row.appendChild(card);
      });

      section.appendChild(row);
      displayFrag.appendChild(section);
      return;
    }

    const catId = cat.replace(/\s+/g, '_');
    totalProd += result[cat].length;

    const pill = document.createElement('div');
    pill.className = 'cat-pill';
    pill.textContent = cat;
    pill.dataset.catid = catId;
    pill.onclick = function() { filterCat(catId, this); };
    menuFrag.appendChild(pill);

    const section = document.createElement('div');
    section.className = 'shop-section';
    section.dataset.cat = catId;

    const savedLayout = localStorage.getItem('zyro_layout_' + catId);
    const initialLayout = savedLayout || (isDesk ? 'vertical' : 'horizontal');
    catLayouts[catId] = initialLayout;

    let panelStatusHtml = '';
    if (isPanel) {
      panelStatusHtml = `<span class="panel-live-pill" id="panel-status-${catId}"><i class="fa-solid fa-spinner fa-spin"></i> Cek Server...</span>`;
    }

    const itemLabel = result[cat].length + ' item';

    const catHd = document.createElement('div');
    catHd.className = 'shop-cat-hd';
    catHd.innerHTML = `
      <div class="shop-cat-icon">
        <i class="${catIcon(cat)}"></i>
      </div>
      <div class="shop-cat-name">${cat}</div>
      <div class="cat-label-pill">${itemLabel}</div>
      ${panelStatusHtml}
      <button class="btn-layout-toggle ${initialLayout === 'vertical' ? 'lt-active' : ''}" title="${initialLayout === 'vertical' ? 'Tampilan horizontal' : 'Tampilan vertikal (Grid)'}" onclick="toggleCatLayout('${catId}')">
        <i class="fa-solid ${initialLayout === 'vertical' ? 'fa-grip' : 'fa-table-columns'}"></i>
      </button>`;
    section.appendChild(catHd);

    if (isNokos) {
      const mbanner = document.createElement('div');
      mbanner.className = 'shop-maint-box';
      mbanner.innerHTML = `
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:12px 16px;margin:8px 0 14px;display:flex;align-items:center;gap:12px;">
          <i class="fa-solid fa-screwdriver-wrench" style="color:#f59e0b;font-size:1.25rem;"></i>
          <div style="font-size:0.8rem;color:var(--t2);line-height:1.45;">
            <strong style="color:#f59e0b;">Pemeliharaan Sistem (Maintenance)</strong><br>
            Layanan Nomor Kosong (Nokos OTP) sementara sedang dialihkan untuk proses pergantian & upgrade server provider. Segera hadir kembali!
          </div>
        </div>`;
      section.appendChild(mbanner);
    }

    const row = document.createElement('div');
    row.className = (initialLayout === 'vertical' ? 'shop-grid' : 'prod-row') + ' prod-container';

    result[cat].forEach((item, i) => {
      const isSold = String(item.stok).toLowerCase() === 'sold' || String(item.stok) === '0';
      const rawPrice = String(item.price).replace(/\./g, '').replace(/,/g, '');
      const numBase = parseInt(rawPrice, 10) || 0;
      let finalPrice = numBase;
      let isDiscounted = false;
      let discountBadgeHtml = '';

      const catDisc = resolveCategoryDiscount(cat);
      if (catDisc && numBase > 0) {
        isDiscounted = true;
        let discAmount = 0;
        if (catDisc.type === 'percent') {
          discAmount = Math.round((numBase * Number(catDisc.value)) / 100);
        } else {
          discAmount = Number(catDisc.value) || 0;
        }
        finalPrice = Math.max(1000, numBase - discAmount);
        const badgeLabel = catDisc.badge || (catDisc.type === 'percent' ? `-${catDisc.value}%` : `HEMAT Rp ${Number(catDisc.value).toLocaleString('id-ID')}`);
        discountBadgeHtml = `<div class="prod-badge pb-promo" style="background:linear-gradient(135deg, #ec4899, #f43f5e);color:#fff;font-weight:800;border:none;box-shadow:0 2px 8px rgba(236,72,153,0.4);"><i class="fa-solid fa-tags"></i> ${badgeLabel}</div>`;
      }

      const badge = getBadge(item, i);
      const defaultBadgeHtml = badge ? `<div class="prod-badge ${badge.cls}">${badge.label}</div>` : '';
      const effectiveBadgeHtml = discountBadgeHtml || defaultBadgeHtml;
      const storeKey = `${catId}_${i}`;

      const extraImgs = [];
      let k = 1;
      while (item[`preview${k}`]) {
        extraImgs.push(item[`preview${k}`]);
        k++;
      }

      _itemStore[storeKey] = {
        name: item.produk, 
        price: isDiscounted ? Number(finalPrice).toLocaleString('id-ID') : item.price,
        originalPrice: item.price,
        isDiscounted,
        discountBadge: catDisc ? (catDisc.badge || `-${catDisc.value}%`) : '',
        desc: item.deskripsi || '',
        img: item.preview || 'assets/logo.png', 
        stok: item.stok, 
        produkid: item.produkid,
        rawPrice: rawPrice,
        discountedPrice: isDiscounted ? String(finalPrice) : rawPrice,
        originalRawPrice: rawPrice,
        extraImgs, 
        category: cat, 
        price_premium: item.price_premium
      };

      const card = document.createElement('div');
      card.className = 'prod-card';
      if (isSold) card.style.opacity = '0.7';
      const priceHtml = isDiscounted
        ? (item.price_premium
            ? `<div class="store-price-block">
                 <span class="store-price-lead">Mulai</span>
                 <span class="store-price-orig" style="text-decoration:line-through;color:var(--t3);font-size:0.75rem;margin-right:4px;">Rp ${item.price}</span>
                 <span class="store-price-main" style="color:#ec4899;"><span class="store-price-curr">Rp</span> ${Number(finalPrice).toLocaleString('id-ID')}</span>
                 <span class="store-price-unit">/bln</span>
               </div>`
            : `<div class="store-price-block">
                 <span class="store-price-orig" style="text-decoration:line-through;color:var(--t3);font-size:0.75rem;margin-right:4px;">Rp ${item.price}</span>
                 <span class="store-price-main" style="color:#ec4899;"><span class="store-price-curr">Rp</span> ${Number(finalPrice).toLocaleString('id-ID')}</span>
               </div>`
          )
        : (item.price_premium
            ? `<div class="store-price-block">
                 <span class="store-price-lead">Mulai</span>
                 <span class="store-price-main"><span class="store-price-curr">Rp</span> ${item.price}</span>
                 <span class="store-price-unit">/bln</span>
               </div>`
            : `<div class="store-price-block">
                 <span class="store-price-main"><span class="store-price-curr">Rp</span> ${item.price}</span>
               </div>`
          );

      const isApkCat = (cat || '').toLowerCase().includes('account') || (cat || '').toLowerCase().includes('akun') || (item.preview && item.preview.includes('assets/apps/'));
      const headerHtml = isApkCat
        ? renderApkPremHeader(item, effectiveBadgeHtml)
        : renderCustomProductHeader(item, cat, effectiveBadgeHtml);
      const taglineHtml = `<div class="prod-tagline">${getProductTagline(item, cat)}</div>`;

      card.innerHTML = `
        ${headerHtml}
        <div class="prod-body">
          <div class="prod-name">${item.produk}</div>
          <div class="prod-price">${priceHtml}</div>
          <div class="prod-stok ${isSold ? 'sold' : ''}"><i class="fa-solid ${isSold ? 'fa-box' : 'fa-boxes-stacked'}"></i> ${isSold ? 'Stok Habis' : 'Tersedia: ' + item.stok}</div>
          ${taglineHtml}
          <button class="btn-detail${isSold ? ' btn-detail-sold' : ''}" data-key="${storeKey}" onclick="openDetailById(this.dataset.key)">
            <i class="fa-solid fa-eye"></i> Lihat Detail
          </button>
        </div>`;
      row.appendChild(card);
    });

    section.appendChild(row);
    displayFrag.appendChild(section);
  });

  if (menu) menu.replaceChildren(menuFrag);
  if (display) display.replaceChildren(displayFrag);

  const userEl = document.getElementById('total-users');
  if (userEl && window.currentStoreTotalUsers && !userEl.classList.contains('animated')) {
    updateUserCountDisplay(window.currentStoreTotalUsers, false);
  }

  const cards = document.querySelectorAll('.prod-card');
  requestAnimationFrame(() => {
    cards.forEach(card => card.classList.add('visible'));
  });

  hideLoader();
  tryOpenFromUrlParam();
  fetchPanelStatusIndicators();
  initCategoryAutoScroll();

}

async function fetchPanelStatusIndicators() {
  try {
    const res = await fetch('/api/pterodactyl/status');
    const json = await res.json();
    if (!json.status || !json.tiers) return;
    const tiers = json.tiers;

    const map = [
      { key: 'legal_public', catId: 'Panel_Legal_Publik' },
      { key: 'legal_private', catId: 'Panel_Legal_Private' },
      { key: 'legal_enterprise', catId: 'Panel_Legal_Enterprise' },
      { key: 'legal_premium', catId: 'Panel_Legal_Premium' }
    ];

    map.forEach(m => {
      const el = document.getElementById('panel-status-' + m.catId);
      if (!el) return;
      const tData = tiers[m.key];
      if (tData && tData.online) {
        el.className = 'panel-live-pill pill-online';
        el.innerHTML = `<i class="fa-solid fa-circle-check"></i> Server Online (${tData.latency}ms)`;
        el.title = `${tData.name}: ${tData.message}`;
      } else {
        el.className = 'panel-live-pill pill-offline';
        el.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Server Offline`;
        el.title = tData ? `${tData.name}: ${tData.message}` : 'Server Offline';
      }
    });
  } catch (e) {
    console.warn('Panel status indicator error:', e);
  }
}

const _pageLoadStartTime = (typeof window.__PAGE_START__ === 'number') ? window.__PAGE_START__ : Date.now();
let _loaderDismissed = false;

function hideLoader(forceImmediate = false) {
  if (_loaderDismissed) return;
  const loader = document.getElementById('preloader');
  if (!loader) {
    _loaderDismissed = true;
    return;
  }
  if (loader.classList.contains('fade-out')) return;

  const minDuration = 750; // ms minimum so the orbit animation runs gracefully
  const elapsed = Date.now() - _pageLoadStartTime;
  const delay = forceImmediate ? 0 : Math.max(0, minDuration - elapsed);

  setTimeout(() => {
    if (_loaderDismissed || loader.classList.contains('fade-out')) return;
    _loaderDismissed = true;
    loader.classList.add('fade-out');
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => {
      loader.style.visibility = 'hidden';
      loader.style.display = 'none';
    }, 400);
  }, delay);
}

// Safety timeout: ensure loader never remains on screen longer than 2.8s
setTimeout(() => {
  hideLoader(true);
}, 2800);

function animateStagger() {
  const items = document.querySelectorAll('.stagger-item');
  items.forEach((el, i) => {
    el.style.animation = `fadeUp .6s ${i * .12}s cubic-bezier(.16,1,.3,1) both`;
  });
}

let _shopBooted = false;
function bootShop() {
  if (_shopBooted) return;
  _shopBooted = true;
  initAuthUI();
  applyTheme();
  loadData();
  animateStagger();
  initPromoSlider();

  const twEl = document.getElementById('hero-typewriter');
  const sentences = [
    'Premium Account & Digital Services',
    'Layanan Otomatis 24/7 Cepat & Terpercaya',
    'Beli YouTube, Canva, VPS & Panel Pterodactyl',
    'Garansi Penuh & Support Ramah 24 Jam'
  ];
  startTypewriterLoop(twEl, sentences, 55);

  const modalOv = document.getElementById('detailModal');
  if (modalOv) {
    modalOv.addEventListener('click', function(e) {
      if (e.target === this) closeDetail();
    });
  }
}



function syncResponsiveLayouts() {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
  if (!width) return;
  const isDesk = width >= 768;
  document.querySelectorAll('.shop-section').forEach(sec => {
    const catId = sec.dataset.cat;
    if (!catId) return;
    const saved = localStorage.getItem('zyro_layout_' + catId);
    const target = saved || (isDesk ? 'vertical' : 'horizontal');
    catLayouts[catId] = target;

    const container = sec.querySelector('.prod-container');
    const toggleBtn = sec.querySelector('.btn-layout-toggle');
    const btnIcon = toggleBtn ? toggleBtn.querySelector('i') : null;

    if (container) {
      container.className = (target === 'vertical' ? 'shop-grid' : 'prod-row') + ' prod-container';
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('lt-active', target === 'vertical');
      toggleBtn.title = target === 'vertical' ? 'Tampilan horizontal' : 'Tampilan vertikal (Grid)';
    }
    if (btnIcon) {
      btnIcon.className = 'fa-solid ' + (target === 'vertical' ? 'fa-grip' : 'fa-table-columns');
    }
  });
}

// Ensure responsiveness is instantly restored when returning from checkout / bfcache
window.addEventListener('pageshow', (event) => {
  closeDetail();
  // Use requestAnimationFrame so window.innerWidth is read after layout is painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      syncResponsiveLayouts();
    });
  });
});

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    syncResponsiveLayouts();
  }, 150);
});

// ==========================================
// WEB PUSH NOTIFICATION CLIENT HANDLERS
// ==========================================
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function checkPushSubscriptionState(reg) {
  try {
    const sub = await reg.pushManager.getSubscription();
    const btn = document.getElementById('btn-subscribe-push');
    const label = document.getElementById('pushBtnLabel');
    if (sub) {
      if (btn) btn.classList.add('active');
      if (label) label.textContent = 'Aktif';
    }
  } catch (e) {}
}

async function toggleWebPushSubscription() {
  const btn = document.getElementById('btn-subscribe-push');
  const label = document.getElementById('pushBtnLabel');
  if (btn && btn.classList.contains('active')) {
    showToast('Notifikasi Web sudah aktif di perangkat ini!', 'success');
    return;
  }

  // 1. OneSignal Web Push SDK
  if (window.OneSignal && window.OneSignal.Notifications) {
    try {
      await OneSignal.Notifications.requestPermission();
      if (OneSignal.Notifications.permission) {
        if (btn) btn.classList.add('active');
        if (label) label.textContent = 'Aktif';
        showToast('Notifikasi OneSignal berhasil diaktifkan!', 'success');
        return;
      } else {
        showToast('Izin notifikasi belum diizinkan oleh browser.', 'warn');
        return;
      }
    } catch (err) {
      console.warn('[OneSignal Prompt Warning]:', err);
    }
  }

  // 2. Standard Service Worker Web Push Fallback
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (window.ZyroAlert) {
      ZyroAlert('Browser Anda belum mendukung Web Push Notifications.', { type: 'warning', title: 'Fitur Tidak Didukung' });
    } else {
      showToast('Browser Anda belum mendukung Web Push Notifications.', 'warn');
    }
    return;
  }

  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      showToast('Izin notifikasi tidak diberikan atau diblokir browser.', 'warn');
      return;
    }

    const res = await fetch('/api/push/vapid-key');
    const keyData = await res.json();
    if (!keyData.status || !keyData.publicKey) {
      showToast('Push service belum siap di server.', 'warn');
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    const saveRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub })
    });
    const saveData = await saveRes.json();
    if (saveData.status) {
      if (btn) btn.classList.add('active');
      if (label) label.textContent = 'Aktif';
      showToast('Notifikasi Web berhasil diaktifkan!', 'success');
    } else {
      showToast('Gagal mendaftarkan langganan notifikasi.', 'warn');
    }
  } catch (err) {
    console.error('[WebPush Error]:', err);
    showToast('Kendala aktivasi notifikasi: ' + err.message, 'warn');
  }
}

// Register Service Worker & handle push messages
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      checkPushSubscriptionState(reg);
    }).catch(err => {
      console.warn('[SW Register Fail]:', err);
    });
  });

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
      const d = event.data.data || {};
      showToast((d.title || 'SeikaOne') + ': ' + (d.body || ''), 'info', 4500);
    }
  });
}

// --- SIDEBAR ACCORDION CATEGORIES TOGGLE ---
function toggleSidebarCategory(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.classList.toggle('collapsed');
}

// --- FLOATING NOTIFICATION PERMISSION CARD PROMPT ---
function checkNotificationPrompt() {
  if (!('Notification' in window)) return;

  // Don't show if already granted
  if (Notification.permission === 'granted') {
    return;
  }

  // Don't show if user dismissed during this session
  if (sessionStorage.getItem('zyro_notif_banner_dismissed') === '1') {
    return;
  }

  // Also check OneSignal permission state if loaded
  if (window.OneSignal && window.OneSignal.Notifications && window.OneSignal.Notifications.permission) {
    return;
  }

  // Display card with smooth entrance upon user scroll or 8s idle timeout (prevent stealing LCP on initial paint)
  const triggerShow = () => {
    if (window._notifPromptTriggered) return;
    window._notifPromptTriggered = true;
    window.removeEventListener('scroll', onScrollTrigger);
    clearTimeout(idleTimer);
    const banner = document.getElementById('notif-permission-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.classList.add('active-ready');
      requestAnimationFrame(() => {
        banner.classList.add('show');
      });
    }
  };

  const onScrollTrigger = () => {
    if (window.scrollY > 250) {
      triggerShow();
    }
  };

  window.addEventListener('scroll', onScrollTrigger, { passive: true });
  const idleTimer = setTimeout(triggerShow, 8000);
}

function dismissNotifPermissionBanner() {
  const banner = document.getElementById('notif-permission-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.classList.remove('active-ready');
      banner.style.display = 'none';
    }, 380);
  }
  sessionStorage.setItem('zyro_notif_banner_dismissed', '1');
}

async function requestWebNotificationsPrompt() {
  const banner = document.getElementById('notif-permission-banner');
  const hideCard = () => {
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.classList.remove('active-ready');
        banner.style.display = 'none';
      }, 380);
    }
  };

  // 1. OneSignal Web Push SDK
  if (window.OneSignal && window.OneSignal.Notifications) {
    try {
      await OneSignal.Notifications.requestPermission();
      if (OneSignal.Notifications.permission) {
        hideCard();
        if (typeof showToast === 'function') {
          showToast('Notifikasi SeikaOne berhasil diaktifkan!', 'fa-circle-check', '#10b981');
        }
        return;
      }
    } catch(err) {
      console.warn('[OneSignal Banner Request Warn]:', err);
    }
  }

  // 2. Standard Browser Notification API
  if ('Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        hideCard();
        if (typeof showToast === 'function') {
          showToast('Notifikasi browser berhasil diaktifkan!', 'fa-circle-check', '#10b981');
        }
        if (typeof toggleWebPushSubscription === 'function') {
          toggleWebPushSubscription();
        }
      } else {
        hideCard();
        sessionStorage.setItem('zyro_notif_banner_dismissed', '1');
      }
    } catch(err) {
      hideCard();
      sessionStorage.setItem('zyro_notif_banner_dismissed', '1');
    }
  }
}
window.addEventListener('load', checkNotificationPrompt);

/* ======================================================
   LEADERBOARD, WARRANTY CLAIM & LIVE CHAT CS JAVASCRIPT
   ====================================================== */

// --- 1. LEADERBOARD SYSTEM ---
async function openLeaderboardModal() {
  const modal = document.getElementById('leaderboardModal');
  if (!modal) return;
  modal.classList.add('on');
  lockBodyScroll();

  const podiumEl = document.getElementById('lbPodium');
  const listEl = document.getElementById('lbList');
  if (podiumEl) podiumEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--t3);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat leaderboard...</div>';
  if (listEl) listEl.innerHTML = '';

  try {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();

    if (data.stats) {
      const elTrx = document.getElementById('modalLbTotalTrx');
      const elRev = document.getElementById('modalLbTotalSpent');
      const elBuy = document.getElementById('modalLbTotalBuyers');
      if (elTrx && data.stats.totalTrx) elTrx.textContent = Number(data.stats.totalTrx).toLocaleString('id-ID') + '+';
      if (elRev && data.stats.totalRevenue) elRev.textContent = 'Rp ' + Number(data.stats.totalRevenue).toLocaleString('id-ID');
      if (elBuy && data.stats.totalBuyers) elBuy.textContent = Number(data.stats.totalBuyers).toLocaleString('id-ID') + '+';
    }

    if (!data.status || !data.leaderboard || data.leaderboard.length === 0) {
      if (podiumEl) podiumEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--t3);font-size:0.85rem;"><i class="fa-solid fa-trophy" style="font-size:2rem;margin-bottom:8px;opacity:0.3;display:block;"></i>Belum ada data transaksi berhasil bulan ini. Jadilah pembeli pertama!</div>';
      return;
    }

    function escapeLbHtml(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }

    function getShopLbRoleBadgeHtml(u, isPodium = false) {
      if (!u || !u.roleBadge || u.roleKey === 'free' || u.roleKey === 'member' || u.roleKey === 'none') {
        return isPodium 
          ? `<div style="margin:4px 0 6px;"><span class="lb-role-badge" style="background:var(--surface);color:var(--t3);border:1px solid var(--b1);font-size:0.58rem;font-weight:700;padding:2px 8px;border-radius:100px;display:inline-flex;align-items:center;gap:3px;"><i class="fa-regular fa-user" style="font-size:0.55rem;"></i> Member</span></div>`
          : '';
      }
      const color = u.roleColor || '#0ea5e9';
      if (isPodium) {
        return `<div style="margin:4px 0 6px;"><span class="lb-role-badge" style="background:${color};color:#fff;font-size:0.6rem;font-weight:800;padding:2px 9px;border-radius:100px;letter-spacing:0.3px;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);"><i class="fa-solid fa-shield-halved" style="font-size:0.56rem;"></i> ${escapeLbHtml(u.roleBadge)}</span></div>`;
      }
      return `<span class="lb-role-badge" style="background:${color};color:#fff;font-size:0.58rem;font-weight:800;padding:2px 7px;border-radius:6px;letter-spacing:0.2px;display:inline-flex;align-items:center;gap:3px;vertical-align:middle;margin-left:6px;box-shadow:0 1px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-shield-halved" style="font-size:0.52rem;"></i> ${escapeLbHtml(u.roleBadge)}</span>`;
    }

    const lb = data.leaderboard;
    // Top 3 Podium
    const p1 = lb[0] || null;
    const p2 = lb[1] || null;
    const p3 = lb[2] || null;

    let podiumHtml = '';
    
    // 2nd Place
    if (p2) {
      podiumHtml += `
        <div class="lb-podium-col">
          <div class="lb-crown" style="color:#94a3b8;"><i class="fa-solid fa-medal"></i></div>
          <div class="lb-podium-card lb-p2">
            <div class="lb-avatar">${p2.name.slice(0, 2).toUpperCase()}</div>
            <div class="lb-name" title="${p2.name}">${p2.name}</div>
            ${getShopLbRoleBadgeHtml(p2, true)}
            <div class="lb-spent">Rp ${Number(p2.totalSpent).toLocaleString('id-ID')}</div>
            <div class="lb-orders">${p2.totalOrders} order</div>
          </div>
        </div>
      `;
    }

    // 1st Place (Center / Taller)
    if (p1) {
      podiumHtml += `
        <div class="lb-podium-col">
          <div class="lb-crown" style="color:#f59e0b;"><i class="fa-solid fa-crown"></i> <i class="fa-solid fa-medal"></i></div>
          <div class="lb-podium-card lb-p1">
            <div class="lb-avatar" style="border-color:#f59e0b;">${p1.name.slice(0, 2).toUpperCase()}</div>
            <div class="lb-name" title="${p1.name}" style="font-weight:900;">${p1.name}</div>
            ${getShopLbRoleBadgeHtml(p1, true)}
            <div class="lb-spent" style="font-size:0.82rem;">Rp ${Number(p1.totalSpent).toLocaleString('id-ID')}</div>
            <div class="lb-orders">${p1.totalOrders} order</div>
          </div>
        </div>
      `;
    }

    // 3rd Place
    if (p3) {
      podiumHtml += `
        <div class="lb-podium-col">
          <div class="lb-crown" style="color:#d97706;"><i class="fa-solid fa-medal"></i></div>
          <div class="lb-podium-card lb-p3">
            <div class="lb-avatar">${p3.name.slice(0, 2).toUpperCase()}</div>
            <div class="lb-name" title="${p3.name}">${p3.name}</div>
            ${getShopLbRoleBadgeHtml(p3, true)}
            <div class="lb-spent">Rp ${Number(p3.totalSpent).toLocaleString('id-ID')}</div>
            <div class="lb-orders">${p3.totalOrders} order</div>
          </div>
        </div>
      `;
    }
    if (podiumEl) podiumEl.innerHTML = podiumHtml;

    // Ranks 4 to 10
    const rest = lb.slice(3, 10);
    if (rest.length === 0) {
      if (listEl) listEl.innerHTML = '<div style="text-align:center;padding:12px;font-size:0.75rem;color:var(--t3);">Belum ada peringkat selanjutnya.</div>';
    } else {
      let listHtml = '';
      rest.forEach((item, idx) => {
        const rankNum = idx + 4;
        listHtml += `
          <div class="lb-item">
            <div class="lb-item-l">
              <span class="lb-rank">${rankNum}</span>
              <div>
                <div class="lb-name" style="font-size:0.84rem;display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
                  <span>${item.name}</span>
                  ${getShopLbRoleBadgeHtml(item, false)}
                </div>
                <div class="lb-orders" style="font-size:0.72rem;margin-top:2px;">
                  ${item.totalOrders} transaksi berhasil
                </div>
              </div>
            </div>
            <div class="lb-item-r">
              <div class="lb-spent">Rp ${Number(item.totalSpent).toLocaleString('id-ID')}</div>
            </div>
          </div>
        `;
      });
      if (listEl) listEl.innerHTML = listHtml;
    }
  } catch (err) {
    if (podiumEl) podiumEl.innerHTML = '<div style="color:var(--rose);padding:14px;text-align:center;">Gagal memuat data leaderboard.</div>';
  }
}

function closeLeaderboardModal() {
  const modal = document.getElementById('leaderboardModal');
  if (modal) modal.classList.remove('on');
  unlockBodyScroll();
}

// --- 2. WARRANTY SYSTEM ---
function openWarrantyModal(prefillCode) {
  const modal = document.getElementById('warrantyModal');
  if (!modal) return;
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';

  // Prefill buyer data from localStorage if available
  const savedEmail = localStorage.getItem('zyro_buyer_email') || '';
  const savedTele = localStorage.getItem('zyro_buyer_tele') || localStorage.getItem('zyro_buyer_name') || '';
  
  const emailIn = document.getElementById('warrEmailInput');
  const contactIn = document.getElementById('warrContactInput');
  const codeIn = document.getElementById('warrCodeInput');

  if (emailIn && !emailIn.value) emailIn.value = savedEmail;
  if (contactIn && !contactIn.value) contactIn.value = savedTele;
  if (prefillCode && codeIn) codeIn.value = prefillCode;
}

function closeWarrantyModal() {
  const modal = document.getElementById('warrantyModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
}

function switchWarrantyTab(tab) {
  const btnClaim = document.getElementById('tab-claim-btn');
  const btnStatus = document.getElementById('tab-status-btn');
  const formTab = document.getElementById('warr-form-tab');
  const statusTab = document.getElementById('warr-status-tab');

  if (tab === 'claim') {
    btnClaim.classList.add('act');
    btnStatus.classList.remove('act');
    formTab.style.display = 'block';
    statusTab.style.display = 'none';
  } else {
    btnStatus.classList.add('act');
    btnClaim.classList.remove('act');
    formTab.style.display = 'none';
    statusTab.style.display = 'block';
  }
}

async function submitWarrantyClaim(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitClaim');
  const originalHtml = btn.innerHTML;

  const payload = {
    orderOrWarrantyCode: document.getElementById('warrCodeInput').value.trim(),
    buyerEmail: document.getElementById('warrEmailInput').value.trim(),
    buyerContact: document.getElementById('warrContactInput').value.trim(),
    issueType: document.getElementById('warrIssueType').value,
    description: document.getElementById('warrDescInput').value.trim()
  };

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Pengajuan...';

  try {
    const res = await fetch('/api/warranty/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = originalHtml;

    if (data.status) {
      if (data.ticketSecret && data.ticketId) {
        try { localStorage.setItem('zyro_ticket_' + data.ticketId, data.ticketSecret); } catch (_) {}
      }
      showToast(data.message, 'success');
      // Switch to status tab and check status automatically
      switchWarrantyTab('status');
      document.getElementById('warrSearchInput').value = data.ticketId;
      checkWarrantyTicketStatus();
    } else {
      showToast(data.message || 'Gagal mengirim pengajuan', 'warn');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    showToast('Terjadi kesalahan jaringan: ' + err.message, 'warn');
  }
}

async function checkWarrantyTicketStatus() {
  const q = document.getElementById('warrSearchInput').value.trim();
  const container = document.getElementById('warrStatusResult');
  if (!q) {
    container.innerHTML = '<div style="color:var(--rose);font-size:0.8rem;margin-top:10px;">Silakan masukkan Kode Tiket / Order ID / Kode Garansi.</div>';
    return;
  }

  container.innerHTML = '<div style="color:var(--t3);text-align:center;padding:16px;"><i class="fa-solid fa-spinner fa-spin"></i> Mencari tiket...</div>';

  try {
    const savedSecret = localStorage.getItem('zyro_ticket_' + q) || '';
    const headers = {};
    if (savedSecret) headers['x-ticket-secret'] = savedSecret;

    const res = await fetch(`/api/warranty/status?q=${encodeURIComponent(q)}`, { headers });
    const data = await res.json();
    if (!data.status || !data.tickets || data.tickets.length === 0) {
      container.innerHTML = `<div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.25);border-radius:12px;padding:14px;color:var(--rose);font-size:0.82rem;text-align:center;">
        <i class="fa-solid fa-circle-exclamation" style="font-size:1.4rem;display:block;margin-bottom:6px;"></i>
        Tiket klaim tidak ditemukan. Pastikan nomor tiket, order ID, atau kode garansi sudah benar.
      </div>`;
      return;
    }

    let html = '';
    data.tickets.forEach(ticket => {
      let badgeClass = 'ws-pending';
      let icon = 'fa-clock';
      if (ticket.status === 'APPROVED') {
        badgeClass = 'ws-approved';
        icon = 'fa-circle-check';
      } else if (ticket.status === 'REJECTED') {
        badgeClass = 'ws-rejected';
        icon = 'fa-circle-xmark';
      }

      html += `
        <div class="warr-ticket-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
            <div>
              <span style="font-size:0.7rem;color:var(--t3);display:block;font-weight:700;">Nomor Tiket</span>
              <b style="font-family:'JetBrains Mono',monospace;color:var(--a);font-size:0.95rem;">${ticket.ticketId}</b>
            </div>
            <span class="warr-status-badge ${badgeClass}">
              <i class="fa-solid ${icon}"></i> ${ticket.status}
            </span>
          </div>

          <div style="font-size:0.78rem;color:var(--t2);line-height:1.5;margin-bottom:8px;">
            <div><b>Produk:</b> ${ticket.productName || 'Panel Pterodactyl'}</div>
            <div><b>Kendala:</b> ${ticket.issueLabel || ticket.issueType}</div>
            <div><b>Waktu Pengajuan:</b> ${ticket.createdAt}</div>
            <div style="margin-top:6px;background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--b1);font-style:italic;">
              "${ticket.description}"
            </div>
          </div>

          ${ticket.adminNotes ? `
            <div style="background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:10px;padding:10px 12px;margin-top:10px;">
              <div style="font-size:0.74rem;font-weight:800;color:var(--a);margin-bottom:3px;display:flex;align-items:center;gap:6px;">
                <i class="fa-solid fa-headset"></i> Respon / Solusi dari Admin (SeikaOne):
              </div>
              <div style="font-size:0.8rem;color:var(--t1);font-weight:600;">
                ${ticket.adminNotes}
              </div>
            </div>
          ` : `
            <div style="font-size:0.72rem;color:var(--t3);margin-top:8px;font-style:italic;">
              <i class="fa-solid fa-hourglass-half"></i> Menunggu review dan penanganan oleh Admin SeikaOne...
            </div>
          `}
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<div style="color:var(--rose);padding:10px;text-align:center;">Gagal mengambil status: ' + err.message + '</div>';
  }
}

// --- 3. LIVE CHAT CS (AI FIRST + HUMAN ADMIN TAKEOVER) ---
let _chatPollInterval = null;
let _chatLastMsgCount = 0;
let _currentChatUserKey = null;

function getChatUserKey() {
  try {
    const raw = localStorage.getItem('seika_user_data') || localStorage.getItem('seika_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.id || u.email)) {
        return 'usr_' + String(u.id || u.email).replace(/[^a-zA-Z0-9_-]/g, '_');
      }
    }
  } catch(e) {}
  return 'guest';
}

function getChatStorageKey() {
  return 'zyro_chat_session_' + getChatUserKey();
}

function getOrCreateChatSession() {
  const sKey = getChatStorageKey();
  let sid = localStorage.getItem(sKey);
  if (!sid) {
    sid = 'CHAT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem(sKey, sid);
  }
  return sid;
}

function startNewChatSession() {
  const sKey = getChatStorageKey();
  const newSid = 'CHAT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  localStorage.setItem(sKey, newSid);
  _chatLastMsgCount = 0;
  
  const container = document.getElementById('chat-messages');
  if (container) {
    container.innerHTML = `
      <div class="chat-bubble-wrap ai">
        <span class="chat-sender-lbl"><i class="fa-solid fa-headset" style="color:var(--a);"></i> SeikaOne Support</span>
        <div class="chat-bubble ai">
          Halo kak! Sesi percakapan baru telah dimulai.<br>
          Ada yang bisa kami bantu? Silakan sampaikan seputar produk, stok panel, garansi, script bot, atau kendala transaksi.
        </div>
        <span class="chat-bubble-time">Sistem</span>
      </div>
    `;
    container.scrollTop = 0;
  }
  if (typeof showToast === 'function') {
    showToast('Sesi chat baru telah dimulai!', 'fa-arrows-rotate', '#10b981');
  }
}

async function refreshChatMessages() {
  const icon = document.getElementById('iconRefreshChat') || document.querySelector('#btnRefreshChat i');
  if (icon) icon.classList.add('fa-spin');
  try {
    await loadChatHistory();
    if (typeof showToast === 'function') {
      showToast('Pesan percakapan diperbarui', 'info', 1800);
    }
  } catch (err) {
    console.warn('[Refresh Chat Error]:', err);
  } finally {
    if (icon) {
      setTimeout(() => icon.classList.remove('fa-spin'), 600);
    }
  }
}
window.refreshChatMessages = refreshChatMessages;

function toggleChatWidget() {
  const box = document.getElementById('chat-widget-box');
  if (!box) return;

  const isOpen = box.classList.contains('open');
  if (isOpen) {
    box.classList.remove('open');
    if (_chatPollInterval) clearInterval(_chatPollInterval);
    _chatPollInterval = null;
  } else {
    box.classList.add('open');
    const uKey = getChatUserKey();
    if (_currentChatUserKey !== uKey) {
      _currentChatUserKey = uKey;
      _chatLastMsgCount = 0;
      const container = document.getElementById('chat-messages');
      if (container) {
        container.innerHTML = `
          <div class="chat-bubble-wrap ai">
            <span class="chat-sender-lbl"><i class="fa-solid fa-headset" style="color:var(--a);"></i> SeikaOne Support</span>
            <div class="chat-bubble ai">
              Halo kak! Selamat datang di <b>SeikaOne.id</b>.<br>
              Ada yang bisa kami bantu? Silakan tanyakan seputar panel, akun premium, garansi, atau cara pembayaran.
            </div>
            <span class="chat-bubble-time">Sistem</span>
          </div>
        `;
      }
    }
    loadChatHistory();
    // Start polling every 4 seconds for live admin responses
    if (!_chatPollInterval) {
      _chatPollInterval = setInterval(loadChatHistory, 4000);
    }
  }
}

async function loadChatHistory() {
  const uKey = getChatUserKey();
  if (_currentChatUserKey !== uKey) {
    _currentChatUserKey = uKey;
    _chatLastMsgCount = 0;
  }
  const sessionId = getOrCreateChatSession();
  try {
    const res = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (data.status && data.messages) {
      renderChatMessages(data.messages);
    }
  } catch (err) {
    console.warn('[Chat History Error]:', err);
  }
}

function renderChatMessages(messages) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  if (!messages || messages.length === 0) {
    return;
  }

  if (messages.length === _chatLastMsgCount) return;
  _chatLastMsgCount = messages.length;

  let html = `
    <div class="chat-bubble-wrap ai">
      <span class="chat-sender-lbl"><i class="fa-solid fa-headset" style="color:var(--a);"></i> SeikaOne Support</span>
      <div class="chat-bubble ai">
        Halo kak! Selamat datang di <b>SeikaOne.id</b>.<br>
        Ada yang bisa kami bantu? Silakan tanyakan seputar panel, akun premium, garansi, atau cara pembayaran.
      </div>
      <span class="chat-bubble-time">Sistem</span>
    </div>
  `;

  messages.forEach(msg => {
    if (msg.sender === 'user') {
      const displayName = (msg.name && msg.name !== 'SeikaOne' && msg.name !== 'Pengunjung Web') ? escapeHtml(msg.name) : 'Anda';
      html += `
        <div class="chat-bubble-wrap user">
          <span class="chat-sender-lbl">${displayName}</span>
          <div class="chat-bubble user">${escapeHtml(msg.text)}</div>
          <span class="chat-bubble-time">${msg.time || ''}</span>
        </div>
      `;
    } else if (msg.sender === 'admin') {
      html += `
        <div class="chat-bubble-wrap admin">
          <span class="chat-sender-lbl admin-lbl"><i class="fa-solid fa-crown"></i> ${msg.name || 'Admin SeikaOne'}</span>
          <div class="chat-bubble admin">${formatAiChatMessage(msg.text)}</div>
          <span class="chat-bubble-time">${msg.time || ''}</span>
        </div>
      `;
    } else {
      // AI response
      const csName = (msg.name && msg.name !== 'AI Assistant SeikaOne') ? msg.name : 'SeikaOne Support';
      html += `
        <div class="chat-bubble-wrap ai">
          <span class="chat-sender-lbl"><i class="fa-solid fa-headset" style="color:var(--a);"></i> ${escapeHtml(csName)}</span>
          <div class="chat-bubble ai">${formatAiChatMessage(msg.text)}</div>
          <span class="chat-bubble-time">${msg.time || ''}</span>
        </div>
      `;
    }
  });

  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function formatAiChatMessage(text) {
  if (!text) return '';
  let out = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Markdown bold **text** or __text__
  out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  out = out.replace(/__(.+?)__/g, '<b>$1</b>');

  // Markdown italic *text* (avoiding double stars)
  out = out.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, '$1<i>$2</i>$3');

  // Inline code `code`
  out = out.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 5px;border-radius:4px;font-family:monospace;font-size:0.88em;">$1</code>');

  // URLs to clickable links (avoiding trailing punctuation)
  out = out.replace(/(https?:\/\/[^\s<]+?)([.,;)]?)(\s|$|<)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--a);text-decoration:underline;word-break:break-all;">$1</a>$2$3');

  // Telegram @mentions
  out = out.replace(/(^|[\s>])@([a-zA-Z0-9_]{4,})/g, '$1<a href="https://t.me/$2" target="_blank" rel="noopener" style="color:var(--a);text-decoration:underline;font-weight:600;">@$2</a>');

  // Bullet points
  out = out.replace(/(^|\n)[\s]*[•\-\*]\s+/g, '$1• ');

  // Newlines to <br>
  out = out.replace(/\n/g, '<br>');

  return out;
}

async function handleSendChatMessage(e) {
  if (e) e.preventDefault();
  const inEl = document.getElementById('chatInputText');
  const btn = document.getElementById('chatSendBtn');
  const msg = inEl.value.trim();
  if (!msg) return;

  const sessionId = getOrCreateChatSession();
  let buyerName = '';
  let buyerEmail = '';
  try {
    const savedUser = JSON.parse(localStorage.getItem('seika_user_data') || localStorage.getItem('seika_user') || 'null');
    if (savedUser) {
      if (savedUser.name) buyerName = savedUser.name;
      if (savedUser.email) buyerEmail = savedUser.email;
    }
  } catch(e) {}
  if (!buyerName) {
    const rawSaved = localStorage.getItem('zyro_buyer_name');
    if (rawSaved && rawSaved !== 'Anda' && rawSaved !== 'Pengunjung Web') buyerName = rawSaved;
  }
  if (!buyerEmail) {
    buyerEmail = localStorage.getItem('zyro_buyer_email') || '';
  }

  const container = document.getElementById('chat-messages');
  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const userBubbleHtml = `
    <div class="chat-bubble-wrap user">
      <span class="chat-sender-lbl">${escapeHtml(buyerName || 'Anda')}</span>
      <div class="chat-bubble user">${escapeHtml(msg)}</div>
      <span class="chat-bubble-time">${nowTime}</span>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', userBubbleHtml);
  container.scrollTop = container.scrollHeight;

  inEl.value = '';
  btn.disabled = true;

  const typingId = 'typing-' + Date.now();
  const typingHtml = `
    <div class="chat-bubble-wrap ai" id="${typingId}">
      <span class="chat-sender-lbl"><i class="fa-solid fa-headset" style="color:var(--a);"></i> SeikaOne Support</span>
      <div class="chat-bubble ai" style="display:flex;align-items:center;gap:6px;padding:8px 14px;">
        <i class="fa-solid fa-circle-notch fa-spin" style="color:var(--a);"></i> <i>SeikaOne Support sedang mengetik...</i>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', typingHtml);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: msg, buyerName, buyerEmail })
    });
    const data = await res.json();
    
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    btn.disabled = false;

    if (data.status && (data.reply || data.aiMessage)) {
      const replyText = data.reply || data.aiMessage.text;
      const aiBubbleHtml = `
        <div class="chat-bubble-wrap ai">
          <span class="chat-sender-lbl"><i class="fa-solid fa-headset" style="color:var(--a);"></i> SeikaOne Support</span>
          <div class="chat-bubble ai">${formatAiChatMessage(replyText)}</div>
          <span class="chat-bubble-time">${data.replyTime || nowTime}</span>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', aiBubbleHtml);
      container.scrollTop = container.scrollHeight;
      _chatLastMsgCount++;
    }
  } catch (err) {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();
    btn.disabled = false;
    showToast('Gagal mengirim pesan chat.', 'warn');
  }
}

function quickChat(text) {
  const inEl = document.getElementById('chatInputText');
  if (inEl) {
    inEl.value = text;
    handleSendChatMessage();
  }
}



/* ======================================================
   MEMBER AUTHENTICATION & GOOGLE LOGIN SYSTEM
   ====================================================== */

function initAuthUI() {
  loadAuthConfig();
  const savedUser = localStorage.getItem('seika_user_data');
  if (_authToken && savedUser) {
    try {
      _currentUser = JSON.parse(savedUser);
      renderLoggedInUI(_currentUser);
      validateSession();
    } catch (e) {
      userLogout(false);
    }
  } else if (_authToken) {
    validateSession();
  } else {
    renderLoggedOutUI();
  }
}

async function loadAuthConfig() {
  if (_authToken || _currentUser) {
    if (window.google?.accounts?.id) {
      try {
        google.accounts.id.cancel();
        google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
    return;
  }
  try {
    const res = await fetch('/api/auth/config');
    const data = await res.json();
    if (data.status && data.googleClientId) {
      _googleClientId = data.googleClientId;
      initGoogleGis();
    }
  } catch (err) {
    console.warn('[Auth Config Error]:', err);
  }
}

function initGoogleGis() {
  if (_authToken || _currentUser) {
    if (window.google?.accounts?.id) {
      try {
        google.accounts.id.cancel();
        google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
    return;
  }
  if (!_googleClientId) return;
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    setTimeout(initGoogleGis, 500);
    return;
  }

  try {
    google.accounts.id.initialize({
      client_id: _googleClientId,
      callback: window.handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // Render official Google Sign-In button if container exists
    const container = document.getElementById('googleBtnContainer');
    if (container) {
      container.style.display = 'block';
      google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 380
      });
      // Hide manual trigger button when official Google button is rendered
      const btnGoogleLogin = document.getElementById('btnGoogleLogin');
      if (btnGoogleLogin) btnGoogleLogin.style.display = 'none';
    }
  } catch (e) {
    console.warn('[Google GIS Init Warn]:', e);
  }
}

async function validateSession() {
  if (!_authToken) return;
  try {
    const res = await fetch(`/api/auth/me?token=${encodeURIComponent(_authToken)}`);
    const data = await res.json();
    if (data.status && data.user) {
      _currentUser = data.user;
      localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      renderLoggedInUI(_currentUser);
    } else {
      userLogout(false);
    }
  } catch (err) {
    console.warn('[Session Validate Warn]:', err);
  }
}

function renderLoggedInUI(user) {
  document.documentElement.classList.add('zyro-authenticated');
  document.documentElement.classList.remove('zyro-guest');

  if (window.google?.accounts?.id) {
    try {
      google.accounts.id.cancel();
      google.accounts.id.disableAutoSelect();
    } catch (e) {}
  }

  const btnLogin = document.getElementById('btnTopLogin');
  const userPill = document.getElementById('userNavPill');
  const navName = document.getElementById('userNavName');
  const navAvatar = document.getElementById('userNavAvatar');
  const udName = document.getElementById('udName');
  const udEmail = document.getElementById('udEmail');
  const udAvatar = document.getElementById('udAvatar');
  const sbUserBox = document.getElementById('sidebarUserBox');
  const sbUserName = document.getElementById('sbUserName');
  const sbUserAvatar = document.getElementById('sbUserAvatar');
  const sbOrdersLink = document.getElementById('sbOrdersLink');

  if (btnLogin) btnLogin.style.display = 'none';
  if (userPill) userPill.style.display = 'inline-flex';

  const firstName = user.name ? user.name.split(' ')[0] : 'Member';
  const avatarUrl = (typeof getSmartAvatar === 'function')
    ? getSmartAvatar(user.avatar, user.name || user.email)
    : (user.avatar || 'assets/logo.png');

  const cachedAva = localStorage.getItem('zyro_cached_avatar_b64');
  const effectiveAvatarSrc = cachedAva || avatarUrl;

  function applyAvatarWithFallback(el) {
    if (!el) return;
    el.src = effectiveAvatarSrc;
    el.onerror = function() {
      if (typeof getSmartAvatar === 'function') {
        this.src = getSmartAvatar('', user.name || user.email);
      } else {
        this.src = 'assets/logo.png';
      }
    };
  }

  // Pre-cache avatar locally in background for 0ms instantaneous future reloads
  (function cacheAvatarLocally(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return;
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 64, 64);
          const dataUri = canvas.toDataURL('image/webp', 0.85);
          if (dataUri && dataUri.length > 50) {
            localStorage.setItem('zyro_cached_avatar_b64', dataUri);
          }
        } catch (_) {}
      };
      img.src = url;
    } catch (_) {}
  })(avatarUrl);

  if (navName) navName.innerText = firstName;
  applyAvatarWithFallback(navAvatar);
  if (udName) udName.innerText = user.name || 'Member Zyro';
  if (udEmail) udEmail.innerText = user.email || '';
  applyAvatarWithFallback(udAvatar);

  const settAvatar = document.getElementById('settUserAvatar');
  const settName = document.getElementById('settUserName');
  const settEmail = document.getElementById('settUserEmail');
  const inCurEmail = document.getElementById('settInputCurrentEmail');
  const inName = document.getElementById('settInputName');
  const inPhone = document.getElementById('settInputPhone');
  applyAvatarWithFallback(settAvatar);
  if (settName) settName.innerText = user.name || 'Member Zyro';
  if (settEmail) settEmail.innerText = user.email || '';
  if (inCurEmail) inCurEmail.value = user.email || '';
  if (inName) inName.value = user.name || '';
  if (inPhone) inPhone.value = user.phone || '';

  if (sbUserBox) {
    sbUserBox.style.display = 'flex';
    if (sbUserName) sbUserName.innerText = user.name || 'Member';
    applyAvatarWithFallback(sbUserAvatar);
  }
  if (sbOrdersLink) sbOrdersLink.style.display = 'flex';

  // Admin Panel link: ONLY visible to Owner (gilangx288@gmail.com, zyrodevv@gmail.com, etc)
  const isOwner = Boolean(user && (
    (user.email && ['gilangx288@gmail.com', 'zyrodevv@gmail.com', 'gilram336@gmail.com'].includes(user.email.toLowerCase())) ||
    (user.isAdmin === true && user.cpanelRole?.category === 'owner')
  ));
  const sbAdminGroup = document.getElementById('sbAdminGroup');
  const sbAdminLink = document.getElementById('sbAdminLink');
  const sbAdminHeader = document.getElementById('sbAdminSectionHeader');
  const ftAdminLink = document.getElementById('ftAdminLink');
  const udAdminLink = document.getElementById('udAdminLink');
  if (sbAdminGroup) sbAdminGroup.style.display = isOwner ? 'block' : 'none';
  if (sbAdminLink) sbAdminLink.style.display = isOwner ? 'flex' : 'none';
  if (sbAdminHeader) sbAdminHeader.style.display = isOwner ? 'flex' : 'none';
  if (ftAdminLink) ftAdminLink.style.display = isOwner ? 'flex' : 'none';
  if (udAdminLink) udAdminLink.style.display = isOwner ? 'flex' : 'none';

  // Home Balance Card Sync
  const homeBalCard = document.getElementById('home-balance-card');
  const homeGuestCard = document.getElementById('home-guest-balance-card');
  const hbalAvatar = document.getElementById('hbal-avatar');
  const hbalName = document.getElementById('hbal-name');
  const hbalEmail = document.getElementById('hbal-email');
  const hbalRoleBadge = document.getElementById('hbal-role-badge');
  const btnOwnerReward = document.getElementById('btn-owner-reward');

  if (homeBalCard) homeBalCard.style.display = 'flex';
  if (homeGuestCard) homeGuestCard.style.display = 'none';
  if (btnOwnerReward) btnOwnerReward.style.display = isOwner ? 'inline-flex' : 'none';
  applyAvatarWithFallback(hbalAvatar);
  if (hbalName) hbalName.innerText = firstName;
  if (hbalEmail) hbalEmail.innerText = user.email || '';
  if (hbalRoleBadge) {
    let roleTitle = (user.cpanelRole?.name || user.role || 'Member').replace('Legal ', '');
    let roleBg = '';
    let roleColor = '';
    if (Array.isArray(user.roles)) {
      if (user.roles.includes('bug_hunter')) {
        roleTitle = '<i class="fa-solid fa-bug"></i> Bug Hunter';
        roleBg = 'rgba(16, 185, 129, 0.15)';
        roleColor = '#10b981';
      } else if (user.roles.includes('top_leaderboard')) {
        roleTitle = '<i class="fa-solid fa-trophy"></i> Top Leaderboard';
        roleBg = 'rgba(245, 158, 11, 0.15)';
        roleColor = '#f59e0b';
      } else if (isOwner || user.roles.includes('developer') || user.roles.includes('founder')) {
        roleTitle = '<i class="fa-solid fa-crown"></i> Founder / Dev';
        roleBg = 'rgba(139, 92, 246, 0.15)';
        roleColor = '#a855f7';
      }
    } else if (isOwner) {
      roleTitle = '<i class="fa-solid fa-crown"></i> Owner / Dev';
      roleBg = 'rgba(245, 158, 11, 0.15)';
      roleColor = '#fbbf24';
    }
    hbalRoleBadge.innerHTML = roleTitle;
    if (roleBg) hbalRoleBadge.style.background = roleBg;
    if (roleColor) {
      hbalRoleBadge.style.color = roleColor;
      hbalRoleBadge.style.borderColor = roleColor;
    }
  }
  updateHomeBalanceDisplay(Number(user.balance) || 0);

  if (user.name) localStorage.setItem('zyro_buyer_name', user.name);
  if (user.email) localStorage.setItem('zyro_buyer_email', user.email);
  if (user.phone) localStorage.setItem('zyro_buyer_tele', user.phone);
}

function renderLoggedOutUI() {
  document.documentElement.classList.remove('zyro-authenticated');
  document.documentElement.classList.remove('zyro-bal-long', 'zyro-bal-huge');
  document.documentElement.classList.add('zyro-guest');

  const btnLogin = document.getElementById('btnTopLogin');
  const userPill = document.getElementById('userNavPill');
  const userDropdown = document.getElementById('userDropdownMenu');
  const sbUserBox = document.getElementById('sidebarUserBox');
  const sbOrdersLink = document.getElementById('sbOrdersLink');
  const sbAdminGroup = document.getElementById('sbAdminGroup');
  const sbAdminLink = document.getElementById('sbAdminLink');
  const sbAdminHeader = document.getElementById('sbAdminSectionHeader');
  const ftAdminLink = document.getElementById('ftAdminLink');
  const udAdminLink = document.getElementById('udAdminLink');
  const homeBalCard = document.getElementById('home-balance-card');
  const homeGuestCard = document.getElementById('home-guest-balance-card');
  const btnOwnerReward = document.getElementById('btn-owner-reward');

  if (btnLogin) btnLogin.style.display = 'inline-flex';
  if (userPill) userPill.style.display = 'none';
  if (userDropdown) userDropdown.style.display = 'none';
  if (sbUserBox) sbUserBox.style.display = 'none';
  if (sbOrdersLink) sbOrdersLink.style.display = 'none';
  if (sbAdminGroup) sbAdminGroup.style.display = 'none';
  if (sbAdminLink) sbAdminLink.style.display = 'none';
  if (sbAdminHeader) sbAdminHeader.style.display = 'none';
  if (ftAdminLink) ftAdminLink.style.display = 'none';
  if (udAdminLink) udAdminLink.style.display = 'none';
  if (homeBalCard) homeBalCard.style.display = 'none';
  if (homeGuestCard) homeGuestCard.style.display = 'flex';
  if (btnOwnerReward) btnOwnerReward.style.display = 'none';
}

// ====================================================
// TOP-UP SALDO & HOME BALANCE LOGIC
// ====================================================
let currentTopupAmount = 20000;
let currentTopupId = null;
let topupTimerInterval = null;
let topupPollInterval = null;
let isBalanceHidden = localStorage.getItem('zyro_hide_balance') === 'true' || localStorage.getItem('zyro_balance_hidden') === 'true';

function updateHomeBalanceDisplay(balance) {
  const el = document.getElementById('hbal-amount-val');
  const modalBal = document.getElementById('topup-modal-current-bal');
  const num = Number(balance) || 0;
  if (modalBal) modalBal.innerText = 'Rp ' + num.toLocaleString('id-ID');
  if (el) {
    if (isBalanceHidden) {
      el.innerText = 'Rp ••••••••';
      el.classList.remove('hbal-amount-long', 'hbal-amount-huge');
    } else {
      const str = 'Rp ' + num.toLocaleString('id-ID');
      el.innerText = str;
      if (str.length > 15) {
        el.classList.add('hbal-amount-huge');
        el.classList.remove('hbal-amount-long');
      } else if (str.length > 12) {
        el.classList.add('hbal-amount-long');
        el.classList.remove('hbal-amount-huge');
      } else {
        el.classList.remove('hbal-amount-long', 'hbal-amount-huge');
      }
    }
  }
  const icon = document.getElementById('icon-toggle-balance');
  if (icon) {
    icon.className = isBalanceHidden ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  }
}

function toggleBalanceVisibility() {
  isBalanceHidden = !isBalanceHidden;
  localStorage.setItem('zyro_hide_balance', isBalanceHidden ? 'true' : 'false');
  localStorage.setItem('zyro_balance_hidden', isBalanceHidden ? 'true' : 'false');
  updateHomeBalanceDisplay(_currentUser ? _currentUser.balance : 0);
}

async function refreshUserBalance(showToastNotice = false) {
  if (!_authToken) return;
  const btn = document.getElementById('btn-refresh-balance');
  if (btn) btn.querySelector('i')?.classList.add('fa-spin');
  try {
    const res = await fetch(`/api/user/balance?token=${encodeURIComponent(_authToken)}`);
    const data = await res.json();
    if (data.status && typeof data.balance !== 'undefined') {
      if (_currentUser) {
        _currentUser.balance = data.balance;
        localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      }
      updateHomeBalanceDisplay(data.balance);
      if (showToastNotice) showToast('Saldo berhasil disinkronkan: Rp ' + Number(data.balance).toLocaleString('id-ID'), 'success');
    }
  } catch (err) {
    console.warn('[Sync Balance Error]:', err);
  } finally {
    if (btn) btn.querySelector('i')?.classList.remove('fa-spin');
  }
}

function openTopupModal() {
  if (!_authToken || !_currentUser) {
    showToast('Silakan masuk ke akun Anda terlebih dahulu untuk top up saldo.', 'info');
    openAuthModal('login');
    return;
  }
  const modal = document.getElementById('topupModal');
  if (!modal) return;

  const isOwner = Boolean(_currentUser && _currentUser.email && ['gilangx288@gmail.com', 'zyrodevv@gmail.com', 'gilram336@gmail.com'].includes(_currentUser.email.toLowerCase()));
  const ownerBox = document.getElementById('topup-owner-direct-box');
  if (ownerBox) ownerBox.style.display = isOwner ? 'block' : 'none';

  // Reset steps
  document.getElementById('topup-step-input').style.display = 'block';
  document.getElementById('topup-step-qris').style.display = 'none';
  document.getElementById('topup-step-success').style.display = 'none';

  // Sync current balance
  updateHomeBalanceDisplay(_currentUser.balance || 0);
  selectTopupChip(20000);

  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeTopupModal() {
  const modal = document.getElementById('topupModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
  if (topupTimerInterval) clearInterval(topupTimerInterval);
  if (topupPollInterval) clearInterval(topupPollInterval);
}

function selectTopupChip(nominal, el) {
  currentTopupAmount = parseInt(nominal, 10);
  document.querySelectorAll('.topup-chip').forEach(c => c.classList.remove('act'));
  if (el) {
    el.classList.add('act');
  } else {
    const match = document.querySelector(`.topup-chip[data-nominal="${nominal}"]`);
    if (match) match.classList.add('act');
  }
  const inCustom = document.getElementById('topup-input-custom');
  if (inCustom) inCustom.value = currentTopupAmount;
  updateTopupSummary();
}

function onTopupCustomInput(el) {
  const val = parseInt(el.value, 10) || 0;
  currentTopupAmount = val;
  document.querySelectorAll('.topup-chip').forEach(c => {
    if (parseInt(c.dataset.nominal, 10) === val) {
      c.classList.add('act');
    } else {
      c.classList.remove('act');
    }
  });
  updateTopupSummary();
}

function updateTopupSummary() {
  const sumAmount = document.getElementById('topup-sum-amount');
  const sumTotal = document.getElementById('topup-sum-total');
  const val = Math.max(0, currentTopupAmount);
  if (sumAmount) sumAmount.innerText = 'Rp ' + val.toLocaleString('id-ID');
  if (sumTotal) sumTotal.innerText = 'Rp ' + val.toLocaleString('id-ID');
}

async function submitTopupOrder() {
  if (currentTopupAmount < 1000) {
    showToast('Nominal top up minimal Rp 1.000', 'warn');
    return;
  }
  const btn = document.getElementById('btn-topup-generate');
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyiapkan QRIS...';

  try {
    const res = await fetch('/api/topup/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_authToken}`
      },
      body: JSON.stringify({ token: _authToken, amount: currentTopupAmount })
    });
    const json = await res.json();
    btn.disabled = false;
    btn.innerHTML = oldText;

    if (json.status && json.data) {
      currentTopupId = json.data.topupId;
      document.getElementById('topup-step-input').style.display = 'none';
      document.getElementById('topup-step-qris').style.display = 'block';

      document.getElementById('topup-qris-total-val').innerText = 'Rp ' + (json.data.totalPayment || currentTopupAmount).toLocaleString('id-ID');
      document.getElementById('topup-qris-id').innerText = '#' + currentTopupId;
      document.getElementById('topup-qr-img').src = json.data.qrUrl;

      startTopupCountdown(15 * 60);
      if (topupPollInterval) clearInterval(topupPollInterval);
      topupPollInterval = setInterval(checkTopupStatusAuto, 4000);
    } else {
      showToast(json.message || 'Gagal membuat QRIS top up', 'warn');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = oldText;
    showToast('Gagal terhubung ke server pembayaran: ' + err.message, 'warn');
  }
}

function startTopupCountdown(seconds) {
  let timeLeft = seconds;
  const display = document.getElementById('topup-timer-val');
  if (topupTimerInterval) clearInterval(topupTimerInterval);
  topupTimerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(topupTimerInterval);
      if (topupPollInterval) clearInterval(topupPollInterval);
      if (display) display.innerText = '00:00 (Kedaluwarsa)';
      showToast('Waktu pembayaran QRIS telah berakhir.', 'warn');
      return;
    }
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    if (display) display.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }, 1000);
}

async function checkTopupStatusAuto() {
  if (!currentTopupId) return;
  try {
    const res = await fetch(`/api/topup/status/${encodeURIComponent(currentTopupId)}`);
    const json = await res.json();
    if (json.status && json.paid) {
      onTopupSuccess(json);
    }
  } catch (err) {
    console.warn('[Auto Check Topup Err]:', err);
  }
}

async function manualCheckTopupStatus() {
  if (!currentTopupId) return;
  const btn = document.getElementById('btn-topup-manual-check');
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...';
  try {
    const res = await fetch(`/api/topup/status/${encodeURIComponent(currentTopupId)}`);
    const json = await res.json();
    btn.disabled = false;
    btn.innerHTML = oldText;
    if (json.status && json.paid) {
      onTopupSuccess(json);
    } else {
      showToast('Pembayaran belum terdeteksi. Silakan selesaikan scan QRIS!', 'info');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = oldText;
    showToast('Gagal mengecek status pembayaran.', 'warn');
  }
}

function onTopupSuccess(data) {
  if (topupTimerInterval) clearInterval(topupTimerInterval);
  if (topupPollInterval) clearInterval(topupPollInterval);

  if (_currentUser) {
    _currentUser.balance = data.newBalance;
    localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
  }
  updateHomeBalanceDisplay(data.newBalance);

  document.getElementById('topup-step-qris').style.display = 'none';
  document.getElementById('topup-step-success').style.display = 'block';
  document.getElementById('topup-success-amount').innerText = '+Rp ' + Number(data.amount || currentTopupAmount).toLocaleString('id-ID');
  document.getElementById('topup-success-newbal').innerText = 'Rp ' + Number(data.newBalance).toLocaleString('id-ID');

  showToast('Top Up Berhasil! Saldo telah masuk ke akun Anda.', 'success');
}

function finishTopupSuccess() {
  closeTopupModal();
  refreshUserBalance();
}

function downloadTopupQris() {
  const img = document.getElementById('topup-qr-img');
  if (!img || !img.src) return;
  const a = document.createElement('a');
  a.href = img.src;
  a.download = `QRIS-Topup-${currentTopupId || 'SeikaOne'}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function cancelTopupTransaction() {
  if (topupTimerInterval) clearInterval(topupTimerInterval);
  if (topupPollInterval) clearInterval(topupPollInterval);
  document.getElementById('topup-step-qris').style.display = 'none';
  document.getElementById('topup-step-input').style.display = 'block';
  currentTopupId = null;
}

// ====================================================
// OWNER REWARD & SELF-SALDO INJECTION (FOUNDER TOOLS)
// ====================================================
let homeRewardSearchTimeout = null;

async function submitOwnerSelfTopup() {
  const isOwner = Boolean(_currentUser && _currentUser.email && ['gilangx288@gmail.com', 'zyrodevv@gmail.com', 'gilram336@gmail.com'].includes(_currentUser.email.toLowerCase()));
  if (!isOwner) {
    showToast('Akses ditolak: Hanya akun Owner/Developer resmi yang dapat menggunakan fitur ini.', 'error');
    return;
  }
  const amount = parseInt(currentTopupAmount, 10);
  if (!amount || amount <= 0) {
    showToast('Pilih atau masukkan nominal top up yang valid.', 'warn');
    return;
  }

  const btn = document.getElementById('btn-owner-instant-topup');
  const oldText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Saldo Instan...';
  }

  try {
    const adminToken = localStorage.getItem('zyro_admin_token') || _authToken;
    const res = await fetch('/api/admin/balance/reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        token: adminToken,
        targetUserId: 'self',
        amount: amount,
        category: 'self',
        note: 'Top up instan saldo owner/developer'
      })
    });
    const json = await res.json();
    if (json.status && json.data) {
      if (_currentUser) {
        _currentUser.balance = json.data.currentBalance;
        localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      }
      updateHomeBalanceDisplay(json.data.currentBalance);
      closeTopupModal();
      showToast(`Berhasil! Saldo akun Anda bertambah +Rp ${amount.toLocaleString('id-ID')}`, 'success');
    } else {
      showToast(json.message || 'Gagal menambahkan saldo.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan sistem: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = oldText;
    }
  }
}

function openOwnerRewardModal() {
  const isOwner = Boolean(_currentUser && _currentUser.email && ['gilangx288@gmail.com', 'zyrodevv@gmail.com', 'gilram336@gmail.com'].includes(_currentUser.email.toLowerCase()));
  if (!isOwner) {
    showToast('Akses ditolak: Hanya akun Owner/Developer yang dapat membuka menu ini.', 'error');
    return;
  }
  const modal = document.getElementById('ownerRewardModal');
  if (!modal) return;

  setHomeRewardTarget('buyer');
  setHomeRewardNominal(50000);
  clearHomeRewardSelectedUser();

  const inSearch = document.getElementById('home-reward-user-search');
  if (inSearch) inSearch.value = '';
  const inNote = document.getElementById('home-reward-note');
  if (inNote) inNote.value = '';
  const selCat = document.getElementById('home-reward-category');
  if (selCat) selCat.value = 'bug';
  onHomeRewardCategoryChange('bug');

  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeOwnerRewardModal() {
  const modal = document.getElementById('ownerRewardModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
}

function setHomeRewardTarget(type) {
  const btnBuyer = document.getElementById('tab-home-tgt-buyer');
  const btnSelf = document.getElementById('tab-home-tgt-self');
  const buyerGroup = document.getElementById('home-reward-buyer-group');
  const roleGroup = document.getElementById('home-reward-role-group');
  const selCat = document.getElementById('home-reward-category');

  if (type === 'self') {
    if (btnSelf) btnSelf.classList.add('act');
    if (btnBuyer) btnBuyer.classList.remove('act');
    if (buyerGroup) buyerGroup.style.display = 'none';
    if (roleGroup) roleGroup.style.display = 'none';
    if (selCat) selCat.value = 'self';
    const tgt = document.getElementById('home-reward-target-id');
    if (tgt) tgt.value = 'self';
  } else {
    if (btnBuyer) btnBuyer.classList.add('act');
    if (btnSelf) btnSelf.classList.remove('act');
    if (buyerGroup) buyerGroup.style.display = 'block';
    if (roleGroup) roleGroup.style.display = 'block';
    if (selCat && selCat.value === 'self') selCat.value = 'bug';
    const tgt = document.getElementById('home-reward-target-id');
    if (tgt) tgt.value = '';
  }
}

function setHomeRewardNominal(amount, el) {
  const inAmount = document.getElementById('home-reward-amount');
  if (inAmount) inAmount.value = amount;
  document.querySelectorAll('#ownerRewardModal .topup-chip').forEach(c => {
    if (c.id !== 'tab-home-tgt-buyer' && c.id !== 'tab-home-tgt-self') {
      c.classList.remove('act');
    }
  });
  if (el) el.classList.add('act');
}

function onHomeRewardSearch(query) {
  clearTimeout(homeRewardSearchTimeout);
  const resultsDiv = document.getElementById('home-reward-user-results');
  if (!query || query.trim().length < 2) {
    if (resultsDiv) { resultsDiv.style.display = 'none'; resultsDiv.innerHTML = ''; }
    return;
  }

  homeRewardSearchTimeout = setTimeout(async () => {
    try {
      const adminToken = localStorage.getItem('zyro_admin_token') || _authToken;
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&token=${encodeURIComponent(adminToken)}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const json = await res.json();
      if (!resultsDiv) return;

      if (json.status && Array.isArray(json.users) && json.users.length > 0) {
        resultsDiv.innerHTML = json.users.map(u => {
          const userJson = JSON.stringify({ id: u.id, name: u.name, email: u.email, balance: u.balance }).replace(/"/g, '&quot;');
          return `
            <div onclick="selectHomeRewardUser(${userJson})" style="padding:10px 14px; border-bottom:1px solid var(--b1); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;" onmouseover="this.style.background='var(--abg)'" onmouseout="this.style.background='transparent'">
              <div>
                <div style="font-weight:700; font-size:0.83rem; color:var(--t1);">${u.name || 'Member'}</div>
                <div style="font-size:0.72rem; color:var(--t2);">${u.email || '-'} · ID: ${u.id}</div>
              </div>
              <div style="font-size:0.75rem; font-weight:700; color:var(--a);">Rp ${Number(u.balance || 0).toLocaleString('id-ID')}</div>
            </div>
          `;
        }).join('');
        resultsDiv.style.display = 'block';
      } else {
        resultsDiv.innerHTML = `<div style="padding:12px; text-align:center; font-size:0.78rem; color:var(--t3);">User tidak ditemukan</div>`;
        resultsDiv.style.display = 'block';
      }
    } catch (err) {
      console.warn('[Home Reward User Search Err]:', err);
    }
  }, 250);
}

function selectHomeRewardUser(user) {
  const resultsDiv = document.getElementById('home-reward-user-results');
  if (resultsDiv) resultsDiv.style.display = 'none';

  const tgt = document.getElementById('home-reward-target-id');
  if (tgt) tgt.value = user.id;
  const selName = document.getElementById('home-reward-sel-name');
  if (selName) selName.innerText = `${user.name} (Saldo: Rp ${Number(user.balance || 0).toLocaleString('id-ID')})`;
  const selDetail = document.getElementById('home-reward-sel-detail');
  if (selDetail) selDetail.innerText = `${user.email || '-'} · ID: ${user.id}`;
  const selBox = document.getElementById('home-reward-selected-box');
  if (selBox) selBox.style.display = 'flex';
  const inSearch = document.getElementById('home-reward-user-search');
  if (inSearch) inSearch.value = user.name || user.email;
}

function clearHomeRewardSelectedUser() {
  const tgt = document.getElementById('home-reward-target-id');
  if (tgt) tgt.value = '';
  const selBox = document.getElementById('home-reward-selected-box');
  if (selBox) selBox.style.display = 'none';
  const inSearch = document.getElementById('home-reward-user-search');
  if (inSearch) inSearch.value = '';
}

function onHomeRewardCategoryChange(cat) {
  const rBug = document.getElementById('home-role-bughunter');
  const rLead = document.getElementById('home-role-leaderboard');
  if (cat === 'bug' && rBug) {
    rBug.checked = true;
  } else if (cat === 'leaderboard' && rLead) {
    rLead.checked = true;
  }
}

async function submitHomeOwnerReward(e) {
  if (e) e.preventDefault();
  const targetId = document.getElementById('home-reward-target-id').value;
  const isSelf = targetId === 'self';

  if (!isSelf && !targetId) {
    showToast('Pilih buyer penerima reward terlebih dahulu melalui pencarian.', 'warn');
    return;
  }

  const amount = parseInt(document.getElementById('home-reward-amount').value, 10);
  if (isNaN(amount) || amount <= 0) {
    showToast('Nominal reward harus lebih dari 0.', 'warn');
    return;
  }

  const category = document.getElementById('home-reward-category').value;
  const note = document.getElementById('home-reward-note').value.trim();
  const roleRadios = document.querySelectorAll('input[name="home_assign_role"]');
  let assignRole = '';
  roleRadios.forEach(r => { if (r.checked) assignRole = r.value; });

  const btn = document.getElementById('btn-submit-home-reward');
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Saldo...';

  try {
    const adminToken = localStorage.getItem('zyro_admin_token') || _authToken;
    const res = await fetch('/api/admin/balance/reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        token: adminToken,
        targetUserId: isSelf ? 'self' : targetId,
        amount,
        category,
        note,
        assignRole: isSelf ? '' : assignRole
      })
    });
    const json = await res.json();
    if (json.status) {
      showToast(json.message || 'Reward berhasil dikirimkan!', 'success');
      closeOwnerRewardModal();
      if (isSelf) {
        if (_currentUser) {
          _currentUser.balance = json.data?.currentBalance || (_currentUser.balance + amount);
          localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
        }
        updateHomeBalanceDisplay(_currentUser.balance);
      }
    } else {
      showToast(json.message || 'Gagal mengirimkan saldo reward.', 'error');
    }
  } catch (err) {
    showToast('Terjadi kesalahan koneksi: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = oldText;
  }
}

function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('userDropdownMenu');
  if (!dropdown) return;
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}


function openAccountSettingsModal() {
  window.location.href = '/profile';
}

function closeAccountSettingsModal() {
  const modal = document.getElementById('accountSettingsModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
}

function switchSettingsTab(tab) {
  const btnProf = document.getElementById('settTabBtnProfile');
  const btnEmail = document.getElementById('settTabBtnEmail');
  const btnPass = document.getElementById('settTabBtnPassword');

  const fProf = document.getElementById('formSettProfile');
  const fEmail = document.getElementById('formSettEmail');
  const fPass = document.getElementById('formSettPassword');

  if (btnProf) btnProf.classList.toggle('act', tab === 'profile');
  if (btnEmail) btnEmail.classList.toggle('act', tab === 'email');
  if (btnPass) btnPass.classList.toggle('act', tab === 'password');

  if (fProf) fProf.style.display = tab === 'profile' ? 'block' : 'none';
  if (fEmail) fEmail.style.display = tab === 'email' ? 'block' : 'none';
  if (fPass) fPass.style.display = tab === 'password' ? 'block' : 'none';
}

/* CATEGORY BAR AUTO-SCROLL (JALAN OTOMATIS) */
let catAutoScrollTimer = null;
let catIsPaused = false;
let catResumeTimeout = null;

function pauseCategoryAutoScroll(ms = 4500) {
  catIsPaused = true;
  if (catResumeTimeout) clearTimeout(catResumeTimeout);
  catResumeTimeout = setTimeout(() => {
    catIsPaused = false;
  }, ms);
}

function initCategoryAutoScroll() {
  const menu = document.getElementById('category-menu');
  if (!menu) return;

  if (catAutoScrollTimer) { clearInterval(catAutoScrollTimer); catAutoScrollTimer = null; }
  if (catResumeTimeout) { clearTimeout(catResumeTimeout); catResumeTimeout = null; }

  // On touch devices (such as Telegram in-app browser & mobile phones), users naturally swipe horizontally with momentum.
  // Running a continuous 40ms interval causes forced reflow and frame drops during touch scrolling.
  const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
  if (isTouchDevice) return;

  const onUserInteraction = () => pauseCategoryAutoScroll(5000);

  menu.addEventListener('wheel', onUserInteraction, { passive: true });
  menu.addEventListener('mousedown', onUserInteraction);
  menu.addEventListener('mouseenter', () => { catIsPaused = true; });
  menu.addEventListener('mouseleave', () => pauseCategoryAutoScroll(2000));

  catAutoScrollTimer = setInterval(() => {
    if (catIsPaused || !menu) return;
    const maxScroll = menu.scrollWidth - menu.clientWidth;
    if (maxScroll <= 8) return; // not overflowing

    if (menu.scrollLeft >= maxScroll - 2) {
      catIsPaused = true;
      setTimeout(() => {
        if (!menu) return;
        menu.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => { catIsPaused = false; }, 2000);
      }, 1500);
    } else {
      menu.scrollLeft += 1;
    }
  }, 40);
}

/* AVATAR UPLOAD VIA ACCOUNT SETTINGS MODAL */
async function handleSettingsAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    return showToast('Pilih file gambar valid (JPG, PNG, WebP)', 'warn');
  }

  showToast('Memproses & mengunggah foto...', 'info');

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = async function() {
      try {
        const canvas = document.createElement('canvas');
        const targetDim = 400;
        const sDim = Math.min(img.width, img.height);
        const sx = (img.width - sDim) / 2;
        const sy = (img.height - sDim) / 2;
        canvas.width = Math.min(sDim, targetDim);
        canvas.height = canvas.width;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sDim, sDim, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        const res = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: _authToken, avatar: compressedBase64 })
        });
        const data = await res.json();
        if (data.status && data.user) {
          _currentUser = { ..._currentUser, ...data.user };
          localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
          renderLoggedInUI(_currentUser);
          showToast('Foto profil berhasil diubah & disimpan!', 'success');
        } else {
          showToast(data.message || 'Gagal mengubah foto profil', 'warn');
        }
      } catch (err) {
        showToast('Koneksi bermasalah saat upload avatar', 'warn');
      }
    };
    img.onerror = function() {
      showToast('File gambar tidak dapat dibaca', 'warn');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const name = document.getElementById('settInputName')?.value.trim();
  const phone = document.getElementById('settInputPhone')?.value.trim();
  const btn = document.getElementById('btnSettProfileSubmit');

  if (!name) return showToast('Nama tidak boleh kosong');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...'; }

  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: _authToken, name, phone })
    });
    const data = await res.json();
    if (data.status) {
      _currentUser = { ..._currentUser, ...data.user };
      localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      renderLoggedInUI(_currentUser);
      showToast('Profil berhasil diperbarui!');
      closeAccountSettingsModal();
    } else {
      showToast(data.message || 'Gagal memperbarui profil');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Profil'; }
  }
}

async function handleUpdateEmail(e) {
  e.preventDefault();
  const newEmail = document.getElementById('settInputNewEmail')?.value.trim();
  const password = document.getElementById('settInputEmailPassword')?.value;
  const btn = document.getElementById('btnSettEmailSubmit');

  if (!newEmail || !newEmail.includes('@')) return showToast('Masukkan alamat email yang valid');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...'; }

  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: _authToken, newEmail, currentPassword: password })
    });
    const data = await res.json();
    if (data.status) {
      _currentUser = { ..._currentUser, ...data.user };
      localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      renderLoggedInUI(_currentUser);
      showToast('Alamat email berhasil diganti!');
      document.getElementById('settInputNewEmail').value = '';
      document.getElementById('settInputEmailPassword').value = '';
      closeAccountSettingsModal();
    } else {
      showToast(data.message || 'Gagal mengubah email');
    }
  } catch (err) {
    showToast('Terjadi kesalahan koneksi');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-envelope-circle-check"></i> Perbarui Email'; }
  }
}

async function handleUpdatePassword(e) {
  e.preventDefault();
  const oldPass = document.getElementById('settInputOldPass')?.value;
  const newPass = document.getElementById('settInputNewPass')?.value;
  const confirmPass = document.getElementById('settInputConfirmPass')?.value;
  const btn = document.getElementById('btnSettPassSubmit');

  if (!newPass || newPass.length < 6) return showToast('Password baru minimal 6 karakter');
  if (newPass !== confirmPass) return showToast('Konfirmasi password tidak cocok');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...'; }

  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: _authToken, currentPassword: oldPass, newPassword: newPass })
    });
    const data = await res.json();
    if (data.status) {
      showToast('Password baru berhasil disimpan!');
      document.getElementById('settInputOldPass').value = '';
      document.getElementById('settInputNewPass').value = '';
      document.getElementById('settInputConfirmPass').value = '';
      closeAccountSettingsModal();
    } else {
      showToast(data.message || 'Gagal mengubah password');
    }
  } catch (err) {
    showToast('Terjadi kesalahan');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-lock"></i> Perbarui Password'; }
  }
}

function openAuthModal(tab = 'login') {
  const refCode = localStorage.getItem('zyro_ref_code') || localStorage.getItem('zyro_bansos_ref') || '';
  const currentParams = new URLSearchParams(window.location.search);
  const redirect = currentParams.get('redirect') || (window.location.pathname !== '/' ? window.location.pathname : '');
  
  const q = [];
  if (refCode) q.push('ref=' + encodeURIComponent(refCode));
  if (redirect) q.push('redirect=' + encodeURIComponent(redirect));
  const queryString = q.length ? '?' + q.join('&') : '';

  window.location.href = (tab === 'register' ? '/register' : '/login') + queryString;
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const btnLogin = document.getElementById('tab-login-btn');
  const btnReg = document.getElementById('tab-register-btn');
  const formLogin = document.getElementById('formAuthLogin');
  const formReg = document.getElementById('formAuthRegister');
  const title = document.getElementById('authModalHeadTitle');
  const sub = document.getElementById('authModalHeadSub');

  if (tab === 'login') {
    if (btnLogin) btnLogin.classList.add('act');
    if (btnReg) btnReg.classList.remove('act');
    if (formLogin) formLogin.style.display = 'block';
    if (formReg) formReg.style.display = 'none';
    if (title) title.innerText = 'Masuk ke Akun';
    if (sub) sub.innerText = 'Dapatkan potongan otomatis 5% setiap transaksi';
  } else {
    if (btnReg) btnReg.classList.add('act');
    if (btnLogin) btnLogin.classList.remove('act');
    if (formLogin) formLogin.style.display = 'none';
    if (formReg) formReg.style.display = 'block';
    if (title) title.innerText = 'Daftar Akun Baru';
    if (sub) sub.innerText = 'Daftar gratis & nikmati diskon member 5%';
  }
}

async function handleUserLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const btn = document.getElementById('btnLoginSubmit');
  const oldText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Masuk...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = oldText;

    if (data.status && data.token && data.user) {
      _authToken = data.token;
      _currentUser = data.user;
      localStorage.setItem('seika_user_token', _authToken);
      localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      renderLoggedInUI(_currentUser);
      closeAuthModal();
      showToast(`Selamat datang kembali, ${_currentUser.name}! Diskon 5% aktif.`, 'success');
    } else {
      showToast(data.message || 'Login gagal, periksa email & password.', 'warn');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = oldText;
    showToast('Terjadi kesalahan jaringan: ' + err.message, 'warn');
  }
}

async function handleUserRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPass').value;
  const btn = document.getElementById('btnRegisterSubmit');
  const oldText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendaftarkan...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, refCode: (localStorage.getItem('zyro_ref_code') || localStorage.getItem('zyro_bansos_ref') || '') })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = oldText;

    if (data.status && data.token && data.user) {
      _authToken = data.token;
      _currentUser = data.user;
      localStorage.setItem('seika_user_token', _authToken);
      localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      renderLoggedInUI(_currentUser);
      closeAuthModal();
      showToast(`Pendaftaran berhasil! Selamat datang ${_currentUser.name}. Diskon 5% aktif!`, 'success');
    } else {
      showToast(data.message || 'Pendaftaran gagal.', 'warn');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = oldText;
    showToast('Terjadi kesalahan jaringan: ' + err.message, 'warn');
  }
}

async function triggerGoogleSignIn() {
  if (_googleClientId && window.google && window.google.accounts && window.google.accounts.id) {
    try {
      google.accounts.id.prompt();
      return;
    } catch (e) {
      console.warn('GIS prompt error:', e);
    }
  }

  // If Google Client ID hasn't been set in Admin Settings
  showToast('Google Client ID belum dipasang oleh Admin. Silakan gunakan form Email & Password di bawah.', 'warn');
}

window.handleGoogleCredentialResponse = async function(response) {
  if (!response || !response.credential) return;
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential, refCode: (localStorage.getItem('zyro_ref_code') || localStorage.getItem('zyro_bansos_ref') || '') })
    });
    const data = await res.json();
    if (data.status && data.token && data.user) {
      _authToken = data.token;
      _currentUser = data.user;
      localStorage.setItem('seika_user_token', _authToken);
      localStorage.setItem('seika_user_data', JSON.stringify(_currentUser));
      renderLoggedInUI(_currentUser);
      closeAuthModal();
      showToast(`Login Google berhasil! Selamat datang, ${_currentUser.name}.`, 'success');
    }
  } catch (err) {
    console.warn('[Google Auth Error]:', err);
  }
};

function userLogout(showNotice = true) {
  _authToken = null;
  _currentUser = null;
  localStorage.removeItem('seika_user_token');
  localStorage.removeItem('user_token');
  sessionStorage.removeItem('seika_user_token');
  sessionStorage.removeItem('user_token');
  localStorage.removeItem('seika_user_data');
  renderLoggedOutUI();
  if (showNotice) showToast('Anda telah berhasil keluar dari akun.', 'info');
}

// ================= RIWAYAT PESANAN, PANEL SAYA & ADD-ON =================
let _activeOrderTab = 'all'; // 'all' or 'panel'
let _cachedOrdersList = [];

async function openUserOrdersModal(tab = 'all') {
  const modal = document.getElementById('userOrdersModal');
  if (!modal) return;
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';

  _activeOrderTab = tab;
  updateOrderModalTabUI();

  const prompt = document.getElementById('guestOrderPrompt');
  const input = document.getElementById('orderSearchInput');

  // If user is logged in
  if (_authToken && _currentUser) {
    if (prompt) prompt.style.display = 'none';
    if (input) input.placeholder = `Akun aktif: ${_currentUser.email} (atau cari Order ID)`;
    await fetchOrdersForUser();
  } else {
    // Guest user (Belum login)
    if (prompt) prompt.style.display = 'block';

    const savedEmail = localStorage.getItem('zyro_buyer_email') || '';
    if (savedEmail && input && !input.value) {
      input.value = savedEmail;
    }

    if (savedEmail) {
      await fetchOrdersByQuery(savedEmail);
    } else {
      const container = document.getElementById('userOrdersList');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:36px 16px;">
            <i class="fa-solid fa-receipt" style="font-size:2.8rem;color:var(--a);opacity:0.4;margin-bottom:12px;display:block;"></i>
            <h4 style="font-weight:800;color:var(--t1);margin-bottom:6px;">Lacak Pesanan Anda</h4>
            <p style="font-size:0.8rem;color:var(--t3);max-width:380px;margin:0 auto 16px;line-height:1.4;">
              Masukkan alamat email atau Order ID pembelian Anda pada kolom pencarian di atas untuk melihat riwayat belanja & panel Anda.
            </p>
          </div>
        `;
      }
    }
  }
}

function openMyPanelsModal() {
  openUserOrdersModal('panel');
}

function switchOrderModalTab(tab) {
  _activeOrderTab = tab;
  updateOrderModalTabUI();
  renderOrdersListUI();
}

function updateOrderModalTabUI() {
  const btnAll = document.getElementById('tabBtnAllOrders');
  const btnPanel = document.getElementById('tabBtnMyPanels');
  const title = document.getElementById('ordersModalTitle');
  const sub = document.getElementById('userOrdersSub');

  if (_activeOrderTab === 'panel') {
    if (btnPanel) btnPanel.classList.add('act');
    if (btnAll) btnAll.classList.remove('act');
    if (title) title.innerHTML = '<i class="fa-solid fa-server" style="color:#10b981;"></i> Panel Pterodactyl Saya';
    if (sub) sub.innerText = 'Daftar server & panel aktif Anda beserta kredensial login';
  } else {
    if (btnAll) btnAll.classList.add('act');
    if (btnPanel) btnPanel.classList.remove('act');
    if (title) title.innerHTML = '<i class="fa-solid fa-receipt" style="color:var(--a);"></i> Riwayat Pesanan';
    if (sub) sub.innerText = 'Daftar semua transaksi Anda (Member maupun Guest / Tanpa Login)';
  }
}

async function executeOrderSearch() {
  const input = document.getElementById('orderSearchInput');
  const query = (input?.value || '').trim();
  if (!query) {
    showToast('Masukkan email atau Order ID untuk mencari pesanan.', 'warn');
    return;
  }
  await fetchOrdersByQuery(query);
}

async function fetchOrdersForUser() {
  const container = document.getElementById('userOrdersList');
  if (container) container.innerHTML = '<div style="padding:30px;text-align:center;color:var(--t3);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat pesanan akun Anda...</div>';

  try {
    const res = await fetch(`/api/user/orders?token=${encodeURIComponent(_authToken)}`);
    const data = await res.json();
    if (data.status && Array.isArray(data.orders)) {
      _cachedOrdersList = data.orders;
    } else {
      _cachedOrdersList = [];
    }
    renderOrdersListUI();
  } catch (err) {
    if (container) container.innerHTML = '<div style="color:var(--rose);padding:20px;text-align:center;">Gagal memuat pesanan: ' + err.message + '</div>';
  }
}

async function fetchOrdersByQuery(query) {
  const container = document.getElementById('userOrdersList');
  if (container) container.innerHTML = '<div style="padding:30px;text-align:center;color:var(--t3);"><i class="fa-solid fa-spinner fa-spin"></i> Mencari pesanan...</div>';

  try {
    const res = await fetch(`/api/order/track?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.status) {
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        _cachedOrdersList = data.orders;
      } else if (data.order) {
        _cachedOrdersList = [data.order];
      } else {
        _cachedOrdersList = [];
      }
    } else {
      _cachedOrdersList = [];
    }
    renderOrdersListUI();
  } catch (err) {
    _cachedOrdersList = [];
    renderOrdersListUI();
  }
}

function isPanelOrder(o) {
  if (!o) return false;
  const st = String(o.status || '').toLowerCase();
  if (st === 'cancelled' || st === 'expired' || st === 'failed') return false;
  if (o.orderType === 'addon' || String(o.productId || '').toLowerCase().includes('addon')) return false;

  const cat = String(o.category || '').toLowerCase();
  const name = String(o.productName || o.nama || '').toLowerCase();
  const id = String(o.productId || o.id || '').toLowerCase();

  if (cat.includes('account') || cat.includes('premku') || cat.includes('otp') ||
      cat.includes('vps') || cat.includes('cloud') || cat.includes('role') ||
      cat.includes('bot') || cat.includes('domain') || cat.includes('jasa')) {
    return false;
  }
  if (name.includes('canva') || name.includes('netflix') || name.includes('spotify') ||
      name.includes('youtube') || name.includes('role') || name.includes('otp') ||
      name.includes('vps') || name.includes('cloud') || name.includes('diamond')) {
    return false;
  }

  return cat.includes('panel') || name.includes('panel') || id.includes('ptero') || id.includes('panel');
}

function renderOrdersListUI() {
  const container = document.getElementById('userOrdersList');
  if (!container) return;

  let list = _cachedOrdersList || [];

  if (_activeOrderTab === 'panel') {
    list = list.filter(isPanelOrder);
  }

  if (list.length === 0) {
    if (_activeOrderTab === 'panel') {
      container.innerHTML = `
        <div style="text-align:center;padding:36px 16px;">
          <i class="fa-solid fa-server" style="font-size:2.8rem;color:#10b981;opacity:0.35;margin-bottom:12px;display:block;"></i>
          <h4 style="font-weight:800;color:var(--t1);margin-bottom:6px;">Belum Ada Panel Pterodactyl</h4>
          <p style="font-size:0.8rem;color:var(--t3);margin-bottom:18px;">Anda belum memiliki server panel aktif. Dapatkan Panel Legal High Performance dengan garansi 30 hari sekarang!</p>
          <button class="btn-order" onclick="closeUserOrdersModal(); scrollToPanelCatalog();" style="max-width:240px;margin:0 auto;">
            <i class="fa-solid fa-cart-shopping"></i> Beli Panel Sekarang
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="text-align:center;padding:36px 16px;">
          <i class="fa-solid fa-box-open" style="font-size:2.8rem;color:var(--a);opacity:0.35;margin-bottom:12px;display:block;"></i>
          <h4 style="font-weight:800;color:var(--t1);margin-bottom:6px;">Tidak Ada Pesanan Ditemukan</h4>
          <p style="font-size:0.8rem;color:var(--t3);margin-bottom:18px;">Periksa kembali email atau Order ID Anda, atau mulai belanja produk digital terbaik di SeikaOne.</p>
          <button class="btn-order" onclick="closeUserOrdersModal()" style="max-width:200px;margin:0 auto;">
            Mulai Belanja
          </button>
        </div>
      `;
    }
    return;
  }

  let html = '';
  list.forEach(o => {
    if (_activeOrderTab === 'panel') {
      html += renderSinglePanelCard(o);
    } else {
      html += renderSingleOrderCard(o);
    }
  });

  container.innerHTML = html;
}

function renderSinglePanelCard(o) {
  const isDone = o.status === 'completed' || o.status === 'paid';
  const badgeClass = isDone ? 'ws-approved' : (o.status === 'pending' ? 'ws-pending' : 'ws-rejected');
  const statusLabel = isDone ? 'Aktif / Siap Pakai' : (o.status === 'pending' ? 'Menunggu Pembayaran' : 'Dibatalkan');

  let addonSummary = '';
  if (o.addons && (o.addons.ramGb || o.addons.diskGb || o.addons.cpuPercent)) {
    const parts = [];
    if (o.addons.ramGb) parts.push(`+${o.addons.ramGb}GB RAM`);
    if (o.addons.diskGb) parts.push(`+${o.addons.diskGb}GB Disk`);
    if (o.addons.cpuPercent) parts.push(`+${o.addons.cpuPercent}% CPU`);
    addonSummary = parts.join(', ');
  }

  let panelUrl = 'https://panel.zyrodevv.my.id';
  if (o.accountDetails) {
    const urlMatch = o.accountDetails.match(/https?:\/\/[^\s\n\r]+/);
    if (urlMatch) panelUrl = urlMatch[0];
  }

  return `
    <div class="warr-ticket-card" style="margin-bottom:14px; border: 1.5px solid rgba(16,185,129,0.3); background: var(--surface);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:34px;height:34px;border-radius:10px;background:rgba(16,185,129,0.15);color:#10b981;display:flex;align-items:center;justify-content:center;font-size:1rem;">
            <i class="fa-solid fa-server"></i>
          </div>
          <div>
            <b style="font-size:0.86rem;color:var(--t1);display:block;">${escapeHtml(o.productName || 'Panel Server')}</b>
            <span style="font-size:0.7rem;color:var(--t3);">${escapeHtml(o.category || 'Panel Pterodactyl')} • Order: <span style="font-family:'JetBrains Mono',monospace;color:var(--a);">${escapeHtml(o.orderId)}</span></span>
          </div>
        </div>
        <span class="warr-status-badge ${badgeClass}">${statusLabel}</span>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
        <span style="font-size:0.72rem;background:var(--bg2);border:1px solid var(--b1);padding:3px 8px;border-radius:6px;color:var(--t2);">
          <i class="fa-solid fa-egg" style="color:var(--a);"></i> Egg: <b>${escapeHtml(o.runtime || 'NodeJS')}</b>
        </span>
        ${o.serverUser ? `
          <span style="font-size:0.72rem;background:var(--bg2);border:1px solid var(--b1);padding:3px 8px;border-radius:6px;color:var(--t2);">
            <i class="fa-solid fa-user" style="color:#0ea5e9;"></i> User: <b>${escapeHtml(o.serverUser)}</b>
          </span>
        ` : ''}
        ${addonSummary ? `
          <span style="font-size:0.72rem;background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);padding:3px 8px;border-radius:6px;color:#0ea5e9;font-weight:700;">
            <i class="fa-solid fa-microchip"></i> Add-on: ${escapeHtml(addonSummary)}
          </span>
        ` : ''}
      </div>

      ${o.accountDetails ? `
        <div style="background:var(--bg2);border:1px dashed var(--b1);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:0.74rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <b style="color:var(--t1);font-size:0.72rem;"><i class="fa-solid fa-key" style="color:#fbbf24;"></i> Kredensial Login Panel:</b>
            <button type="button" class="btn-act btn-edit" style="margin:0;padding:2px 8px;font-size:0.68rem;" onclick="copyTextToClipboard('${encodeURIComponent(o.accountDetails).replace(/'/g, "\\'")}', 'Kredensial panel berhasil disalin!')">
              <i class="fa-solid fa-copy"></i> Salin
            </button>
          </div>
          <pre style="white-space:pre-wrap;font-family:'JetBrains Mono',monospace;color:var(--t2);margin:0;font-size:0.73rem;line-height:1.45;">${escapeHtml(o.accountDetails)}</pre>
        </div>
      ` : ''}

      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--b1);flex-wrap:wrap;gap:8px;">
        <div>
          <span style="font-size:0.68rem;color:var(--t3);display:block;">Kode Garansi:</span>
          <b style="font-size:0.78rem;color:var(--a);font-family:'JetBrains Mono',monospace;">${escapeHtml(o.warrantyCode || '-')}</b>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <a href="${panelUrl}" target="_blank" rel="noopener" class="btn-act btn-save" style="margin:0;text-decoration:none;background:#10b981;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Panel
          </a>
          ${o.warrantyCode ? `
            <button class="btn-act btn-edit" style="margin:0;" onclick="closeUserOrdersModal(); openWarrantyModal('${escapeHtml(o.warrantyCode)}')">
              <i class="fa-solid fa-shield-halved"></i> Klaim Garansi
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderSingleOrderCard(o) {
  let badgeClass = 'ws-pending';
  let statusLabel = 'Menunggu Pembayaran';
  if (o.status === 'completed' || o.status === 'paid') {
    badgeClass = 'ws-approved';
    statusLabel = 'Selesai / Lunas';
  } else if (o.status === 'expired' || o.status === 'cancelled') {
    badgeClass = 'ws-rejected';
    statusLabel = 'Dibatalkan';
  }

  const isPanel = isPanelOrder(o);

  return `
    <div class="warr-ticket-card" style="margin-bottom:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <div>
          <b style="font-family:'JetBrains Mono',monospace;color:var(--a);font-size:0.92rem;">${escapeHtml(o.orderId)}</b>
          <span style="font-size:0.7rem;color:var(--t3);display:block;">${escapeHtml(o.createdAt || '')}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${isPanel ? '<span style="font-size:0.65rem;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 6px;border-radius:4px;font-weight:800;">PANEL</span>' : ''}
          <span class="warr-status-badge ${badgeClass}">${statusLabel}</span>
        </div>
      </div>

      <div style="font-size:0.82rem;font-weight:700;color:var(--t1);margin-bottom:4px;">
        ${escapeHtml(o.productName || 'Produk Digital')}
      </div>
      <div style="font-size:0.72rem;color:var(--t3);margin-bottom:8px;">
        Kategori: ${escapeHtml(o.category || '-')} ${o.memberDiscount ? '<span style="color:#22c55e;font-weight:800;">(Diskon 5% -Rp ' + Number(o.memberDiscount).toLocaleString('id-ID') + ')</span>' : ''}
      </div>

      ${o.accountDetails ? `
        <div style="background:var(--bg2);border:1px dashed var(--b1);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:0.73rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <b style="color:var(--t1);font-size:0.72rem;"><i class="fa-solid fa-key" style="color:#fbbf24;"></i> Detail Akun / Layanan:</b>
            <div style="display:flex;gap:4px;align-items:center;">
              ${o.accountDetails.includes('.zip') ? `
                <a href="${o.accountDetails.match(/https?:\/\/[^\s\n\r]+\.zip/)?.[0] || '#'}" target="_blank" download class="btn-act" style="margin:0;padding:2px 8px;font-size:0.68rem;background:#10b981;color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                  <i class="fa-solid fa-cloud-arrow-down"></i> Unduh ZIP
                </a>
              ` : ''}
              ${(o.licenseKey || o.accountDetails.includes('License Key:')) ? `
                <button type="button" class="btn-act" style="margin:0;padding:2px 8px;font-size:0.68rem;background:#0ea5e9;color:#fff;border:none;border-radius:4px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;" onclick="copyTextToClipboard('${(o.licenseKey || o.accountDetails.match(/License Key:\s*([^\s\n\r]+)/)?.[1] || '').replace(/'/g, "\\'")}', 'License Key berhasil disalin!')">
                  <i class="fa-solid fa-key"></i> Salin Lisensi
                </button>
              ` : ''}
              <button type="button" class="btn-act btn-edit" style="margin:0;padding:2px 8px;font-size:0.68rem;" onclick="copyTextToClipboard('${encodeURIComponent(o.accountDetails).replace(/'/g, "\\'")}', 'Detail akun berhasil disalin!')">
                <i class="fa-solid fa-copy"></i> Salin
              </button>
            </div>
          </div>
          <pre style="white-space:pre-wrap;font-family:'JetBrains Mono',monospace;color:var(--t2);margin:0;font-size:0.72rem;line-height:1.4;">${escapeHtml(o.accountDetails)}</pre>
        </div>
      ` : ''}

      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--b1);flex-wrap:wrap;gap:8px;">
        <div>
          <span style="font-size:0.68rem;color:var(--t3);display:block;">Total Bayar:</span>
          <b style="font-size:0.95rem;color:#22c55e;font-family:'JetBrains Mono',monospace;">Rp ${Number(o.totalPayment || o.amount || 0).toLocaleString('id-ID')}</b>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${o.warrantyCode ? `
            <button class="btn-act btn-edit" style="margin:0;" onclick="closeUserOrdersModal(); openWarrantyModal('${escapeHtml(o.warrantyCode)}')">
              <i class="fa-solid fa-shield-halved"></i> Klaim Garansi
            </button>
          ` : ''}
          <a href="/cek-pesanan" class="btn-act btn-save" style="margin:0;text-decoration:none;">
            <i class="fa-solid fa-receipt"></i> Cek Bukti
          </a>
        </div>
      </div>
    </div>
  `;
}

function closeUserOrdersModal() {
  const modal = document.getElementById('userOrdersModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
}

function openAddonInfoModal() {
  const modal = document.getElementById('addonInfoModal');
  if (!modal) return;
  modal.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeAddonInfoModal() {
  const modal = document.getElementById('addonInfoModal');
  if (modal) modal.classList.remove('on');
  document.body.style.overflow = '';
}

function scrollToPanelCatalog() {
  const catMenu = document.getElementById('category-menu');
  if (catMenu) {
    const btn = Array.from(catMenu.querySelectorAll('.cat-btn')).find(b => b.innerText.toLowerCase().includes('panel legal publik'));
    if (btn) btn.click();
    catMenu.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function copyTextToClipboard(text, msg = 'Berhasil disalin!') {
  if (!text) return;
  try {
    const decoded = decodeURIComponent(text);
    navigator.clipboard.writeText(decoded).then(() => {
      showToast(msg, 'success');
    }).catch(() => {
      showToast('Gagal menyalin teks.', 'warn');
    });
  } catch (e) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg, 'success');
    }).catch(() => {
      showToast('Gagal menyalin teks.', 'warn');
    });
  }
}


// Auto-open settings or login from URL query param
window.addEventListener('DOMContentLoaded', () => {
  try {
    const urlRef = new URLSearchParams(window.location.search).get('ref');
    if (urlRef) {
      localStorage.setItem('zyro_ref_code', urlRef.trim().toUpperCase());
      localStorage.setItem('zyro_bansos_ref', urlRef.trim().toUpperCase());
    }
  } catch(e) {}
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('settings') === '1' || sp.get('profile') === '1') {
      window.location.href = '/profile';
    } else if (sp.get('login') === '1') {
      window.location.href = '/login';
    } else if (sp.get('register') === '1') {
      window.location.href = '/register';
    } else if (sp.get('chat') === '1' || sp.get('open_chat') === '1') {
      setTimeout(() => {
        if (typeof toggleChatWidget === 'function') toggleChatWidget();
      }, 350);
    }
  } catch (e) {}
});

// Dynamic Store Settings Sync (Telegram, Channel, Contacts, Brand)
async function syncStoreSettings() {
  try {
    const res = await fetch('/api/store/info');
    const json = await res.json();
    if (json.status && json.data) {
      const s = json.data;
      if (s.telegramChannel) {
        document.querySelectorAll('a[href*="LeozyChannel"], a[href*="SeikaOneOfficial"], .store-telegram-channel, #sbTelegramChannel').forEach(a => {
          a.href = s.telegramChannel;
        });
      }
      if (s.telegram) {
        document.querySelectorAll('.store-telegram-cs, #sbTelegramCs').forEach(a => {
          a.href = s.telegram;
        });
      }
      if (s.totalUsers) {
        updateUserCountDisplay(s.totalUsers, false);
      }
    }
  } catch (e) {
    console.debug('[Settings Sync Error]:', e.message);
  }
}

// Realtime User Counter Engine (SSE + Auto-polling fallback)
function initRealtimeUserCounter() {
  fetch('/api/realtime/stats')
    .then(r => r.json())
    .then(d => {
      if (d && d.totalUsers) updateUserCountDisplay(d.totalUsers, false);
    })
    .catch(() => {});

  if (typeof EventSource !== 'undefined') {
    let es = null;
    let reconnectTimer = null;

    function connectSSE() {
      try {
        if (es) { es.close(); es = null; }
        es = new EventSource('/api/realtime/stream');
        es.onmessage = function(e) {
          try {
            const data = JSON.parse(e.data);
            if (data && data.totalUsers) {
              updateUserCountDisplay(data.totalUsers, false);
            }
          } catch (_) {}
        };
        es.onerror = function() {
          if (es) { es.close(); es = null; }
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connectSSE, 10000);
        };
      } catch (_) {}
    }
    connectSSE();
  }

  // Periodic polling fallback every 15 seconds
  setInterval(async () => {
    try {
      const res = await fetch('/api/realtime/stats');
      const data = await res.json();
      if (data && data.totalUsers) {
        updateUserCountDisplay(data.totalUsers, false);
      }
    } catch (_) {}
  }, 15000);
}

function initAppBootstrap() {
  bootShop();
  syncStoreSettings();
  initRealtimeUserCounter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppBootstrap);
} else {
  initAppBootstrap();
}
