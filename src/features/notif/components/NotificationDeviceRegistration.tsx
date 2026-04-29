'use client';

import { useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';

import { useAuth } from '@/features/auth/useAuth';
import { messaging } from '@/lib/firebase';
import { notificationService } from '@/services';
import type { RegisterDeviceTokenRequest } from '@/types/notification';

const getDeviceType = (): RegisterDeviceTokenRequest['deviceType'] => {
  if (typeof window === 'undefined') {
    return 'DESKTOP';
  }

  if (window.innerWidth < 768) {
    return 'MOBILE';
  }

  if (window.innerWidth < 1024) {
    return 'TABLET';
  }

  return 'DESKTOP';
};

export default function NotificationDeviceRegistration() {
  const { user } = useAuth();
  const lastRegisteredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || !messaging) {
      return;
    }

    const firebaseMessaging = messaging;

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    let isCancelled = false;

    const registerDevice = async () => {
      if (Notification.permission === 'denied') {
        return;
      }

      const permission =
        Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission();

      if (permission !== 'granted' || !('serviceWorker' in navigator)) {
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        return;
      }

      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );

      const token = await getToken(firebaseMessaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token || isCancelled || lastRegisteredTokenRef.current === token) {
        return;
      }

      await notificationService.registerDeviceToken({
        token,
        deviceType: getDeviceType(),
      });

      lastRegisteredTokenRef.current = token;
    };

    void registerDevice().catch(() => undefined);

    const unsubscribe = onMessage(firebaseMessaging, () => undefined);

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [user?.id]);

  return null;
}
