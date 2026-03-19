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
import {
  secretTokenResponseSchema,
  trackDetailsResponseSchema,
  trackUpdateResponseSchema,
  updateTrackVisibilityDtoSchema,
  uploadTrackResponseSchema,
} from './tracks';
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

  AUTH_LOGOUT: defineContract<void, undefined>({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.LOGOUT,
    responseSchema: z.undefined(),
  }),

  AUTH_LOGOUT_ALL: defineContract<void, undefined>({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.LOGOUT_ALL,
    responseSchema: z.undefined(),
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

  TRACKS_UPLOAD: defineContract<FormData, z.infer<typeof uploadTrackResponseSchema>>({
    method: 'POST',
    url: API_ENDPOINTS.TRACKS.UPLOAD,
    responseSchema: uploadTrackResponseSchema,
  }),

  TRACKS_BY_ID: (trackId: number) =>
    defineContract<void, z.infer<typeof trackDetailsResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.TRACKS.BY_ID(trackId),
      responseSchema: trackDetailsResponseSchema,
    }),

  TRACKS_UPDATE_VISIBILITY: (trackId: number) =>
    defineContract({
      method: 'PATCH',
      url: API_ENDPOINTS.TRACKS.BY_ID(trackId),
      requestSchema: updateTrackVisibilityDtoSchema,
      responseSchema: trackUpdateResponseSchema,
    }),

  TRACKS_SECRET_TOKEN: (trackId: number | string) =>
    defineContract<void, z.infer<typeof secretTokenResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.TRACKS.SECRET_TOKEN(trackId),
      responseSchema: secretTokenResponseSchema,
    }),

  TRACKS_GENERATE_TOKEN: (trackId: number | string) =>
    defineContract<void, z.infer<typeof secretTokenResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.GENERATE_TOKEN(trackId),
      responseSchema: secretTokenResponseSchema,
    }),
} as const;

/** Union of all contract keys for autocomplete and constrained lookups. */
export type ApiContractKey = keyof typeof API_CONTRACTS;
