import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { privacyService } from "@/services";
import type { UpdatePrivacySettingsDto } from "@/types/privacy";

const PRIVACY_QUERY_KEY = ["privacySettings"];

export function usePrivacySettings() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PRIVACY_QUERY_KEY,
    queryFn: () => privacyService.getPrivacySettings(),
  });

  const { mutate: updateSetting, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdatePrivacySettingsDto) =>
      privacyService.updatePrivacySettings(data),
    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: PRIVACY_QUERY_KEY });
      const previous = queryClient.getQueryData(PRIVACY_QUERY_KEY);
      queryClient.setQueryData(PRIVACY_QUERY_KEY, (old: typeof settings) => ({
        ...old,
        ...newData,
      }));
      return { previous };
    },
    onError: (_err, _newData, context) => {
      queryClient.setQueryData(PRIVACY_QUERY_KEY, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRIVACY_QUERY_KEY });
    },
  });

  return {
    settings,
    isLoading,
    isError,
    isUpdating,
    updateSetting,
  };
}