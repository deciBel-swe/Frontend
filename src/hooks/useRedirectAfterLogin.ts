'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth';

/**
 * useRedirectAfterLogin — redirects the user after a successful login.
 *
 * Reads the `?redirect=` query parameter set by middleware when an
 * unauthenticated user attempts to visit a protected route. Only when
 * `isAuthenticated` transitions from `false` to `true`, the user is sent
 * to that destination (or `/discover` if no redirect param is present).
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const previousIsAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    const becameAuthenticated =
      previousIsAuthenticated.current === false && isAuthenticated === true;
    previousIsAuthenticated.current = isAuthenticated;

    if (!becameAuthenticated) return;

    const currentPath = window.location.pathname;
    const destination =
      new URLSearchParams(window.location.search).get('redirect') ??
      ROUTES.DISCOVER;

    // Avoid redundant replaces when already on the target page.
    const destinationPath = destination.split('?')[0].split('#')[0] || '/';
    if (destinationPath === currentPath) return;

    console.log('Redirecting to:', destination);
    router.replace(destination);
    // Intentional: this effect should only react to auth state transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
};
