
const CACHE_NAME = `oxytrack-cache-${new Date().getTime()}`;

// Supprime les anciens caches lors de l'activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Supprime les caches qui ne sont pas celui actuel
          if (CACHE_NAME !== cacheName && cacheName.startsWith('oxytrack-cache')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie "Network First" pour s'assurer que le contenu est toujours à jour
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la requête réussit, on met en cache la réponse et on la retourne
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, on cherche dans le cache
        return caches.match(event.request);
      })
  );
});
