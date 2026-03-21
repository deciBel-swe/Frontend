import { API_CONTRACTS } from '@/types/apiContracts';
import type { UpdateMeRequest, UserMe } from '@/types/user';
import { apiRequest } from '@/hooks/useAPI';

export interface editMeService {
  /** Update current authenticated user data (PATCH /users/me). */
  editMe(token: string, data: UpdateMeRequest): Promise<UserMe>;
}

export class RealEditMeService implements editMeService {
  async editMe(token: string, data: UpdateMeRequest): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME_EDIT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: data,
    });
  }
}
