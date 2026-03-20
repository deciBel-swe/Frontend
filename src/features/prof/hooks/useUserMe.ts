import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services';
import { userService } from '@/services/index';
import { UserMe } from '@/types/user';

const currentUsernameKey = ['currentUsername'];

/**
 * Hook to get the current authenticated user's data via /users/me.
 */
// TODO : currently doesn't work fixing it later
export const useUserMe = () => {
  const { data, isLoading, isError } = useQuery<UserMe | null>({
    queryKey: currentUsernameKey,
    queryFn: async () => {
      const session = await authService.getSession();

      if (!session?.accessToken) {
        return null;
      }

      const me = await userService.getUserMe(session.accessToken);
      return me ?? null;
    },
  });

  return {
    user: data ?? null,
    isLoading,
    error: isError ? 'Failed to fetch current user data' : null,
  };
};
