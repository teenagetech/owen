const CACHE_NAME = 'owen-cache';
const urlsToCache = [
  '/owen/',
  '/owen/styles.css',
  '/owen/apple-touch-icon.png',
  '/owen/index.html',
  '/owen/favicon.ico',
  '/owen/firebaseconfig.js',
  '/owen/dev.html',
  '/owen/home.html',
  '/owen/header.html',
  '/owen/header.js',
  '/owen/photography.html',
  '/owen/mascot.png',
  '/owen/mascotblue.png',
  '/owen/manifest.json',
  '/owen/service-worker.js'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching files');
        return cache.addAll(urlsToCache);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  });
  