import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';

import type { ApiEndpointContract } from '@/types/apiContracts';
import {
  apiClient,
  apiRequest,
  normalizeApiError,
  useAPI,
  useApiMutation,
  useApiQuery,
} from '@/hooks/useAPI';

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
    ).rejects.toThrow('Invalid response DTO for /sample');
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
