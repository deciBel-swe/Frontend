import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, EditMeService } from '@/services';
import type { UpdateMeRequest, UserMe } from '@/types/user';

const currentUsernameKey = ['currentUsername'];

/**
 * Hook to update the current authenticated user's profile via /users/me.
 */
export const useEditMe = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: editMe,
    isPending: isUpdating,
    isError,
    error,
  } = useMutation<UserMe, Error, UpdateMeRequest>({
    mutationFn: async (data) => {
      const session = await authService.getSession();

      if (!session?.accessToken) {
        throw new Error('Missing access token');
      }

      return EditMeService.editMe(session.accessToken, data);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(currentUsernameKey, updatedUser);
    },
  });

  return {
    editMe,
    isUpdating,
    error: isError ? (error?.message ?? 'Failed to update user profile') : null,
  };
};
