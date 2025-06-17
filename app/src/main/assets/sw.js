const CACHE_NAME = 'vr-minecraft-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/control-panel.html',
  '/manifest.json',
  '/js/main.js',
  '/js/inventory.js',
  '/js/physics.js',
  '/js/animations.js',
  '/js/save-system.js',
  '/js/sound-system.js',
  '/js/world-generator.js',
  '/js/player.js',
  '/Skeleton.glb',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/VRButton.js',
  'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/XRControllerModelFactory.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 