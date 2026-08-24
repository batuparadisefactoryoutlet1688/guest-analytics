/**
 * UTILS.JS
 * Helper lintas halaman: format angka/tanggal, guard login, komponen kecil.
 */

const STORAGE_KEYS = {
  TOKEN: 'bp_token',
  ROLE: 'bp_role',
  NAMA: 'bp_nama'
};

function getToken() { return localStorage.getItem(STORAGE_KEYS.TOKEN); }
function getRole() { return localStorage.getItem(STORAGE_KEYS.ROLE); }
function getNama() { return localStorage.getItem(STORAGE_KEYS.NAMA); }

function isAdmin() { return getRole() === 'ADMIN'; }

/** Panggil di setiap halaman yang wajib login. Redirect ke login.html kalau belum login. */
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/** Panggil di halaman yang cuma boleh ADMIN (input.html). */
function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

function doLogoutAndRedirect() {
  callApi('LOGOUT', {}).finally(function () {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.NAMA);
    window.location.href = 'dashboard.html';
  });
}

// ============ FORMAT ============

function formatAngka(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('id-ID');
}

function formatPersen(n) {
  if (n === null || n === undefined) return '—';
  const sign = n > 0 ? '▲' : (n < 0 ? '▼' : '—');
  return sign + ' ' + Math.abs(n).toFixed(1) + '%';
}

function deltaClass(n) {
  if (n === null || n === undefined) return 'flat';
  return n > 0 ? 'up' : (n < 0 ? 'down' : 'flat');
}

/** input[type=date] pakai format yyyy-mm-dd, backend Apps Script terima ini langsung. */
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

// ============ UI HELPERS ============

function showMessage(container, text, type) {
  container.innerHTML = '<div class="message ' + (type || 'error') + '">' + text + '</div>';
}

function clearMessage(container) {
  container.innerHTML = '';
}

function setButtonLoading(btn, loading, labelDefault) {
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spinner"></span>' : labelDefault;
}

// ============ RIDGE SVG (elemen ciri khas) ============

function ridgeSvg() {
  return '' +
    '<svg class="ridge-svg" viewBox="0 0 400 46" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M0 40 L40 22 L70 33 L110 10 L150 28 L190 16 L230 34 L270 14 L310 30 L350 20 L400 36 L400 46 L0 46 Z" fill="var(--primary)" opacity="0.9"/>' +
    '<path d="M0 40 L40 22 L70 33 L110 10 L150 28 L190 16 L230 34 L270 14 L310 30 L350 20 L400 36" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';
}

// ============ NAV SHELL (dipakai semua halaman selain login) ============

const NAV_ITEMS = [
  { href: 'dashboard.html', label: 'Dashboard', icon: '◆', adminOnly: false },
  { href: 'input.html', label: 'Input', icon: '✎', adminOnly: true },
  { href: 'comparison.html', label: 'Comparison', icon: '⇄', adminOnly: false },
  { href: 'analytics.html', label: 'Analytics', icon: '▤', adminOnly: false }
];

function renderShell(activeHref) {
  const loggedIn = !!getToken();
  const admin = isAdmin();
  const items = NAV_ITEMS.filter(function (i) { return !i.adminOnly || admin; });

  const sidebarLinks = items.map(function (i) {
    return '<a href="' + i.href + '" class="' + (i.href === activeHref ? 'active' : '') + '">' +
      '<span>' + i.icon + '</span><span>' + i.label + '</span></a>';
  }).join('');

  const bottomLinks = items.map(function (i) {
    return '<a href="' + i.href + '" class="' + (i.href === activeHref ? 'active' : '') + '">' +
      '<span class="icon">' + i.icon + '</span>' + i.label + '</a>';
  }).join('');

  const sidebarUserbox = loggedIn
    ? '<div class="userbox">' + (getNama() || getRole()) + ' &middot; ' + getRole() +
      '<div><button class="secondary" onclick="doLogoutAndRedirect()" style="width:100%;margin-top:6px;">Keluar</button></div></div>'
    : '<div class="userbox">Mode Lihat Saja' +
      '<div><a href="login.html"><button style="width:100%;margin-top:6px;">Masuk sebagai Admin</button></a></div></div>';

  document.getElementById('sidebar-slot').innerHTML =
    '<div class="brand">Batu Paradise<small>Guest Analytics</small></div>' +
    '<nav>' + sidebarLinks +
    (loggedIn ? '' : '<a href="login.html"><span>&#128274;</span><span>Masuk</span></a>') +
    '</nav>' +
    sidebarUserbox;

  document.getElementById('bottomnav-slot').innerHTML = bottomLinks +
    (loggedIn ? '' : '<a href="login.html"><span class="icon">&#128274;</span>Masuk</a>');
}
