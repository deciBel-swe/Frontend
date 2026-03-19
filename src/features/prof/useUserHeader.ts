import { useEffect, useState } from 'react';
import { UserHeader } from '@/types/user';
import { UserService, RealUserService } from '@/services/api/userService';
import { MockUserService } from '@/services/mocks/userService';
import { config } from '@/config/index';

/**
 * Hook to get user header data (cover photo, username, location)
 */
export const useUserHeader = (username: string) => {
  const [data, setData] = useState<UserHeader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service: UserService = config.api.useMock
    ? new MockUserService()
    : new RealUserService();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await service.getPublicUser(username);

        const mapped: UserHeader = {
          username: user.profile.username,
          location: user.profile.location,
          coverPhotoUrl: user.profile.coverPhotoUrl,
          avatarUrl: user.profile.avatarUrl,
        };

        setData(mapped);
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  return { data, isLoading, error };
};
