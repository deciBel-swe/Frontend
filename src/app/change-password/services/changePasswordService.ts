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
import { sha256Hex } from '@/utils/sha256';

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
  async submit(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const hashedNewPassword = await sha256Hex(payload.newPassword);
    
    return apiRequest(changePasswordEndpoint, {
      payload: {
        ...payload,
        newPassword: hashedNewPassword,
      },
    });
  },
};
