import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { UserMe } from '@/types/user';

export class UserService {
  static async getUserByUsername(): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME);
  }
}
