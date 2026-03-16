import { API_ENDPOINTS, getApiUrl } from '@/constants/routes';
import { UserMe } from '@/types/user';

export class UserService {
  static async getUserByUsername(): Promise<UserMe> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.USERS.ME), {});
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    return response.json();
  }
}
