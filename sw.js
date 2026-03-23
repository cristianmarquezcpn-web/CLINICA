const CACHE_NAME = 'clinica-v8.6'; // <--- CAMBIÁ ESTE NÚMERO SIEMPRE QUE SUBAS A GITHUB

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './cet.html',
  './cd.html',
  './rehab.html',
  './facturacion.html',
  './saei.html'
 './tesoreria.html'
 './cobranzas.html'

];

// 1. INSTALACIÓN
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Fuerza al SW nuevo a activarse ya mismo
});

// 2. ACTIVACIÓN (Limpia cachés viejos automáticamente)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché viejo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Toma el control de la página inmediatamente
});

// 3. FETCH (Estrategia: Primero Red, si falla, Caché)
// Esto evita que te muestre cosas viejas si hay internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});