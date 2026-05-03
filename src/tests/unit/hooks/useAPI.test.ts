import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';

import type { ApiEndpointContract } from '@/types/apiContracts';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  attachJwtInterceptor,
  apiClient,
  apiRequest,
  handleAuthRefreshOnUnauthorized,
  normalizeApiError,
  redirectToSignin,
  useAPI,
  useApiMutation,
  useApiQuery,
} from '@/hooks/useAPI';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

jest.mock('@/services', () => ({
  authService: {
    refreshToken: jest.fn(),
    clearSession: jest.fn(),
  },
}));

const mockedToast = toast as jest.Mocked<typeof toast>;

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client }, children);

  return Wrapper;
};

type SampleRequestDTO = { name: string };
type SampleResponseDTO = { id: number; name: string };

const sampleEndpoint: ApiEndpointContract<SampleRequestDTO, SampleResponseDTO> =
  {
    method: 'POST',
    url: '/sample',
    requestSchema: z.object({
      name: z.string().min(1),
    }),
    responseSchema: z.object({
      id: z.number().int(),
      name: z.string(),
    }),
  };

const makeAxiosError = (
  status: number,
  data: unknown,
  message = 'Request failed',
  code = 'ERR_BAD_REQUEST'
): AxiosError =>
  ({
    isAxiosError: true,
    response: { status, data },
    message,
    code,
    name: 'AxiosError',
    toJSON: () => ({}),
    config: {},
  }) as AxiosError;

const mockWindowLocation = (
  pathname = '/feed',
  search = '?tab=recent',
  origin = 'https://decibel.test'
) => {
  const replace = jest.fn();

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      origin,
      pathname,
      search,
      replace,
    } as unknown as Location,
  });

  return { replace };
};

describe('normalizeApiError', () => {
  it('returns backend error payload when it matches ApiErrorDTO schema', () => {
    const axiosError = makeAxiosError(400, {
      statusCode: 400,
      message: 'Invalid input',
      error: 'Bad Request',
    });

    expect(normalizeApiError(axiosError)).toEqual({
      statusCode: 400,
      message: 'Invalid input',
      error: 'Bad Request',
    });
  });

  it('falls back to axios fields when backend payload is not ApiErrorDTO', () => {
    const axiosError = makeAxiosError(
      401,
      { reason: 'unauthorized' },
      'Denied'
    );

    expect(normalizeApiError(axiosError)).toEqual({
      statusCode: 401,
      message: 'Denied',
      error: 'ERR_BAD_REQUEST',
    });
  });

  it('uses backend message/error fields when payload uses status instead of statusCode', () => {
    const axiosError = makeAxiosError(400, {
      timestamp: '2026-04-29T17:13:44.73487841',
      status: 400,
      error: 'Free User Out of Free Tracks',
      message:
        "User with ID '535' is out of free tracks. Can only upload/patch to BLOCKED.",
      path: '/api/tracks/upload/v2',
    });

    expect(normalizeApiError(axiosError)).toEqual({
      statusCode: 400,
      message:
        "User with ID '535' is out of free tracks. Can only upload/patch to BLOCKED.",
      error: 'Free User Out of Free Tracks',
    });
  });

  it('maps Error instances to ApiErrorDTO', () => {
    expect(normalizeApiError(new Error('Boom'))).toEqual({
      statusCode: 500,
      message: 'Boom',
    });
  });

  it('maps unknown errors to a generic ApiErrorDTO', () => {
    expect(normalizeApiError('not-an-error-object')).toEqual({
      statusCode: 500,
      message: 'Unexpected API error',
    });
  });
});

