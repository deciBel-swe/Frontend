'use client';

/**
 * Centralized API hook template.
 *
 * All real backend communication should go through this module so the app gets
 * one consistent request pipeline:
 * 1) URL + method come from a typed endpoint contract.
 * 2) Request payloads are validated with Zod before sending.
 * 3) Responses are validated with Zod before returning to callers.
 * 4) Errors are normalized to a shared `ApiErrorDTO` shape.
 *
 * Exposed API surface:
 * - `apiRequest`      -> low-level imperative requester.
 * - `useApiQuery`     -> React Query wrapper for read operations.
 * - `useApiMutation`  -> React Query wrapper for write operations.
 * - `useAPI`          -> hook returning imperative request/client access.
 */

import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useMemo } from 'react';
import { z } from 'zod';

import { config } from '@/config';
import { ROUTES } from '@/constants/routes';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { ApiEndpointContract } from '@/types/apiContracts';
import { apiErrorDTOSchema, type ApiErrorDTO } from '@/types';
import toast from 'react-hot-toast';
/**
 * Shared querystring parameter shape for API requests.
 */
export type ApiQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Optional request metadata consumed by `apiRequest`.
 *
 * @template TRequest Request DTO type validated by the endpoint contract.
 */
export interface ApiRequestOptions<TRequest> {
  /** Request payload (body) for write operations. */
  payload?: TRequest;
  /** Querystring params appended by axios (e.g. ?page=1&size=20). */
  params?: ApiQueryParams;
  /** Abort signal forwarded from React Query or custom callers. */
  signal?: AbortSignal;
  /** Optional per-request headers merged with client defaults. */
  headers?: AxiosRequestConfig['headers'];
  /** Optional upload progress handler (for multipart/form-data requests). */
  onUploadProgress?: AxiosRequestConfig['onUploadProgress'];
}

/**
 * Query hook config for GET-style API calls.
 *
 * Use this for endpoints that should be cached and automatically
 * re-fetched by React Query.
 *
 * @template TRequest Request DTO type (optional for GET endpoints).
 * @template TResponse Response DTO type produced by Zod validation.
 * @template TSelected Shape returned from React Query `select`.
 */
export interface UseApiQueryConfig<
  TRequest,
  TResponse,
  TSelected = TResponse,
> extends Omit<
  UseQueryOptions<TResponse, ApiErrorDTO, TSelected, QueryKey>,
  'queryKey' | 'queryFn'
> {
  queryKey: QueryKey;
  endpoint: ApiEndpointContract<TRequest, TResponse>;
  payload?: TRequest;
  params?: ApiQueryParams;
}

/**
 * Mutation hook config for write endpoints (POST/PATCH/PUT/DELETE).
 *
 * @template TRequest Payload type passed to `mutate`/`mutateAsync`.
 * @template TResponse Response DTO type produced by Zod validation.
 * @template TContext React Query optimistic-update context type.
 */
export interface UseApiMutationConfig<
  TRequest,
  TResponse,
  TContext = unknown,
> extends Omit<
  UseMutationOptions<TResponse, ApiErrorDTO, TRequest, TContext>,
  'mutationFn'
> {
  endpoint: ApiEndpointContract<TRequest, TResponse>;
}

/**
 * Return type of `useAPI`.
 */
export interface UseAPIResult {
  /** Imperative validated request function. */
  request: typeof apiRequest;
  /** Shared axios client for advanced scenarios. */
  client: typeof apiClient;
}

/**
 * Axios instance for all backend API requests.
 *
 * The base URL is sourced from app config so environment changes happen in one
 * place (`src/config/index.ts`).
 */
export const apiClient = axios.create({
  baseURL: config.api.baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ACCESS_TOKEN_STORAGE_KEY = 'decibel_access_token';
const ADMIN_ACCESS_TOKEN_STORAGE_KEY = 'decibel_admin_access_token';
const ADMIN_AUTH_COOKIE = 'decibel_admin_auth';
const ADMIN_USER_STORAGE_KEY = 'decibel_admin_user';

const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storageKey = isAdminSessionRoute()
      ? ADMIN_ACCESS_TOKEN_STORAGE_KEY
      : ACCESS_TOKEN_STORAGE_KEY;

    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
};

export const attachJwtInterceptor = (
  requestConfig: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = getStoredAccessToken();
  if (!token) {
    return requestConfig;
  }

  if (
    typeof (requestConfig.headers as { get?: unknown }).get === 'function' &&
    typeof (requestConfig.headers as { set?: unknown }).set === 'function'
  ) {
    const existingAuthorization = (
      requestConfig.headers as {
        get: (name: string) => string | undefined;
        set: (name: string, value: string) => void;
      }
    ).get('Authorization');

    if (
      typeof existingAuthorization === 'string' &&
      existingAuthorization.trim().length > 0
    ) {
      return requestConfig;
    }
    
    (
      requestConfig.headers as {
        set: (name: string, value: string) => void;
      }
    ).set('Authorization', `Bearer ${token}`);
    return requestConfig;
  }

  const plainHeaders = requestConfig.headers as unknown as Record<
    string,
    string | undefined
  >;

  const existingAuthorization =
    plainHeaders.Authorization ?? plainHeaders.authorization;

const isRetry = (requestConfig as RetryableRequestConfig)._retry;

if (!isRetry && existingAuthorization) {
  return requestConfig;
}

  plainHeaders.Authorization = `Bearer ${token}`;

  return requestConfig;
};


type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshTokenRequest: Promise<void> | null = null;

const isAdminPathname = (pathname: string): boolean =>
  pathname === '/admin' || pathname.startsWith('/admin/');

const isAdminSessionRoute = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return isAdminPathname(window.location.pathname);
};

