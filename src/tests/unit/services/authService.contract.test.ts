import { apiRequest } from '@/hooks/useAPI';
import { RealAuthService } from '@/services/api/authService';
import { MockAuthService } from '@/services/mocks/authService';
import {
  loginResponseDTOSchema,
  refreshTokenResponseDTOSchema,
  type LoginResponseDTO,
  type LoginUserDTO,
} from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';
import { TextEncoder } from 'util';

Object.defineProperty(globalThis, 'TextEncoder', {
  value: TextEncoder,
  configurable: true,
});

const PASSWORD1_HASH =
  '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541';

jest.mock('@/utils/sha256', () => ({
  sha256Hex: jest.fn(async (value: string) =>
    value === 'Password1' ? PASSWORD1_HASH : 'f'.repeat(64)
  ),
}));

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  apiClient: {
    request: jest.fn(),
  },
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const localStorageStore = new Map<string, string>();
const sessionStorageStore = new Map<string, string>();

const bindStorageDoubles = () => {
  const localStorageDouble = {
    getItem: (key: string) => localStorageStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      localStorageStore.set(key, value);
    },
    removeItem: (key: string) => {
      localStorageStore.delete(key);
    },
    clear: () => {
      localStorageStore.clear();
    },
  } as Storage;

  const sessionStorageDouble = {
    getItem: (key: string) => sessionStorageStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      sessionStorageStore.set(key, value);
    },
    removeItem: (key: string) => {
      sessionStorageStore.delete(key);
    },
    clear: () => {
      sessionStorageStore.clear();
    },
  } as Storage;

  Object.defineProperty(window, 'localStorage', {
    value: localStorageDouble,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageDouble,
    configurable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageDouble,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'sessionStorage', {
    value: sessionStorageDouble,
    configurable: true,
  });
};

const assertValidLoginResponse = (value: unknown): LoginResponseDTO => {
  const parsed = loginResponseDTOSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Invalid LoginResponseDTO: ${JSON.stringify(parsed.error.issues)}`
    );
  }
  return parsed.data;
};

const assertValidRefreshResponse = (value: unknown) => {
  const parsed = refreshTokenResponseDTOSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Invalid RefreshTokenResponseDTO: ${JSON.stringify(parsed.error.issues)}`
    );
  }
  return parsed.data;
};

const realUser: LoginUserDTO = {
  id: 12,
  username: 'real-user',
  tier: 'FREE',
  avatarUrl: '/images/default_song_image.png',
};

const artistUser: LoginUserDTO = {
  id: 99,
  username: 'artist-user',
  tier: 'PRO',
  avatarUrl: '/images/default_song_image.png',
};

const advanceMockDelay = async (ms = 350) => {
  await jest.advanceTimersByTimeAsync(ms);
};

