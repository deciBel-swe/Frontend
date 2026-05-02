import {apiRequest } from '@/hooks/useAPI';
import type {
  DeviceInfoDTO,
  LoginResponseDTO,
  RegisterLocalRequestDTO,
  RefreshTokenResponseDTO,
  RegisterLocalResponseDTO,
} from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';
import { sha256Hex } from '@/utils/sha256';

export type RegisterLocalPayload = Omit<RegisterLocalRequestDTO, 'deviceInfo'>;
/**
 * Auth service contract.
 * Both real and mock implementations must satisfy this interface.
 */
export interface AuthService {
  /** Log in with email and password (POST /auth/login/local) */
  login(email: string, password: string): Promise<LoginResponseDTO>;

  /** Register a local account (POST /auth/register/local). */
  registerLocal(payload: RegisterLocalPayload): Promise<RegisterLocalResponseDTO>;

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

  /** Resend email verification message (POST /auth/resend-verification). */
  resendVerification(email: string): Promise<{ message: string; coolDown?: number | null }>;

  /** Send password reset message (POST /auth/forgot-password). */
  forgotPassword(email: string): Promise<{ message: string }>;

  /** Verify email token (POST /auth/verify-email). */
  verifyEmail(token: string): Promise<{ message: string }>;

  /** Backward-compatible alias for resendVerification. */
  requestEmailVerification(email: string): Promise<{ message: string }>;

  clearSession(): void;
}

export const USER_STORAGE_KEY = 'user';
export const ACCESS_TOKEN_STORAGE_KEY = 'decibel_access_token';
export const AUTH_COOKIE = 'decibel_auth';

const hasUsableAccessToken = (token: string | null): token is string =>
  typeof token === 'string' &&
  token.trim().length > 0 &&
  token !== 'undefined' &&
  token !== 'null';
const getDeviceType = (): DeviceInfoDTO['deviceType'] => {
  // if (typeof window === 'undefined') {
  //   return 'DESKTOP';
  // }

  // const width = window.innerWidth;
  // if (width < 768) {
  //   return 'MOBILE';
  // }
  // if (width < 1024) {
  //   return 'TABLET';
  // }
  return 'WEB';
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
    const hashedPassword = await sha256Hex(password);

    const response = await apiRequest(API_CONTRACTS.AUTH_LOGIN_LOCAL, {
      payload: { email, password: hashedPassword, deviceInfo: buildDeviceInfo() },
    });

    this.persistSession(response);
    return response;
  }

  async registerLocal(payload: RegisterLocalPayload): Promise<RegisterLocalResponseDTO> {
    const hashedPassword = await sha256Hex(payload.password);

    return apiRequest(API_CONTRACTS.AUTH_REGISTER_LOCAL, {
      payload: {
        ...payload,
        password: hashedPassword,
        deviceInfo: buildDeviceInfo(),
      },
    });
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
    const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!stored || !hasUsableAccessToken(storedAccessToken)) {
      this.clearSession();
      return null;
    }

    return {
      accessToken: this.accessToken ?? storedAccessToken,
      user: JSON.parse(stored),
      expiresIn: 3600,
    };
  }

  async refreshToken(): Promise<RefreshTokenResponseDTO> {
    const response = await apiRequest(API_CONTRACTS.AUTH_REFRESH_TOKEN);
    this.accessToken = response.accessToken;
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.accessToken);
    document.cookie = `${AUTH_COOKIE}=${response.accessToken}; path=/; max-age=${response.expiresIn}; SameSite=Lax`;
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

  async resendVerification(email: string): Promise<{ message: string; coolDown?: number | null }> {
    const response = await apiRequest(API_CONTRACTS.RESEND_VERIFICATION, {
      payload: { email ,deviceInfo: buildDeviceInfo()},
    });
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiRequest(API_CONTRACTS.FORGOT_PASSWORD, {
      payload: { email },
    });
    return response;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiRequest(API_CONTRACTS.VERIFY_EMAIL, {
      payload: { token },
    });
    return response;
  }

  async requestEmailVerification(email: string): Promise<{ message: string }> {
    return this.resendVerification(email);
  }

  private persistSession(response: LoginResponseDTO): void {
    this.accessToken = response.accessToken;
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    document.cookie = `${AUTH_COOKIE}=${response.accessToken}; path=/; max-age=${response.expiresIn}; SameSite=Lax`;
  }

  public clearSession(): void {
    this.accessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}
