import { apiClient, apiRequest } from '@/hooks/useAPI';
import { RealAuthService } from '@/services/api/authService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { LoginResponseDTO, LoginUserDTO } from '@/types';

const MOCKED_PASSWORD_HASH = 'a'.repeat(64);

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
  apiClient: {
    request: jest.fn(),
  },
}));

jest.mock('@/utils/sha256', () => ({
  sha256Hex: jest.fn(),
}));

const USER_STORAGE_KEY = 'user';
const ACCESS_TOKEN_STORAGE_KEY = 'decibel_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'decibel_refresh_token';

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedSha256Hex = jest.requireMock('@/utils/sha256')
  .sha256Hex as jest.MockedFunction<(value: string) => Promise<string>>;

const user: LoginUserDTO = {
  id: 1,
  username: 'service-user',
  tier: 'FREE',
};

const loginResponse: LoginResponseDTO = {
  accessToken: 'access-1',
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
    mockedSha256Hex.mockResolvedValue(MOCKED_PASSWORD_HASH);
  });

  it('logs in with email/password and persists session data', async () => {
    mockedApiRequest.mockResolvedValue(loginResponse);

    const service = new RealAuthService();
    const response = await service.login('service@test.dev', 'pass123');

    expect(response).toEqual(loginResponse);
    expect(mockedSha256Hex).toHaveBeenCalledWith('pass123');
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.AUTH_LOGIN_LOCAL,
      {
        payload: {
          email: 'service@test.dev',
          password: MOCKED_PASSWORD_HASH,
          deviceInfo: expect.objectContaining({
            deviceType: 'DESKTOP',
            fingerPrint: expect.any(String),
            deviceName: expect.any(String),
          }),
        },
      }
    );

    expect(storage.get(USER_STORAGE_KEY)).toBe(JSON.stringify(user));
    expect(storage.get(ACCESS_TOKEN_STORAGE_KEY)).toBe('access-1');
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


  it('logs out and clears persisted session keys', async () => {
    storage.set(USER_STORAGE_KEY, JSON.stringify(user));

    mockedApiRequest.mockResolvedValue(undefined);

    const service = new RealAuthService();
    await service.logout();

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.AUTH_LOGOUT);
    expect(storage.has(ACCESS_TOKEN_STORAGE_KEY)).toBe(false);
    expect(storage.has(USER_STORAGE_KEY)).toBe(false);
  });

  it('logs out from all sessions and clears persisted session keys', async () => {
    storage.set(REFRESH_TOKEN_STORAGE_KEY, 'refresh-xyz');
    storage.set(USER_STORAGE_KEY, JSON.stringify(user));

    mockedApiRequest.mockResolvedValue(undefined);

    const service = new RealAuthService();
    await service.logoutAll();

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.AUTH_LOGOUT_ALL
    );
    expect(storage.has(ACCESS_TOKEN_STORAGE_KEY)).toBe(false);
    expect(storage.has(USER_STORAGE_KEY)).toBe(false);
  });
});
