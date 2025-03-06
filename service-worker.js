const CACHE_NAME = 'owen-cache';
const urlsToCache = [
  '../',
  '../styles.css',
  '../apple-touch-icon.png',
  '../index.html',
  '../favicon.ico',
  '../firebaseconfig.js',
  '../dev.html',
  '../header.html',
  '../header.js',
  '../photography.html',
  '../mascot.png',
  '../mascot.svg',
  '../manifest.json',
  '../service-worker.js'
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
  