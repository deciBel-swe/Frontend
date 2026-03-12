import type { LoginResponseDTO, RefreshTokenResponseDTO } from '@/types';

/**
 * Auth service contract.
 * Both real and mock implementations must satisfy this interface.
 */
export interface AuthService {
  /** Log in with email and password (POST /auth/login/local) */
  login(email: string, password: string): Promise<LoginResponseDTO>;

  // NEW: Log in with Google OAuth token (POST /auth/oauth/google)
  loginWithGoogle(googleToken: string): Promise<LoginResponseDTO>;

  /** Resume an existing session from stored credentials (no network call) */
  getSession(): Promise<LoginResponseDTO | null>;

  /** Refresh the access token (POST /auth/refreshtoken) */
  refreshToken(): Promise<RefreshTokenResponseDTO>;

  /** Log out of the current session (POST /auth/logout) */
  logout(): Promise<void>;

  /** Log out of all sessions (POST /auth/logout-all) */
  logoutAll(): Promise<void>;
}
