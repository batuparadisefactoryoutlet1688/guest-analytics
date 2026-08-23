/**
 * AUTH.JS
 * Logic untuk index.html (halaman login).
 */

document.addEventListener('DOMContentLoaded', function () {
  // Kalau sudah login sebagai ADMIN, langsung ke Input (tujuan orang login).
  if (getToken() && isAdmin()) {
    window.location.href = 'input.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('password');
  const msgBox = document.getElementById('loginMessage');
  const submitBtn = document.getElementById('loginSubmit');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMessage(msgBox);

    const password = passwordInput.value.trim();
    if (!password) {
      showMessage(msgBox, 'Password wajib diisi.', 'error');
      return;
    }

    setButtonLoading(submitBtn, true, 'Masuk');
    const res = await callApi('LOGIN', { password: password });
    setButtonLoading(submitBtn, false, 'Masuk');

    if (res && res.status === 'success') {
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
      localStorage.setItem(STORAGE_KEYS.ROLE, res.data.role);
      localStorage.setItem(STORAGE_KEYS.NAMA, res.data.nama || '');
      window.location.href = (res.data.role === 'ADMIN') ? 'input.html' : 'dashboard.html';
    } else {
      showMessage(msgBox, (res && res.message) || 'Login gagal.', 'error');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
});
