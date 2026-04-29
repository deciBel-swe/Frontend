'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';

import { useAuth } from '@/features/auth/useAuth';
import { auth } from '@/lib/firebase';

export default function FirebaseSessionBridge() {
  const { user } = useAuth();

  useEffect(() => {
    const firebaseAuth = auth;

    if (!firebaseAuth) {
      return;
    }

    if (!user?.id) {
      if (firebaseAuth.currentUser?.isAnonymous) {
        void signOut(firebaseAuth).catch(() => undefined);
      }
      return;
    }

    const ensureSignedIn = async () => {
      if (firebaseAuth.currentUser) {
        return;
      }

      await signInAnonymously(firebaseAuth);
    };

    void ensureSignedIn().catch((error) => {
      console.warn('Failed to establish Firebase session:', error);
    });

    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        return;
      }

      void signInAnonymously(firebaseAuth).catch((error) => {
        console.warn('Failed to re-establish Firebase session:', error);
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  return null;
}
