const CACHE_NAME = 'clinica-v10.3'; 
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './cet.html',
  './cd.html',
  './rehab.html',
  './facturacion.html',
  './saei.html',    
  './tesoreria.html', 
  './cobranzas.html'  
];

// 1. INSTALACIÓN
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando archivos principales...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// 2. ACTIVACIÓN (Limpia cachés viejos)
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
  return self.clients.claim(); 
});

// 3. FETCH (Estrategia: Primero Red, si falla, Caché)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
