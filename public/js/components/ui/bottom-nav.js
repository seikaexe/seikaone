/**
 * SeikaOne Mobile Bottom Navigation Bar v4.2
 * Smart Adaptive Navigation:
 * - Instant tab bounce and non-blocking top progress bar.
 * - Adaptive lag detection: If destination loads fast (<180ms), zero splash overlay.
 * - If delayed / lagging (>180ms), displays luxury tech emblem animation.
 */
(function() {
  const NAV_META = {
    '/shop': { title: 'SEIKAONE', label: 'TOKO RESMI & PRODUK', icon: 'fa-solid fa-store', status: 'Membuka Katalog Produk...' },
    '/': { title: 'SEIKAONE', label: 'BERANDA UTAMA', icon: 'fa-solid fa-house', status: 'Membuka Beranda Utama...' },
    '/riwayat': { title: 'RIWAYAT PESANAN', label: 'STATUS & INVOICE', icon: 'fa-solid fa-receipt', status: 'Memuat Riwayat Pesanan...' },
    '/cpanel': { title: 'CPANEL SERVER', label: 'PTERODACTYL CLOUD', icon: 'fa-solid fa-server', status: 'Menghubungkan Node Server...' },
    '/bansos': { title: 'BANSOS PANEL FREE', label: 'SERVER 1GB GRATIS', icon: 'fa-solid fa-gift', status: 'Cek Ketersediaan Server Free...' },
    '/profile': { title: 'AKUN & PROFIL', label: 'PROFIL & SALDO', icon: 'fa-solid fa-user', status: 'Sinkronisasi Sesi Akun...' }
  };

  let _pendingSplashTimer = null;

  function ensureTopProgressBar() {
    let bar = document.getElementById('zyro-top-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'zyro-top-progress-bar';
      bar.setAttribute('aria-hidden', 'true');
      document.body.prepend(bar);
    }
    return bar;
  }

  function ensureNavSplash() {
    let splash = document.getElementById('zyro-nav-splash');
    if (!splash) {
      splash = document.createElement('div');
      splash.id = 'zyro-nav-splash';
      splash.className = 'zyro-intro-splash';
      splash.setAttribute('aria-hidden', 'true');
      splash.innerHTML = `
        <div class="zyro-intro-ambient"></div>
        <div class="zyro-intro-card">
          <div class="zyro-emblem-wrapper">
            <div class="zyro-orbit-ring zyro-orbit-outer"></div>
            <div class="zyro-orbit-ring zyro-orbit-inner"></div>
            <div class="zyro-emblem-box">
              <img src="assets/logo-static-dark.webp" width="91" height="74" alt="SeikaOne" class="zyro-emblem-img zyro-logo-static">
              <span class="zyro-emblem-glow"></span>
            </div>
          </div>
          <div class="zyro-intro-branding">
            <div class="zyro-intro-title" id="zyro-nav-splash-title">SEIKAONE</div>
            <div class="zyro-intro-tagline" id="zyro-nav-splash-tagline">
              <i id="zyro-nav-splash-icon" class="fa-solid fa-cloud"></i>
              <span id="zyro-nav-splash-label">MEMUAT HALAMAN...</span>
            </div>
          </div>
          <div class="zyro-intro-loader">
            <div class="zyro-loader-beam">
              <div class="zyro-loader-thumb"></div>
            </div>
            <div class="zyro-loader-status">
              <span class="zyro-status-dot"></span>
              <span class="zyro-status-text" id="zyro-nav-splash-status">Menghubungkan Server...</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(splash);
    }
    return splash;
  }

  function showNavSplash(meta) {
    const splash = ensureNavSplash();
    const titleEl = document.getElementById('zyro-nav-splash-title');
    const labelEl = document.getElementById('zyro-nav-splash-label');
    const iconEl = document.getElementById('zyro-nav-splash-icon');
    const statusEl = document.getElementById('zyro-nav-splash-status');

    if (titleEl && meta.title) titleEl.textContent = meta.title;
    if (labelEl && meta.label) labelEl.textContent = meta.label;
    if (iconEl && meta.icon) iconEl.className = meta.icon;
    if (statusEl && meta.status) statusEl.textContent = meta.status;

    splash.classList.remove('fade-out');
    splash.classList.add('active');
  }

  function hideNavSplash(smooth = true) {
    const splash = document.getElementById('zyro-nav-splash');
    if (!splash) return;

    if (smooth) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.classList.remove('active', 'fade-out');
      }, 240);
    } else {
      splash.classList.remove('active', 'fade-out');
    }
  }

  function cleanupTransitionArtifacts() {
    if (_pendingSplashTimer) {
      clearTimeout(_pendingSplashTimer);
      _pendingSplashTimer = null;
    }
    try {
      sessionStorage.removeItem('seika_nav_lagged');
      sessionStorage.removeItem('seika_nav_target');
      sessionStorage.removeItem('seika_nav_time');
    } catch (_) {}

    document.documentElement.classList.remove('zyro-nav-locked');
    document.body.classList.remove('zyro-page-leaving');
    hideNavSplash(false);
  }

  function mountZyroBottomNav() {
    // Check if previous navigation took long and triggered the lag splash
    try {
      const wasLagged = sessionStorage.getItem('seika_nav_lagged');
      sessionStorage.removeItem('seika_nav_lagged');
      sessionStorage.removeItem('seika_nav_target');
      sessionStorage.removeItem('seika_nav_time');

      if (wasLagged === '1') {
        const splash = ensureNavSplash();
        splash.classList.add('active');
        requestAnimationFrame(() => {
          hideNavSplash(true);
        });
      } else {
        cleanupTransitionArtifacts();
      }
    } catch (_) {
      cleanupTransitionArtifacts();
    }

    // Finish top progress bar if active from previous navigation
    const bar = ensureTopProgressBar();
    bar.classList.add('done');
    setTimeout(() => {
      bar.classList.remove('active', 'done');
    }, 280);

    const path = window.location.pathname.toLowerCase();
    const isLanding = path === '/' || path === '/landing' || path === '/landing.html' || path === '/beranda' ||
      Boolean(document.body && document.body.classList.contains('lp-body')) ||
      Boolean(document.querySelector('.lp-hero'));

    if (isLanding) {
      const existingNav = document.querySelector('.zyro-bottom-nav');
      if (existingNav) existingNav.remove();
      return;
    }

    let nav = document.querySelector('.zyro-bottom-nav');

    const isShop = path === '/shop' || path === '/shop/' || path === '/store' || path === '/catalog' || path === '/toko' || path === '/index.html' || path === '/index';
    const isTrx = path.includes('/riwayat') || path.includes('/orders') || path.includes('/cek-pesanan') || path.includes('/payment');
    const isCpanel = path.includes('/cpanel') || path.includes('/mypanel') || path.includes('/addon');
    const isBansos = path.includes('/bansos');
    const isAkun = path.includes('/profile') || path.includes('/account') || path.includes('/login') || path.includes('/register') || path.includes('/pengaturan');

    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'zyro-bottom-nav';
      nav.setAttribute('aria-label', 'Navigasi Cepat Mobile');
      nav.innerHTML = `
        <a href="/shop" draggable="false" class="zyro-bottom-nav-item ${isShop ? 'active' : ''}" title="Toko & Katalog">
          <i class="fa-solid fa-store"></i>
          <span>Toko</span>
        </a>
        <a href="/riwayat" draggable="false" class="zyro-bottom-nav-item ${isTrx ? 'active' : ''}" title="Riwayat Pesanan">
          <i class="fa-solid fa-receipt"></i>
          <span>Transaksi</span>
        </a>
        <a href="/cpanel" draggable="false" class="zyro-bottom-nav-item ${isCpanel ? 'active' : ''}" title="CPanel Server">
          <i class="fa-solid fa-server"></i>
          <span>CPanel</span>
        </a>
        <a href="/bansos" draggable="false" class="zyro-bottom-nav-item ${isBansos ? 'active' : ''}" title="Bansos Panel Free">
          <i class="fa-solid fa-gift"></i>
          <span>Bansos</span>
        </a>
        <a href="/profile" draggable="false" class="zyro-bottom-nav-item ${isAkun ? 'active' : ''}" title="Akun & Profil">
          <i class="fa-solid fa-user"></i>
          <span>Akun</span>
        </a>
      `;
      document.body.appendChild(nav);
    } else {
      const items = nav.querySelectorAll('.zyro-bottom-nav-item');
      if (items.length >= 5) {
        items[0].setAttribute('href', '/shop');
        items[0].setAttribute('title', 'Toko & Katalog');
        const icon0 = items[0].querySelector('i');
        if (icon0) icon0.className = 'fa-solid fa-store';
        const span0 = items[0].querySelector('span');
        if (span0) span0.textContent = 'Toko';

        items[0].classList.toggle('active', isShop);
        items[1].classList.toggle('active', isTrx);
        items[2].classList.toggle('active', isCpanel);
        items[3].classList.toggle('active', isBansos);
        items[4].classList.toggle('active', isAkun);
      }
    }

    if (nav.dataset.bound) return;
    nav.dataset.bound = 'true';

    nav.querySelectorAll('.zyro-bottom-nav-item').forEach(item => {
      const href = item.getAttribute('href');

      item.addEventListener('click', (e) => {
        if (window.getSelection) {
          try { window.getSelection().removeAllRanges(); } catch (_) {}
        }

        // If already on Shop, scroll smoothly to top
        const isCurrentShop = (window.location.pathname === '/shop' || window.location.pathname === '/shop/' || window.location.pathname === '/store' || window.location.pathname === '/catalog');
        if (href === '/shop' && isCurrentShop) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // If already on Home/Landing, scroll smoothly to top
        if (href === '/' && (window.location.pathname === '/' || window.location.pathname === '/landing' || window.location.pathname === '/beranda')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // If already on CPanel, return to create-panel if in subview, or toggle sidebar if already on main
        if (href === '/cpanel' && window.location.pathname.startsWith('/cpanel')) {
          const currentActive = document.querySelector('.cp-view.active');
          if (currentActive && currentActive.id !== 'view-create-panel' && typeof navigateTo === 'function') {
            e.preventDefault();
            navigateTo('create');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          } else if (typeof toggleCpanelSidebar === 'function') {
            e.preventDefault();
            toggleCpanelSidebar();
            return;
          }
        }

        // Tactile bounce feedback on the clicked tab
        nav.querySelectorAll('.zyro-bottom-nav-item').forEach(el => el.classList.remove('active', 'tab-tapped'));
        item.classList.add('active', 'tab-tapped');

        // Sleek non-blocking top progress bar
        const topBar = ensureTopProgressBar();
        topBar.classList.remove('done');
        topBar.classList.add('active');

        // Smart Adaptive Lag/Delay Splash:
        // Page navigation is smooth with the instant top progress bar.
        // Splash only activates as a fallback if network is severely delayed (>2500ms).
        if (_pendingSplashTimer) clearTimeout(_pendingSplashTimer);
        const meta = NAV_META[href] || { title: 'SEIKAONE', label: 'MEMUAT HALAMAN', icon: 'fa-solid fa-cloud', status: 'Menghubungkan ke server...' };

        _pendingSplashTimer = setTimeout(() => {
          try {
            sessionStorage.setItem('seika_nav_lagged', '1');
            sessionStorage.setItem('seika_nav_target', href);
            sessionStorage.setItem('seika_nav_time', String(Date.now()));
          } catch (_) {}
          showNavSplash(meta);
        }, 2500);
      });
    });

    // Auto-hide bottom nav whenever any modal/dialog/sheet/sidebar is opened (RAF debounced)
    let _modalCheckRaf = null;
    function checkModalState() {
      if (_modalCheckRaf) cancelAnimationFrame(_modalCheckRaf);
      _modalCheckRaf = requestAnimationFrame(() => {
        _modalCheckRaf = null;
        const anyModalOpen = Boolean(
          document.querySelector('.modal-ov.on, .modal-ov.active, .cp-modal-overlay.show, .role-sheet-backdrop.show, #img-lightbox.on, body.modal-open, .sidebar.on, .sb-ov.on, .cp-sidebar.open, .cp-sidebar-backdrop.show, #cs-panel.on, #notif-panel.on')
        );
        nav.classList.toggle('nav-hidden', anyModalOpen);
      });
    }

    try {
      const observer = new MutationObserver(checkModalState);
      observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
    } catch (_) {}
  }

  // Fallback: If page load was restored from BFCache (back/forward navigation)
  window.addEventListener('pageshow', () => {
    cleanupTransitionArtifacts();
    const bar = document.getElementById('zyro-top-progress-bar');
    if (bar) {
      bar.classList.add('done');
      setTimeout(() => bar.classList.remove('active', 'done'), 200);
    }
  });

  window.addEventListener('popstate', () => {
    cleanupTransitionArtifacts();
  });

  // Universal Animated Logo Theme Sync (Dark vs Light/Cream) with Play-Once Per Refresh/Menu
  let _logoAnimTimer = null;
  let _currentCycleId = Date.now();
  let _isAnimPhase = true;

  try {
    sessionStorage.removeItem('seika_logo_animated');
  } catch (_) {}

  function syncZyroLogos(restartAnimation = false) {
    try {
      const isDark = document.documentElement.classList.contains('dark') ||
                     (document.body && document.body.classList.contains('dark')) ||
                     document.documentElement.getAttribute('data-theme') === 'dark';

      if (restartAnimation) {
        _currentCycleId = Date.now();
        _isAnimPhase = true;
        if (_logoAnimTimer) clearTimeout(_logoAnimTimer);
        _logoAnimTimer = null;
      }

      // Static completed full logos (always for preloader, and for brand logos after intro)
      const staticSrc = isDark ? 'assets/logo-static-dark.webp' : 'assets/logo-static-light.webp';
      // Animated full logo with "ZYRODEVV STORE" text (plays drawing stroke once from frame 0)
      const animSrc   = (isDark ? 'assets/logo-animated-dark.webp' : 'assets/logo-animated-light.webp') + '?t=' + _currentCycleId;

      // 1. Entrance Preloader (#preloader & #zyro-nav-splash):
      // Kept solid & static from frame 0 like originally, so the 750ms preloader is never cut off mid-drawing!
      const preloaders = document.querySelectorAll(
        '#preloader .zyro-emblem-img, #zyro-nav-splash .zyro-emblem-img, .zyro-logo-static'
      );
      preloaders.forEach(img => {
        if (!img) return;
        if (img.getAttribute('src') !== staticSrc) {
          img.src = staticSrc;
        }
      });

      // 2. All Brand Logos on Web Pages (Topbar, Sidebar, Hero, Footers, Auth cards)
      // Contains the full logo with "ZYRODEVV STORE" text:
      // Plays drawing animation once on initial visit / refresh / menu open; then stays static!
      const targetSrc = _isAnimPhase ? animSrc : staticSrc;
      const brandLogos = document.querySelectorAll(
        '.tb-brand img, .cp-brand img, .sb-brand img, .hb-logo img, .ft-brand img, .lp-foot-brand img, .zyro-logo-animated:not(#preloader img):not(#zyro-nav-splash img)'
      );
      brandLogos.forEach(img => {
        if (!img || img.src.includes('avatar') || img.id === 'sbUserAvatar' || img.id === 'udAvatar') return;
        const cur = img.getAttribute('src') || '';
        if (cur.includes('logo') || cur.includes('emblem')) {
          if (cur !== targetSrc) img.src = targetSrc;
        }
      });

      // Transition smoothly to static logo after 5.5s so it stays still without infinite loop
      if (_isAnimPhase && !_logoAnimTimer) {
        _logoAnimTimer = setTimeout(() => {
          _isAnimPhase = false;
          _logoAnimTimer = null;
          brandLogos.forEach(img => {
            if (!img || img.src.includes('avatar') || img.id === 'sbUserAvatar' || img.id === 'udAvatar') return;
            const cur = img.getAttribute('src') || '';
            if (cur.includes('logo') || cur.includes('emblem')) {
              img.src = staticSrc;
            }
          });
        }, 5500);
      }
    } catch (_) {}
  }
  window.syncZyroLogos = syncZyroLogos;
  window.triggerZyroLogoAnimation = function() {
    syncZyroLogos(true);
  };

  // Re-trigger animation whenever user clicks drawer menu link or brand logo
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.sb-item, .cp-sb-item, .tb-brand a, .cp-brand a, .hb-logo a, [data-view], .cat-pill');
    if (link && typeof window.triggerZyroLogoAnimation === 'function') {
      window.triggerZyroLogoAnimation();
    }
  }, { passive: true });

  // Real-time MutationObserver for seamless zero-flicker theme changes
  try {
    const themeObserver = new MutationObserver(() => syncZyroLogos());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    if (document.body) {
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    }
  } catch (_) {}

  // Run immediately and on DOM events
  syncZyroLogos();
  window.addEventListener('DOMContentLoaded', syncZyroLogos);
  window.addEventListener('load', syncZyroLogos);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountZyroBottomNav);
  } else {
    mountZyroBottomNav();
  }
})();
