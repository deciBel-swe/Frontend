import type { NextRequest } from 'next/server';

import { ROUTES } from '@/constants/routes';
import { proxy } from '@/proxy';

jest.mock('next/server', () => {
  const redirect = jest.fn((url: URL) => ({
    kind: 'redirect',
    location: url.toString(),
  }));

  const next = jest.fn(() => ({ kind: 'next', location: null }));

  return {
    NextResponse: {
      redirect,
      next,
    },
  };
});

const AUTH_COOKIE = 'decibel_auth';

const createRequest = (
  pathname: string,
  {
    search = '',
    authenticated = false,
  }: { search?: string; authenticated?: boolean } = {}
): NextRequest => {
  const url = new URL(`https://decibel.test${pathname}${search}`);

  return {
    nextUrl: {
      pathname: url.pathname,
      search: url.search,
      searchParams: url.searchParams,
      clone: () => new URL(url.toString()),
    },
    cookies: {
      has: (name: string) => authenticated && name === AUTH_COOKIE,
    },
  } as unknown as NextRequest;
};

const getRedirectLocation = (
  response: ReturnType<typeof proxy>
): string | null =>
  (response as unknown as { location: string | null }).location;

describe('proxy auth guard behavior', () => {
  it('redirects authenticated users away from public auth-entry pages', () => {
    const routes = [
      ROUTES.HOME,
      ROUTES.SIGNIN,
      ROUTES.REGISTER,
      ROUTES.RESETPASSWORD,
    ];

    routes.forEach((route) => {
      const response = proxy(
        createRequest(route, {
          authenticated: true,
        })
      );

      expect(getRedirectLocation(response)).toBe(
        'https://decibel.test/discover'
      );
    });
  });

  it('resolves redirect query for authenticated users on auth pages', () => {
    const authRoutes = [ROUTES.SIGNIN, ROUTES.REGISTER, ROUTES.RESETPASSWORD];

    authRoutes.forEach((route) => {
      const response = proxy(
        createRequest(route, {
          authenticated: true,
          search: '?redirect=%2Fupload',
        })
      );

      expect(getRedirectLocation(response)).toBe('https://decibel.test/upload');
    });
  });

  it('redirects unauthenticated users to /signin from key protected pages', () => {
    const protectedRoutes = [
      ROUTES.UPLOAD,
      ROUTES.NOTIFICATIONS,
      ROUTES.MESSAGES,
      ROUTES.FEED,
      ROUTES.LIBRARY,
    ];

    protectedRoutes.forEach((route) => {
      const response = proxy(
        createRequest(route, {
          authenticated: false,
        })
      );

      expect(getRedirectLocation(response)).toBe(
        `https://decibel.test/signin?redirect=${encodeURIComponent(route)}`
      );
    });
  });

  it('preserves pathname and query string in redirect parameter', () => {
    const response = proxy(
      createRequest(ROUTES.FEED, {
        authenticated: false,
        search: '?tab=recent',
      })
    );

    expect(getRedirectLocation(response)).toBe(
      'https://decibel.test/signin?redirect=%2Ffeed%3Ftab%3Drecent'
    );
  });

  it('ignores unsafe external redirect targets for authenticated users', () => {
    const response = proxy(
      createRequest(ROUTES.SIGNIN, {
        authenticated: true,
        search: '?redirect=https%3A%2F%2Fevil.example%2Fpwn',
      })
    );

    expect(getRedirectLocation(response)).toBe('https://decibel.test/discover');
  });

  it('allows authenticated users to continue on protected routes', () => {
    const response = proxy(
      createRequest(ROUTES.FEED, {
        authenticated: true,
      })
    );

    expect(getRedirectLocation(response)).toBeNull();
  });

  it('allows unauthenticated users to continue on non-protected routes', () => {
    const response = proxy(
      createRequest(ROUTES.DISCOVER, {
        authenticated: false,
      })
    );

    expect(getRedirectLocation(response)).toBeNull();
  });
});