describe('attachJwtInterceptor', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('adds bearer Authorization header when a token is available', () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'jwt-token-123');

    const requestConfig = attachJwtInterceptor({
      headers: {
        'x-test': 'on',
      },
    } as never);

    expect(requestConfig.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer jwt-token-123',
        'x-test': 'on',
      })
    );
  });

  it('does not overwrite an existing Authorization header', () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'jwt-token-123');

    const requestConfig = attachJwtInterceptor({
      headers: {
        Authorization: 'Bearer explicit-token',
      },
    } as never);

    expect(requestConfig.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer explicit-token',
      })
    );
  });

  it('leaves headers unchanged when no token is stored', () => {
    const requestConfig = attachJwtInterceptor({
      headers: {
        'x-test': 'on',
      },
    } as never);

    expect(requestConfig.headers).toEqual(
      expect.objectContaining({
        'x-test': 'on',
      })
    );
    expect(
      (requestConfig.headers as Record<string, string>).Authorization
    ).toBeUndefined();
  });

  it('uses the admin access token on admin routes', () => {
    mockWindowLocation('/admin/analytics', '');
    window.localStorage.setItem(
      'decibel_admin_access_token',
      'admin-jwt-token-123'
    );

    const requestConfig = attachJwtInterceptor({
      headers: {
        'x-test': 'on',
      },
    } as never);

    expect(requestConfig.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer admin-jwt-token-123',
        'x-test': 'on',
      })
    );
  });

  it('does not use the admin access token on the admin login route', () => {
    mockWindowLocation('/admin/login', '');
    window.localStorage.setItem(
      'decibel_admin_access_token',
      'admin-jwt-token-123'
    );

    const requestConfig = attachJwtInterceptor({
      headers: {
        'x-test': 'on',
      },
    } as never);

    expect(requestConfig.headers).toEqual(
      expect.objectContaining({
        'x-test': 'on',
      })
    );
    expect(
      (requestConfig.headers as Record<string, string>).Authorization
    ).toBeUndefined();
  });
});

describe('auth redirect helpers', () => {
  it('redirects admin pages to admin login with the current page as redirect target', () => {
    const locationControl = mockWindowLocation('/admin/reports', '?page=2');

    redirectToSignin();

    expect(locationControl.replace).toHaveBeenCalledWith(
      'https://decibel.test/admin/login?redirect=%2Fadmin%2Freports%3Fpage%3D2'
    );
  });

  it('does not redirect non-admin pages', () => {
    const locationControl = mockWindowLocation('/feed', '?tab=recent');

    redirectToSignin();

    expect(locationControl.replace).not.toHaveBeenCalled();
  });

  it('does not redirect the admin login page to itself', () => {
    const locationControl = mockWindowLocation('/admin/login', '');

    redirectToSignin();

    expect(locationControl.replace).not.toHaveBeenCalled();
  });

  it('does not clear session or redirect non-admin pages when refresh fails', async () => {
    const locationControl = mockWindowLocation('/feed', '?tab=recent');
    const authServices = await import('@/services');
    const axiosError = makeAxiosError(401, { denied: true }, 'Unauthorized');
    axiosError.config = { url: '/tracks', headers: {} } as never;
    (authServices.authService.refreshToken as jest.Mock).mockRejectedValueOnce(
      new Error('refresh expired')
    );

    await expect(handleAuthRefreshOnUnauthorized(axiosError)).rejects.toBe(
      axiosError
    );

    expect(authServices.authService.clearSession).not.toHaveBeenCalled();
    expect(mockedToast.error).not.toHaveBeenCalled();
    expect(locationControl.replace).not.toHaveBeenCalled();
  });

  it('clears the session and redirects admin pages when refresh token renewal fails', async () => {
    const locationControl = mockWindowLocation('/admin/reports', '?page=2');
    const authServices = await import('@/services');
    const originalRequest = apiClient.request;
    const requestSpy = jest
      .spyOn(apiClient, 'request')
      .mockImplementation(originalRequest);

    const axiosError = makeAxiosError(401, { denied: true }, 'Unauthorized');
    axiosError.config = { url: '/tracks', headers: {} } as never;
    (authServices.authService.refreshToken as jest.Mock).mockRejectedValueOnce(
      new Error('refresh expired')
    );

    await expect(handleAuthRefreshOnUnauthorized(axiosError)).rejects.toBe(
      axiosError
    );

    expect(authServices.authService.clearSession).not.toHaveBeenCalled();
    expect(mockedToast.error).toHaveBeenCalledWith('Please log in to continue');
    expect(locationControl.replace).toHaveBeenCalledWith(
      'https://decibel.test/admin/login?redirect=%2Fadmin%2Freports%3Fpage%3D2'
    );
    requestSpy.mockRestore();
  });
});

