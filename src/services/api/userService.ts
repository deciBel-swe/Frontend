import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { UserMe, UserPublic } from '@/types/user';

/**
 * User service contract.
 *
 * Real and mock implementations must satisfy this interface.
 */
export interface UserService {
  /** Read public profile data by username (GET /users/:username). */
  getPublicUser(username: string): Promise<UserPublic>;

  /** Read current authenticated user payload (GET /users/me). */
  getUserMe(token: string): Promise<UserMe>;
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealUserService implements UserService {
  async getPublicUser(username: string): Promise<UserPublic> {
    return apiRequest(API_CONTRACTS.USERS_PUBLIC(username));
  }

  async getUserMe(token: string): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
