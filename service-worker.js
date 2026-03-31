const CACHE_NAME = 'cars45-clone-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/inventory.html',
    '/car-details.html',
    '/login.html',
    '/register.html',
    '/dashboard.html',
    '/admin.html',
    '/honda.html',
    '/toyota.html',
    '/hyundai.html',
    '/css/style.css',
    '/js/auth/auth.js',
    '/js/database/db.js',
    '/js/database/dummy-data.js',
    '/js/installment/calculator.js',
    '/js/messaging/chat.js',
    '/js/security/crypto.js',
    '/js/ui/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response; // Return from cache
            }
            return fetch(event.request).then(
                (response) => {
                    // Check if valid response
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                }
            );
        }).catch(() => {
            // Offline fallback for HTML
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheAllowlist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
