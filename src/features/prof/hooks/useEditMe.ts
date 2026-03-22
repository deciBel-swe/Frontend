import { useCallback, useState } from 'react';
import { authService, userService } from '@/services';
import type { UpdateMeRequest, UserMe } from '@/types/user';

/**
 * Hook to update the current authenticated user's profile via /users/me.
 */
export const useEditMe = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editMe = useCallback(async (data: UpdateMeRequest): Promise<UserMe> => {
    setIsUpdating(true);
    setError(null);

    try {
      const session = await authService.getSession();

      if (!session?.accessToken) {
        throw new Error('Missing access token');
      }
      
      return userService.updateMe(data);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to update user profile';
      setError(message);
      throw caughtError;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    editMe,
    isUpdating,
    error,
  };
};
