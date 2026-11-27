/**
 * SeikaOne.id - Module: User Role Management Modal
 * Modularized user role actions, defensive checks, and modern confirmation integration
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroUserRoleModal = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Remove a specific role from user with modern confirmation dialog
   */
  async function removeRole({ targetUserId, roleKey, roleLabel, isOwner = false, onComplete } = {}) {
    if (!targetUserId || !roleKey) return;

    // Use Modern Confirmation Modal
    const confirmed = await ZyroConfirm({
      title: 'Hapus Role Pengguna',
      tag: 'KONFIRMASI ROLE',
      message: `Apakah Anda yakin ingin mencabut role "<b>${roleLabel || roleKey}</b>" dari pengguna ini?`,
      icon: 'fa-solid fa-user-xmark',
      isDestructive: true,
      confirmText: 'Ya, Hapus Role',
      cancelText: 'Batal'
    });

    if (!confirmed) return;

    const endpoint = isOwner ? '/api/cpanel/admin/update-user-role' : '/api/cpanel/partner/assign-sub-role';

    try {
      const res = await ZyroAPI.post(endpoint, {
        targetUserId,
        newRole: roleKey,
        action: 'remove'
      });

      if (res && res.status) {
        ZyroToast.success(res.message || `Role ${roleLabel || roleKey} berhasil dihapus!`);
        if (typeof onComplete === 'function') onComplete(res);
      } else {
        ZyroToast.error(res?.message || 'Gagal menghapus role pengguna.');
      }
    } catch (err) {
      ZyroToast.error(err.message || 'Terjadi kesalahan sistem.');
    }
  }

  return {
    removeRole
  };
});
