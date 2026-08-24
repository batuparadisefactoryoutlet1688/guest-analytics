/**
 * SW.JS
 * v2: naikkan versi CACHE_NAME supaya browser yang masih pegang cache lama
 * (dari sebelum index.html/login.html dipisah) otomatis ambil versi baru.
 * Strategi fetch juga diubah jadi "network-first": selalu coba ambil versi
 * terbaru dulu dari jaringan, baru pakai cache kalau offline. Ini mencegah
 * masalah "sudah update kode tapi user masih lihat versi lama" di masa depan.
 */
const CACHE_NAME = 'bp-guest-analytics-v2';
const APP_SHELL = [
  'index.html',
  'login.html',
  'dashboard.html',
  'input.html',
  'comparison.html',
  'analytics.html',
  'css/style.css',
  'css/dashboard.css',
  'css/input.css',
  'css/comparison.css',
  'css/responsive.css',
  'js/utils.js',
  'js/api.js',
  'js/auth.js',
  'js/dashboard.js',
  'js/input.js',
  'js/comparison.js',
  'js/analytics.js',
  'manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  // Jangan cache request ke Apps Script (data selalu harus fresh).
  if (event.request.url.indexOf('script.google.com') !== -1) {
    return;
  }

  // Network-first: coba jaringan dulu supaya update kode langsung kelihatan.
  // Kalau offline/gagal, baru fallback ke cache.
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
