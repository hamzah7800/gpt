const CACHE_NAME = 'ai-sim-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'main.js',
    'style.css',
    'icon-192.jpg',
    // In a production PWA, you would also cache your CDN files if possible,
    // but caching third-party CDNs depends on their CORS settings.
];

// 1. Installation: Cache all essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Opened cache');
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('[Service Worker] Failed to cache one or more URLs:', err);
                });
            })
    );
    self.skipWaiting();
});

// 2. Fetching: Serve assets from cache if available (Cache-First Strategy)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Fallback to network
                return fetch(event.request);
            })
    );
});

// 3. Activation: Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
