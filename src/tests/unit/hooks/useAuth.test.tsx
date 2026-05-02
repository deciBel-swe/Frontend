import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { AuthContext } from '@/features/auth/AuthContext';
import { useAuth } from '@/features/auth/useAuth';
import type { AuthContextValue } from '@/types';

const originalLocation = window.location;
const originalGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const originalOAuthRedirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;

const createAuthContextValue = (): AuthContextValue => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
});

const createWrapper = (value: AuthContextValue) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );

  return Wrapper;
};

const mockLocation = (origin = 'https://decibel.test') => {
  const url = new URL(`${origin}/signin`);
  (url as any).assign = jest.fn();
  (url as any).replace = jest.fn();

  // @ts-ignore
  delete window.location;
  window.location = url as any;

  return url;
};

describe('useAuth Google login', () => {
  afterEach(() => {
    // @ts-ignore
    delete window.location;
    window.location = originalLocation;

    if (originalGoogleClientId === undefined) {
      delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    } else {
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalGoogleClientId;
    }

    if (originalOAuthRedirectUri === undefined) {
      delete process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
    } else {
      process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI = originalOAuthRedirectUri;
    }
  });

  it('logs an error and does not redirect when the Google client id is missing', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const locationControl = mockLocation('https://client.decibel.test');
    const wrapper = createWrapper(createAuthContextValue());
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.handleGoogleLogin();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Google Client ID is missing from environment variables.'
    );
    expect(locationControl.href).toBe(
      'https://client.decibel.test/signin'
    );
  });

  it('builds the OAuth URL with the default callback path when redirect env is unset', () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'google-client-id';
    delete process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;

    const locationControl = mockLocation('https://client.decibel.test');
    const wrapper = createWrapper(createAuthContextValue());

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.handleGoogleLogin();
    });

    const redirectTarget = new URL(locationControl.href);

    expect(redirectTarget.origin).toBe('https://accounts.google.com');
    expect(redirectTarget.pathname).toBe('/o/oauth2/v2/auth');
    expect(redirectTarget.searchParams.get('client_id')).toBe(
      'google-client-id'
    );
    expect(redirectTarget.searchParams.get('redirect_uri')).toBe(
      'https://client.decibel.test/oauth/callback'
    );
    expect(redirectTarget.searchParams.get('response_type')).toBe('code');
    expect(redirectTarget.searchParams.get('scope')).toBe(
      'openid email profile'
    );
    expect(redirectTarget.searchParams.get('prompt')).toBe('select_account');
  });

  it('uses NEXT_PUBLIC_OAUTH_REDIRECT_URI when provided', () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI =
      'https://api.decibel.test/oauth/callback';

    const locationControl = mockLocation('https://client.decibel.test');
    const wrapper = createWrapper(createAuthContextValue());

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.handleGoogleLogin();
    });

    const redirectTarget = new URL(locationControl.href);

    expect(redirectTarget.searchParams.get('redirect_uri')).toBe(
      'https://api.decibel.test/oauth/callback'
    );
  });
});
