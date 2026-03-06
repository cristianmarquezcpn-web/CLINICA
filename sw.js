const CACHE_NAME = 'clinica-v1';

// Lista de archivos que la App guardará para que sea rápida
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './cet.html',
  './cd.html',
  './rehab.html',
  './facturacion.html'
];

// Instalación: Guarda los archivos en la memoria del navegador
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch: Sirve los archivos desde la memoria (vuela)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});