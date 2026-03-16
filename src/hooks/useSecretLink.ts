import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackVisibilityService } from '@/services';
import { formatSecretUrl } from '@/types';

const secretLinkKey = (trackId: string) => ['secretLink', trackId];

export function useSecretLink(trackId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: secretLinkKey(trackId!),
    queryFn: () => trackVisibilityService.getSecretLink(trackId!),
    enabled: !!trackId,
  });

  const secretUrl = data && trackId
    ? formatSecretUrl(trackId, data.secretLink)
    : null;

  const { mutate: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: () => trackVisibilityService.regenerateSecretLink(trackId!),
    onSuccess: (newData) => {
      // Update cache directly with new token — no need to refetch
      queryClient.setQueryData(secretLinkKey(trackId!), newData);
    },
  });

  return { secretUrl, isLoading, isError, regenerate, isRegenerating };
}