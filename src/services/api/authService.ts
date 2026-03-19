import { apiRequest } from '@/hooks/useAPI';
import type {
  DeviceInfoDTO,
  LoginResponseDTO,
  RefreshTokenResponseDTO,
} from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';
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

const USER_STORAGE_KEY = 'user';
const REFRESH_TOKEN_STORAGE_KEY = 'decibel_refresh_token';

const getDeviceType = (): DeviceInfoDTO['deviceType'] => {
  if (typeof window === 'undefined') {
    return 'DESKTOP';
  }

  const width = window.innerWidth;
  if (width < 768) {
    return 'MOBILE';
  }
  if (width < 1024) {
    return 'TABLET';
  }
  return 'DESKTOP';
};

const buildDeviceInfo = (): DeviceInfoDTO => {
  const userAgent =
    typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown-device';

  return {
    deviceType: getDeviceType(),
    fingerPrint: userAgent,
    deviceName: userAgent,
  };
};

// ================================
// Real auth service
// ================================

export class RealAuthService implements AuthService {
  /** ================================
   * Resume session from cookies
   * ================================ */
  private accessToken: string | null = null;

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const response = await apiRequest(API_CONTRACTS.AUTH_LOGIN_LOCAL, {
      payload: { email, password },
    });

    this.persistSession(response);
    return response;
  }

  async loginWithGoogle(code: string): Promise<LoginResponseDTO> {
    const response = await apiRequest(API_CONTRACTS.AUTH_OAUTH_GOOGLE, {
      payload: {
        authTokenDto: code,
        deviceInfo: buildDeviceInfo(),
      },
    });

    this.persistSession(response);
    return response;
  }

  async getSession(): Promise<LoginResponseDTO | null> {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;

    return {
      accessToken: this.accessToken ?? '',
      refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? undefined,
      user: JSON.parse(stored),
      expiresIn: 3600,
    };
  }

  async refreshToken(): Promise<RefreshTokenResponseDTO> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available. Please log in again.');
    }

    const response = await apiRequest(API_CONTRACTS.AUTH_REFRESH_TOKEN, {
      payload: { refreshToken },
    });

    this.accessToken = response.accessToken;
    return response;
  }

  async logout(): Promise<void> {
    await apiRequest(API_CONTRACTS.AUTH_LOGOUT);
    this.clearSession();
  }

  async logoutAll(): Promise<void> {
    await apiRequest(API_CONTRACTS.AUTH_LOGOUT_ALL);
    this.clearSession();
  }

  private persistSession(response: LoginResponseDTO): void {
    this.accessToken = response.accessToken;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));

    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
    }
  }

  private clearSession(): void {
    this.accessToken = null;
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}