describe('AuthService contract parity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageStore.clear();
    sessionStorageStore.clear();
    bindStorageDoubles();
  });

  it.skip('returns schema-valid login responses for both RealAuthService and MockAuthService', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      accessToken: 'real-access-token',
      expiresIn: 3600,
      user: realUser,
    });

    const realService = new RealAuthService();
    const realLoginResponse = await realService.login(
      'service@test.dev',
      'Password1'
    );
    const parsedRealLogin = assertValidLoginResponse(realLoginResponse);

    expect(parsedRealLogin.user.id).toBe(12);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.AUTH_LOGIN_LOCAL,
      {
        payload: {
          email: 'service@test.dev',
          password: expect.stringMatching(/^[a-f0-9]{64}$/),
          deviceInfo: expect.objectContaining({
            deviceType: expect.any(String),
            fingerPrint: expect.any(String),
            deviceName: expect.any(String),
          }),
        },
      }
    );

    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const mockLoginPromise = mockService.login(
      'artist@decibel.test',
      'Password1'
    );
    await advanceMockDelay();
    const mockLoginResponse = await mockLoginPromise;

    const parsedMockLogin = assertValidLoginResponse(mockLoginResponse);
    expect(parsedMockLogin.user.id).toBeGreaterThan(0);

    const restoredMockSession = await mockService.getSession();
    expect(restoredMockSession).not.toBeNull();
    expect(restoredMockSession?.user.id).toBe(parsedMockLogin.user.id);

    jest.useRealTimers();
  });

  it('returns schema-valid Google login responses for both implementations', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      accessToken: 'real-google-access',
      refreshToken: 'real-google-refresh',
      expiresIn: 3600,
      user: artistUser,
    });

    const realService = new RealAuthService();
    const realGoogleResponse = await realService.loginWithGoogle('oauth-code');

    const parsedRealGoogle = assertValidLoginResponse(realGoogleResponse);
    expect(parsedRealGoogle.user.tier).toBe('PRO');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.AUTH_OAUTH_GOOGLE,
      {
        payload: {
          authTokenDto: 'oauth-code',
          deviceInfo: expect.objectContaining({
            deviceType: expect.any(String),
            fingerPrint: expect.any(String),
            deviceName: expect.any(String),
          }),
        },
      }
    );

    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const mockGooglePromise = mockService.loginWithGoogle('oauth-code');
    await advanceMockDelay();
    const mockGoogleResponse = await mockGooglePromise;

    const parsedMockGoogle = assertValidLoginResponse(mockGoogleResponse);
    expect(parsedMockGoogle.user.tier).toBe('FREE');

    const session = await mockService.getSession();
    expect(session).not.toBeNull();
    assertValidLoginResponse(session);

    jest.useRealTimers();
  });

  it('returns schema-valid refresh responses for both implementations', async () => {
    localStorageStore.set('decibel_refresh_token', 'refresh-for-real-service');

    mockedApiRequest.mockResolvedValueOnce({
      accessToken: 'refreshed-real-access',
      expiresIn: 3600,
    });

    const realService = new RealAuthService();
    const realRefreshResponse = await realService.refreshToken();

    const parsedRealRefresh = assertValidRefreshResponse(realRefreshResponse);
    expect(parsedRealRefresh.accessToken).toBe('refreshed-real-access');

    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const mockLoginPromise = mockService.loginWithGoogle('oauth-code');
    await advanceMockDelay();
    await mockLoginPromise;

    const mockRefreshPromise = mockService.refreshToken();
    await advanceMockDelay();
    const mockRefreshResponse = await mockRefreshPromise;

    const parsedMockRefresh = assertValidRefreshResponse(mockRefreshResponse);
    expect(parsedMockRefresh.expiresIn).toBeGreaterThan(0);

    jest.useRealTimers();
  });

  it('supports registering a mock user then logging in with same credentials', async () => {
    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const email = 'new.registered.user@decibel.test';
    const password = 'Password1';

    const registerPromise = mockService.registerLocal({
      email,
      displayName: 'newuser',
      password,
      dateOfBirth: '2000-01-01',
      gender: 'female',
      captchaToken: 'mock-captcha-token',
    });
    await advanceMockDelay();
    await registerPromise;

    const loginPromise = mockService.login(email, password);
    await advanceMockDelay();
    const loginResponse = await loginPromise;

    const parsedLogin = assertValidLoginResponse(loginResponse);
    expect(parsedLogin.user.username).toBe('newuser');

    const badLoginPromise = mockService.login(email, 'WrongPassword');
    const badLoginAssertion = expect(badLoginPromise).rejects.toThrow(
      'Invalid email or password.'
    );
    await advanceMockDelay();
    await badLoginAssertion;

    jest.useRealTimers();
  });

  it('creates mock user from Google account identity', async () => {
    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const googleIdentity = {
      email: 'google.mock.user@decibel.test',
      username: 'Google User',
      picture: 'https://example.com/avatar.jpg',
    };

    const loginPromise = mockService.loginWithGoogle(
      JSON.stringify(googleIdentity)
    );
    await advanceMockDelay();
    const googleLogin = await loginPromise;

    const parsed = assertValidLoginResponse(googleLogin);
    expect(parsed.user.username).toMatch(/^google-user(?:-\d+)?$/);
    expect(parsed.user.avatarUrl).toBe('https://example.com/avatar.jpg');

    const session = await mockService.getSession();
    expect(session?.user.id).toBe(parsed.user.id);
    expect(session?.user.username).toBe(parsed.user.username);
    expect(session?.user.avatarUrl).toBe('https://example.com/avatar.jpg');

    jest.useRealTimers();
  });

  it('uses clean fallback username for opaque Google auth codes', async () => {
    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const loginPromise = mockService.loginWithGoogle('opaque-code-from-google');
    await advanceMockDelay();
    const googleLogin = await loginPromise;

    const parsed = assertValidLoginResponse(googleLogin);
    expect(parsed.user.username).toBe('google-user');

    jest.useRealTimers();
  });
});
