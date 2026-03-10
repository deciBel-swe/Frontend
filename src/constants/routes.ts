/**
 * Application Routes
 *
 * Centralized route definitions for the application.
 * Use these constants instead of hardcoding paths.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',

  // Auth routes
  SIGNIN: '/signin',

  // Protected routes
  UPLOAD: '/upload',
  DISCOVER: '/discover',
  FEED: '/feed',
  SETTINGS: '/settings',
  YOU: '/you',
} as const;

/** Routes that require authentication */
export const PROTECTED_ROUTES = [
  ROUTES.UPLOAD,
  ROUTES.FEED,
  ROUTES.SETTINGS,
  ROUTES.YOU,
] as const;

/** Routes restricted to the artist role */
export const ARTIST_ONLY_ROUTES = [
] as const;

/**
 * API Endpoints
 *
 * Centralized API endpoint definitions.
 * These are relative paths that will be appended to the API base URL.
 */

export const API_ENDPOINTS = {
  AUTH: {
    REFRESH: '/auth/refreshtoken',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  USERS: {
    ME: '/users/me',
    ME_ROLE: '/users/me/role',
  },
} as const;

/**
 * Helper function to build full API URL
 * @param endpoint - API endpoint path
 * @param baseURL - Optional base URL override
 */
export const getApiUrl = (endpoint: string, baseURL?: string): string => {
  const base = baseURL || process.env.NEXT_PUBLIC_API_URL || '';
  return `${base}${endpoint}`;
};
