const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- In-memory data stores (mock DB) ----
const users = new Map();          // token -> user
const usersByEmail = new Map();
const apiKeys = new Map();        // token -> {apiKey, apiSecret, status, ipWhitelist}
const orders = new Map();
const servers = new Map();
const bansosClaims = new Map();
const warranties = new Map();
const chatMessages = [];
const commissions = new Map();
const cpanelActivities = [];
const roleQris = new Map();
const pendingRoleQris = new Map();
const taxLogs = [];
const adpServers = new Map();
const communityUsers = [];
const products = [
  { id: 'vps-do-2gb', name: 'VPS DigitalOcean 2GB', category: 'VPS', price: 35000, stock: 99, desc: 'VPS DO SG, 2GB RAM, 1 vCPU, 50GB SSD NVMe, 2TB BW' },
  { id: 'vps-do-4gb', name: 'VPS DigitalOcean 4GB', category: 'VPS', price: 65000, stock: 99, desc: 'VPS DO SG, 4GB RAM, 2 vCPU, 80GB SSD NVMe' },
  { id: 'vps-do-8gb', name: 'VPS DigitalOcean 8GB', category: 'VPS', price: 120000, stock: 99, desc: 'VPS DO SG, 8GB RAM, 4 vCPU, 160GB SSD NVMe' },
  { id: 'panel-node-pub', name: 'Panel Pterodactyl Node Public 4GB', category: 'Panel', price: 15000, stock: 99, desc: 'Panel Node.js/Python, 4GB RAM, Auto Deploy 1-3s, Anti-DDoS' },
  { id: 'panel-node-priv', name: 'Panel Pterodactyl Private 32GB', category: 'Panel', price: 85000, stock: 99, desc: 'Private Node 32GB RAM, Dedicated, Garansi 30 Hari' },
  { id: 'panel-node-ent', name: 'Panel Enterprise 64GB', category: 'Panel', price: 150000, stock: 50, desc: 'Enterprise Node 64GB, Priority Support' },
  { id: 'script-wa-md', name: 'Script Bot WhatsApp Multi-Device', category: 'Script', price: 75000, stock: 99, desc: 'Source code bot WA MD, No ENC, update gratis' },
  { id: 'script-tg', name: 'Script Bot Telegram', category: 'Script', price: 50000, stock: 99, desc: 'Bot Telegram Node.js, clean architecture' },
  { id: 'yt-premium-1y', name: 'YouTube Premium 1 Tahun', category: 'Digital', price: 25000, stock: 99, desc: 'Akun YouTube Premium 1 tahun, garansi' },
  { id: 'canva-pro-1y', name: 'Canva Pro 1 Tahun', category: 'Digital', price: 30000, stock: 99, desc: 'Canva Pro 1 tahun, email pribadi' },
  { id: 'capcut-pro', name: 'CapCut Pro', category: 'Digital', price: 20000, stock: 99, desc: 'CapCut Pro 1 tahun' },
  { id: 'nokos-wa', name: 'Nokos OTP WhatsApp', category: 'Nokos', price: 5000, stock: 999, desc: 'Nomor virtual OTP WhatsApp instan' },
  { id: 'nokos-tg', name: 'Nokos OTP Telegram', category: 'Nokos', price: 5000, stock: 999, desc: 'Nomor virtual OTP Telegram instan' }
];

// ---- Helpers ----
function getUser(token) {
  if (!token) return null;
  return users.get(token) || null;
}
function authMiddleware(req, res, next) {
  const token = req.query.token || req.body?.token || req.headers['x-auth-token'] || req.headers.authorization?.replace('Bearer ', '');
  const user = getUser(token);
  if (!user) return res.status(401).json({ status: false, message: 'Unauthorized' });
  req.user = user;
  req.token = token;
  next();
}
function ok(res, data = {}) { res.json({ status: true, ...data }); }
function fail(res, msg, code = 400) { res.status(code).json({ status: false, message: msg }); }

// ---- Realtime stats proxy (fallback) ----
let cachedStats = { status: true, visitors: 2175, total_users: 777, total_transactions: 1287, uptime: 1988169, server_time: Date.now() };
let cachedSys = { status: true, source: 'push_legal_public', node_name: 'SERVER LEGAL PUBLIK', node_slot: 4, is_live: true, cpu: 47, cpu_cores: 16, cpu_model: 'Intel Xeon CPU E5-2697 v2 @ 2.70GHz', cpu_label: '16 Core Intel Xeon', ram_pct: 73, ram_used_mb: 47122, ram_total_mb: 64396, ram_used_gb: '46.0', ram_total_gb: '64', ram_label: '46.0 / 64 GB', disk_pct: 84, disk_label: '188 / 250 GB NVMe', uptime: 1988175, load: 16.76, lag_ms: 24, cores: 16, store_status: 'Online', store_label: 'Auto Provisioning', received_at: new Date().toISOString() };

