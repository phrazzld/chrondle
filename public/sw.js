// Chrondle Service Worker for Push Notifications
// Provides enhanced notification support and background functionality

const CACHE_NAME = 'chrondle-v1';
const BASE_URL = self.location.origin;

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('📱 Chrondle Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.ico',
        // Add other essential resources here if needed
      ]);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('📱 Chrondle Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      // Take control immediately
      return self.clients.claim();
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Chrondle Service Worker: Push received');
  
  let notificationData = {
    title: 'Chrondle - Daily History Challenge',
    body: 'Your daily puzzle awaits! 🏛️',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'chrondle-daily-reminder',
    requireInteraction: false,
    data: {
      url: BASE_URL,
      timestamp: Date.now()
    }
  };
  
  // If push has data, use it
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (e) {
      console.log('📱 Push event data is not JSON:', event.data.text());
      notificationData.body = event.data.text() || notificationData.body;
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'play',
          title: 'Play Now',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Later',
          icon: '/favicon.ico'
        }
      ]
    })
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Chrondle Service Worker: Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  if (action === 'close') {
    // User chose to dismiss
    return;
  }
  
  // Default action or 'play' action - open the game
  const urlToOpen = notificationData.url || BASE_URL;
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if Chrondle is already open
      const existingClient = clientList.find(client => 
        client.url.includes(urlToOpen) && 'focus' in client
      );
      
      if (existingClient) {
        // Focus existing window
        return existingClient.focus();
      } else {
        // Open new window
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event - handle when user dismisses
self.addEventListener('notificationclose', (event) => {
  console.log('📱 Chrondle Service Worker: Notification closed');
  // Could track dismissal analytics here if needed
});

// Background sync for notification scheduling (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('📱 Chrondle Service Worker: Background sync triggered');
  
  if (event.tag === 'chrondle-daily-reminder-sync') {
    event.waitUntil(
      // Could implement offline notification scheduling here
      Promise.resolve()
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('📱 Chrondle Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Send response back
  event.ports[0]?.postMessage({
    type: 'SW_RESPONSE',
    success: true
  });
});

console.log('📱 Chrondle Service Worker: Loaded and ready!');