describe('apiRequest', () => {
  it('sends a validated request and returns validated response', async () => {
    const requestSpy = jest.spyOn(apiClient, 'request').mockResolvedValue({
      status: 200,
      data: { id: 7, name: 'mona' },
    } as AxiosResponse);

    const response = await apiRequest(sampleEndpoint, {
      payload: { name: 'mona' },
      params: { page: 1 },
      headers: { 'x-test': 'on' },
    });

    expect(response).toEqual({ id: 7, name: 'mona' });
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/sample',
        data: { name: 'mona' },
        params: { page: 1 },
        headers: { 'x-test': 'on' },
      })
    );
  });

  it('throws before network call when request DTO validation fails', async () => {
    const requestSpy = jest.spyOn(apiClient, 'request');

    await expect(
      apiRequest(sampleEndpoint, {
        payload: { name: '' },
      })
    ).rejects.toThrow('Invalid request DTO for /sample');

    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('throws when response DTO validation fails', async () => {
    jest.spyOn(apiClient, 'request').mockResolvedValue({
      status: 200,
      data: { id: 'not-number', name: 'mona' },
    } as unknown as AxiosResponse);

    await expect(
      apiRequest(sampleEndpoint, {
        payload: { name: 'mona' },
      })
    ).rejects.toThrow('Invalid response DTO from /sample');
  });

  it('supports endpoints that return no content (204)', async () => {
    const noContentEndpoint: ApiEndpointContract<void, undefined> = {
      method: 'DELETE',
      url: '/sample/7',
      responseSchema: z.undefined(),
    };

    jest.spyOn(apiClient, 'request').mockResolvedValue({
      status: 204,
      data: '',
    } as AxiosResponse);

    await expect(apiRequest(noContentEndpoint)).resolves.toBeUndefined();
  });
});

describe('useApiQuery', () => {
  it('returns validated data from a successful query', async () => {
    jest.spyOn(apiClient, 'request').mockResolvedValue({
      status: 200,
      data: { id: 11, name: 'nora' },
    } as AxiosResponse);

    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['sample-query'],
          endpoint: sampleEndpoint,
          payload: { name: 'nora' },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: 11, name: 'nora' });
  });

  it('returns normalized errors for failed queries', async () => {
    jest
      .spyOn(apiClient, 'request')
      .mockRejectedValue(makeAxiosError(403, { denied: true }, 'Forbidden'));

    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['sample-query-error'],
          endpoint: sampleEndpoint,
          payload: { name: 'nora' },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual({
      statusCode: 403,
      message: 'Forbidden',
      error: 'ERR_BAD_REQUEST',
    });
  });
});

describe('useApiMutation', () => {
  it('resolves with validated mutation response', async () => {
    jest.spyOn(apiClient, 'request').mockResolvedValue({
      status: 200,
      data: { id: 20, name: 'lina' },
    } as AxiosResponse);

    const { result } = renderHook(
      () =>
        useApiMutation({
          endpoint: sampleEndpoint,
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      const response = await result.current.mutateAsync({ name: 'lina' });
      expect(response).toEqual({ id: 20, name: 'lina' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rejects with normalized error shape when mutation fails', async () => {
    jest
      .spyOn(apiClient, 'request')
      .mockRejectedValue(
        makeAxiosError(500, { reason: 'down' }, 'Server down')
      );

    const { result } = renderHook(
      () =>
        useApiMutation({
          endpoint: sampleEndpoint,
        }),
      { wrapper: createWrapper() }
    );

    await expect(
      act(async () => result.current.mutateAsync({ name: 'lina' }))
    ).rejects.toEqual({
      statusCode: 500,
      message: 'Server down',
      error: 'ERR_BAD_REQUEST',
    });
  });
});

describe('useAPI', () => {
  it('exposes the imperative apiRequest function and shared axios client', () => {
    const { result } = renderHook(() => useAPI());

    expect(result.current.request).toBe(apiRequest);
    expect(result.current.client).toBe(apiClient);
  });
});
