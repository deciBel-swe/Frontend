import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { PROTECTED_ROUTES, ROUTES } from '@/constants/routes';

const AUTH_ENTRY_ROUTES = new Set<string>([
  ROUTES.HOME,
  ROUTES.SIGNIN,
  ROUTES.REGISTER,
  ROUTES.RESETPASSWORD,
]);

const resolveSafeRedirect = (
  request: NextRequest,
  redirectParam: string | null
): URL | null => {
  if (
    !redirectParam ||
    !redirectParam.startsWith('/') ||
    redirectParam.startsWith('//')
  ) {
    return null;
  }

  const baseUrl = request.nextUrl.clone();
  const destination = new URL(redirectParam, baseUrl.toString());
  if (AUTH_ENTRY_ROUTES.has(destination.pathname)) {
    return null;
  }

  return destination;
};

/**
 * Auth middleware.
 *
 * Redirects unauthenticated requests on protected routes to /signin,
 * preserving the original URL as a `?redirect=` query parameter so
 * the signin page can bounce the user back after a successful login.
 *
 * Runs on the Edge runtime — reads only cookies, never localStorage.
 * The mock auth service writes a `decibel_auth` cookie on login and
 * clears it on logout so this check works end-to-end during development.
 * The real auth service will keep the same cookie name.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Redirect /verify-email-change to /settings/verify-email-change
  if (pathname === '/verify-email-change') {
    const verifyUrl = request.nextUrl.clone();
    verifyUrl.pathname = '/settings/verify-email-change';
    return NextResponse.redirect(verifyUrl);
  }
  
  const isAuthenticated = request.cookies.has('decibel_auth');
  // // todo this needs to be changes later with actual cookies
  // const isAuthenticated = true;
  if (AUTH_ENTRY_ROUTES.has(pathname) && isAuthenticated) {
    const destination = resolveSafeRedirect(
      request,
      request.nextUrl.searchParams.get('redirect')
    );

    if (destination) {
      return NextResponse.redirect(destination);
    }

    const discoverUrl = request.nextUrl.clone();
    discoverUrl.pathname = ROUTES.DISCOVER;
    discoverUrl.search = '';
    return NextResponse.redirect(discoverUrl);
  }

  const isProtected = (PROTECTED_ROUTES as readonly string[]).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const signinUrl = request.nextUrl.clone();
  signinUrl.pathname = ROUTES.SIGNIN;
  signinUrl.search = '';
  signinUrl.searchParams.set(
    'redirect',
    `${pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(signinUrl);
}
