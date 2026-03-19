import { API_ENDPOINTS, getApiUrl } from '@/constants/routes';
import { UserPublic, UserMe } from '@/types/user';
import axios from 'axios';

export interface UserService {
  getPublicUser(username: string): Promise<UserPublic>;

  getUserMe(token: string): Promise<UserMe>;
}

export class RealUserService implements UserService {
  async getPublicUser(username: string): Promise<UserPublic> {
    try {
      const response = await axios.get(
        getApiUrl(API_ENDPOINTS.USERS.BY_ID(username)),
        {
          headers: {},
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || 'Failed to fetch user data'
      );
    }
  }

  async getUserMe(token: string): Promise<UserMe> {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.USERS.ME), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || 'Failed to fetch user data'
      );
    }
  }
}
