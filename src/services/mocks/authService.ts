import type { AuthService } from '@/services/api/authService';

import type {
  LoginResponseDTO,
  LoginUserDTO,
  RefreshTokenResponseDTO,
  UserRole,
} from '@/types';

// ================================
// Mock data
// ================================

const MOCK_DELAY_MS = 300;
const ACCESS_TOKEN_KEY = 'decibel_access_token';
const REFRESH_TOKEN_KEY = 'decibel_refresh_token';
const USER_KEY = 'decibel_mock_user';
/** Cookie name read by middleware to gate protected routes. */
const AUTH_COOKIE = 'decibel_auth';

const mockUsers: Record<UserRole, LoginUserDTO> = {
  artist: {
    id: 1,
    username: 'mockartist',
    tier: 'ARTIST',
  },
  listener: {
    id: 2,
    username: 'mocklistener',
    tier: 'FREE',
  },
};

/** Simulates a network round-trip */
const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((r) => setTimeout(r, ms));

/** Encode a minimal JWT-like payload (base64, not signed — mock only) */
const createMockToken = (userId: number, expiresIn = 3600): string => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({ sub: userId, exp: Date.now() + expiresIn * 1000 })
  );
  return `${header}.${payload}.mock`;
};

const decodeMockToken = (
  token: string
): { sub: number; exp: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

/** Select mock user by email. artist@decibel.test → artist, everything else → listener */
const resolveUserByEmail = (email: string): LoginUserDTO =>
  email === 'artist@decibel.test' ? mockUsers.artist : mockUsers.listener;

// ================================
// Mock auth service
// ================================

export class MockAuthService implements AuthService {
  async getSession(): Promise<LoginResponseDTO | null> {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!accessToken || !refreshToken || !raw) return null;

    const decoded = decodeMockToken(accessToken);
    if (!decoded || decoded.exp < Date.now()) {
      this._clearStorage();
      return null;
    }

    const user: LoginUserDTO = JSON.parse(raw);
    return { accessToken, refreshToken, user };
  }

  async refreshToken(): Promise<RefreshTokenResponseDTO> {
    await delay();
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No session');

    const decoded = decodeMockToken(refreshToken);
    if (!decoded) throw new Error('Invalid refresh token');

    const expiresIn = 3600;
    const newAccessToken = createMockToken(decoded.sub, expiresIn);
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    return { accessToken: newAccessToken, expiresIn };
  }

  async logout(): Promise<void> {
    await delay(100);
    this._clearStorage();
  }

  async logoutAll(): Promise<void> {
    await this.logout();
  }

  async login(email: string, _password: string): Promise<LoginResponseDTO> {
    await delay();
    const user = resolveUserByEmail(email);
    const expiresIn = 3600;
    const accessToken = createMockToken(user.id, expiresIn);
    const refreshToken = createMockToken(user.id, 86400);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Sync to cookie so middleware can read it on the server side.
    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${expiresIn}; SameSite=Lax`;
    return { accessToken, refreshToken, user };
  }

  private _clearStorage(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Expire the auth cookie.
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}
