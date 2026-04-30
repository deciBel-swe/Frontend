/* global importScripts, firebase, console, self */
// Import Firebase Service Worker Compat libraries
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js"
);

// We cannot use process.env here directly easily in a standard Next.js public/ setup
// However, Firebase requires the config to initialize the app in the SW.
// For security and simplicity in Next.js public files, we can use URL parameters
// to pass the config to the SW during registration, or hardcode it if it's strictly public info.
// Given the backend test file, we'll extract the config from URL query params
// when the SW is registered.

const defaultConfig = {
  apiKey: "AIzaSyAZRjTRHzHI3e7A0a1Ak9yeXG_gTW4xytU",
  authDomain: "decibel-1774203293120.firebaseapp.com",
  projectId: "decibel-1774203293120",
  storageBucket: "decibel-1774203293120.firebasestorage.app",
  messagingSenderId: "32707752970",
  appId: "1:32707752970:web:b2caf328e6eae12798dbf3"
};

// Initialize Firebase in the Service Worker
firebase.initializeApp(defaultConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  // Extract data from payload.data per backend test file
  const notificationTitle = payload.data?.title || payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || "You have a new message.",
    icon: "/images/apple-icon.svg", 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
