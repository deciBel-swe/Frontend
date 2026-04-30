'use client';

import { useEffect, useRef } from 'react';
import { getToken } from 'firebase/messaging';

import { useAuth } from '@/features/auth/useAuth';
import { messaging } from '@/lib/firebase';
import { notificationService } from '@/services/api/notificationService';

// Fallback to environment variable. It was hardcoded to a mismatched test value previously.
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * FirebaseSessionBridge Component
 *
 * Manages the connection between the application and Firebase Cloud Messaging (FCM).
 *
 * It automatically:
 * 1. Requests notification permissions when a user logs into the app.
 * 2. Generates an FCM device token.
 * 3. Registers the token with the backend so they can receive push notifications.
 */
export default function FirebaseSessionBridge() {
  const { user } = useAuth();
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    const messagingInstance = messaging;
    if (!messagingInstance) {
      return;
    }

    if (!user?.id) {
      // Clear registration state when the user logs out so a new login can re-register.
      isRegisteredRef.current = false;
      return;
    }

    if (isRegisteredRef.current) {
      return;
    }

    const registerDevice = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Push notification permission was not granted.');
          return;
        }

        if (!VAPID_KEY) {
          console.warn('FCM VAPID Key is missing from environment variables.');
          return;
        }

        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );

        const currentToken = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!currentToken) {
          console.warn('FCM did not return a valid device token.');
          return;
        }

        await notificationService.registerDeviceToken({
          token: currentToken,
          deviceType: 'WEB',
        });

        isRegisteredRef.current = true;
        console.log('Successfully registered FCM device token.');
      } catch (error) {
        console.warn(
          'Failed to register device for push notifications:',
          error
        );
      }
    };

    void registerDevice();
  }, [user?.id]);

  return null;
}