async function refreshStats() {
  try {
    const r = await fetch('https://zyrostore.id/api/stats', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (r.ok) cachedStats = await r.json();
  } catch (e) {}
  try {
    const r = await fetch('https://zyrostore.id/api/sys-stats', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (r.ok) { const d = await r.json(); cachedSys = d; }
  } catch (e) {}
}
refreshStats();
setInterval(refreshStats, 30000);

// ---- Auth ----
app.get('/api/auth/config', (req, res) => ok(res, { googleClientId: process.env.GOOGLE_CLIENT_ID || '', appName: 'SeikaOne' }));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 'Email dan password wajib diisi');
  const existing = usersByEmail.get(email);
  if (existing && existing.password !== password) return fail(res, 'Password salah');
  let user;
  if (!existing) {
    user = { id: uuidv4(), name: email.split('@')[0], email, password, balance: 50000, role: 'member', avatar: '/assets/logo.png', createdAt: Date.now(), telegram: null, discount: 0.05 };
    usersByEmail.set(email, user);
  } else {
    user = existing;
  }
  const token = uuidv4();
  users.set(token, user);
  ok(res, { token, user: { ...user, password: undefined } });
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body || {};
  // Mock: accept any credential, create user from email in token (if present) else guest
  let email = 'googleuser@seikaone.id';
  try {
    if (credential) {
      const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
      if (payload.email) email = payload.email;
    }
  } catch (e) {}
  let user = usersByEmail.get(email);
  if (!user) {
    user = { id: uuidv4(), name: email.split('@')[0], email, password: null, balance: 50000, role: 'member', avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c', createdAt: Date.now(), telegram: null, discount: 0.05 };
    usersByEmail.set(email, user);
  }
  const token = uuidv4();
  users.set(token, user);
  ok(res, { token, user: { ...user, password: undefined } });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  const user = getUser(token);
  if (!user) return fail(res, 'Unauthorized', 401);
  ok(res, { user: { ...user, password: undefined } });
});

app.post('/api/auth/update-profile', authMiddleware, (req, res) => {
  const { name, avatar } = req.body || {};
  if (name) req.user.name = name;
  if (avatar) req.user.avatar = avatar;
  ok(res, { user: { ...req.user, password: undefined } });
});

// ---- Stats ----
app.get('/api/stats', (req, res) => {
  cachedStats.server_time = Date.now();
  res.json(cachedStats);
});
app.get('/api/sys-stats', (req, res) => {
  cachedSys.received_at = new Date().toISOString();
  cachedSys.uptime = (cachedSys.uptime || 0) + 4;
  res.json(cachedSys);
});
app.get('/api/realtime/stats', (req, res) => res.json(cachedStats));
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const iv = setInterval(() => {
    res.write(`data: ${JSON.stringify({ stats: cachedStats, sys: cachedSys })}\n\n`);
  }, 4000);
  req.on('close', () => clearInterval(iv));
});

// ---- Products/Services ----
app.get('/api/v1/services', (req, res) => {
  const cat = req.query.category;
  const list = cat ? products.filter(p => p.category === cat) : products;
  ok(res, { services: list });
});
app.get('/api/v1/status', (req, res) => ok(res, { status: 'online', version: '1.0', uptime: cachedStats.uptime }));
app.get('/api/v1/profile', authMiddleware, (req, res) => ok(res, { user: { ...req.user, password: undefined } }));
app.post('/api/v1/order', authMiddleware, (req, res) => {
  const { serviceId, quantity = 1 } = req.body || {};
  const svc = products.find(p => p.id === serviceId);
  if (!svc) return fail(res, 'Service not found');
  const total = svc.price * quantity;
  if (req.user.balance < total) return fail(res, 'Saldo tidak cukup');
  req.user.balance -= total;
  const orderId = 'ORD-' + Date.now();
  const order = { id: orderId, userId: req.user.id, serviceId, quantity, total, status: 'processing', createdAt: Date.now(), details: `Auto provisioned: ${svc.name}` };
  orders.set(orderId, order);
  setTimeout(() => { order.status = 'completed'; }, 3000);
  ok(res, { order, message: 'Order berhasil diproses' });
});

