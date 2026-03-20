import { apiRequest } from '@/hooks/useAPI';
import { RealAuthService } from '@/services/api/authService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { LoginResponseDTO, LoginUserDTO } from '@/types';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const USER_STORAGE_KEY = 'user';
const REFRESH_TOKEN_STORAGE_KEY = 'decibel_refresh_token';

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const user: LoginUserDTO = {
  id: 1,
  username: 'service-user',
  tier: 'FREE',
};

const loginResponse: LoginResponseDTO = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresIn: 3600,
  user,
};

describe('RealAuthService', () => {
  const storage = new Map<string, string>();

  const bindStorageDouble = () => {
    const localStorageDouble = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage.clear();
    bindStorageDouble();
  });

  it('logs in with email/password and persists session data', async () => {
    mockedApiRequest.mockResolvedValue(loginResponse);

    const service = new RealAuthService();
    const response = await service.login('service@test.dev', 'pass123');

    expect(response).toEqual(loginResponse);
    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.AUTH_LOGIN_LOCAL, {
      payload: { email: 'service@test.dev', password: 'pass123' },
    });

    expect(storage.get(USER_STORAGE_KEY)).toBe(JSON.stringify(user));
    expect(storage.get(REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh-1');
  });

  it('logs in with Google and sends device info payload', async () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      configurable: true,
      writable: true,
    });

    mockedApiRequest.mockResolvedValue(loginResponse);

    const service = new RealAuthService();
    await service.loginWithGoogle('google-code');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.AUTH_OAUTH_GOOGLE,
      {
        payload: {
          authTokenDto: 'google-code',
          deviceInfo: expect.objectContaining({
            deviceType: 'MOBILE',
            fingerPrint: expect.any(String),
            deviceName: expect.any(String),
          }),
        },
      }
    );
  });

  it('returns null session when user is not in storage', async () => {
    const service = new RealAuthService();
    await expect(service.getSession()).resolves.toBeNull();
  });

  it('refreshes access token and exposes it through getSession', async () => {
    storage.set(REFRESH_TOKEN_STORAGE_KEY, 'refresh-xyz');
    storage.set(USER_STORAGE_KEY, JSON.stringify(user));

    mockedApiRequest.mockResolvedValue({
      accessToken: 'access-refreshed',
      expiresIn: 3600,
    });

    const service = new RealAuthService();
    const refreshed = await service.refreshToken();

    expect(refreshed).toEqual({
      accessToken: 'access-refreshed',
      expiresIn: 3600,
    });

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.AUTH_REFRESH_TOKEN, {
      payload: { refreshToken: 'refresh-xyz' },
    });

    const session = await service.getSession();
    expect(session?.accessToken).toBe('access-refreshed');
    expect(session?.refreshToken).toBe('refresh-xyz');
    expect(session?.user).toEqual(user);
  });

  it('throws when refreshing without a refresh token', async () => {
    const service = new RealAuthService();

    await expect(service.refreshToken()).rejects.toThrow(
      'No refresh token available. Please log in again.'
    );
  });

  it('logs out and clears persisted session keys', async () => {
    storage.set(REFRESH_TOKEN_STORAGE_KEY, 'refresh-xyz');
    storage.set(USER_STORAGE_KEY, JSON.stringify(user));

    mockedApiRequest.mockResolvedValue(undefined);

    const service = new RealAuthService();
    await service.logout();

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.AUTH_LOGOUT);
    expect(storage.has(REFRESH_TOKEN_STORAGE_KEY)).toBe(false);
    expect(storage.has(USER_STORAGE_KEY)).toBe(false);
  });

  it('logs out from all sessions and clears persisted session keys', async () => {
    storage.set(REFRESH_TOKEN_STORAGE_KEY, 'refresh-xyz');
    storage.set(USER_STORAGE_KEY, JSON.stringify(user));

    mockedApiRequest.mockResolvedValue(undefined);

    const service = new RealAuthService();
    await service.logoutAll();

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.AUTH_LOGOUT_ALL);
    expect(storage.has(REFRESH_TOKEN_STORAGE_KEY)).toBe(false);
    expect(storage.has(USER_STORAGE_KEY)).toBe(false);
  });
});
