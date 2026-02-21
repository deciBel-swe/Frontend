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
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

/**
 * API Endpoints
 * 
 * Centralized API endpoint definitions.
 * These are relative paths that will be appended to the API base URL.
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  }
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
