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
  private accessToken: string | null = null;

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const res = await axios.post(
      `${API_BASE}/auth/login/local`,
      { email, password },
      { withCredentials: true }
    );

    const { accessToken, expiresIn, user } = res.data;

    this.accessToken = accessToken;
    localStorage.setItem("user", JSON.stringify(user));

    return { accessToken, user, expiresIn, refreshToken: "" };
  }

  async loginWithGoogle(code: string): Promise<LoginResponseDTO> {
    const res = await axios.post(
      `${API_BASE}/auth/oauth/google`,
      { code },
      { withCredentials: true }
    );

    const { accessToken, expiresIn, user } = res.data;

    this.accessToken = accessToken;
    localStorage.setItem("user", JSON.stringify(user));

    return { accessToken, user, expiresIn, refreshToken: "" };
  }

  async getSession(): Promise<LoginResponseDTO | null> {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    return {
      accessToken: this.accessToken ?? "",
      refreshToken: "",
      user: JSON.parse(stored),
      expiresIn: 3600,
    };
  }

  async refreshToken(): Promise<RefreshTokenResponseDTO> {
    const res = await axios.post(
      `${API_BASE}/auth/refreshtoken`,
      {},
      { withCredentials: true }
    );

    const { accessToken, expiresIn } = res.data;

    this.accessToken = accessToken;

    return { accessToken, expiresIn };
  }

  async logout(): Promise<void> {
    await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      { withCredentials: true }
    );

    this.accessToken = null;
    localStorage.removeItem("user");
  }

  async logoutAll(): Promise<void> {
    await axios.post(
      `${API_BASE}/auth/logout-all`,
      {},
      { withCredentials: true }
    );

    this.accessToken = null;
    localStorage.removeItem("user");
  }
}