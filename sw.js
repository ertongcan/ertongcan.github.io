const CACHE_NAME = 'target-math-cache-v0'; // Increment version when you update
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json'
];

// Install: cache all files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', evt => {
  console.log("Service Worker activated");
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );

  self.clients.claim();
});

// Fetch: serve cached files, fallback to network
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
