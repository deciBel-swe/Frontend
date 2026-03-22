/**
 * Global TypeScript Type Definitions
 *
 * This file contains common types used throughout the application.
 */

import { z } from 'zod';

// ================================
// Auth — Shared Types
// ================================

export type UserRole = 'artist' | 'listener';

export const userTierSchema = z.enum(['FREE', 'ARTIST', 'ARTIST_PRO']);
export type UserTier = z.infer<typeof userTierSchema>;

// ================================
// Auth
// ================================

/** DTO sent to POST /auth/login/local */
export const loginLocalRequestDTOSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type LoginLocalRequestDTO = z.infer<typeof loginLocalRequestDTOSchema>;

/** Device metadata sent to OAuth exchange endpoints. */
export const deviceInfoDTOSchema = z.object({
  deviceType: z.enum(['DESKTOP', 'MOBILE', 'TABLET']),
  fingerPrint: z.string().trim().min(1),
  deviceName: z.string().trim().min(1),
});
export type DeviceInfoDTO = z.infer<typeof deviceInfoDTOSchema>;

/** DTO sent to POST /auth/register/local */
export const registerLocalRequestDTOSchema = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  password: z.string().min(1),
  dateOfBirth: z.string().trim().min(1),
  gender: z.string().trim().min(1),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  captchaToken: z.string().trim().min(1),
  deviceInfo: deviceInfoDTOSchema,
});
export type RegisterLocalRequestDTO = z.infer<
  typeof registerLocalRequestDTOSchema
>;

/** DTO sent to POST /auth/oauth/google */
export const googleOAuthRequestDTOSchema = z.object({
  authTokenDto: z.string().trim().min(1),
  deviceInfo: deviceInfoDTOSchema,
});
export type GoogleOAuthRequestDTO = z.infer<typeof googleOAuthRequestDTOSchema>;

/** User object returned inside LoginResponseDTO */
export const loginUserDTOSchema = z.object({
  id: z.number().int().nonnegative(),
  username: z.string().trim().min(1),
  tier: userTierSchema,
  profileUrl: z.string().trim().min(1).optional(),
  avatarUrl: z.string().trim().min(1).optional(),
});
export type LoginUserDTO = z.infer<typeof loginUserDTOSchema>;

/** Response from POST /auth/login/local and POST /auth/oauth/google */
export const loginResponseDTOSchema = z.object({
  accessToken: z.string().trim().min(1),
  refreshToken: z.string().trim().min(1).optional(),
  expiresIn: z.number().int().positive().optional(),
  user: loginUserDTOSchema,
});
export type LoginResponseDTO = z.infer<typeof loginResponseDTOSchema>;

/** DTO sent to POST /auth/refreshtoken */
export const refreshTokenRequestDTOSchema = z.object({
  refreshToken: z.string().trim().min(1),
});
export type RefreshTokenRequestDTO = z.infer<
  typeof refreshTokenRequestDTOSchema
>;

/** Response from POST /auth/refreshtoken */
export const refreshTokenResponseDTOSchema = z.object({
  accessToken: z.string().trim().min(1),
  expiresIn: z.number().int().nonnegative(),
});
export type RefreshTokenResponseDTO = z.infer<
  typeof refreshTokenResponseDTOSchema
>;

/** Generic backend error payload DTO */
export const apiErrorDTOSchema = z.object({
  statusCode: z.number().int(),
  message: z.string().min(1),
  error: z.string().min(1).optional(),
});
export type ApiErrorDTO = z.infer<typeof apiErrorDTOSchema>;

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
  loginWithGoogle: (code: string) => Promise<void>;
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

export type { UploadTrackResponse } from './tracks';
export { uploadSchema, toTrackSlug } from './uploadSchema';
export type { UploadFormValues } from './uploadSchema';
