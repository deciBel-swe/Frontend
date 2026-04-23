'use client';

import { API_ENDPOINTS } from '@/constants/routes';
import { apiRequest } from '@/hooks/useAPI';
import type { ApiEndpointContract } from '@/types/apiContracts';

import {
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
} from '../types';

const changePasswordEndpoint: ApiEndpointContract<
  ChangePasswordRequest,
  ChangePasswordResponse
> = {
  method: 'POST',
  url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
  requestSchema: changePasswordRequestSchema,
  responseSchema: changePasswordResponseSchema,
};

export const changePasswordService = {
  submit(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return apiRequest(changePasswordEndpoint, { payload });
  },
};
