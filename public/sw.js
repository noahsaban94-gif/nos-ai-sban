// Progressive Web App Service Worker for Noa Saban AI
const CACHE_NAME = 'noa-saban-ai-v2';

// Cache critical core assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  'https://i.ibb.co/GQfHTYZH/Gemini-Generated-Image-7.png'
];

// Optional OneSignal push notifications worker
try {
  if (self.location.protocol === 'https:' && !self.location.hostname.includes('localhost')) {
    importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
  }
} catch (_) {
  // Offline or OneSignal skipped
}

// Immediate skip waiting on message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API routes: Network First, fallback to cached offline json response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({
              status: 'ok',
              message: 'התחברות אופליין פעילה. הנתונים מוצגים ממאגר הסדרנות המקומי.',
              htmlMessage: '<div class="p-2 text-slate-800 font-bold">התחברות אופליין פעילה. הנתונים זמינים מהזיכרון המקומי.</div>',
              model: 'offline-cache'
            }),
            {
              headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // 2. Navigation requests: Stale-While-Revalidate with fallback to '/'
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // 3. Static assets & images: Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate for assets)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/icon.svg');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
