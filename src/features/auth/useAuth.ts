'use client';

import { useCallback, useContext } from 'react';

import { AuthContext } from '@/features/auth/AuthContext';

import type { AuthContextValue } from '@/types';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_SCOPE = 'openid email profile';

export type UseAuthValue = AuthContextValue & {
  handleGoogleLogin: () => void;
};

/**
 * useAuth — access authentication state from any component.
 *
 * Must be rendered inside `<AuthProvider>`.
 *
 * @example
 *   const {
 *     user,
 *     role,
 *     isAuthenticated,
 *     isLoading,
 *     login,
 *     handleGoogleLogin,
 *     logout,
 *   } = useAuth();
 */
export const useAuth = (): UseAuthValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const handleGoogleLogin = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID is missing from environment variables.');
      return;
    }

    const redirectUri = `${window.location.origin}/oauth/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GOOGLE_OAUTH_SCOPE,
      prompt: 'select_account',
    });

    window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }, []);

  return {
    ...context,
    handleGoogleLogin,
  };
};
