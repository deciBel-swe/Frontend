import type {
  AuthService,
  RegisterLocalPayload,
} from '@/services/api/authService';

import type {
  LoginResponseDTO,
  LoginUserDTO,
  RefreshTokenResponseDTO,
  RegisterLocalResponseDTO,
} from '@/types';

import {
  createMockAuthAccount,
  getMockAuthAccountByEmail,
  upsertMockAuthAccount,
  updateMockAuthEmailVerification,
} from './mockAuthUsersStore';
import {
  getMockEmailVerificationStore,
  persistMockSystemState,
} from './mockSystemStore';
import { sha256Hex } from '@/utils/sha256';
import {
  ACCESS_TOKEN_STORAGE_KEY as ACCESS_TOKEN_KEY,
  USER_STORAGE_KEY as USER_KEY,  
  AUTH_COOKIE,
} from '../api/authService';
// ================================
// Mock data
// ================================
const REFRESH_TOKEN_KEY = 'decibel_refresh_token';
const MOCK_DELAY_MS = 300;
/** Cookie name read by middleware to gate protected routes. */

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
    displayName: account.displayName,
    avatarUrl: account.avatarUrl?.trim() || "/images/default_song_image.png",
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
        avatarUrl:
          (parsed.picture || parsed.avatarUrl || '').trim() || undefined,
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
  async registerLocal(payload: RegisterLocalPayload): Promise<RegisterLocalResponseDTO> {
    await delay();

    createMockAuthAccount({
      email: payload.email,
      username:
        payload.displayName.trim() || payload.email.split('@')[0] || 'user',
      password: await sha256Hex(payload.password),
      emailVerified: true,
      tier: 'FREE',
    });

    return { message: 'User Generated successfully' };
  }

  async getSession(): Promise<LoginResponseDTO | null> {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!accessToken || !refreshToken || !raw) return null;

    const decoded = decodeMockToken(accessToken);
    if (!decoded || decoded.exp < Date.now()) {
      this.clearSession();
      return null;
    }

    // Re-sync the auth cookie so middleware stays in agreement with the
    // client session. The cookie may have expired (1 h max-age) while the
    // token is still valid, which would otherwise trigger an infinite
    // middleware redirect loop back to /signin.
    const remainingMs = decoded.exp - Date.now();
    const remainingSec = Math.floor(remainingMs / 1000);
    document.cookie = `${AUTH_COOKIE}=${accessToken}; path=/; max-age=${remainingSec}; SameSite=Lax`;

    const expiresIn = remainingSec;
    const user: LoginUserDTO = JSON.parse(raw);
    return { accessToken, expiresIn, user };
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

    document.cookie = `${AUTH_COOKIE}=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax`;

    return { accessToken, expiresIn, user };
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
    this.clearSession();
  }

  async logoutAll(): Promise<void> {
    await this.logout();
  }

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    await delay();
    const account = getMockAuthAccountByEmail(email);
    if (!account) {
      throw new Error('Invalid email or password.');
    }

    if (!account.emailVerified) {
      throw new Error('Email is not verified yet.');
    }

    const passwordHash = await sha256Hex(password);
    if (passwordHash !== account.password) {
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
    document.cookie = `${AUTH_COOKIE}=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax`;

    // --- MOBILE INTEGRATION START ---
  // Check the browser URL for a redirect parameter (e.g., ?redirect_uri=soundcloud-clone://callback)
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUri = urlParams.get('redirect_uri');

  if (redirectUri) {
    // Construct the final URL to send the user back to the app with the token
    const finalUrl = `${redirectUri}?token=${accessToken}&refreshToken=${refreshToken}`;
    
    // This is the "magic" line that closes the mobile browser and re-opens the app
    window.location.href = finalUrl;
  }
  // --- MOBILE INTEGRATION END ---

  //mobile link: https://your-site.com/login?redirect_uri=soundcloud-clone://callback

//   import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';

// Future<void> loginWithWeb() async {
//   // 1. They point to your login page with the redirect_uri query param
//   final url = 'https://your-website.com/login?redirect_uri=soundcloud-clone://callback';

//   try {
//     // 2. This opens the secure browser session
//     final result = await FlutterWebAuth2.authenticate(
//       url: url,
//       callbackUrlScheme: "soundcloud-clone",
//     );

//     // 3. 'result' will be the full string you sent: 
//     // "soundcloud-clone://callback?token=ABC&refreshToken=XYZ"
//     final Uri callbackUri = Uri.parse(result);
//     final String? token = callbackUri.queryParameters['token'];
    
//     print("Success! Received token: $token");
//   } catch (e) {
//     print("User closed the browser or error occurred: $e");
//   }
// }

    return { accessToken, expiresIn, user };
  }

  // ================================
  // Email verification methods
  // ================================

  async resendVerification(email: string): Promise<{ message: string; coolDown?: number | null }> {
    await delay();

    const token = crypto.randomUUID();

    mockEmailVerification[token] = {
      email,
      token,
      verified: true,
    };

    updateMockAuthEmailVerification(email, true);
    persistMockSystemState();

    return { message: 'Verification email sent.', coolDown: 60 };
  }

  async forgotPassword(_email: string): Promise<{ message: string }> {
    await delay();

    return { message: 'Password reset email sent.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    await delay();

    const entry = mockEmailVerification[token];
    if (!entry) {
      return { message: 'Invalid or expired verification token.' };
    }

    entry.verified = true;
    updateMockAuthEmailVerification(entry.email, true);
    persistMockSystemState();
    return { message: 'Email verified successfully.' };
  }

  async requestEmailVerification(email: string): Promise<{ message: string }> {
    return this.resendVerification(email);
  }

  // ================================

  public clearSession(): void {
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
> = getMockEmailVerificationStore();
