'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth';

/**
 * useRedirectAfterLogin — redirects the user after a successful login.
 *
 * Reads the `?redirect=` query parameter set by middleware when an
 * unauthenticated user attempts to visit a protected route. On mount,
 * and whenever `isAuthenticated` becomes `true`, the user is sent to
 * that destination (or `/feed` if no redirect param is present).
 *
 * This hook responds to `isAuthenticated` changing regardless of how
 * login occurred — email/password form, OAuth, or session restore on
 * mount — so the sign-in page has no routing logic of its own.
 *
 * Must be used inside `<AuthProvider>`.
 *
 * @example
 *   export default function SignInPage() {
 *     useRedirectAfterLogin();
 *     const { login } = useAuth();
 *     // render form, call login() on submit
 *   }
 */
export const useRedirectAfterLogin = (): void => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const destination = searchParams.get('redirect') ?? ROUTES.DISCOVER;
    router.replace(destination);
  }, [isAuthenticated, isLoading, router, searchParams]);
};
