const CACHE_NAME = 'stress-test-v3'; // Version erhöht!
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-512x512.png',
    './chart.js' 
];

// ... (restlicher Code bleibt gleich)

// Service Worker installieren und alle Ressourcen cachen
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Alle Ressourcen werden gecacht...');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ressourcen aus dem Cache liefern (Offline-Unterstützung)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Falls im Cache, zurückgeben
                if (response) {
                    return response;
                }
                // Sonst aus dem Netzwerk laden und im Cache speichern
                return fetch(event.request)
                    .then(response => {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        return response;
                    })
                    .catch(() => {
                        // Falls offline und nicht im Cache: Fallback zu index.html
                        return caches.match('/index.html');
                    });
            })
    );
});

// Alte Caches löschen
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
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