// ---- User ----
app.get('/api/user/api-key', (req, res) => {
  const token = req.query.token;
  const user = getUser(token);
  if (!user) return fail(res, 'Unauthorized', 401);
  const data = apiKeys.get(token);
  if (!data) return ok(res, { hasKey: false });
  ok(res, { hasKey: true, data: { apiKey: data.apiKey, apiSecretMasked: data.apiSecret.slice(0, 8) + '•'.repeat(24), status: data.status, ipWhitelist: data.ipWhitelist } });
});
app.post('/api/user/api-key/generate', (req, res) => {
  const token = req.body?.token;
  const user = getUser(token);
  if (!user) return fail(res, 'Unauthorized', 401);
  const apiKey = 'sk_live_' + uuidv4().replace(/-/g, '');
  const apiSecret = 'ss_' + uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
  const data = { apiKey, apiSecret, status: 'ACTIVE', ipWhitelist: [] };
  apiKeys.set(token, data);
  ok(res, { message: 'API Key berhasil dibuat', data: { apiKey, apiSecret } });
});
app.post('/api/user/api-key/revoke', (req, res) => {
  const token = req.body?.token;
  const data = apiKeys.get(token);
  if (data) data.status = 'REVOKED';
  ok(res, { message: 'API Key dinonaktifkan' });
});
app.post('/api/user/api-key/ip-whitelist', (req, res) => {
  const token = req.body?.token;
  const data = apiKeys.get(token);
  if (!data) return fail(res, 'No API key');
  const raw = req.body.ipWhitelist || '';
  data.ipWhitelist = raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  ok(res, { message: 'IP Whitelist disimpan' });
});
app.get('/api/user/balance', authMiddleware, (req, res) => ok(res, { balance: req.user.balance }));
app.get('/api/user/info', authMiddleware, (req, res) => ok(res, { user: { ...req.user, password: undefined } }));
app.get('/api/user/profile', authMiddleware, (req, res) => ok(res, { user: { ...req.user, password: undefined } }));
app.get('/api/user/orders', (req, res) => {
  const token = req.query.token;
  const user = getUser(token);
  if (!user) return fail(res, 'Unauthorized', 401);
  const list = [...orders.values()].filter(o => o.userId === user.id);
  ok(res, { orders: list });
});
app.get('/api/user/commissions', (req, res) => {
  const token = req.query.token;
  const user = getUser(token);
  if (!user) return fail(res, 'Unauthorized', 401);
  ok(res, { commissions: commissions.get(token) || [] });
});
app.post('/api/user/sync-telegram', authMiddleware, (req, res) => {
  req.user.telegram = req.body?.telegramId || req.user.telegram;
  ok(res, { message: 'Telegram tersinkronisasi' });
});
app.post('/api/user/telegram-otp/request', authMiddleware, (req, res) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  req.user._otp = code;
  ok(res, { message: 'OTP dikirim', code: process.env.NODE_ENV === 'production' ? undefined : code });
});
app.post('/api/user/telegram-otp/verify', authMiddleware, (req, res) => {
  if (String(req.body?.code) === String(req.user._otp)) {
    req.user.telegramVerified = true;
    ok(res, { message: 'Telegram terverifikasi' });
  } else {
    fail(res, 'Kode OTP salah');
  }
});

// ---- Orders track ----
app.get('/api/order/track', (req, res) => {
  const q = req.query.q || '';
  let found = [...orders.values()].filter(o => o.id === q || o.id.includes(q));
  if (found.length === 0) found = [...orders.values()].slice(0, 5);
  ok(res, { orders: found, results: found });
});