const buildAdminLoginRedirectUrl = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isAdminSessionRoute()) {
    return null;
  }

  const redirectTarget = `${window.location.pathname}${window.location.search}`;
  const signinUrl = new URL(ROUTES.ADMIN_LOGIN, window.location.origin);

  if (redirectTarget && redirectTarget !== ROUTES.ADMIN_LOGIN) {
    signinUrl.searchParams.set('redirect', redirectTarget);
  }

  return signinUrl.toString();
};

export const redirectToSignin = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const redirectUrl = buildAdminLoginRedirectUrl();

  if (!redirectUrl) {
    return;
  }

  window.location.replace(redirectUrl);
};

const clearAdminSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  document.cookie = `${ADMIN_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

const shouldHandleUnauthorized = (error: AxiosError): boolean => {
  const status = error.response?.status;
  const requestConfig = error.config as RetryableRequestConfig | undefined;

  if (!requestConfig) {
    return false;
  }

  if (requestConfig._retry) {
    return false;
  }

  if (status !== 401) {
    return false;
  }

  return requestConfig.url !== API_CONTRACTS.AUTH_REFRESH_TOKEN.url;
};

const refreshSessionToken = async (): Promise<void> => {
  if (!refreshTokenRequest) {
    refreshTokenRequest = (async () => {
      const { authService } = await import('@/services');
      await authService.refreshToken();
    })().finally(() => {
      refreshTokenRequest = null;
    });
  }
  await refreshTokenRequest;
};

export const handleAuthRefreshOnUnauthorized = async (
  error: unknown
): Promise<unknown> => {
  if (!axios.isAxiosError(error) || !shouldHandleUnauthorized(error)) {
    
    return Promise.reject(error);
  }

  const requestConfig = error.config as RetryableRequestConfig;
  requestConfig._retry = true;

  try {
    await refreshSessionToken();
    return apiClient.request(requestConfig);
  } catch {
    if (!isAdminSessionRoute()) {
      return Promise.reject(error);
    }

    clearAdminSession();
    toast.error('Please log in to continue');
    redirectToSignin();
    return Promise.reject(error);
  }
};


const formatZodIssues = (error: z.ZodError): string => {
  return error.issues
    .map((issue) => {
      const path = issue.path.length === 0 ? 'root' : issue.path.join('.');
      return `${path}: ${issue.message}`;
    })
    .join('; ');
};

const parseWithSchema = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
  context: string
): z.infer<TSchema> => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(`${context}. ${formatZodIssues(result.error)}`);
  }
  return result.data;
};

const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i;

const TIMEZONE_SUFFIX_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Backend sends naive UTC timestamps with no timezone suffix.
 * Appending "Z" tells JS to treat them as UTC, so relative-time
 * libraries ("3 hours ago") compute the correct diff.
 */
const labelAsUtc = (value: string): string => {
  const trimmed = value.trim();
  if (!ISO_DATE_TIME_PATTERN.test(trimmed)) return value;
  if (TIMEZONE_SUFFIX_PATTERN.test(trimmed)) return value;
  return `${trimmed}Z`;
};

const normalizeBackendTimestamps = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return labelAsUtc(value);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeBackendTimestamps);
  }

  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        normalizeBackendTimestamps(entry),
      ])
    );
  }

  return value;
};

/**
 * Normalizes unknown thrown values into a shared ApiErrorDTO shape.
 *
 * Priority order:
 * 1) Axios error with backend payload matching `apiErrorDTOSchema`.
 * 2) Axios error fallback using status/message/code.
 * 3) Generic Error instance.
 * 4) Final generic fallback.
 */
export const normalizeApiError = (error: unknown): ApiErrorDTO => {
  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    'message' in error
  ) {
    const parsedError = apiErrorDTOSchema.safeParse(error);

    if (parsedError.success) {
      return parsedError.data;
    }
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const parsedError = apiErrorDTOSchema.safeParse(axiosError.response?.data);

    if (parsedError.success) {
      return parsedError.data;
    }

    if (
      axiosError.response?.data &&
      typeof axiosError.response.data === 'object'
    ) {
      const responseData = axiosError.response.data as Record<string, unknown>;
      const backendMessage =
        typeof responseData.message === 'string' &&
        responseData.message.trim().length > 0
          ? responseData.message
          : undefined;
      const backendError =
        typeof responseData.error === 'string' &&
        responseData.error.trim().length > 0
          ? responseData.error
          : undefined;

      if (backendMessage || backendError) {
        return {
          statusCode:
            typeof responseData.status === 'number'
              ? responseData.status
              : axiosError.response?.status ?? 500,
          message:
            backendMessage ??
            backendError ??
            axiosError.message ??
            'Unexpected API error',
          error: backendError ?? axiosError.code,
        };
      }
    }

    return {
      statusCode: axiosError.response?.status ?? 500,
      message: axiosError.message || 'Unexpected API error',
      error: axiosError.code,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Unexpected API error',
  };
};

/**
 * Low-level validated API requester.
 *
 * This is the single backend request gateway for real API calls:
 * - validates request DTOs with Zod before dispatch
 * - sends request through one axios client
 * - validates response DTOs with Zod before returning to callers
 *
 * @template TRequest Request DTO type defined by endpoint contract.
 * @template TResponse Response DTO type defined by endpoint contract.
 * @param endpoint Endpoint contract describing method, URL, and DTO schemas.
 * @param requestOptions Optional payload/params/headers/signal values.
 * @returns Validated response DTO.
 * @throws Error when request or response validation fails.
 *
 * @example
 * const me = await apiRequest(API_CONTRACTS.USERS_ME);
 */
export const apiRequest = async <TRequest, TResponse>(
  endpoint: ApiEndpointContract<TRequest, TResponse>,
  requestOptions: ApiRequestOptions<TRequest> = {}
): Promise<TResponse> => {
  const validatedPayload = endpoint.requestSchema
    ? parseWithSchema(
        endpoint.requestSchema,
        requestOptions.payload,
        `Invalid request DTO for ${endpoint.url}`
      )
    : requestOptions.payload;

  try {
    const response = await apiClient.request({
      method: endpoint.method,
      url: endpoint.url,
      data: validatedPayload,
      params: requestOptions.params,
      signal: requestOptions.signal,
      headers: requestOptions.headers,
      onUploadProgress: requestOptions.onUploadProgress,
    });
    const responsePayload =
      response.status === 204 || response.data === '' ? undefined : response.data;

    return parseWithSchema(
      endpoint.responseSchema,
      responsePayload,
      `Invalid response DTO from ${endpoint.url}`
    );
  } catch (error) {
    const normalizedError = normalizeApiError(error);
    throw Object.assign(new Error(normalizedError.message), normalizedError);
  }
};

/**
 * Query template hook.
 *
 * Wraps React Query `useQuery` and routes all network access through
 * `apiRequest`.
 *
 * Use this when data is cacheable and should participate in query invalidation.
 *
 * @example
 * const query = useApiQuery({
 *   queryKey: ['privacySettings'],
 *   endpoint: API_CONTRACTS.USERS_ME_PRIVACY,
 * });
 */
export const useApiQuery = <TRequest, TResponse, TSelected = TResponse>(
  queryConfig: UseApiQueryConfig<TRequest, TResponse, TSelected>
): UseQueryResult<TSelected, ApiErrorDTO> => {
  const { queryKey, endpoint, payload, params, ...queryOptions } = queryConfig;

  return useQuery<TResponse, ApiErrorDTO, TSelected>({
    queryKey,
    queryFn: async ({ signal }) => {
      try {
        return await apiRequest(endpoint, {
          payload,
          params,
          signal,
        });
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    ...queryOptions,
  });
};

/**
 * Mutation template hook.
 *
 * Wraps React Query `useMutation` and routes all write operations through
 * `apiRequest`.
 *
 * Use this for user actions that modify backend state.
 *
 * @example
 * const mutation = useApiMutation({
 *   endpoint: API_CONTRACTS.USERS_ME_PRIVACY_UPDATE,
 * });
 * mutation.mutate({ isPrivate: true });
 */
export const useApiMutation = <TRequest, TResponse, TContext = unknown>(
  mutationConfig: UseApiMutationConfig<TRequest, TResponse, TContext>
): UseMutationResult<TResponse, ApiErrorDTO, TRequest, TContext> => {
  const { endpoint, ...mutationOptions } = mutationConfig;

  return useMutation<TResponse, ApiErrorDTO, TRequest, TContext>({
    mutationFn: async (payload) => {
      try {
        return await apiRequest(endpoint, { payload });
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    ...mutationOptions,
  });
};

/**
 * Imperative API template hook.
 *
 * Useful when a component needs one-off request control outside of
 * query/mutation wrappers. Keeps access to the same validated request path.
 *
 * @example
 * const { request } = useAPI();
 * const me = await request(API_CONTRACTS.USERS_ME);
 */
export const useAPI = (): UseAPIResult => {
  return useMemo(
    () => ({
      request: apiRequest,
      client: apiClient,
    }),
    []
  );
};

// attach interceptors
apiClient.interceptors.request.use(attachJwtInterceptor);



apiClient.interceptors.response.use(
  (response) => {
    response.data = normalizeBackendTimestamps(response.data);
    return response;
  },
  handleAuthRefreshOnUnauthorized
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if ((status === 401 || status === 403) && isAdminSessionRoute()) {
      try {
        clearAdminSession();
      } catch {
        // Ignore cleanup issues and still force a fresh login.
      }
      toast.error('Please log in to continue');
      redirectToSignin();
    }
    return Promise.reject(error);
  }
);