/**
 * Global TypeScript Type Definitions
 *
 * This file contains common types used throughout the application.
 */

// ================================
// Auth — Shared Types
// ================================

export type UserRole = 'artist' | 'listener';

export type UserTier = 'FREE' | 'ARTIST';

// ================================
// Auth
// ================================

/** User object returned inside LoginResponseDTO */
export interface LoginUserDTO {
  id: number;
  username: string;
  tier: UserTier;
  profileUrl?: string;
}

/** Response from POST /auth/login/local and POST /auth/oauth/google */
export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: LoginUserDTO;
}

/** Response from POST /auth/refreshtoken */
export interface RefreshTokenResponseDTO {
  accessToken: string;
  expiresIn: number;
}

export interface ApiErrorDTO {
  statusCode: number;
  message: string;
  error?: string;
}

// ================================
// Auth — Context Shape
// ================================

export interface AuthState {
  user: LoginUserDTO | null;
  /** Derived from tier. ARTIST → 'artist', FREE → 'listener'. Used for conditional rendering. */
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ================================
// Navigation
// ================================

export type ActiveNav = 'home' | 'feed' | 'library' | 'upload';

export interface NavLinkConfig {
  label: string;
  href: string;
  name: ActiveNav;
}

// ================================
// Track Visibility 
// ================================
 
export type TrackPrivacyValue = 'public' | 'private' | 'scheduled';
 
export interface TrackVisibility {
  isPrivate: boolean;
}
 
export interface UpdateTrackVisibilityDto {
  isPrivate: boolean;
}

// ================================
// Secret Link 
// ================================
 
export interface SecretLink {
  secretLink: string; // token returned from API
}
 
/** Formats the full shareable URL from a token */
export function formatSecretUrl(trackId: string, token: string): string {
  return `decibel.com/tracks/${trackId}?s=${token}`;
}
 