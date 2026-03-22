import type {
  AuthService,
  RegisterLocalPayload,
} from '@/services/api/authService';

import type {
  LoginResponseDTO,
  LoginUserDTO,
  RefreshTokenResponseDTO,
} from '@/types';

import {
  createMockAuthAccount,
  getMockAuthAccountByEmail,
  upsertMockAuthAccount,
  updateMockAuthEmailVerification,
} from './mockAuthUsersStore';

// ================================
// Mock data
// ================================

const MOCK_DELAY_MS = 300;
const ACCESS_TOKEN_KEY = 'decibel_access_token';
const REFRESH_TOKEN_KEY = 'decibel_refresh_token';
const USER_KEY = 'decibel_mock_user';
/** Cookie name read by middleware to gate protected routes. */
const AUTH_COOKIE = 'decibel_auth';

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

const toLoginUser = (
  account: ReturnType<typeof getMockAuthAccountByEmail>
): LoginUserDTO => {
  if (!account) {
    throw new Error('User not found');
  }

  return {
    id: account.id,
    username: account.username,
    tier: account.tier,
    avatarUrl: account.avatarUrl,
  };
};

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const normalizeUsername = (value: string): string => {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '');

  return cleaned || 'google-user';
};

const extractGoogleIdentity = (
  code: string
): { email: string; username: string; avatarUrl?: string } => {
  const payload = parseJwtPayload(code);
  if (payload) {
    const payloadEmail =
      typeof payload.email === 'string' ? payload.email.trim() : '';
    const payloadName =
      typeof payload.name === 'string'
        ? payload.name
        : typeof payload.given_name === 'string'
          ? payload.given_name
          : '';
    const payloadPicture =
      typeof payload.picture === 'string' ? payload.picture.trim() : '';

    if (payloadEmail) {
      return {
        email: payloadEmail.toLowerCase(),
        username: normalizeUsername(
          payloadName || payloadEmail.split('@')[0] || ''
        ),
        avatarUrl: payloadPicture || undefined,
      };
    }
  }

  try {
    const parsed = JSON.parse(code) as {
      email?: string;
      username?: string;
      name?: string;
      picture?: string;
      avatarUrl?: string;
    };

    if (parsed.email?.trim()) {
      const email = parsed.email.trim().toLowerCase();
      return {
        email,
        username: normalizeUsername(
          (parsed.username || parsed.name || email.split('@')[0] || '').trim()
        ),
        avatarUrl: (parsed.picture || parsed.avatarUrl || '').trim() || undefined,
      };
    }
  } catch {
    // Ignore JSON parse errors and continue with simpler fallbacks.
  }

  if (code.includes('@')) {
    const email = code.trim().toLowerCase();
    return {
      email,
      username: normalizeUsername(email.split('@')[0] || ''),
    };
  }

  // OAuth authorization codes are opaque and should not be treated as names.
  return {
    email: 'google-user@google.mock',
    username: 'google-user',
  };
};

// ================================
// Mock auth service
// ================================

export class MockAuthService implements AuthService {
  async registerLocal(
    payload: RegisterLocalPayload
  ): Promise<string> {
    await delay();

    createMockAuthAccount({
      email: payload.email,
      username: payload.username.trim() || payload.email.split('@')[0] || 'user',
      password: payload.password,
      emailVerified: true,
      tier: 'FREE',
    });

    return 'User Generated successfully';
  }

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

    // Re-sync the auth cookie so middleware stays in agreement with the
    // client session. The cookie may have expired (1 h max-age) while the
    // token is still valid, which would otherwise trigger an infinite
    // middleware redirect loop back to /signin.
    const remainingMs = decoded.exp - Date.now();
    const remainingSec = Math.floor(remainingMs / 1000);
    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${remainingSec}; SameSite=Lax`;

    const expiresIn = remainingSec;
    const user: LoginUserDTO = JSON.parse(raw);
    return { accessToken, expiresIn, refreshToken, user };
  }

  async loginWithGoogle(code: string): Promise<LoginResponseDTO> {
    await delay(); // simulate network latency

    if (!code) throw new Error('Authorization code is missing');

    const googleIdentity = extractGoogleIdentity(code);
    const account = upsertMockAuthAccount({
      email: googleIdentity.email,
      username: googleIdentity.username,
      avatarUrl: googleIdentity.avatarUrl,
      emailVerified: true,
      tier: 'FREE',
    });
    const user = toLoginUser(account);
    const expiresIn = 3600;

    const accessToken = createMockToken(user.id, expiresIn);
    const refreshToken = createMockToken(user.id, 86400);

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${expiresIn}; SameSite=Lax`;

    return { accessToken, expiresIn, refreshToken, user };
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
    const account = getMockAuthAccountByEmail(email);
    if (!account) {
      throw new Error('User not found. Please register first.');
    }

    if (!account.emailVerified) {
      throw new Error('Email is not verified yet.');
    }

    if (_password !== account.password) {
      throw new Error('Invalid email or password.');
    }

    const user = toLoginUser(account);

    const expiresIn = 3600;
    const accessToken = createMockToken(user.id, expiresIn);
    const refreshToken = createMockToken(user.id, 86400);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Sync to cookie so middleware can read it on the server side.
    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${expiresIn}; SameSite=Lax`;
    return { accessToken, expiresIn, refreshToken, user };
  }

  // ================================
  // Email verification methods
  // ================================

  async resendVerification(email: string): Promise<{ success: boolean }> {
    await delay();

    const token = crypto.randomUUID();

    mockEmailVerification[token] = {
      email,
      token,
      verified: true,
    };

    updateMockAuthEmailVerification(email, true);

    return { success: true };
  }

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    await delay();

    const entry = mockEmailVerification[token];
    if (!entry) {
      return { success: false };
    }

    entry.verified = true;
    updateMockAuthEmailVerification(entry.email, true);
    return { success: true };
  }

  async requestEmailVerification(email: string): Promise<{ success: boolean }> {
    return this.resendVerification(email);
  }

  // ================================

  private _clearStorage(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Expire the auth cookie.
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

// ================================
// Mock email verification storage
// ================================

export const mockEmailVerification: Record<
  string,
  { email: string; token: string; verified: boolean }
> = {};
