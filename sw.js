const CACHE_NAME = 'bp-guest-analytics-v1';
const APP_SHELL = [
  'index.html',
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

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
