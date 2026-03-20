import { apiClient, apiRequest } from '@/hooks/useAPI';
import { RealAuthService } from '@/services/api/authService';
import { MockAuthService } from '@/services/mocks/authService';
import {
  loginResponseDTOSchema,
  refreshTokenResponseDTOSchema,
  type LoginResponseDTO,
  type LoginUserDTO,
} from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  apiClient: {
    request: jest.fn(),
  },
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedApiClientRequest =
  apiClient.request as jest.MockedFunction<typeof apiClient.request>;

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
    throw new Error(`Invalid LoginResponseDTO: ${JSON.stringify(parsed.error.issues)}`);
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
};

const artistUser: LoginUserDTO = {
  id: 99,
  username: 'artist-user',
  tier: 'ARTIST',
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

  it('returns schema-valid login responses for both RealAuthService and MockAuthService', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      accessToken: 'real-access-token',
      refreshToken: 'real-refresh-token',
      expiresIn: 3600,
      user: realUser,
    });

    const realService = new RealAuthService();
    const realLoginResponse = await realService.login(
      'service@test.dev',
      'Password1'
    );
    const parsedRealLogin = assertValidLoginResponse(realLoginResponse);

    expect(parsedRealLogin.user.username).toBe('real-user');
    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.AUTH_LOGIN_LOCAL, {
      payload: { email: 'service@test.dev', password: 'Password1' },
    });

    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const mockLoginPromise = mockService.login('user1@test.com', 'Password1');
    await advanceMockDelay();
    const mockLoginResponse = await mockLoginPromise;

    const parsedMockLogin = assertValidLoginResponse(mockLoginResponse);
    expect(parsedMockLogin.user.username).toBe('user1');

    const restoredMockSession = await mockService.getSession();
    expect(restoredMockSession).not.toBeNull();
    expect(restoredMockSession?.user.username).toBe('user1');

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
    expect(parsedRealGoogle.user.tier).toBe('ARTIST');

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

  it('returns consistently shaped recaptcha verification results for real and mock services', async () => {
    mockedApiClientRequest.mockResolvedValueOnce({
      data: {
        success: true,
        score: 0.93,
      },
    } as never);

    const realService = new RealAuthService();
    const realResult = await realService.verifyReCaptcha('token-abc', 'signin');

    expect(realResult.success).toBe(true);
    expect(realResult.score).toBe(0.93);

    jest.useFakeTimers();

    const mockService = new MockAuthService();
    const mockResultPromise = mockService.verifyReCaptcha('token-abc', 'signin');
    await advanceMockDelay(100);
    const mockResult = await mockResultPromise;

    expect(typeof mockResult.success).toBe('boolean');
    expect(mockResult.success).toBe(true);
    expect(typeof mockResult.score).toBe('number');

    const mockFailPromise = mockService.verifyReCaptcha('fail-token', 'signin');
    await advanceMockDelay(100);
    const mockFail = await mockFailPromise;

    expect(mockFail).toEqual({
      success: false,
      score: 0.1,
      error: 'Verification failed',
    });

    jest.useRealTimers();
  });
});