// ---- Leaderboard & Hall of Fame ----
app.get('/api/leaderboard', (req, res) => {
  res.json({ status: true, stats: { totalTrx: orders.size + 951, totalRevenue: 6716254, totalBuyers: users.size + 777, totalTrackedBuyers: 445 }, leaderboard: [
    { rank: 1, key: 'usr249893', rawName: 'Akbar', name: 'Ak***ar', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocK0rMox65B4A7IcK87v4MeBqSM8T7yzCYp5yKRL7fWq_jSx0w=s96-c', totalSpent: 209000, totalOrders: 1, lastTransaction: Date.now(), roleKey: 'free', roleLabel: 'Free Member' },
    { rank: 2, key: 'usr9912', rawName: 'Budi', name: 'Bu***di', avatar: 'https://lh3.googleusercontent.com/a/default=s96-c', totalSpent: 150000, totalOrders: 3, lastTransaction: Date.now(), roleKey: 'member', roleLabel: 'Member' }
  ] });
});
app.get('/api/hall-of-fame', (req, res) => {
  res.json({ status: true, data: { bugHunters: [
    { id: 'USR-1789283123762-C9C65415', name: 'Pisxyzz', maskedName: 'Pi***zz', avatar: '/assets/logo.png', roleBadge: 'BUG HUNTER', roleColor: '#10b981', totalBounty: 20000, reportsCount: 2, title: 'Penemu Bug Web & Keamanan' }
  ] } });
});

// ---- Bansos ----
app.get('/api/bansos/info', (req, res) => ok(res, { deviceToken: req.query.deviceToken, claimed: bansosClaims.has(req.query.deviceToken), info: 'Bansos Panel 1GB gratis untuk pembelajaran' }));
app.post('/api/bansos/claim', authMiddleware, (req, res) => {
  const token = req.body?.deviceToken || req.token;
  if (bansosClaims.has(token)) return fail(res, 'Sudah diklaim');
  bansosClaims.set(token, { userId: req.user.id, claimedAt: Date.now() });
  ok(res, { message: 'Bansos 1GB berhasil diklaim', panel: { ram: '1GB', status: 'active' } });
});

// ---- Warranty ----
app.get('/api/warranty/status', (req, res) => {
  const q = req.query.q || '';
  ok(res, { query: q, status: 'active', warranty: { id: q, product: 'VPS DigitalOcean 8GB', daysLeft: 25, status: 'active' } });
});
app.post('/api/warranty/claim', authMiddleware, (req, res) => {
  const id = uuidv4();
  warranties.set(id, { id, userId: req.user.id, ...req.body, status: 'pending', createdAt: Date.now() });
  ok(res, { message: 'Klaim garansi diterima', claimId: id });
});
app.post('/api/warranty/message', authMiddleware, (req, res) => {
  ok(res, { message: 'Pesan terkirim ke CS' });
});

// ---- CPanel ----
app.get('/api/cpanel/overview', authMiddleware, (req, res) => {
  ok(res, { overview: { totalServers: servers.size, activeServers: servers.size, cpu: cachedSys.cpu, ram: cachedSys.ram_pct, uptime: cachedSys.uptime } });
});
app.get('/api/cpanel/my-servers', authMiddleware, (req, res) => {
  const list = [...servers.values()].filter(s => s.userId === req.user.id);
  ok(res, { servers: list });
});
app.post('/api/cpanel/create-server', authMiddleware, (req, res) => {
  const id = uuidv4();
  const srv = { id, userId: req.user.id, name: req.body?.name || 'Server-' + id.slice(0, 6), status: 'running', ram: req.body?.ram || '1GB', createdAt: Date.now(), ip: '103.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) };
  servers.set(id, srv);
  cpanelActivities.push({ type: 'create', serverId: id, userId: req.user.id, at: Date.now() });
  ok(res, { server: srv, message: 'Server berhasil dibuat' });
});
app.get('/api/cpanel/servers/:id', authMiddleware, (req, res) => {
  const s = servers.get(req.params.id);
  if (!s) return fail(res, 'Server not found', 404);
  ok(res, { server: s });
});
app.delete('/api/cpanel/servers/:id', authMiddleware, (req, res) => {
  servers.delete(req.params.id);
  ok(res, { message: 'Server dihapus' });
});
app.post('/api/cpanel/servers/:id/reset-password', authMiddleware, (req, res) => {
  ok(res, { message: 'Password direset', newPassword: 'tmp_' + Math.random().toString(36).slice(2, 10) });
});
app.get('/api/cpanel/nodes-status', (req, res) => {
  ok(res, { nodes: [
    { id: 1, name: 'Node SG-1', status: 'online', cpu: 40, ram: 60 },
    { id: 2, name: 'Node US-1', status: 'online', cpu: 35, ram: 55 },
    { id: 3, name: 'Node ID-1', status: 'online', cpu: 50, ram: 70 }
  ] });
});
app.get('/api/cpanel/activities', authMiddleware, (req, res) => ok(res, { activities: cpanelActivities.slice(-50) }));
app.post('/api/cpanel/chat', authMiddleware, (req, res) => {
  const msg = { id: uuidv4(), userId: req.user.id, message: req.body?.message, from: 'user', at: Date.now() };
  chatMessages.push(msg);
  // auto reply
  setTimeout(() => chatMessages.push({ id: uuidv4(), userId: req.user.id, message: 'Halo! Ada yang bisa kami bantu?', from: 'cs', at: Date.now() }), 800);
  ok(res, { message: 'Terkirim', reply: 'Halo! Ada yang bisa kami bantu?' });
});
app.get('/api/cpanel/community-users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const q = (req.query.q || '').toLowerCase();
  const role = req.query.role || '';
  let list = communityUsers;
  if (q) list = list.filter(u => u.name.toLowerCase().includes(q));
  if (role) list = list.filter(u => u.role === role);
  const start = (page - 1) * limit;
  ok(res, { users: list.slice(start, start + limit), total: list.length, page, limit });
});

// Admin endpoints (mock, open)
app.get('/api/cpanel/admin/role-proofs', (req, res) => ok(res, { proofs: [] }));
app.post('/api/cpanel/admin/update-user-role', (req, res) => ok(res, { message: 'Role updated' }));
app.get('/api/cpanel/admin/vip-buyers', (req, res) => ok(res, { buyers: [] }));
app.post('/api/cpanel/admin/vip-buyers/server-power', (req, res) => ok(res, { message: 'Power action done' }));
app.get('/api/cpanel/admin/tax/logs', (req, res) => ok(res, { logs: taxLogs }));
app.get('/api/cpanel/admin/taxes', (req, res) => ok(res, { taxes: [] }));
app.post('/api/cpanel/admin/tax/*', (req, res) => ok(res, { message: 'Tax action done' }));
app.get('/api/cpanel/admin/tax/*', (req, res) => ok(res, { data: {} }));
app.post('/api/cpanel/admin/broadcast-status', (req, res) => ok(res, { status: 'idle' }));
app.post('/api/cpanel/admin/start-broadcast', (req, res) => ok(res, { message: 'Broadcast started' }));
app.post('/api/cpanel/admin/stop-broadcast', (req, res) => ok(res, { message: 'Broadcast stopped' }));
app.post('/api/cpanel/admin/test-broadcast', (req, res) => ok(res, { message: 'Test sent' }));
app.post('/api/cpanel/admin/test-email-notification', (req, res) => ok(res, { message: 'Email sent' }));
app.post('/api/cpanel/admin/upload-proof', (req, res) => ok(res, { message: 'Proof uploaded' }));
app.get('/api/cpanel/admin/download-agent', (req, res) => res.status(200).send('agent-mock'));
app.post('/api/cpanel/admin/reset-cadp', (req, res) => ok(res, { message: 'CADP reset' }));
app.post('/api/cpanel/partner/assign-sub-role', (req, res) => ok(res, { message: 'Sub-role assigned' }));
app.get('/api/cpanel/cadp/status', (req, res) => ok(res, { status: 'active' }));
app.post('/api/cpanel/cadp/create', (req, res) => ok(res, { message: 'CADP created', id: uuidv4() }));
app.post('/api/cpanel/create-role-qris', (req, res) => {
  const id = uuidv4();
  pendingRoleQris.set(id, { id, ...req.body, status: 'pending', createdAt: Date.now() });
  ok(res, { paymentId: id, qris: '000201010212...', amount: req.body?.amount || 0 });
});
app.get('/api/cpanel/check-role-qris', (req, res) => {
  const p = pendingRoleQris.get(req.query.paymentId);
  ok(res, { status: p ? 'paid' : 'pending', payment: p });
});
app.post('/api/cpanel/cancel-role-qris', (req, res) => ok(res, { message: 'Cancelled' }));
app.get('/api/cpanel/pending-role-qris', (req, res) => ok(res, { payments: [...pendingRoleQris.values()] }));
app.post('/api/cpanel/tax/create-qris', (req, res) => ok(res, { paymentId: uuidv4(), qris: '000201010212...' }));
app.post('/api/cpanel/tax/pay-balance', (req, res) => ok(res, { message: 'Paid' }));

// ---- Eggs ----
app.get('/api/eggs', (req, res) => ok(res, { eggs: [
  { id: 'egg-nodejs', name: 'Node.js 20', description: 'Node.js 20 runtime' },
  { id: 'egg-python', name: 'Python 3.11', description: 'Python 3.11 runtime' },
  { id: 'egg-java', name: 'Java 17', description: 'Java 17 runtime' }
] }));

// ---- Auth config etc ----
app.get('/api/auth/config', (req, res) => ok(res, { googleClientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id', appName: 'SeikaOne' }));

// ---- Profile update ----
app.post('/api/v1/profile', authMiddleware, (req, res) => ok(res, { user: { ...req.user, password: undefined } }));

// ---- Bansos admin etc already ----

// ---- Catch-all for unimplemented API: return success mock ----
app.all('/api/*', (req, res) => {
  if (res.headersSent) return;
  res.json({ status: true, message: 'OK (mock)', path: req.path, method: req.method });
});

// ---- Static files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- SPA fallback ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`SeikaOne running on http://localhost:${PORT}`));
