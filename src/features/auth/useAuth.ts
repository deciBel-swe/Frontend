'use client';

import { useCallback, useContext } from 'react';

import { AuthContext } from '@/features/auth/AuthContext';

import type { AuthContextValue } from '@/types';

/**
 * Google OAuth 2.0 authorization endpoint
 * @constant {string}
 */
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Requested OAuth scopes from Google
 * @constant {string}
 */
const GOOGLE_OAUTH_SCOPE = 'openid email profile';

/**
 * Return type of the useAuth hook
 * @typedef {Object} UseAuthValue
 * @property {LoginUserDTO|null} user - Currently authenticated user or null if not logged in
 * @property {UserRole|null} role - User's role ('artist' or 'listener') or null if not logged in
 * @property {boolean} isAuthenticated - Whether a user is currently authenticated
 * @property {boolean} isLoading - Whether auth state is still loading
 * @property {(email: string, password: string) => Promise<void>} login - Function to log in with email/password
 * @property {() => Promise<void>} logout - Function to log out current user
 * @property {() => void} handleGoogleLogin - Function to initiate Google OAuth flow
 */
export type UseAuthValue = AuthContextValue & {
  handleGoogleLogin: () => void;
};

/**
 * useAuth Hook
 * 
 * Provides access to authentication state and actions from anywhere in the application.
 * Must be called from within an `<AuthProvider>` component tree.
 * 
 * Authentication operations:
 * - `login(email, password)` - Authenticate with credentials
 * - `logout()` - Clear authentication and sign out
 * - `handleGoogleLogin()` - Initiate Google OAuth 2.0 sign-in flow
 * 
 * State information:
 * - `user` - Current user object (email, tier, etc.) or null if logged out
 * - `role` - User's role derived from tier: 'artist' or 'listener'
 * - `isAuthenticated` - Boolean flag for quick auth checks
 * - `isLoading` - Whether auth state is still being loaded
 * 
 * @hook
 * @returns {UseAuthValue} Authentication state and action functions
 * @throws {Error} If called outside of AuthProvider context
 * 
 * @example
 * const { user, isAuthenticated, login, logout, handleGoogleLogin } = useAuth();
 * 
 * // Check if authenticated
 * if (isAuthenticated) {
 *   console.log('User email:', user?.email);
 * }
 * 
 * // Sign in with credentials
 * await login('user@example.com', 'password123');
 * 
 * // Sign in with Google
 * handleGoogleLogin();
 * 
 * // Sign out
 * await logout();
 */
export const useAuth = (): UseAuthValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  /**
   * Initiates Google OAuth 2.0 authentication flow
   * 
   * Redirects user to Google's authorization page where they can:
   * - Sign in with existing Google account
   * - Create new account using Google
   * 
   * After user authorizes, redirects to `/oauth/callback` to complete sign-in.
   * 
   * @function
   * @throws {Error} Logs error if GOOGLE_CLIENT_ID is missing from environment
   * 
   * @example
   * <button onClick={handleGoogleLogin}>Sign in with Google</button>
   */
  const handleGoogleLogin = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID is missing from environment variables.');
      return;
    }

    const redirectUri =
      process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI ||
      `${window.location.origin}/oauth/callback`;

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
