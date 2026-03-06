const CACHE_NAME = 'clinica-v1';
const ASSETS = [
  'index.html',
  'cet.html',
  'cd.html',
  'rehab.html',
  'facturacion.html',
  'manifest.json'
];

// Instalar el Service Worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Responder desde la caché cuando no hay internet o para ir más rápido
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});