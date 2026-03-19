import { z } from 'zod';

/**
 * Endpoint contract registry.
 *
 * This file maps route constants to runtime DTO validators so every backend
 * call has a strongly typed request and response boundary.
 *
 * Update flow for new endpoints:
 * 1) Define request/response Zod DTO schemas in `src/types`.
 * 2) Add a contract entry in `API_CONTRACTS` using `API_ENDPOINTS` URL values.
 * 3) Consume the contract via `apiRequest`, `useApiQuery`, or `useApiMutation`.
 */

import { API_ENDPOINTS } from '@/constants/routes';

import {
  googleOAuthRequestDTOSchema,
  loginLocalRequestDTOSchema,
  loginResponseDTOSchema,
  refreshTokenRequestDTOSchema,
  refreshTokenResponseDTOSchema,
} from './index';
import {
  privacySettingsSchema,
  updatePrivacySettingsDtoSchema,
} from './privacy';
import { userMeSchema } from './user';

/** Supported HTTP verbs for endpoint contracts. */
export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Strongly typed API contract for one endpoint.
 *
 * TRequest is validated before dispatch.
 * TResponse is validated before returning data to callers.
 */
export interface ApiEndpointContract<TRequest, TResponse> {
  method: ApiHttpMethod;
  url: string;
  requestSchema?: z.ZodType<TRequest>;
  responseSchema: z.ZodType<TResponse>;
}

const defineContract = <TRequest, TResponse>(
  contract: ApiEndpointContract<TRequest, TResponse>
): ApiEndpointContract<TRequest, TResponse> => contract;

/**
 * Endpoint registry used by useAPI templates and real services.
 *
 * Every entry imports its URL from `API_ENDPOINTS` and binds request/response
 * DTO schemas for runtime validation.
 */
export const API_CONTRACTS = {
  AUTH_LOGIN_LOCAL: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.LOGIN_LOCAL,
    requestSchema: loginLocalRequestDTOSchema,
    responseSchema: loginResponseDTOSchema,
  }),

  AUTH_OAUTH_GOOGLE: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.GOOGLE_OAUTH,
    requestSchema: googleOAuthRequestDTOSchema,
    responseSchema: loginResponseDTOSchema,
  }),

  AUTH_REFRESH_TOKEN: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.REFRESH,
    requestSchema: refreshTokenRequestDTOSchema,
    responseSchema: refreshTokenResponseDTOSchema,
  }),

  USERS_ME: defineContract({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME,
    responseSchema: userMeSchema,
  }),

  USERS_ME_PRIVACY: defineContract({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME_PRIVACY,
    responseSchema: privacySettingsSchema,
  }),

  USERS_ME_PRIVACY_UPDATE: defineContract({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME_PRIVACY,
    requestSchema: updatePrivacySettingsDtoSchema,
    responseSchema: privacySettingsSchema,
  }),
} as const;

/** Union of all contract keys for autocomplete and constrained lookups. */
export type ApiContractKey = keyof typeof API_CONTRACTS;
