import type { LoginResponseDTO, RefreshTokenResponseDTO } from '@/types';
import axios from "axios";
/**
 * Auth service contract.
 * Both real and mock implementations must satisfy this interface.
 */
export interface AuthService {
  /** Log in with email and password (POST /auth/login/local) */
  login(email: string, password: string): Promise<LoginResponseDTO>;

  // NEW: Handle the Google OAuth code exchange
  loginWithGoogle(code: string): Promise<LoginResponseDTO>;

  /** Resume an existing session from stored credentials (no network call) */
  getSession(): Promise<LoginResponseDTO | null>;

  /** Refresh the access token (POST /auth/refreshtoken) */
  refreshToken(): Promise<RefreshTokenResponseDTO>;

  /** Log out of the current session (POST /auth/logout) */
  logout(): Promise<void>;

  /** Log out of all sessions (POST /auth/logout-all) */
  logoutAll(): Promise<void>;

}

// ================================
// Config
// ================================

// Your backend base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ================================
// Real auth service
// ================================

export class RealAuthService implements AuthService {
  /** ================================
   * Resume session from cookies
   * ================================ */
  async getSession(): Promise<LoginResponseDTO | null> {
    try {
      // Backend reads cookies automatically — no body needed
      const res = await axios.get(`${API_BASE}/auth/session`, {
        withCredentials: true,
      });

      return res.data as LoginResponseDTO;
    } catch (_) {
      return null;
    }
  }

  /** ================================
   * Email + password login
   * POST /auth/login/local
   * ================================ */
  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const res = await axios.post(
      `${API_BASE}/auth/login/local`,
      { email, password },
      { withCredentials: true }
    );

    return res.data as LoginResponseDTO;
  }

  /** ================================
   * Google OAuth login
   * POST /auth/oauth/google
   * ================================ */
  async loginWithGoogle(code: string): Promise<LoginResponseDTO> {
    const res = await axios.post(
      `${API_BASE}/auth/oauth/google`,
      { code },
      { withCredentials: true }
    );

    return res.data as LoginResponseDTO;
  }

  /** ================================
   * Refresh access token
   * POST /auth/refreshtoken
   * ================================ */
  async refreshToken(): Promise<RefreshTokenResponseDTO> {
    const res = await axios.post(
      `${API_BASE}/auth/refreshtoken`,
      {},
      { withCredentials: true }
    );

    return res.data as RefreshTokenResponseDTO;
  }

  /** ================================
   * Logout current device
   * POST /auth/logout
   * ================================ */
  async logout(): Promise<void> {
    await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

  /** ================================
   * Logout all devices
   * POST /auth/logout-all
   * ================================ */
  async logoutAll(): Promise<void> {
    await axios.post(
      `${API_BASE}/auth/logout-all`,
      {},
      { withCredentials: true }
    );
  }
}