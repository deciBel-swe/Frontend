import { useQuery } from '@tanstack/react-query';
import { UserPublic } from '@/types/user';
import { userService } from '@/services';

const userPublicUser = (username: string) => ['userPublic', username];

/**
 * Hook to get user header data (cover photo, username, location)
 */
export const usePublicUser = (username: string) => {
  const { data, isLoading, isError } = useQuery<UserPublic>({
    queryKey: userPublicUser(username),
    queryFn: () => userService.getPublicUser(username),
    enabled: username.length > 0,
  });

  return {
    data: data ?? null,
    isLoading,
    error: isError ? 'Failed to fetch user' : null,
  };
};
