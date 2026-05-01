/**
 * Application Routes
 *
 * Centralized route definitions for the application.
 * Use these constants instead of hardcoding paths.
 */

import type { NavLinkConfig } from '@/types';

export const ROUTES = {
  // Public routes
  HOME: '/',
  DISCOVER: '/discover',
  SEARCH: '/search',

  // Auth routes
  SIGNIN: '/signin',
  REGISTER: '/register',
  RESETPASSWORD: '/reset-password',

  // Content routes
  ARTISTS: '/artists',
  UPLOAD: '/upload',
  FEED: '/feed',

  // User routes
  LIBRARY: '/you/library',
  LIKES: '/you/likes',
  STATIONS: '/you/stations',
  FOLLOWING: '/you/following',
  PEOPLE: '/people',
  CHECKOUT: '/settings/subscription',
  NOTIFICATIONS: '/notifications',
  MESSAGES: '/messages',

  // User account routes
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
  SUBSCRIPTION: '/settings/subscription',
  VERIFY_EMAIL_CHANGE: '/settings/verify-email-change',
  FAILED_SUBSCRIPTION: '/checkout/cancel',
  SUCCESSFUL_SUBSCRIPTION: '/checkout/success',
  HELP: '/help',
  SHORTCUTS: '/shortcuts',
  LOGOUT: '/logout',
} as const;

/** Routes that require authentication */
export const PROTECTED_ROUTES = [
  ROUTES.UPLOAD,
  ROUTES.FEED,
  ROUTES.SETTINGS,
  ROUTES.LIBRARY,
  ROUTES.NOTIFICATIONS,
  ROUTES.MESSAGES,
  ROUTES.DASHBOARD,
] as const;

/** Routes restricted to the artist role */
export const ARTIST_ONLY_ROUTES = [] as const;

/** Primary navigation links rendered in the top nav bar. */
export const NAV_LINKS: NavLinkConfig[] = [
  { label: 'Home', href: ROUTES.DISCOVER, name: 'home' },
  { label: 'Feed', href: ROUTES.FEED, name: 'feed' },
  { label: 'Library', href: ROUTES.LIBRARY, name: 'library' },
  { label: 'Upload', href: ROUTES.UPLOAD, name: 'upload' },
];

/**
 * Items for the authenticated-user (avatar) dropdown.
 * The Profile entry is prepended at the call site so its href can be
 * built dynamically from the logged-in user's username.
 */
export const USER_DROPDOWN_ITEMS: Array<{
  label: string;
  href: string;
} | null> = [
  { label: 'Likes', href: ROUTES.LIKES },
  { label: 'Following', href: ROUTES.FOLLOWING },
  { label: 'Who to Follow', href: ROUTES.PEOPLE },
  { label: 'Subscription', href: ROUTES.CHECKOUT },
];

