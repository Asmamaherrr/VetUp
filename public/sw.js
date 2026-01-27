const CACHE_NAME = 'video-cache-v1';
const VIDEO_CACHE_PREFIX = 'video-';

// Install event - set up cache
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.startsWith(VIDEO_CACHE_PREFIX)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - intercept requests and serve from cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache video files
  if (event.request.method === 'GET' && url.pathname.match(/\.(mp4|webm|ogg)$/i)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Return cached response if available
          if (response) {
            return response;
          }

          // Fetch from network and cache it
          return fetch(event.request).then((networkResponse) => {
            // Don't cache if not a successful response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
            return networkResponse;
          }).catch(() => {
            // Return offline page or cached response if network fails
            return cache.match(event.request) || new Response('Video not available offline');
          });
        });
      })
    );
  }
});

// Handle messages from clients for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((requests) => {
        event.ports[0].postMessage({ cacheSize: requests.length });
      });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }
});
