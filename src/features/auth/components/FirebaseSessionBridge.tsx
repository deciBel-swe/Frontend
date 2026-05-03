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

    const unregisterIfNeeded = async () => {
      if (!isRegisteredRef.current) {
        isRegisteredRef.current = false;
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration(
          '/firebase-messaging-sw.js'
        );

        const currentToken = await getToken(
          messagingInstance,
          registration
            ? {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
              }
            : { vapidKey: VAPID_KEY }
        );

        if (currentToken) {
          await notificationService.unregisterDeviceToken(currentToken);
          console.log('Successfully unregistered FCM device token.');
        }
      } catch (error) {
        console.warn('Failed to unregister device token:', error);
      } finally {
        isRegisteredRef.current = false;
      }
    };

    if (!user?.id) {
      // User logged out — attempt to unregister previous device token.
      void unregisterIfNeeded();
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
