import { API_ENDPOINTS } from '@/constants/routes';
import { apiClient, apiRequest } from '@/hooks/useAPI';
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

  /** Verify a ReCaptcha token before auth-related submissions */
  verifyReCaptcha(
    token: string,
    action?: string
  ): Promise<ReCaptchaVerificationResult>;
}

export interface ReCaptchaVerificationResult {
  success: boolean;
  score?: number;
  error?: string;
}

const USER_STORAGE_KEY = 'user';
const ACCESS_TOKEN_STORAGE_KEY = 'decibel_access_token';
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

    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    return {
      accessToken: this.accessToken ?? storedAccessToken ?? '',
      refreshToken:
        localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? undefined,
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
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.accessToken);
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

  async verifyReCaptcha(
    token: string,
    action: string = 'submit_form'
  ): Promise<ReCaptchaVerificationResult> {
    if (!token || !token.trim()) {
      return { success: false, error: 'Token is required' };
    }

    try {
      const response = await apiClient.request<{
        success: boolean;
        score?: number;
        error?: string;
        errors?: string[];
      }>({
        baseURL: '',
        method: 'POST',
        url: API_ENDPOINTS.AUTH.VERIFY_RECAPTCHA,
        data: { token, action },
      });

      const data = response.data;
      if (data.success) {
        return {
          success: true,
          score: data.score,
        };
      }

      const normalizedError =
        data.error ||
        (Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.join(', ')
          : 'Verification failed');

      return {
        success: false,
        score: data.score,
        error: normalizedError,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private persistSession(response: LoginResponseDTO): void {
    this.accessToken = response.accessToken;
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));

    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
    }
  }

  private clearSession(): void {
    this.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}
