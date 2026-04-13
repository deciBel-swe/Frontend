'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants/routes';

/**
 * LogoutPage — calls auth.logout() on mount then redirects to sign-in.
 * Visited via the "Sign out" dropdown item at ROUTES.LOGOUT.
 */
export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.replace(ROUTES.HOME);
    });
  }, [router, logout]);

  return null;
}
