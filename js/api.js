/**
 * API.JS
 * Satu titik pemanggilan ke Apps Script Web App.
 * GANTI API_URL kalau deployment Apps Script berubah.
 *
 * CATATAN PENTING:
 * Dikirim sebagai GET dengan seluruh payload digabung jadi satu query
 * parameter ("data"), BUKAN sebagai POST body. Ini untuk menghindari bug
 * umum Apps Script Web App: request POST ke .../exec selalu di-redirect
 * oleh Google, dan redirect itu bisa membuat browser mengubah method
 * jadi GET sekaligus MEMBUANG body (termasuk token login). Dengan GET +
 * data di query string, redirect tetap membawa semua data karena sudah
 * menyatu di URL sejak awal.
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbygPINTDmVzmgnSMiMov96EkZLpy55k6xuodwWfVgGcNg3BJkVkOEkCZ494rrywOnAeKA/exec';

/**
 * @param {string} action  salah satu ACTIONS di backend (LOGIN, GET_DASHBOARD, dst)
 * @param {Object} params  payload tambahan (password, tanggal, dsb)
 * @returns {Promise<{status:string, message:string, data?:any, code?:string}|null>}
 */
async function callApi(action, params) {
  params = params || {};
  const body = Object.assign({ action: action, token: getToken() }, params);
  const url = API_URL + '?data=' + encodeURIComponent(JSON.stringify(body));

  try {
    const res = await fetch(url, { method: 'GET' });
    const json = await res.json();

    if (json && json.status === 'error' && json.code === 'AUTH_ERROR') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.NAMA);
      if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
      }
    }

    return json;
  } catch (err) {
    return { status: 'error', message: 'Gagal menghubungi server. Cek koneksi internet.', code: 'NETWORK_ERROR' };
  }
}
