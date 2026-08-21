/**
 * APP.JS
 * Registrasi service worker untuk mode PWA (install ke HP/desktop).
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {
      // Diam saja kalau gagal (mis. dibuka lewat file:// saat development lokal).
    });
  });
}
