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
  FEED: '/feed',
  SETTINGS: '/settings',
} as const;

/** Routes that require authentication */
export const PROTECTED_ROUTES = [
  ROUTES.UPLOAD,
  ROUTES.FEED,
  ROUTES.SETTINGS,
] as const;

/** Routes restricted to the artist role */
export const ARTIST_ONLY_ROUTES = [] as const;

/**
 * API Endpoints
 *
 * Centralized API endpoint definitions.
 * These are relative paths that will be appended to the API base URL.
 * Static routes are strings; dynamic routes are arrow functions.
 */

export const API_ENDPOINTS = {
  AUTH: {
    CHECK_USER: '/auth/check-user',
    REGISTER_LOCAL: '/auth/register/local',
    LOGIN_LOCAL: '/auth/login/local',
    REFRESH: '/auth/refreshtoken',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE_TRIGGER: '/oauth2/authorization/google',
    GOOGLE_OAUTH: '/auth/oauth/google',
  },
  USERS: {
    ME: '/users/me',
    ME_RESET_PASSWORD: '/users/me/reset-password',
    ME_ADD_EMAIL: '/users/me/add-new-email',
    ME_UPDATE_PRIMARY_EMAIL: '/users/me/update-email-primary',
    ME_SOCIAL_LINKS: '/users/me/social-links',
    ME_ROLE: '/users/me/role',
    ME_PRIVACY: '/users/me/privacy',
    ME_TIER: '/users/me/tier',
    ME_IMAGES: '/users/me/images',
    ME_HISTORY: '/users/me/history',
    ME_BLOCKED: '/users/me/blocked',
    SUGGESTED: '/users/suggested',
    BY_ID: (userId: number) => `/users/${userId}`,
    TRACKS: (userId: number) => `/users/${userId}/tracks`,
    PLAYLISTS: (userId: number) => `/users/${userId}/playlists`,
    FOLLOW: (userId: number) => `/users/${userId}/follow`,
    FOLLOWERS: (userId: number) => `/users/${userId}/followers`,
    FOLLOWING: (userId: number) => `/users/${userId}/following`,
    BLOCK: (userId: number) => `/users/${userId}/block`,
  },
  TRACKS: {
    UPLOAD: '/tracks/upload',
    BY_ID: (trackId: number) => `/tracks/${trackId}`,
    STATUS: (trackId: number | string) => `/tracks/${trackId}/status`,
    PEAKS: (trackId: number | string) => `/tracks/${trackId}/peaks`,
    PUBLISH: (trackId: number | string) => `/tracks/${trackId}/publish`,
    SECRET_LINK: (trackId: number | string) => `/tracks/${trackId}/secret-link`,
    PLAY: (trackId: number) => `/tracks/${trackId}/play`,
    COMPLETE: (trackId: number) => `/tracks/${trackId}/complete`,
    DOWNLOAD: (trackId: number) => `/tracks/${trackId}/download`,
    REPORT: (trackId: number) => `/tracks/${trackId}/report`,
  },
  GENRES: '/genres',
  COMMENTS: {
    REPORT: (commentId: number) => `/comments/${commentId}/report`,
  },
  ADMIN: {
    REPORTS: '/admin/reports',
    REPORT_BY_ID: (id: number) => `/admin/reports/${id}`,
    SUSPEND_USER: (userId: number) => `/admin/users/${userId}/suspend`,
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
