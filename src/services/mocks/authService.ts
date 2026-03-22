import type {
  AuthService,
  ReCaptchaVerificationResult,
} from '@/services/api/authService';
import { API_ENDPOINTS } from '@/constants/routes';
import { apiClient } from '@/hooks/useAPI';

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

// For testing purposes, only allow 5 specific users to log in with email (any password allowed)
const allowedUsers: Record<string, LoginUserDTO> = {
  'user1@test.com': { id: 1, username: 'user1', tier: 'FREE' },
  'user2@test.com': { id: 2, username: 'user2', tier: 'FREE' },
  'user3@test.com': { id: 3, username: 'user3', tier: 'FREE' },
  'user4@test.com': { id: 4, username: 'user4', tier: 'FREE' },
  'user5@test.com': { id: 5, username: 'user5', tier: 'FREE' },
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
// const resolveUserByEmail = (email: string): LoginUserDTO =>
//   email === 'artist@decibel.test' ? mockUsers.artist : mockUsers.listener;

// ================================
// Mock auth service
// ================================

export class MockAuthService implements AuthService {
  async verifyReCaptcha(
    token: string,
    _action: string = 'submit_form'
  ): Promise<ReCaptchaVerificationResult> {
    await delay(50);

    if (!token || !token.trim()) {
      return {
        success: false,
        score: 0,
        error: 'Verification failed',
      };
    }

    // Frontend-only mock mode should never call the API endpoint.
    if (token.startsWith('fail')) {
      return {
        success: false,
        score: 0.1,
        error: 'Verification failed',
      };
    }

    return {
      success: true,
      score: 0.92,
    };
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

    // When the backend is ready, the RealAuthService will look like this:
    // return await apiClient.post('/auth/oauth/google', {
    //   code,
    //   deviceInfo: getDeviceInfo()
    // });

    // Mock successful exchange: default to listener role
    const user = mockUsers.listener;
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
    //const user = resolveUserByEmail(email);

    // Check if email exists in allowed users
    const user = allowedUsers[email];
    if (!user) {
      throw new Error('User not allowed. Only 5 users can login in this mock.');
    }

    const expiresIn = 3600;
    const accessToken = createMockToken(user.id, expiresIn);
    const refreshToken = createMockToken(user.id, 86400);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Sync to cookie so middleware can read it on the server side.
    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${expiresIn}; SameSite=Lax`;

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

    return { accessToken, expiresIn, refreshToken, user };
  }

  // ================================
  // Email verification methods
  // ================================

  async requestEmailVerification(email: string): Promise<{ success: boolean }> {
    await delay();

    const token = crypto.randomUUID();

    mockEmailVerification[token] = {
      email,
      token,
      verified: false,
    };

    // Call API route to send real email
    await apiClient.request({
      baseURL: '',
      method: 'POST',
      url: API_ENDPOINTS.AUTH.SEND_VERIFICATION,
      data: { email, token },
    });

    return { success: true };
  }

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    await delay();

    if (!mockEmailVerification[token]) {
      return { success: false };
    }

    mockEmailVerification[token].verified = true;
    return { success: true };
  }

  async checkEmailVerified(email: string): Promise<boolean> {
    await delay();

    return Object.values(mockEmailVerification).some(
      (entry) => entry.email === email && entry.verified === true
    );
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
