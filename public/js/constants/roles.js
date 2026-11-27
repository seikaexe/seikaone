/**
 * SeikaOne.id - Centralized Role Constants
 * Configuration of role badges, labels, categories, and colors
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroRoles = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ROLE_CONFIG = {
    // Server Legal
    free: { key: 'free', label: 'Member Biasa (Free)', badge: 'FREE', color: '#64748b', category: 'legal' },
    reseller: { key: 'reseller', label: 'Public Reseller', badge: 'RESELLER', color: '#38bdf8', category: 'legal' },
    pt: { key: 'pt', label: 'Public PT', badge: 'PT', color: '#0ea5e9', category: 'legal' },
    adp: { key: 'adp', label: 'Public ADP', badge: 'ADP', color: '#0284c7', category: 'legal' },
    owner: { key: 'owner', label: 'Public Owner', badge: 'OWNER', color: '#f59e0b', category: 'legal' },
    ceo: { key: 'ceo', label: 'Public CEO', badge: 'CEO', color: '#d97706', category: 'legal' },

    // Legal Private & Enterprise
    private_reseller: { key: 'private_reseller', label: 'Private Reseller', badge: 'PRIV RESS', color: '#10b981', category: 'legal' },
    private_pt: { key: 'private_pt', label: 'Private PT', badge: 'PRIV PT', color: '#059669', category: 'legal' },
    enterprise_reseller: { key: 'enterprise_reseller', label: 'Enterprise Reseller', badge: 'ENT RESS', color: '#8b5cf6', category: 'legal' },
    enterprise_pt: { key: 'enterprise_pt', label: 'Enterprise PT', badge: 'ENT PT', color: '#7c3aed', category: 'legal' },
    premium_reseller: { key: 'premium_reseller', label: 'Premium Reseller', badge: 'PREM RESS', color: '#06b6d4', category: 'legal' },
    premium_partner: { key: 'premium_partner', label: 'Premium Partner', badge: 'PARTNER', color: '#0891b2', category: 'legal' },
    premium_owner: { key: 'premium_owner', label: 'Premium Owner', badge: 'PREM OWNER', color: '#eab308', category: 'legal' },

    // Server Ilegal (Cluster 1-4)
    illegal_ress: { key: 'illegal_ress', label: 'Ilegal Reseller', badge: 'ILEGAL RESS', color: '#ec4899', category: 'illegal' },
    illegal_prem: { key: 'illegal_prem', label: 'Ilegal Premium', badge: 'ILEGAL PREM', color: '#f43f5e', category: 'illegal' },
    illegal_adp: { key: 'illegal_adp', label: 'Ilegal ADP', badge: 'ILEGAL ADP', color: '#e11d48', category: 'illegal' },
    illegal_pt: { key: 'illegal_pt', label: 'Ilegal PT', badge: 'ILEGAL PT', color: '#a855f7', category: 'illegal' },
    illegal_tk: { key: 'illegal_tk', label: 'Ilegal TK', badge: 'ILEGAL TK', color: '#9333ea', category: 'illegal' },
    illegal_owner: { key: 'illegal_owner', label: 'Ilegal Owner', badge: 'ILG OWNER', color: '#f97316', category: 'illegal' },
    illegal_ceo: { key: 'illegal_ceo', label: 'Ilegal CEO', badge: 'ILG CEO', color: '#ea580c', category: 'illegal' },
    illegal_security: { key: 'illegal_security', label: 'Ilegal Security', badge: 'SECURITY', color: '#6366f1', category: 'illegal' },
    illegal_svip: { key: 'illegal_svip', label: 'Ilegal SVIP', badge: 'SVIP', color: '#4f46e5', category: 'illegal' },
    illegal_dev: { key: 'illegal_dev', label: 'Ilegal Developer', badge: 'DEVELOPER', color: '#3b82f6', category: 'illegal' },
    illegal_pemilik: { key: 'illegal_pemilik', label: 'Ilegal Pemilik', badge: 'PEMILIK', color: '#e11d48', category: 'illegal' },
    illegal_cofounder: { key: 'illegal_cofounder', label: 'Ilegal Co-Founder', badge: 'CO-FOUNDER', color: '#db2777', category: 'illegal' },
    illegal_king: { key: 'illegal_king', label: 'Ilegal KING', badge: 'KING', color: '#d946ef', category: 'illegal' },
    illegal_imo: { key: 'illegal_imo', label: 'Ilegal Immortal', badge: 'IMMORTAL', color: '#c026d3', category: 'illegal' },
    illegal_god: { key: 'illegal_god', label: 'Ilegal GOD', badge: 'GOD', color: '#dc2626', category: 'illegal' },

    // Role Khusus & Kehormatan / Reward Komunitas
    bug_hunter: { key: 'bug_hunter', label: 'Bug Hunter (Penemu Bug)', badge: 'BUG HUNTER', color: '#10b981', category: 'special', icon: 'fa-solid fa-bug' },
    top_leaderboard: { key: 'top_leaderboard', label: 'Top Leaderboard (Top Trx)', badge: 'TOP LEADERBOARD', color: '#f59e0b', category: 'special', icon: 'fa-solid fa-trophy' },
    developer: { key: 'developer', label: 'Web Developer', badge: 'DEVELOPER', color: '#3b82f6', category: 'special', icon: 'fa-solid fa-code' },
    founder: { key: 'founder', label: 'Founder & Co-Founder', badge: 'FOUNDER', color: '#8b5cf6', category: 'special', icon: 'fa-solid fa-crown' }
  };

  function getRoleInfo(roleKey) {
    if (!roleKey) return ROLE_CONFIG.free;
    const cleanKey = String(roleKey).trim().toLowerCase();
    return ROLE_CONFIG[cleanKey] || {
      key: cleanKey,
      label: cleanKey.replace(/_/g, ' ').toUpperCase(),
      badge: cleanKey.slice(0, 10).toUpperCase(),
      color: '#64748b',
      category: cleanKey.startsWith('illegal_') ? 'illegal' : 'legal'
    };
  }

  return {
    ROLE_CONFIG,
    getRoleInfo
  };
});