/** Items for the "Settings and more" (···) dropdown. */
export const MORE_DROPDOWN_ITEMS: Array<{
  label: string;
  href: string;
} | null> = [
  { label: 'Settings', href: ROUTES.SETTINGS },
  { label: 'Subscription', href: ROUTES.CHECKOUT },
  null,
  { label: 'Sign out', href: ROUTES.LOGOUT },
];

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
    SEND_VERIFICATION: '/auth/verify-email',
  },
  USERS: {
    ME: '/users/me',
    ME_CHANGE_EMAIL: '/users/me/email',
    ME_EMAIL_VERIFY: '/users/me/email/verify',
    ME_PLAYLISTS: '/users/me/playlists',
    ME_TRACKS: '/users/me/tracks',
    ME_LIKED_TRACKS: '/users/me/liked-tracks',
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
    ME_REPOSTs: '/users/me/repost',
    ME_REPOSTS: '/users/me/repost',
    SUGGESTED: '/users/suggested',
    DEVICE_TOKENS: '/users/me/device-tokens',
    BY_ID: (userId: number) => `/users/${userId}`,
    BY_USERNAME: (username: string) => `/users/username/${username}`,
    TRACKS: (userId: number) => `/users/${userId}/tracks`,
    PLAYLISTS: (username: string) => `/users/${username}/playlists`,
    LIKED_PLAYLISTS: (
      username: string //this should be changed in backend should be userid not username
    ) => `/users/${username}/liked-playlists`,
    FOLLOW: (userId: number) => `/users/${userId}/follow`,
    FOLLOWERS: (userId: number) => `/users/${userId}/followers`,
    FOLLOWING: (userId: number) => `/users/${userId}/following`,
    BLOCK: (userId: number) => `/users/${userId}/block`,
    WHO_LIKE_TRACK: (trackid: number) => `/users/tracks/${trackid}/like`, //users who like a track
    LIKE_PLAYLISTS: (userId: number) => `/users/${userId}/liked-playlists`, //playlists user has liked
    LIKE_TRACKS: (username: string) => `/users/${username}/liked-tracks`, //tracks user has liked
    WHO_REPOSTED: (trackId: number) => `/users/tracks/${trackId}/reposters`, //users who reposted a track
    REPOSTS: (username: string) => `/users/${username}/reposted-tracks`,
    REPOSTS_BY_USERNAME: (username: string) => `/users/repost/${username}`, //tracks user has reposted
  },
  TRACKS: {
    UPLOAD: '/tracks/upload/v2',
    RESOLVE: (trackSlug: string) => `/tracks/resolve/${trackSlug}`,
    BY_ID: (trackId: number) => `/tracks/${trackId}`,
    TOKEN: (token: string) => `/tracks/token/${token}`,
    COVER: (trackId: number) => `/tracks/${trackId}/cover`,
    STATUS: (trackId: number | string) => `/tracks/${trackId}/status`,
    PEAKS: (trackId: number | string) => `/tracks/${trackId}/peaks`,
    PUBLISH: (trackId: number | string) => `/tracks/${trackId}/publish`,
    SECRET_TOKEN: (trackId: number | string) =>
      `/tracks/${trackId}/secret-token`,
    GENERATE_TOKEN: (trackId: number | string) =>
      `/tracks/${trackId}/regenerate-token`,
    PLAY: (trackId: number) => `/tracks/${trackId}/play`,
    COMPLETE: (trackId: number) => `/tracks/${trackId}/complete`,
    DOWNLOAD: (trackId: number) => `/tracks/${trackId}/download`,
    REPORT: (trackId: number) => `/tracks/${trackId}/report`,
    GET_REPOSTERS: (trackId: number) => `/users/tracks/${trackId}/reposters`,
    REPOST: (trackId: number) => `/tracks/${trackId}/repost`,
    LIKE: (trackId: number) => `/tracks/${trackId}/like`,
    COMMENTS: (trackId: number) => `/tracks/${trackId}/comments`,
    DELETE: (trackId: number) => `/tracks/${trackId}`,
  },
  PLAYLISTS: {
    CREATE: '/playlists',
    RESOLVE: '/playlists/resolve',
    BY_ID: (playlistId: number) => `/playlists/${playlistId}`,
    UPDATE: (playlistId: number) => `/playlists/${playlistId}`,
    DELETE: (playlistId: number) => `/playlists/${playlistId}`,
    LIKE: (playlistId: number) => `/playlists/${playlistId}/like`, //this should be changed in backend currently tracks/playlists/:id/like but should be playlists/:id/like
    REPOST: (playlistId: number) => `/playlists/${playlistId}/repost`,
    TRACKS: (playlistId: number) => `/playlists/${playlistId}/tracks`,
    TRACK: (playlistId: number, trackId: number) =>
      `/playlists/${playlistId}/tracks/${trackId}`,
    REORDER_TRACKS: (playlistId: number) =>
      `/playlists/${playlistId}/tracks/reorder`,
    EMBED: (playlistId: number) => `/playlists/${playlistId}/embed`,
    SECRET_LINK: (playlistId: number) => `/playlists/${playlistId}/secret-link`,
    SECRET_LINK_REGENERATE: (playlistId: number) =>
      `/playlists/${playlistId}/secret-link/regenerate`,
    TOKEN: (token: string) => `/playlists/token/${token}`,
  },
  GENRES: '/genres',
  COMMENTS: {
    REPORT: (commentId: number) => `/comments/${commentId}/report`,
    REPLIES: (commentId: number) => `/comments/${commentId}/replies`,
    DELETE: (commentId: number) => `/api/comments/${commentId}`, // change when api isn't there following api dogs
  },
  ADMIN: {
    LOGIN: '/admin/login',
    REPORTS: '/admin/reports',
    REPORT_BY_ID: (id: number) => `/admin/reports/${id}`,
    BANNED_USERS: '/admin/users/banned',
    BAN_USER: (userId: number) => `/admin/users/${userId}/ban`,
    ANALYTICS: '/admin/analytics',
  },
  FEED: '/feed',
  SEARCH: '/search',
  TRENDING: '/explore/trending',
  STATIONS: {
    GENRE: '/stations/genre',
    ARTIST: '/stations/artist',
    LIKES: '/stations/likes',
  },
  MESSAGES: {
    CONVERSATIONS: '/conversations',
    CONVERSATION_MESSAGES: (userId: number) =>
      `/conversations/${userId}/messages`,
  },
  SUBSCRIPTION: {
    CHECKOUT: '/subscription/checkout',
    CANCEL: '/subscription/cancel',
    STATUS: '/subscription/status',
    RENEW: '/subscription/renew',
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    MARK_ALL_READ: '/notifications/mark-all-read',
    UNREAD_COUNT: '/notifications/unread-count',
    SETTINGS: '/notifications/settings',
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
