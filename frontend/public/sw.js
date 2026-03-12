// Service Worker for Sky High PWA
const CACHE_NAME = 'skyhigh-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/products',
  '/brands',
  '/about',
  '/contact',
  '/offline',
  '/manifest.json',
  // Add your static assets
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/v1/products/',
  '/api/v1/brands/',
  '/api/v1/categories/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static files');
      return cache.addAll(STATIC_CACHE_URLS);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached page or offline page
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      // Network first, cache fallback strategy for API
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets (images, fonts, etc.)
  if (request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(
      // Cache first, network fallback strategy for static assets
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: network first for other requests
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }

  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrderData());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  const options = {
    body: 'You have new updates from Sky High!',
    icon: '/android-chrome-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'skyhigh-notification',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Sky High';
    options.data.url = data.url || '/';
  }

  event.waitUntil(
    self.registration.showNotification('Sky High', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data.url || '/';

    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});

// Sync cart data when back online
async function syncCartData() {
  try {
    // Get offline cart data from IndexedDB or localStorage
    const offlineCart = await getOfflineCartData();

    if (offlineCart && offlineCart.length > 0) {
      // Send to server
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offlineCart)
      });

      if (response.ok) {
        // Clear offline cart data
        await clearOfflineCartData();
        console.log('Cart data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync cart data:', error);
  }
}

// Sync order data when back online
async function syncOrderData() {
  try {
    // Get offline order data
    const offlineOrders = await getOfflineOrderData();

    if (offlineOrders && offlineOrders.length > 0) {
      for (const order of offlineOrders) {
        const response = await fetch('/api/orders/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order)
        });

        if (response.ok) {
          await removeOfflineOrder(order.id);
          console.log('Order synced successfully:', order.id);
        }
      }
    }
  } catch (error) {
    console.error('Failed to sync order data:', error);
  }
}

// Helper functions for offline data management
async function getOfflineCartData() {
  // Implementation would depend on your storage strategy
  // This is a placeholder for the actual implementation
  return [];
}

async function clearOfflineCartData() {
  // Clear offline cart storage
}

async function getOfflineOrderData() {
  // Get offline orders
  return [];
}

async function removeOfflineOrder(orderId) {
  // Remove specific offline order
}