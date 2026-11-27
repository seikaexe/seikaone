/**
 * SEIKAONE.ID — OFFICIAL HOMEPAGE & LANDING SCRIPT v4.0
 * Pure Native JS, Zero Leaks, Realtime Telemetry, Theme Sync & Mobile Shell
 */

(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Number(n || 0).toLocaleString('id-ID'); };
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };

  // ==========================================
  // 1. DISMISS ENTRANCE PRELOADER (750ms minimum, Zero Blocking)
  // ==========================================
  var pageStart = window.__PAGE_START__ || Date.now();
  var loaderDismissed = false;

  function dismissPreloader(immediate) {
    if (loaderDismissed) return;
    var preloader = $('preloader');
    if (!preloader) { loaderDismissed = true; return; }

    var elapsed = Date.now() - pageStart;
    var wait = immediate ? 0 : Math.max(0, 750 - elapsed);

    setTimeout(function () {
      if (loaderDismissed) return;
      loaderDismissed = true;
      preloader.classList.add('fade-out');
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      setTimeout(function () {
        preloader.style.visibility = 'hidden';
        preloader.style.display = 'none';
      }, 380);
    }, wait);
  }

  if (document.readyState === 'complete') {
    dismissPreloader(false);
  } else {
    window.addEventListener('load', function () { dismissPreloader(false); });
  }
  // Safety timeout: Never keep preloader blocking clicks longer than 1.4s
  setTimeout(function () { dismissPreloader(true); }, 1400);

  // ==========================================
  // 2. SIDEBAR DRAWER NAVIGATION
  // ==========================================
  window.toggleSidebar = function (forceState) {
    var sb = $('sidebar');
    var ov = $('sbOv');
    if (sb && ov) {
      var isOpen = forceState !== undefined ? forceState : !sb.classList.contains('on');
      sb.classList.toggle('on', isOpen);
      sb.classList.toggle('open', isOpen);
      ov.classList.toggle('on', isOpen);
      ov.classList.toggle('open', isOpen);
      document.body.classList.toggle('modal-open', isOpen);
    }
  };

  window.toggleSidebarCategory = function (groupId) {
    var group = $(groupId);
    if (!group) return;
    group.classList.toggle('collapsed');
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.toggleSidebar(false);
    }
  });

  // ==========================================
  // 3. THEME TOGGLE (SeikaOne Dual Theme Sync)
  // ==========================================
  window.toggleTheme = function () {
    var currentTheme = root.getAttribute('data-theme') || 'dark';
    var nextTheme = (currentTheme === 'dark' || currentTheme === 'classic') ? 'cream' : 'dark';

    localStorage.setItem('seika_theme_engine', nextTheme);
    localStorage.setItem('seika_theme', nextTheme);

    root.setAttribute('data-theme', nextTheme);
    var creamLink = $('themeEngineStylesheet');

    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('cream');
      root.style.backgroundColor = '#070e1b';
      root.style.colorScheme = 'dark';
      if (creamLink) creamLink.disabled = true;
    } else {
      root.classList.remove('dark');
      root.classList.add('cream');
      root.style.backgroundColor = '#FAF8F5';
      root.style.colorScheme = 'light';
      if (creamLink) creamLink.disabled = false;
    }
    if (typeof window.syncZyroLogos === 'function') window.syncZyroLogos();
  };

  window.toggleLandingTheme = window.toggleTheme;

  // ==========================================
  // 4. CS & SUPPORT WIDGET
  // ==========================================
  window.toggleChatWidget = function () {
    window.open('https://t.me/SeikaOne?text=Halo%20Admin%20SeikaOne,%20saya%20butuh%20bantuan', '_blank');
  };

  // ==========================================
  // 5. SCROLL READING PROGRESS & REVEAL
  // ==========================================
  var bar = $('lp-bar');
  if (bar) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var maxScroll = root.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0) + ')';
        tick = false;
      });
    }, { passive: true });
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 }) : null;

  document.querySelectorAll('.lp-reveal:not(.in)').forEach(function (el) {
    if (io) io.observe(el);
    else el.classList.add('in');
  });

  // ==========================================
  // 6. REALTIME STATS (Users, Orders, Uptime)
  // ==========================================
  var serverUptime = null;
  var uptimeBaseTime = Date.now();

  function renderUptime() {
    if (serverUptime == null) return;
    var totalSec = Math.floor(serverUptime + (Date.now() - uptimeBaseTime) / 1000);
    var d = Math.floor(totalSec / 86400);
    var h = Math.floor((totalSec % 86400) / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;

    var setEl = function (id, v) {
      var el = $(id);
      if (el) el.textContent = v;
    };

    setEl('lp-up-d', pad(d));
    setEl('lp-up-h', pad(h));
    setEl('lp-up-m', pad(m));
    setEl('lp-up-s', pad(s));
  }

  function fetchStats() {
    fetch('/api/stats', { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (res) {
        if (!res || !res.status) return;
        serverUptime = Number(res.uptime) || 120;
        uptimeBaseTime = Date.now();
        if ($('lp-users')) $('lp-users').textContent = fmt(res.total_users || 639);
        if ($('lp-trx')) $('lp-trx').textContent = fmt(res.total_transactions || 1200);
        if ($('lp-visitor')) $('lp-visitor').textContent = fmt(res.visitors || 1789);
      })
      .catch(function () {});
  }

  fetchStats();
  setInterval(function () {
    if (!document.hidden) renderUptime();
  }, 1000);

  // ==========================================
  // 7. HARDWARE TELEMETRY (Lag, CPU, RAM - Live Push Legal Publik)
  // ==========================================
  function setBar(id, val) {
    var el = $(id);
    if (!el) return;
    el.style.width = Math.max(2, Math.min(100, val)) + '%';
  }

  function fetchSysStats() {
    var t0 = performance.now();
    fetch('/api/sys-stats', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.status) return;
        var rtt = Math.round(performance.now() - t0);
        var ping = Math.max(12, Math.min(300, (Number(d.lag_ms) || 28) + Math.round(rtt * 0.2)));

        if ($('lp-sig-ms')) $('lp-sig-ms').textContent = ping + ' ms';
        if ($('lp-bars')) {
          var bars = $('lp-bars').children;
          var active = ping < 65 ? 5 : (ping < 130 ? 4 : (ping < 200 ? 3 : 2));
          for (var b = 0; b < bars.length; b++) {
            bars[b].className = b < active ? 'on' : '';
          }
        }
        if ($('lp-sig-t')) {
          $('lp-sig-t').textContent = ping < 75 ? 'Sangat Cepat' : (ping < 150 ? 'Cepat & Stabil' : 'Normal');
        }

        if ($('lp-cpu-v')) $('lp-cpu-v').textContent = (d.cpu || 15) + '%';
        setBar('lp-cpu-b', d.cpu || 15);
        if ($('lp-cpu-t') && d.cpu_label) $('lp-cpu-t').textContent = d.cpu_label;

        if ($('lp-ram-v')) $('lp-ram-v').textContent = (d.ram_pct || 48) + '%';
        setBar('lp-ram-b', d.ram_pct || 48);
        if ($('lp-ram-t')) {
          $('lp-ram-t').textContent = d.ram_label || ((d.ram_used_mb || 1024) + ' / ' + (d.ram_total_mb || 2048) + ' MB');
        }

        // Live Push sync to Uptime
        if (d.uptime && (serverUptime == null || Math.abs(serverUptime - d.uptime) > 5)) {
          serverUptime = Number(d.uptime);
          uptimeBaseTime = Date.now();
          renderUptime();
        }
      })
      .catch(function () {});
  }

  fetchSysStats();
  setInterval(function () {
    if (!document.hidden) fetchSysStats();
  }, 4000);

  // ==========================================
  // 8. REALTIME WIB CLOCK
  // ==========================================
  function updateServerClock() {
    var now = new Date();
    var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    var wib = new Date(utc + (3600000 * 7));

    var clockEl = $('lp-clock');
    if (clockEl) {
      clockEl.innerHTML = pad(wib.getHours()) + '<i>:</i>' + pad(wib.getMinutes()) + '<i>:</i>' + pad(wib.getSeconds());
    }

    var dateEl = $('lp-date');
    if (dateEl) {
      var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      dateEl.textContent = days[wib.getDay()] + ', ' + wib.getDate() + ' ' + months[wib.getMonth()] + ' ' + wib.getFullYear() + ' (WIB)';
    }
  }

  updateServerClock();
  setInterval(updateServerClock, 1000);

})();
