/**
 * API.JS
 * Satu titik pemanggilan ke Apps Script Web App.
 * GANTI API_URL kalau deployment Apps Script berubah.
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbzBWch0BXBQLrCiZWZ4JHR3ElKQuLz4LNAUgD-idtKecJ9S79e5aHRfjXm0YnT5feZWaA/exec';

/**
 * @param {string} action  salah satu ACTIONS di backend (LOGIN, GET_DASHBOARD, dst)
 * @param {Object} params  payload tambahan (password, tanggal, dsb)
 * @returns {Promise<{status:string, message:string, data?:any, code?:string}|null>}
 */
async function callApi(action, params) {
  params = params || {};
  const body = Object.assign({ action: action, token: getToken() }, params);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      // text/plain menghindari CORS preflight ke Apps Script; backend tetap parse sebagai JSON.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });

    const json = await res.json();

    if (json && json.status === 'error' && json.code === 'AUTH_ERROR') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      localStorage.removeItem(STORAGE_KEYS.NAMA);
      if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
      }
    }

    return json;
  } catch (err) {
    return { status: 'error', message: 'Gagal menghubungi server. Cek koneksi internet.', code: 'NETWORK_ERROR' };
  }
}
