// Stratégie "Network First" pour les pages de navigation, Cache First pour le reste.
const CACHE_NAME = 'oxytrack-cache-v4'; // Version incrémentée pour invalider les anciens caches
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

// Installe le Service Worker et met en cache les ressources initiales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Pour les requêtes de navigation (chargement de page) -> Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si la requête réseau réussit, on met la réponse en cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Si le réseau échoue (mode hors ligne), on sert depuis le cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Pour les autres ressources (JS, CSS, images) -> Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la ressource est dans le cache, on la sert
        if (response) {
          return response;
        }

        // Sinon, on la récupère du réseau, on la met en cache et on la sert
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        );
      })
  );
});

// Nettoie les anciens caches lors de l'activation du nouveau Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
