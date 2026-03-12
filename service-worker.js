/**
 * Service Worker - Lista do pão
 * Autoria: [Fosfo virtual](https://fosfo.com.br) - 12/03/2026 10:13
 */

const CACHE_NAME = 'lista-do-pao-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/storage.js',
    '/categories.js',
    '/realtime.js',
    '/offline.js',
    '/pwa.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    // Forçar a ativação do novo service worker
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', event => {
    // Limpar caches antigos
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
