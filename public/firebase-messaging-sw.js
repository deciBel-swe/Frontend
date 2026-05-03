/* global importScripts, firebase, console, self */
// Import Firebase Service Worker Compat libraries
importScripts(
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js'
);

// Default Firebase config used by the service worker. This config is public
// by design for client-side Firebase usage. You can override by passing
// configuration via query params when registering the SW if desired.
const defaultConfig = {
  apiKey: 'AIzaSyAZRjTRHzHI3e7A0a1Ak9yeXG_gTW4xytU',
  authDomain: 'decibel-1774203293120.firebaseapp.com',
  projectId: 'decibel-1774203293120',
  storageBucket: 'decibel-1774203293120.firebasestorage.app',
  messagingSenderId: '32707752970',
  appId: '1:32707752970:web:b2caf328e6eae12798dbf3',
};

try {
  // Initialize Firebase app in SW context
  if (!firebase.apps?.length) {
    firebase.initializeApp(defaultConfig);
  }

  const messaging = firebase.messaging();

  // Handle background messages sent via FCM
  messaging.onBackgroundMessage(function (payload) {
    console.log(
      '[firebase-messaging-sw.js] Received background message',
      payload
    );

    const notificationTitle =
      payload?.data?.title || payload?.notification?.title || 'New Message';

    const notificationOptions = {
      body:
        payload?.data?.body ||
        payload?.notification?.body ||
        'You have a new message.',
      icon: '/images/apple-icon.svg',
      data: payload?.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification click events
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const clickAction = event.notification?.data?.click_action || '/';
    if (self.clients && typeof self.clients.openWindow === 'function') {
      event.waitUntil(self.clients.openWindow(clickAction));
    } else {
      // clients.openWindow not available in this environment; no-op
      event.waitUntil(Promise.resolve());
    }
  });
} catch (err) {
  // Swallow initialization errors but log them for diagnostics.
  console.error(
    'Failed to initialize firebase messaging in service worker',
    err
  );
}
