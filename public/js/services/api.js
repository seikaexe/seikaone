/**
 * SeikaOne.id - Unified API Client Service
 * Centralized error handling, automatic auth token attachment, and defensive response parsing
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ZyroAPI = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function getStoredToken() {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('seika_user_token') ||
           localStorage.getItem('user_token') ||
           sessionStorage.getItem('seika_user_token') ||
           sessionStorage.getItem('user_token') ||
           localStorage.getItem('zyro_admin_token') || '';
  }

  async function request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = options.token || getStoredToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const config = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(endpoint, config);
      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { status: false, message: `HTTP ${response.status}: Respon server tidak valid.` };
      }

      if (!response.ok && data.status !== false) {
        data.status = false;
        data.message = data.message || `Terjadi kesalahan (Kode: ${response.status})`;
      }

      return data;
    } catch (networkErr) {
      console.error('[API Network Error]:', networkErr);
      return {
        status: false,
        message: 'Koneksi ke server gagal. Periksa jaringan internet Anda.'
      };
    }
  }

  return {
    get: (url, opts) => request(url, { ...opts, method: 'GET' }),
    post: (url, body, opts) => request(url, { ...opts, method: 'POST', body }),
    put: (url, body, opts) => request(url, { ...opts, method: 'PUT', body }),
    del: (url, opts) => request(url, { ...opts, method: 'DELETE' }),
    request,
    getStoredToken
  };
});
