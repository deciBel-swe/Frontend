import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { PROTECTED_ROUTES, ROUTES } from '@/constants/routes';

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
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('decibel_auth');

  if (
    (pathname === ROUTES.SIGNIN || pathname === ROUTES.HOME) &&
    isAuthenticated
  ) {
    const feedUrl = request.nextUrl.clone();
    feedUrl.pathname = ROUTES.FEED;
    feedUrl.search = '';
    return NextResponse.redirect(feedUrl);
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
  signinUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(signinUrl);
}
