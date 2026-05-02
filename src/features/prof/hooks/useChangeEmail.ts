import { useCallback, useState } from 'react';
import { authService, userService } from '@/services';
import type { UpdatePrimaryEmailRequest, ChangeEmailResponse } from '@/types/user';

/**
 * Hook to change the current authenticated user's email via /users/me/email.
 */
export const useChangeEmail = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeEmail = useCallback(async (data: UpdatePrimaryEmailRequest): Promise<ChangeEmailResponse> => {
    setIsUpdating(true);
    setError(null);

    try {
      const session = await authService.getSession();

      if (!session?.accessToken) {
        throw new Error('Missing access token');
      }
      
      return userService.changeEmail(data);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to change email';
      setError(message);
      throw caughtError;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    changeEmail,
    isUpdating,
    error,
  };
};
