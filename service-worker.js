const CACHE_NAME = 'owen-cache';
const urlsToCache = [
  '/',
  '/styles.css',
  '/apple-touch-icon.png',
  '/index.html',
  'favicon.ico',
  'firebaseconfig.js',
  'dev.html',
  'home.html',
  'header.html',
  'header.js',
  'photography.html',
  'mascot.png',
  'mascotblue.png',
  'manifest.json',
  'service-worker.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
