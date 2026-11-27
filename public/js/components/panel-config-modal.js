/**
 * SeikaOne.id - Dynamic Panel Configuration Modal & In-Place Checkout
 * Pure Vanilla JS, Zero External Bloat, Zero Emojis (FontAwesome Vector Icons).
 * Integrated 1-10GB Slider + Sekat Unlimited.
 */

(function () {
  'use strict';

  // Tier configuration metadata & official pricing tables
  const TIER_SPECS = {
    legal_public: {
      key: 'legal_public',
      tag: 'Most Affordable',
      tagCat: 'PUBLIC',
      title: 'Konfigurasi Panel Publik Shared',
      rateLabel: 'Rp 1.000 / GB',
      minRam: 1,
      maxRam: 11, // 1-10 GB, 11 = Unlimited
      checkpoints: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'sekat', 11],
      unlimitedPrice: 10000,
      hostSpecs: {
        cpu: '16 Core vCPU',
        ram: '64 GB Host RAM',
        disk: '128 GB NVMe Gen4',
        loc: 'Datacenter Jakarta (ID)'
      },
      calcPrice: function (ram) {
        if (ram === 11) return this.unlimitedPrice;
        return ram * 1000;
      },
      calcCpu: function (ram) {
        if (ram === 11) return 'Unlimited';
        const cpuMap = { 1: 50, 2: 60, 3: 75, 4: 100, 5: 125, 6: 150, 7: 175, 8: 200, 9: 225, 10: 250 };
        return (cpuMap[ram] || 250) + '%';
      },
      calcDisk: function (ram) {
        if (ram === 11) return 'Unlimited NVMe';
        return (ram * 2) + ' GB';
      },
      port: '1 Port Dedicated',
      dbBackup: '1 DB / 1 BKP'
    },
    legal_private: {
      key: 'legal_private',
      tag: 'Dedicated Performance',
      tagCat: 'PRIVATE',
      title: 'Konfigurasi Panel Private Dedicated',
      rateLabel: 'High IOPS',
      minRam: 1,
      maxRam: 11,
      checkpoints: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'sekat', 11],
      unlimitedPrice: 25000,
      hostSpecs: {
        cpu: '16 Core vCPU',
        ram: '32 GB Host RAM',
        disk: '250 GB NVMe Gen4',
        loc: 'Datacenter Jakarta / Bandung (ID)'
      },
      calcPrice: function (ram) {
        if (ram === 11) return this.unlimitedPrice;
        const pTable = { 1: 4000, 2: 7000, 3: 9000, 4: 11000, 5: 13000, 6: 15000, 7: 17000, 8: 19000, 9: 21000, 10: 23000 };
        return pTable[ram] || (ram * 2300);
      },
      calcCpu: function (ram) {
        if (ram === 11) return 'Unlimited';
        const cpuMap = { 1: 50, 2: 60, 3: 75, 4: 100, 5: 125, 6: 150, 7: 175, 8: 200, 9: 225, 10: 250 };
        return (cpuMap[ram] || 250) + '%';
      },
      calcDisk: function (ram) {
        if (ram === 11) return 'Unlimited NVMe';
        return (ram * 2) + ' GB';
      },
      port: '1 Port Dedicated',
      dbBackup: '1 DB / 1 BKP'
    },
    legal_enterprise: {
      key: 'legal_enterprise',
      tag: 'High Performance',
      tagCat: 'ENTERPRISE',
      title: 'Konfigurasi Panel Enterprise Ultra',
      rateLabel: '3x NVMe Storage',
      minRam: 1,
      maxRam: 11,
      checkpoints: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'sekat', 11],
      unlimitedPrice: 26000,
      hostSpecs: {
        cpu: '16 Core vCPU',
        ram: '64 GB Host RAM',
        disk: '500 GB NVMe Gen4',
        loc: 'Datacenter Jakarta (ID)'
      },
      calcPrice: function (ram) {
        if (ram === 11) return this.unlimitedPrice;
        const pTable = { 1: 5000, 2: 8000, 3: 10000, 4: 12000, 5: 14000, 6: 16000, 7: 18000, 8: 20000, 9: 22000, 10: 24000 };
        return pTable[ram] || (ram * 2400);
      },
      calcCpu: function (ram) {
        if (ram === 11) return 'Unlimited';
        const cpuMap = { 1: 60, 2: 80, 3: 100, 4: 125, 5: 150, 6: 175, 7: 200, 8: 225, 9: 250, 10: 300 };
        return (cpuMap[ram] || 250) + '%';
      },
      calcDisk: function (ram) {
        if (ram === 11) return 'Unlimited NVMe';
        return (ram * 3) + ' GB';
      },
      port: '1 Port Dedicated',
      dbBackup: '1 DB / 3 BKP'
    },
    legal_premium: {
      key: 'legal_premium',
      tag: 'Ultimate Specs',
      tagCat: 'PREMIUM',
      title: 'Konfigurasi Panel Premium High-Core',
      rateLabel: 'Priority Support',
      minRam: 1,
      maxRam: 11,
      checkpoints: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'sekat', 11],
      unlimitedPrice: 30000,
      hostSpecs: {
        cpu: '8 Core High-Clock',
        ram: '64 GB Host RAM',
        disk: '250 GB NVMe Gen4',
        loc: 'Datacenter Jakarta (ID)'
      },
      calcPrice: function (ram) {
        if (ram === 11) return this.unlimitedPrice;
        const pTable = { 1: 5000, 2: 8000, 3: 10000, 4: 13000, 5: 15000, 6: 17000, 7: 20000, 8: 22000, 9: 25000, 10: 27000 };
        return pTable[ram] || (ram * 2700);
      },
      calcCpu: function (ram) {
        if (ram === 11) return 'Unlimited';
        const cpuMap = { 1: 50, 2: 60, 3: 75, 4: 100, 5: 125, 6: 150, 7: 175, 8: 200, 9: 225, 10: 250 };
        return (cpuMap[ram] || 250) + '%';
      },
      calcDisk: function (ram) {
        if (ram === 11) return 'Unlimited NVMe';
        return (ram * 2) + ' GB';
      },
      port: '1 Port Dedicated',
      dbBackup: '1 DB / 3 BKP'
    }
  };

  // State
  let activeTier = TIER_SPECS.legal_public;
  let currentRam = 1;
  let isUnlimited = false;
  let selectedRuntime = 'nodejs'; // 'nodejs' | 'python'
  let selectedPaymentMethod = 'qris'; // 'qris' | 'saldo'
  let userBalance = 0;
  let pollInterval = null;
  let timerInterval = null;
  let currentOrderId = null;
  let currentOrderSecret = null;
  let _lastRawCredentials = '';

  // Build Modal DOM dynamically if not exists
  function ensureModalElement() {
    let overlay = document.getElementById('panelConfigOverlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'panelConfigOverlay';
    overlay.className = 'pcm-overlay';
    overlay.innerHTML = `
      <div class="pcm-container" id="panelConfigContainer" role="dialog" aria-modal="true">
        <!-- Step 1: Configuration View -->
        <div id="pcmViewConfig" style="display:flex; flex-direction:column; flex:1; overflow:hidden;">
          <div class="pcm-header">
            <div class="pcm-header-top-row">
              <div class="pcm-header-tags">
                <span class="pcm-tag-pill" id="pcmTagPill">Most Affordable</span>
                <span class="pcm-tag-cat" id="pcmTagCat">KATEGORI: PUBLIC</span>
              </div>
              <button class="pcm-close-btn" id="pcmCloseBtn" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <h3 class="pcm-title" id="pcmTitle">Konfigurasi Panel Publik Shared</h3>

            <!-- Instant Tier Switching Tabs (Clean Vector Icons, No Emojis) -->
            <div class="pcm-tier-tabs" id="pcmTierTabs">
              <div class="pcm-tier-tab act" data-tier="legal_public" onclick="window.PanelConfigModal.switchTier('legal_public')">
                <i class="fa-solid fa-globe"></i> Publik
              </div>
              <div class="pcm-tier-tab" data-tier="legal_private" onclick="window.PanelConfigModal.switchTier('legal_private')">
                <i class="fa-solid fa-shield-halved"></i> Private
              </div>
              <div class="pcm-tier-tab" data-tier="legal_enterprise" onclick="window.PanelConfigModal.switchTier('legal_enterprise')">
                <i class="fa-solid fa-building"></i> Enterprise
              </div>
              <div class="pcm-tier-tab" data-tier="legal_premium" onclick="window.PanelConfigModal.switchTier('legal_premium')">
                <i class="fa-solid fa-crown"></i> Premium
              </div>
            </div>
          </div>

          <div class="pcm-body">
            <!-- Memory Allocation Main Card with 1-10GB + Sekat Unlimited -->
            <div class="pcm-ram-card" id="pcmRamCard">
              <div class="pcm-ram-card-top">
                <span class="pcm-ram-card-label">Kapasitas Alokasi Memori (RAM)</span>
                <span class="pcm-price-rate-pill" id="pcmPriceRatePill">Rp 1.000 / GB</span>
              </div>

              <div class="pcm-ram-card-display">
                <div class="pcm-ram-val-wrap">
                  <span class="pcm-ram-val-huge" id="pcmRamDisplay">1</span>
                  <span class="pcm-ram-val-unit" id="pcmRamUnit">GB RAM</span>
                </div>
                <div class="pcm-ram-cost-wrap">
                  <div class="pcm-ram-cost-label">Total Biaya Bulanan</div>
                  <div class="pcm-ram-cost-val" id="pcmRamCostDisplay">Rp 1.000</div>
                </div>
              </div>

              <!-- Slider and Steppers (1-10 GB + Sekat Unli) -->
              <div id="pcmSliderControls">
                <div class="pcm-slider-row">
                  <button class="pcm-step-btn" id="pcmStepMinus" aria-label="Kurangi RAM" onclick="window.PanelConfigModal.stepRam(-1)">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <div class="pcm-slider-wrap">
                    <input type="range" class="pcm-range-input" id="pcmRamSlider" min="1" max="11" value="1" step="1">
                  </div>
                  <button class="pcm-step-btn" id="pcmStepPlus" aria-label="Tambah RAM" onclick="window.PanelConfigModal.stepRam(1)">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <div class="pcm-slider-checkpoints" id="pcmCheckpoints"></div>
              </div>
            </div>

            <!-- Auto-Adjusting Specs Grid -->
            <div class="pcm-specs-section">
              <div class="pcm-section-hd">
                <i class="fa-solid fa-bolt"></i> Spesifikasi Otomatis Menyesuaikan:
              </div>
              <div class="pcm-specs-grid">
                <div class="pcm-spec-card">
                  <div class="pcm-spec-card-lbl"><i class="fa-solid fa-microchip"></i> CPU Core</div>
                  <div class="pcm-spec-card-val">
                    <span id="pcmSpecCpu">50%</span>
                    <span class="pcm-spec-card-sub">vCPU</span>
                  </div>
                </div>
                <div class="pcm-spec-card">
                  <div class="pcm-spec-card-lbl"><i class="fa-solid fa-hard-drive"></i> Disk NVMe</div>
                  <div class="pcm-spec-card-val">
                    <span id="pcmSpecDisk">2 GB</span>
                    <span class="pcm-spec-card-sub">Fast</span>
                  </div>
                </div>
                <div class="pcm-spec-card">
                  <div class="pcm-spec-card-lbl"><i class="fa-solid fa-network-wired"></i> Alokasi Port</div>
                  <div class="pcm-spec-card-val">
                    <span id="pcmSpecPort">1 Port</span>
                    <span class="pcm-spec-card-sub">Dedicated</span>
                  </div>
                </div>
                <div class="pcm-spec-card">
                  <div class="pcm-spec-card-lbl"><i class="fa-solid fa-database"></i> Database/Backup</div>
                  <div class="pcm-spec-card-val" id="pcmSpecDbBkp" style="font-size:1rem;">1 DB / 1 BKP</div>
                </div>
              </div>
            </div>

            <!-- Host Node Server Specs Box (VPS Hardware Transparency) -->
            <div class="pcm-host-specs-card">
              <div class="pcm-host-specs-header">
                <div class="pcm-host-specs-title">
                  <i class="fa-solid fa-server"></i> Spesifikasi Server Host (Physical Node):
                </div>
                <span class="pcm-host-status-pill">
                  <i class="fa-solid fa-circle-check"></i> Node Online
                </span>
              </div>
              <div class="pcm-host-chips-grid">
                <div class="pcm-host-chip">
                  <i class="fa-solid fa-microchip"></i> <span id="pcmHostCpu">16 Core vCPU</span>
                </div>
                <div class="pcm-host-chip">
                  <i class="fa-solid fa-memory"></i> <span id="pcmHostRam">64 GB Host RAM</span>
                </div>
                <div class="pcm-host-chip">
                  <i class="fa-solid fa-hard-drive"></i> <span id="pcmHostDisk">128 GB NVMe Gen4</span>
                </div>
                <div class="pcm-host-chip">
                  <i class="fa-solid fa-location-dot"></i> <span id="pcmHostLoc">Datacenter Jakarta (ID)</span>
                </div>
              </div>
            </div>

            <!-- Nama Server / Panel (Wajib) -> Otomatis Menjadi Username Akun Panel -->
            <div class="pcm-form-group">
              <label class="pcm-input-label" for="pcmServerName">
                <i class="fa-solid fa-server"></i> Nama Panel / Server <span class="pcm-required-badge">*Wajib</span>
              </label>
              <input type="text" class="pcm-input-field" id="pcmServerName" placeholder="Contoh: zyro / mybot" maxlength="32" autocomplete="off" oninput="window.PanelConfigModal.syncServerName(this.value)">
              <div class="pcm-input-hint">Username panel otomatis: <strong id="pcmUserAutoPreview" style="color:var(--pcm-amber); font-family:monospace;">zyro</strong> (dibuat langsung dari nama panel).</div>
            </div>

            <!-- Email Penerima Struk & Kredensial (Wajib) -->
            <div class="pcm-form-group">
              <label class="pcm-input-label" for="pcmBuyerEmail">
                <i class="fa-solid fa-envelope"></i> Email Penerima Struk & Akun <span class="pcm-required-badge">*Wajib</span>
              </label>
              <input type="email" class="pcm-input-field" id="pcmBuyerEmail" placeholder="nama@gmail.com" maxlength="60" autocomplete="email">
              <div class="pcm-input-hint">Struk pembayaran dan detail login akun Pterodactyl otomatis dikirimkan ke email ini.</div>
            </div>

            <!-- Account Choice & Runtime Selector -->
            <div class="pcm-form-group">
              <label class="pcm-input-label"><i class="fa-solid fa-terminal"></i> Pilihan Runtime Bot</label>
              <div class="pcm-option-chips">
                <div class="pcm-chip act" id="pcmRuntimeNodejs" onclick="window.PanelConfigModal.setRuntime('nodejs')">
                  <i class="fa-brands fa-node-js" style="color:#22c55e;"></i> NodeJS
                </div>
                <div class="pcm-chip" id="pcmRuntimePython" onclick="window.PanelConfigModal.setRuntime('python')">
                  <i class="fa-brands fa-python" style="color:#38bdf8;"></i> Python
                </div>
              </div>
            </div>

            <!-- Pilihan Metode Pembayaran (QRIS Otomatis & Saldo Akun) -->
            <div class="pcm-form-group">
              <label class="pcm-input-label"><i class="fa-solid fa-credit-card"></i> Pilihan Metode Pembayaran</label>
              <div class="pcm-pay-grid">
                <div class="pcm-pay-card act" id="pcmMethodQris" onclick="window.PanelConfigModal.setPaymentMethod('qris')">
                  <div class="pcm-pay-card-top">
                    <i class="fa-solid fa-qrcode"></i>
                    <span class="pcm-pay-badge">Instan</span>
                  </div>
                  <div class="pcm-pay-card-title">QRIS Otomatis</div>
                  <div class="pcm-pay-card-desc">BCA, Dana, GoPay, OVO, ShopeePay</div>
                </div>
                <div class="pcm-pay-card" id="pcmMethodSaldo" onclick="window.PanelConfigModal.setPaymentMethod('saldo')">
                  <div class="pcm-pay-card-top">
                    <i class="fa-solid fa-wallet"></i>
                    <span class="pcm-pay-badge pcm-pay-badge-balance" id="pcmSaldoBadge">Saldo: Rp 0</span>
                  </div>
                  <div class="pcm-pay-card-title">Saldo Akun Zyro</div>
                  <div class="pcm-pay-card-desc" id="pcmSaldoSub">Potong saldo langsung</div>
                </div>
              </div>
              <div id="pcmSaldoAlert" class="pcm-saldo-alert" style="display:none;"></div>
            </div>
          </div>

          <!-- Footer Actions & Total Calculation -->
          <div class="pcm-footer">
            <div class="pcm-price-summary-row">
              <div>
                <div class="pcm-price-summary-lbl">Total Pembayaran</div>
                <div id="pcmMemberDiscountPill" style="display:none;" class="pcm-member-badge">
                  <i class="fa-solid fa-tags"></i> Diskon Member 5%
                </div>
              </div>
              <div class="pcm-total-price-huge" id="pcmTotalFooter">Rp 1.000</div>
            </div>

            <button class="pcm-cta-btn" id="pcmSubmitBtn" onclick="window.PanelConfigModal.proceedPayment()">
              <span>Lanjut Bayar via QRIS</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Step 2: In-Place QRIS View -->
        <div id="pcmViewQris" style="display:none; flex-direction:column; flex:1; overflow:hidden;">
          <div class="pcm-header">
            <h3 class="pcm-title">Pembayaran QRIS Instan</h3>
            <button class="pcm-close-btn" onclick="window.PanelConfigModal.close()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="pcm-body" style="align-items:center;">
            <div class="pcm-qris-container">
              <div class="pcm-timer-badge" id="pcmQrisTimer"><i class="fa-regular fa-clock"></i> 14:59</div>
              <div class="pcm-qris-box">
                <img id="pcmQrisImg" src="" alt="QRIS Code">
              </div>
              <div style="font-size:0.85rem; color:var(--pcm-text-secondary); line-height:1.4;">
                Scan QRIS di atas menggunakan <strong>BCA, GoPay, OVO, Dana, ShopeePay</strong> atau Mobile Banking Anda.
              </div>
              <div style="background:var(--pcm-bg-card); border:1.5px solid var(--pcm-border-strong); border-radius:14px; padding:12px 18px; width:100%;">
                <div style="font-size:0.75rem; color:var(--pcm-text-secondary);">Nominal Tepat:</div>
                <div style="font-size:1.5rem; font-weight:900; color:var(--pcm-amber);" id="pcmQrisAmount">Rp 1.000</div>
                <div style="font-size:0.72rem; color:var(--pcm-text-tertiary); margin-top:2px;">Order ID: <span id="pcmQrisOrderId">ZYRO-000000</span></div>
              </div>
            </div>
          </div>
          <div class="pcm-footer">
            <button class="pcm-cta-btn" style="background:#22c55e;" id="pcmCheckQrisBtn" onclick="window.PanelConfigModal.checkManual()">
              <i class="fa-solid fa-arrows-rotate"></i> Cek Status Pembayaran
            </button>
            <button class="pcm-chip" style="background:transparent; border:none; margin-top:4px;" onclick="window.PanelConfigModal.backToConfig()">
              <i class="fa-solid fa-chevron-left"></i> Kembali & Ubah Konfigurasi
            </button>
          </div>
        </div>

        <!-- Step 3: In-Place Success View -->
        <div id="pcmViewSuccess" style="display:none; flex-direction:column; flex:1; overflow:hidden;">
          <div class="pcm-header">
            <h3 class="pcm-title"><i class="fa-solid fa-circle-check" style="color:var(--pcm-green);margin-right:6px;"></i> Pembayaran Berhasil!</h3>
            <button class="pcm-close-btn" onclick="window.PanelConfigModal.close()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="pcm-body" style="align-items:center;">
            <div class="pcm-success-container">
              <div class="pcm-success-icon"><i class="fa-solid fa-check"></i></div>
              <h4 style="font-size:1.25rem; font-weight:800; margin:0;">Server Siap Digunakan!</h4>
              <p style="font-size:0.82rem; color:var(--pcm-text-secondary); margin:0;">Akun dan server Pterodactyl Anda telah berhasil dibuat secara otomatis.</p>
              
              <div id="pcmSuccessCredsWrap" style="width:100%;">
                <div class="pcm-cred-box" id="pcmSuccessCreds">Memuat kredensial...</div>
              </div>
            </div>
          </div>
          <div class="pcm-footer">
            <a href="https://cp.zyrostore.id" target="_blank" class="pcm-cta-btn" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:8px;" id="pcmOpenPanelLink">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Buka Control Panel</span>
            </a>
            <button class="pcm-chip" id="pcmCopyCredBtn" onclick="window.PanelConfigModal.copyCredentials()" style="width:100%; border:1.5px solid var(--pcm-border-strong); margin-top:6px; padding:12px; font-weight:700;">
              <i class="fa-regular fa-copy"></i> <span>Salin Semua Kredensial</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay backdrop click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) window.PanelConfigModal.close();
    });

    // Close button
    document.getElementById('pcmCloseBtn').addEventListener('click', function () {
      window.PanelConfigModal.close();
    });

    // Slider input change
    const slider = document.getElementById('pcmRamSlider');
    slider.addEventListener('input', function () {
      window.PanelConfigModal.setRam(parseInt(this.value, 10));
    });

    // ESC key close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('on')) {
        window.PanelConfigModal.close();
      }
    });

    return overlay;
  }

  // Format IDR helper
  function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  // Safe HTML escape helper
  function safeEscape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Cross-platform copy helper
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (_) {}
    document.body.removeChild(ta);
  }

  // Parse structured Pterodactyl credential receipt
  function parseCredentialText(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const lines = raw.split(/\r?\n/);
    const data = {
      raw: raw,
      status: '',
      category: '',
      loginUrl: '',
      email: '',
      username: '',
      password: '',
      serverName: '',
      serverId: '',
      resource: '',
      runtime: '',
      backup: '',
      database: '',
      activeDays: '',
      warranty: '',
      note: ''
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const idx = trimmed.indexOf(':');
      if (idx === -1) continue;

      const key = trimmed.slice(0, idx).trim().toLowerCase();
      const val = trimmed.slice(idx + 1).trim();

      if (key.includes('status')) {
        data.status = val;
      } else if (key.includes('kategori')) {
        data.category = val;
      } else if (key.includes('link login') || key === 'link' || key === 'domain') {
        data.loginUrl = val;
      } else if (key.includes('email')) {
        data.email = val;
      } else if (key.includes('username') || key === 'user') {
        data.username = val;
      } else if (key.includes('password') || key === 'pass') {
        data.password = val;
      } else if (key.includes('nama server') || key === 'server name') {
        data.serverName = val;
      } else if (key.includes('server id')) {
        data.serverId = val;
      } else if (key.includes('resource') || key.includes('spesifikasi')) {
        data.resource = val;
      } else if (key.includes('runtime') || key.includes('egg')) {
        data.runtime = val;
      } else if (key.includes('backup')) {
        data.backup = val;
      } else if (key.includes('database')) {
        data.database = val;
      } else if (key.includes('masa aktif')) {
        data.activeDays = val;
      } else if (key.includes('garansi')) {
        data.warranty = val;
      } else if (key.includes('catatan') || key.includes('note')) {
        data.note = val;
      }
    }

    if (!data.username && !data.loginUrl && !data.password) {
      return null;
    }
    return data;
  }

  // Render high-contrast, crystal-clear credential card
  function renderCredentialCard(rawText) {
    _lastRawCredentials = rawText || '';
    const parsed = parseCredentialText(rawText);
    if (!parsed) {
      return `<div class="pcm-cred-box" id="pcmSuccessCreds">${safeEscape(rawText)}</div>`;
    }

    const loginUrl = parsed.loginUrl || 'https://cp.zyrostore.id';
    const formattedUrl = loginUrl.startsWith('http') ? loginUrl : `https://${loginUrl}`;

    // Update bottom open CTA button href
    const openLinkEl = document.getElementById('pcmOpenPanelLink');
    if (openLinkEl) {
      openLinkEl.href = formattedUrl;
    }

    const isExistingPass = !parsed.password || parsed.password.includes('(') || parsed.password.toLowerCase().includes('lama');

    return `
      <div class="pcm-card-creds-clean">
        <div class="pcm-creds-header-pill">
          <span class="pcm-creds-status-dot"></span>
          <span class="pcm-creds-status-text">${safeEscape(parsed.status || 'Panel Otomatis Aktif')}</span>
        </div>

        <div class="pcm-cred-fields-group">
          <!-- Field 1: Link Login Panel -->
          <div class="pcm-cfield">
            <div class="pcm-cfield-top">
              <span class="pcm-cfield-lbl"><i class="fa-solid fa-globe" style="color:var(--pcm-amber,#D97706);"></i> Link Login Panel</span>
              <div class="pcm-cfield-actions">
                <button type="button" class="pcm-cbtn-copy" onclick="window.PanelConfigModal.copyField('${safeEscape(formattedUrl)}', this)">
                  <i class="fa-regular fa-copy"></i> <span>Salin</span>
                </button>
                <a href="${safeEscape(formattedUrl)}" target="_blank" rel="noopener noreferrer" class="pcm-cbtn-open">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Buka</span>
                </a>
              </div>
            </div>
            <div class="pcm-cfield-box">
              <a href="${safeEscape(formattedUrl)}" target="_blank" rel="noopener noreferrer" class="pcm-cfield-val-link">
                ${safeEscape(formattedUrl)}
              </a>
            </div>
          </div>

          <!-- Field 2: Username -->
          <div class="pcm-cfield">
            <div class="pcm-cfield-top">
              <span class="pcm-cfield-lbl"><i class="fa-solid fa-user" style="color:var(--pcm-charcoal,#18181B);"></i> Username Akun</span>
              <div class="pcm-cfield-actions">
                <button type="button" class="pcm-cbtn-copy" onclick="window.PanelConfigModal.copyField('${safeEscape(parsed.username)}', this)">
                  <i class="fa-regular fa-copy"></i> <span>Salin</span>
                </button>
              </div>
            </div>
            <div class="pcm-cfield-box">
              <span class="pcm-cfield-val">${safeEscape(parsed.username || '-')}</span>
            </div>
            ${parsed.email ? `
            <div class="pcm-cfield-subtext">
              <i class="fa-regular fa-envelope"></i> Email: <b>${safeEscape(parsed.email)}</b>
            </div>` : ''}
          </div>

          <!-- Field 3: Password -->
          <div class="pcm-cfield">
            <div class="pcm-cfield-top">
              <span class="pcm-cfield-lbl"><i class="fa-solid fa-key" style="color:var(--pcm-amber,#D97706);"></i> Password</span>
              <div class="pcm-cfield-actions">
                ${!isExistingPass ? `
                <button type="button" class="pcm-cbtn-toggle-eye" onclick="window.PanelConfigModal.togglePassPeek(this)" title="Lihat/Sembunyikan Password">
                  <i class="fa-solid fa-eye-slash"></i>
                </button>
                <button type="button" class="pcm-cbtn-copy" onclick="window.PanelConfigModal.copyField('${safeEscape(parsed.password)}', this)">
                  <i class="fa-regular fa-copy"></i> <span>Salin</span>
                </button>
                ` : ''}
              </div>
            </div>
            <div class="pcm-cfield-box">
              ${isExistingPass ? `
                <span class="pcm-cfield-val" style="font-size:0.85rem; color:var(--pcm-text-secondary); font-family:inherit; font-weight:600;">
                  <i class="fa-solid fa-circle-info" style="color:var(--pcm-amber);margin-right:4px;"></i> Gunakan password lama akun panel Anda
                </span>
              ` : `
                <span class="pcm-cfield-val" data-raw-pass="${safeEscape(parsed.password)}" data-masked="false">${safeEscape(parsed.password)}</span>
              `}
            </div>
          </div>
        </div>

        <!-- Specs Badge Pills -->
        <div class="pcm-creds-specs-grid">
          ${parsed.serverName ? `
          <div class="pcm-cspec-item">
            <div class="pcm-cspec-icon"><i class="fa-solid fa-server"></i></div>
            <div class="pcm-cspec-meta">
              <span class="pcm-cspec-lbl">Nama Server</span>
              <span class="pcm-cspec-val" title="${safeEscape(parsed.serverName)}">${safeEscape(parsed.serverName)}</span>
            </div>
          </div>` : ''}

          ${parsed.resource ? `
          <div class="pcm-cspec-item">
            <div class="pcm-cspec-icon" style="color:#15803D; background:#DCFCE7;"><i class="fa-solid fa-microchip"></i></div>
            <div class="pcm-cspec-meta">
              <span class="pcm-cspec-lbl">Resource</span>
              <span class="pcm-cspec-val" title="${safeEscape(parsed.resource)}">${safeEscape(parsed.resource)}</span>
            </div>
          </div>` : ''}

          ${parsed.runtime ? `
          <div class="pcm-cspec-item">
            <div class="pcm-cspec-icon"><i class="fa-solid fa-cube"></i></div>
            <div class="pcm-cspec-meta">
              <span class="pcm-cspec-lbl">Runtime / Egg</span>
              <span class="pcm-cspec-val" title="${safeEscape(parsed.runtime)}">${safeEscape(parsed.runtime.replace(/\s*\([^)]*\)/g, ''))}</span>
            </div>
          </div>` : ''}

          ${parsed.serverId ? `
          <div class="pcm-cspec-item">
            <div class="pcm-cspec-icon" style="color:#7C3AED; background:#F5F3FF;"><i class="fa-solid fa-fingerprint"></i></div>
            <div class="pcm-cspec-meta">
              <span class="pcm-cspec-lbl">Server ID</span>
              <span class="pcm-cspec-val" title="${safeEscape(parsed.serverId)}">${safeEscape(parsed.serverId)}</span>
            </div>
          </div>` : ''}
        </div>

        <!-- Accordion for technical details & raw text -->
        <details class="pcm-creds-details-accordion">
          <summary>
            <span><i class="fa-solid fa-circle-info" style="color:var(--pcm-text-secondary);margin-right:6px;"></i> Detail Lengkap & Kredensial Raw</span>
            <i class="fa-solid fa-chevron-down pcm-caccordion-arrow"></i>
          </summary>
          <div class="pcm-caccordion-content">
            <pre class="pcm-raw-text">${safeEscape(rawText)}</pre>
          </div>
        </details>
      </div>
    `;
  }

  // Check logged in user for 5% discount
  function getDiscountMultiplier() {
    try {
      const token = localStorage.getItem('zyro_auth_token') || (window._authToken || '');
      if (token) return 0.95; // 5% discount for registered members
    } catch (e) {}
    return 1.0;
  }

  // Recalculate & update UI
  function updateUI() {
    const slider = document.getElementById('pcmRamSlider');
    const stepMinus = document.getElementById('pcmStepMinus');
    const stepPlus = document.getElementById('pcmStepPlus');
    const ramDisplay = document.getElementById('pcmRamDisplay');
    const ramUnit = document.getElementById('pcmRamUnit');
    const ramCostDisplay = document.getElementById('pcmRamCostDisplay');
    const totalFooter = document.getElementById('pcmTotalFooter');
    const specCpu = document.getElementById('pcmSpecCpu');
    const specDisk = document.getElementById('pcmSpecDisk');
    const specPort = document.getElementById('pcmSpecPort');
    const specDbBkp = document.getElementById('pcmSpecDbBkp');
    const memberDiscountPill = document.getElementById('pcmMemberDiscountPill');
    const priceRatePill = document.getElementById('pcmPriceRatePill');

    const isMember = getDiscountMultiplier() < 1;
    if (memberDiscountPill) {
      memberDiscountPill.style.display = isMember ? 'inline-block' : 'none';
    }

    slider.min = 1;
    slider.max = 11;
    slider.value = currentRam;

    stepMinus.disabled = currentRam <= 1;
    stepPlus.disabled = currentRam >= 11;

    isUnlimited = (currentRam === 11);

    // Update Slider Progress Fill Track
    const pct = ((currentRam - 1) / (11 - 1)) * 100;
    if (isUnlimited) {
      slider.style.background = `linear-gradient(to right, var(--pcm-amber) 0%, var(--pcm-amber) ${pct}%, #E2D9CC ${pct}%, #E2D9CC 100%)`;
      if (priceRatePill) priceRatePill.textContent = 'Paket Unlimited';
      ramDisplay.innerHTML = '<i class="fa-solid fa-infinity" style="font-size:2.1rem; color:var(--pcm-amber);"></i>';
      ramUnit.textContent = 'Unlimited';
      const baseCost = activeTier.unlimitedPrice;
      const finalCost = Math.round(baseCost * getDiscountMultiplier());
      ramCostDisplay.textContent = formatRupiah(baseCost);
      totalFooter.textContent = formatRupiah(finalCost);
      specCpu.textContent = 'Unlimited';
      specDisk.textContent = 'Unlimited NVMe';
      specPort.textContent = activeTier.port;
      specDbBkp.textContent = activeTier.dbBackup;
    } else {
      slider.style.background = `linear-gradient(to right, var(--pcm-charcoal) 0%, var(--pcm-charcoal) ${pct}%, #E2D9CC ${pct}%, #E2D9CC 100%)`;
      if (priceRatePill) priceRatePill.textContent = activeTier.rateLabel;
      ramDisplay.textContent = currentRam;
      ramUnit.textContent = 'GB RAM';
      const baseCost = activeTier.calcPrice(currentRam);
      const finalCost = Math.round(baseCost * getDiscountMultiplier());
      ramCostDisplay.textContent = formatRupiah(baseCost);
      totalFooter.textContent = formatRupiah(finalCost);
      specCpu.textContent = activeTier.calcCpu(currentRam);
      specDisk.textContent = activeTier.calcDisk(currentRam);
      specPort.textContent = activeTier.port;
      specDbBkp.textContent = activeTier.dbBackup;
    }

    // Refresh Host Node VPS Specs
    const hostCpu = document.getElementById('pcmHostCpu');
    const hostRam = document.getElementById('pcmHostRam');
    const hostDisk = document.getElementById('pcmHostDisk');
    const hostLoc = document.getElementById('pcmHostLoc');
    if (activeTier.hostSpecs) {
      if (hostCpu) hostCpu.textContent = activeTier.hostSpecs.cpu;
      if (hostRam) hostRam.textContent = activeTier.hostSpecs.ram;
      if (hostDisk) hostDisk.textContent = activeTier.hostSpecs.disk;
      if (hostLoc) hostLoc.textContent = activeTier.hostSpecs.loc;
    }

    // Highlight checkpoints
    const marks = document.querySelectorAll('.pcm-chk-mark');
    marks.forEach(m => {
      const v = parseInt(m.dataset.val, 10);
      m.classList.toggle('active', v === currentRam);
    });

    updateSaldoAlert();
  }

  // Update Saldo Alert UI based on current cart cost vs user balance
  function updateSaldoAlert() {
    const alertEl = document.getElementById('pcmSaldoAlert');
    if (!alertEl) return;

    if (selectedPaymentMethod !== 'saldo') {
      alertEl.style.display = 'none';
      return;
    }

    const baseCost = isUnlimited ? activeTier.unlimitedPrice : activeTier.calcPrice(currentRam);
    const finalCost = Math.round(baseCost * getDiscountMultiplier());

    let token = '';
    try {
      token = localStorage.getItem('seika_user_token') || localStorage.getItem('user_token') || localStorage.getItem('zyro_auth_token') || (window._authToken || '');
    } catch (e) {}

    if (!token) {
      alertEl.style.display = 'flex';
      alertEl.style.background = '#FEF3C7';
      alertEl.style.borderColor = '#FDE68A';
      alertEl.style.color = '#92400E';
      alertEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>Anda belum masuk ke akun. Silakan <a href="javascript:void(0)" onclick="if(typeof openAuthModal===\'function\')openAuthModal(\'login\')" style="color:#92400E;font-weight:800;text-decoration:underline;">Masuk / Login</a> terlebih dahulu untuk membayar via Saldo Akun.</span>';
      return;
    }

    if (userBalance < finalCost) {
      const diff = finalCost - userBalance;
      alertEl.style.display = 'flex';
      alertEl.style.background = '#FEF2F2';
      alertEl.style.borderColor = '#FECACA';
      alertEl.style.color = '#B91C1C';
      alertEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:#DC2626;"></i> <span>Saldo akun tidak mencukupi (Saldo: ${formatRupiah(userBalance)} / Kurang ${formatRupiah(diff)}). Silakan gunakan QRIS Otomatis atau <a href="javascript:void(0)" onclick="if(typeof openTopupModal===\'function\')openTopupModal()" style="color:#B91C1C;font-weight:800;text-decoration:underline;">Top Up Saldo</a>.</span>`;
    } else {
      alertEl.style.display = 'flex';
      alertEl.style.background = '#DCFCE7';
      alertEl.style.borderColor = '#BBF7D0';
      alertEl.style.color = '#15803D';
      alertEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#15803D;"></i> <span>Saldo Anda mencukupi! Sisa saldo setelah pembelian: <strong>${formatRupiah(userBalance - finalCost)}</strong>. Server langsung aktif seketika tanpa perlu scan.</span>`;
    }
  }

  // Fetch and display live user balance
  async function updateUserBalanceDisplay() {
    let token = '';
    try {
      token = localStorage.getItem('seika_user_token') || localStorage.getItem('user_token') || localStorage.getItem('zyro_auth_token') || (window._authToken || '');
      const rawUser = localStorage.getItem('seika_user_data') || localStorage.getItem('seika_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (typeof u.balance !== 'undefined') userBalance = Number(u.balance) || 0;
      }
    } catch (e) {}

    const badge = document.getElementById('pcmSaldoBadge');
    const sub = document.getElementById('pcmSaldoSub');

    if (token) {
      if (badge) badge.textContent = `Saldo: ${formatRupiah(userBalance)}`;
      if (sub) sub.textContent = `Tersedia: ${formatRupiah(userBalance)}`;

      try {
        const res = await fetch(`/api/user/balance?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.status && typeof data.balance !== 'undefined') {
          userBalance = Number(data.balance) || 0;
          if (badge) badge.textContent = `Saldo: ${formatRupiah(userBalance)}`;
          if (sub) sub.textContent = `Tersedia: ${formatRupiah(userBalance)}`;
          updateSaldoAlert();
        }
      } catch (_) {}
    } else {
      if (badge) badge.textContent = 'Belum Login';
      if (sub) sub.textContent = 'Masuk untuk bayar via Saldo';
    }
    updateSaldoAlert();
  }

  // Render Checkpoints with Sekat for Unlimited
  function renderCheckpoints() {
    const wrap = document.getElementById('pcmCheckpoints');
    if (!wrap) return;
    wrap.innerHTML = '';
    activeTier.checkpoints.forEach(cp => {
      if (cp === 'sekat') {
        const sep = document.createElement('span');
        sep.className = 'pcm-chk-separator';
        sep.textContent = '|';
        wrap.appendChild(sep);
        return;
      }
      if (cp === 11) {
        const span = document.createElement('span');
        span.className = 'pcm-chk-mark pcm-chk-unli' + (currentRam === 11 ? ' active' : '');
        span.innerHTML = '<i class="fa-solid fa-infinity"></i> Unli';
        span.dataset.val = 11;
        span.title = 'Paket Unlimited';
        span.onclick = function () {
          window.PanelConfigModal.setRam(11);
        };
        wrap.appendChild(span);
        return;
      }
      const span = document.createElement('span');
      span.className = 'pcm-chk-mark' + (currentRam === cp ? ' active' : '');
      span.textContent = cp + 'G';
      span.dataset.val = cp;
      span.title = cp + ' GB RAM';
      span.onclick = function () {
        window.PanelConfigModal.setRam(cp);
      };
      wrap.appendChild(span);
    });
  }

  // Module Export
  window.PanelConfigModal = {
    open: function (tierKey) {
      ensureModalElement();
      const resolvedKey = (tierKey || 'legal_public').toLowerCase().replace('-', '_');
      activeTier = TIER_SPECS[resolvedKey] || TIER_SPECS.legal_public;
      currentRam = 1;
      isUnlimited = false;

      // Update Header Text
      document.getElementById('pcmTagPill').textContent = activeTier.tag;
      document.getElementById('pcmTagCat').textContent = 'KATEGORI: ' + activeTier.tagCat;
      document.getElementById('pcmTitle').textContent = activeTier.title;
      document.getElementById('pcmPriceRatePill').textContent = activeTier.rateLabel;

      // Reset view to config
      document.getElementById('pcmViewConfig').style.display = 'flex';
      document.getElementById('pcmViewQris').style.display = 'none';
      document.getElementById('pcmViewSuccess').style.display = 'none';
      _lastRawCredentials = '';
      const credWrap = document.getElementById('pcmSuccessCredsWrap');
      if (credWrap) {
        credWrap.innerHTML = '<div class="pcm-cred-box" id="pcmSuccessCreds">Memuat kredensial...</div>';
      }

      // Update tier tabs active state
      const tabs = document.querySelectorAll('.pcm-tier-tab');
      tabs.forEach(t => {
        t.classList.toggle('act', t.dataset.tier === resolvedKey);
      });

      // Auto-prefill panel name & email if user is logged in
      try {
        const rawUser = localStorage.getItem('seika_user_data') || localStorage.getItem('seika_user');
        const uData = rawUser ? JSON.parse(rawUser) : null;
        const emailField = document.getElementById('pcmBuyerEmail');
        const serverNameField = document.getElementById('pcmServerName');

        const savedEmail = (uData && uData.email) || localStorage.getItem('zyro_buyer_email') || '';
        if (emailField && !emailField.value && savedEmail) {
          emailField.value = savedEmail;
        }

        const savedName = (uData && (uData.username || uData.name)) || localStorage.getItem('zyro_buyer_name') || '';
        if (serverNameField && !serverNameField.value && savedName) {
          serverNameField.value = String(savedName).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().substring(0, 32);
        }
        this.syncServerName(serverNameField ? serverNameField.value : '');
      } catch (_) {}

      // Default payment method: QRIS
      this.setPaymentMethod('qris');
      updateUserBalanceDisplay();

      renderCheckpoints();
      updateUI();

      const overlay = document.getElementById('panelConfigOverlay');
      overlay.classList.add('on');

      if (typeof window.lockBodyScroll === 'function') {
        window.lockBodyScroll();
      } else {
        document.body.style.overflow = 'hidden';
      }
    },

    setPaymentMethod: function (method) {
      selectedPaymentMethod = method;
      const qrisCard = document.getElementById('pcmMethodQris');
      const saldoCard = document.getElementById('pcmMethodSaldo');
      if (qrisCard) qrisCard.classList.toggle('act', method === 'qris');
      if (saldoCard) saldoCard.classList.toggle('act', method === 'saldo');

      const btn = document.getElementById('pcmSubmitBtn');
      if (btn) {
        if (method === 'saldo') {
          btn.innerHTML = '<span>Bayar dengan Saldo</span> <i class="fa-solid fa-bolt"></i>';
        } else {
          btn.innerHTML = '<span>Lanjut Bayar via QRIS</span> <i class="fa-solid fa-arrow-right"></i>';
        }
      }

      updateSaldoAlert();
    },

    switchTier: function (tierKey) {
      const resolvedKey = (tierKey || 'legal_public').toLowerCase().replace('-', '_');
      activeTier = TIER_SPECS[resolvedKey] || TIER_SPECS.legal_public;
      currentRam = Math.max(1, Math.min(11, currentRam));

      document.getElementById('pcmTagPill').textContent = activeTier.tag;
      document.getElementById('pcmTagCat').textContent = 'KATEGORI: ' + activeTier.tagCat;
      document.getElementById('pcmTitle').textContent = activeTier.title;
      document.getElementById('pcmPriceRatePill').textContent = activeTier.rateLabel;

      const tabs = document.querySelectorAll('.pcm-tier-tab');
      tabs.forEach(t => {
        t.classList.toggle('act', t.dataset.tier === resolvedKey);
      });

      renderCheckpoints();
      updateUI();
    },

    close: function () {
      const overlay = document.getElementById('panelConfigOverlay');
      if (overlay) overlay.classList.remove('on');

      if (typeof window.unlockBodyScroll === 'function') {
        window.unlockBodyScroll();
      } else {
        document.body.style.overflow = '';
      }

      if (pollInterval) clearInterval(pollInterval);
      if (timerInterval) clearInterval(timerInterval);
    },

    setRam: function (val) {
      currentRam = Math.max(1, Math.min(11, val));
      isUnlimited = (currentRam === 11);
      updateUI();
    },

    stepRam: function (delta) {
      this.setRam(currentRam + delta);
    },

    setRuntime: function (rt) {
      selectedRuntime = rt;
      document.getElementById('pcmRuntimeNodejs').classList.toggle('act', rt === 'nodejs');
      document.getElementById('pcmRuntimePython').classList.toggle('act', rt === 'python');
    },

    backToConfig: function () {
      if (pollInterval) clearInterval(pollInterval);
      if (timerInterval) clearInterval(timerInterval);
      document.getElementById('pcmViewConfig').style.display = 'flex';
      document.getElementById('pcmViewQris').style.display = 'none';
      document.getElementById('pcmViewSuccess').style.display = 'none';
    },

    syncServerName: function (val) {
      const preview = document.getElementById('pcmUserAutoPreview');
      const clean = String(val || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().substring(0, 32);
      if (preview) {
        preview.textContent = clean || 'zyro';
      }
    },

    proceedPayment: async function () {
      const serverNameInput = document.getElementById('pcmServerName');
      const emailField = document.getElementById('pcmBuyerEmail');

      const rawServerName = serverNameInput ? serverNameInput.value.trim() : '';
      const rawEmail = emailField ? emailField.value.trim() : '';

      // 1. Mandatory Validation: Nama Server / Panel (Otomatis Menjadi Username Akun Panel)
      const cleanUser = rawServerName.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().substring(0, 32);
      if (!rawServerName || cleanUser.length < 2) {
        if (serverNameInput) {
          serverNameInput.focus();
          serverNameInput.classList.add('pcm-input-error');
          setTimeout(() => serverNameInput.classList.remove('pcm-input-error'), 4000);
        }
        alert('Mohon isi Nama Panel / Server yang valid (minimal 2 karakter alfanumerik, contoh: zyro / mybot). Username akun panel Anda otomatis menggunakan nama ini.');
        return;
      }
      if (serverNameInput) serverNameInput.classList.remove('pcm-input-error');

      // 2. Mandatory Validation: Email Penerima Struk & Kredensial
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!rawEmail || !emailRegex.test(rawEmail)) {
        if (emailField) {
          emailField.focus();
          emailField.classList.add('pcm-input-error');
          setTimeout(() => emailField.classList.remove('pcm-input-error'), 4000);
        }
        alert('Mohon isi alamat Email penerima struk & akun yang valid (contoh: nama@gmail.com). Detail server dan struk akan dikirim ke email ini.');
        return;
      }
      if (emailField) emailField.classList.remove('pcm-input-error');

      // Remember buyer details for seamless repeat purchases
      try {
        localStorage.setItem('zyro_buyer_email', rawEmail);
        localStorage.setItem('zyro_buyer_name', cleanUser);
      } catch (_) {}

      // Formulate Product ID and Name
      let prodId = '';
      let prodName = '';
      let baseCost = 0;

      if (currentRam === 11) {
        if (activeTier.key === 'legal_private') prodId = 'ptero-pri-unli';
        else if (activeTier.key === 'legal_enterprise') prodId = 'ptero-ent-unli';
        else if (activeTier.key === 'legal_premium') prodId = 'ptero-pre-unli';
        else prodId = 'ptero-pub-unli';
        prodName = activeTier.title.replace('Konfigurasi ', '') + ' Unlimited';
        baseCost = activeTier.unlimitedPrice;
      } else {
        if (activeTier.key === 'legal_private') prodId = `ptero-pri-${currentRam}gb`;
        else if (activeTier.key === 'legal_enterprise') prodId = `ptero-ent-${currentRam}gb`;
        else if (activeTier.key === 'legal_premium') prodId = `ptero-pre-${currentRam}gb`;
        else prodId = `ptero-pub-${currentRam}gb`;
        prodName = `${activeTier.title.replace('Konfigurasi ', '')} ${currentRam}GB`;
        baseCost = activeTier.calcPrice(currentRam);
      }

      const isMember = getDiscountMultiplier() < 1;
      const finalCost = Math.round(baseCost * getDiscountMultiplier());

      // Category mapping
      let catParam = 'Panel Legal Publik';
      if (activeTier.key === 'legal_private') catParam = 'Panel Legal Private';
      else if (activeTier.key === 'legal_enterprise') catParam = 'Panel Legal Enterprise';
      else if (activeTier.key === 'legal_premium') catParam = 'Panel Legal Premium';

      let token = '';
      try {
        token = localStorage.getItem('seika_user_token') || localStorage.getItem('user_token') || localStorage.getItem('zyro_auth_token') || (window._authToken || '');
      } catch (e) {}

      // Saldo Payment Pre-flight verification
      if (selectedPaymentMethod === 'saldo') {
        if (!token) {
          alert('Silakan masuk / login ke akun Anda terlebih dahulu untuk membayar dengan Saldo Akun.');
          if (typeof openAuthModal === 'function') openAuthModal('login');
          return;
        }
        if (userBalance < finalCost) {
          alert(`Saldo akun Anda tidak mencukupi (Saldo: ${formatRupiah(userBalance)} / Diperlukan: ${formatRupiah(finalCost)}). Silakan gunakan QRIS Otomatis atau Top Up saldo terlebih dahulu.`);
          return;
        }
      }

      const btn = document.getElementById('pcmSubmitBtn');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = selectedPaymentMethod === 'saldo'
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Potong Saldo...'
        : '<i class="fa-solid fa-spinner fa-spin"></i> Menyiapkan QRIS...';

      try {
        const queryUrl = `/paymentku?action=create` +
          `&amount=${finalCost}` +
          `&id=${encodeURIComponent(prodId)}` +
          `&nama=${encodeURIComponent(prodName)}` +
          `&category=${encodeURIComponent(catParam)}` +
          `&duration=1` +
          `&runtime=${encodeURIComponent(selectedRuntime)}` +
          `&server_user=${encodeURIComponent(cleanUser)}` +
          `&buyer_email=${encodeURIComponent(rawEmail)}` +
          `&panel_server_name=${encodeURIComponent(rawServerName || cleanUser)}` +
          (selectedPaymentMethod === 'saldo' ? '&gateway=saldo' : '') +
          (token ? `&user_token=${encodeURIComponent(token)}` : '') +
          (isMember ? `&member_discount=${Math.round(baseCost * 0.05)}` : '');

        const res = await fetch(queryUrl);
        const json = await res.json();

        if (json.status && json.data) {
          currentOrderId = json.data.order_id;
          currentOrderSecret = json.data.order_secret || '';

          // Save local order reference for riwayat
          try {
            let myOrders = JSON.parse(localStorage.getItem('zyro_buyer_orders') || '[]');
            if (!myOrders.includes(currentOrderId)) {
              myOrders.unshift(currentOrderId);
              localStorage.setItem('zyro_buyer_orders', JSON.stringify(myOrders));
            }
          } catch (e) {}

          // A. PAID INSTANTLY WITH SALDO
          if (json.data.paid_with_saldo) {
            if (typeof json.data.new_balance !== 'undefined') {
              userBalance = json.data.new_balance;
              try {
                const raw = localStorage.getItem('seika_user_data');
                if (raw) {
                  const u = JSON.parse(raw);
                  u.balance = userBalance;
                  localStorage.setItem('seika_user_data', JSON.stringify(u));
                }
              } catch (_) {}
              if (typeof window.refreshUserBalance === 'function') {
                window.refreshUserBalance();
              }
            }

            // Transition directly to In-Place Success View
            document.getElementById('pcmViewConfig').style.display = 'none';
            document.getElementById('pcmViewQris').style.display = 'none';
            document.getElementById('pcmViewSuccess').style.display = 'flex';

            const creds = json.data.akun || json.data.accountDetails || 'Panel Pterodactyl Anda telah aktif! Kredensial telah dikirim ke ' + rawEmail;
            const targetEl = document.getElementById('pcmSuccessCredsWrap') || document.getElementById('pcmSuccessCreds');
            if (targetEl) {
              targetEl.innerHTML = renderCredentialCard(creds);
            }
            return;
          }

          // B. PAID VIA QRIS OTOMATIS
          document.getElementById('pcmViewConfig').style.display = 'none';
          document.getElementById('pcmViewQris').style.display = 'flex';
          document.getElementById('pcmViewSuccess').style.display = 'none';

          document.getElementById('pcmQrisImg').src = json.data.qr_url;
          document.getElementById('pcmQrisAmount').textContent = formatRupiah(json.data.total_payment || finalCost);
          document.getElementById('pcmQrisOrderId').textContent = currentOrderId;

          // Start Timer (15 minutes countdown)
          let secondsLeft = 15 * 60;
          const timerEl = document.getElementById('pcmQrisTimer');
          if (timerInterval) clearInterval(timerInterval);
          timerInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
              clearInterval(timerInterval);
              timerEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Waktu Habis';
              return;
            }
            const m = Math.floor(secondsLeft / 60);
            const s = secondsLeft % 60;
            timerEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${m}:${s < 10 ? '0' : ''}${s}`;
          }, 1000);

          // Start Live Status Polling (every 3 seconds)
          if (pollInterval) clearInterval(pollInterval);
          pollInterval = setInterval(async () => {
            await window.PanelConfigModal.checkStatus(currentOrderId);
          }, 3000);
        } else {
          alert(json.message || 'Gagal membuat pesanan panel. Mohon coba beberapa saat lagi.');
        }
      } catch (err) {
        console.error('[PanelConfigModal Payment Error]:', err);
        alert('Terjadi kesalahan jaringan saat memproses pesanan.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    },

    checkManual: async function () {
      if (!currentOrderId) return;
      const btn = document.getElementById('pcmCheckQrisBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa Pembayaran...';
      await this.checkStatus(currentOrderId, true);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Cek Status Pembayaran';
    },

    checkStatus: async function (orderId, isManual) {
      try {
        const secParam = currentOrderSecret ? `&order_secret=${encodeURIComponent(currentOrderSecret)}` : '';
        const res = await fetch(`/paymentku?action=check&order_id=${encodeURIComponent(orderId)}${secParam}`);
        const json = await res.json();
        if (json.status && json.data) {
          const st = String(json.data.status || '').toLowerCase();
          if (st === 'completed' || st === 'success' || st === 'settlement') {
            if (pollInterval) clearInterval(pollInterval);
            if (timerInterval) clearInterval(timerInterval);

            // Render Success Creds
            document.getElementById('pcmViewConfig').style.display = 'none';
            document.getElementById('pcmViewQris').style.display = 'none';
            document.getElementById('pcmViewSuccess').style.display = 'flex';

            const details = json.data.accountDetails || json.data.akun || 'Panel Anda sedang aktif. Cek email untuk detail login.';
            const targetEl = document.getElementById('pcmSuccessCredsWrap') || document.getElementById('pcmSuccessCreds');
            if (targetEl) {
              targetEl.innerHTML = renderCredentialCard(details);
            }

            if (json.data.panelDomain) {
              const openLink = document.getElementById('pcmOpenPanelLink');
              if (openLink) openLink.href = json.data.panelDomain;
            }
          } else if (isManual) {
            alert('Pembayaran belum terdeteksi. Pastikan Anda telah menyelesaikan pembayaran QRIS.');
          }
        }
      } catch (e) {
        console.warn('[Check Order Error]:', e);
      }
    },

    copyCredentials: function () {
      const creds = _lastRawCredentials || (document.getElementById('pcmSuccessCreds') ? document.getElementById('pcmSuccessCreds').textContent : '');
      if (!creds) return;
      const btn = document.getElementById('pcmCopyCredBtn');
      const doFeedback = () => {
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Berhasil Disalin!</span>';
          setTimeout(() => { btn.innerHTML = orig; }, 2000);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(creds).then(doFeedback).catch(() => {
          fallbackCopy(creds);
          doFeedback();
        });
      } else {
        fallbackCopy(creds);
        doFeedback();
      }
    },

    copyField: function (text, btnEl) {
      if (!text) return;
      const doFeedback = () => {
        if (btnEl) {
          const orig = btnEl.innerHTML;
          btnEl.innerHTML = '<i class="fa-solid fa-check"></i> <span>Disalin</span>';
          setTimeout(() => { btnEl.innerHTML = orig; }, 1800);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(doFeedback).catch(() => {
          fallbackCopy(text);
          doFeedback();
        });
      } else {
        fallbackCopy(text);
        doFeedback();
      }
    },

    togglePassPeek: function (btnEl) {
      if (!btnEl) return;
      const cfield = btnEl.closest('.pcm-cfield');
      if (!cfield) return;
      const valEl = cfield.querySelector('.pcm-cfield-val');
      if (!valEl) return;
      const rawPass = valEl.getAttribute('data-raw-pass');
      if (!rawPass) return;
      const isMasked = valEl.getAttribute('data-masked') === 'true';
      if (isMasked) {
        valEl.textContent = rawPass;
        valEl.setAttribute('data-masked', 'false');
        btnEl.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        btnEl.title = 'Sembunyikan Password';
      } else {
        valEl.textContent = '••••••••••••';
        valEl.setAttribute('data-masked', 'true');
        btnEl.innerHTML = '<i class="fa-solid fa-eye"></i>';
        btnEl.title = 'Lihat Password';
      }
    }
  };
})();
