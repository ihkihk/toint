// service-worker.js
const CACHE_NAME = 'toint-cache-v0';

const INITIAL_CACHED_RESOURCES = [
  '/toint/.', // Alias for index.html
  '/toint/index.html',
  '/toint/manifest.json',
  '/toint/style.css',
  '/toint/script.js',
  '/toint/icons/180.png',
  '/toint/icons/192.png',
  '/toint/icons/512.png',
  '/toint/images/bankheader.png',
  '/toint/images/checkmark.png',
  '/toint/images/maincenter.png',
  '/toint/images/paybutton.png',
  '/toint/images/reqbutton.png',
  '/toint/images/sbsfooter.png',
  '/toint/images/sbsheader.png',
  '/toint/images/scanheader.png',
  '/toint/images/sendbutton.png',
  '/toint/ios/splash390.png',
  '/toint/html5-qrcode.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll(INITIAL_CACHED_RESOURCES);
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Try the cache first.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse !== undefined) {
      // Cache hit, let's send the cached resource.
      return cachedResponse;
    } else {
      return;
      // Nothing in cache, let's go to the network.
    }
  })());
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

/* EOF */
