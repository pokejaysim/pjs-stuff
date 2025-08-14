// Service Worker for PJS Games
const CACHE_NAME = 'pjs-games-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/common.css',
  '/assets/js/common.js',
  '/SnakeGame/index_new.html',
  '/SnakeGame/style.css',
  '/SnakeGame/game.js',
  '/BlackJack/index.html',
  '/PlinkoGame/index.html',
  '/Minesweeper/index.html',
  '/images/snake-preview.jpg',
  '/images/blackjack-preview.jpg',
  '/images/plinko-preview.jpg',
  '/images/minesweeper-preview.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // If network fails, try to return cached offline page
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});