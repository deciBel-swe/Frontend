import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackService } from '@/services';
import { formatSecretUrl } from '@/utils/formatSecretUrl';

const secretLinkKey = (trackId: string) => ['secretLink', trackId];

/**
 * Fetches and manages the secret share link for a private track.
 *
 * Provides the full formatted URL, loading/error states,
 * and a `regenerate` function to invalidate the old token.
 *
 * Only fetches when `trackId` is defined.
 *
 * @param trackId - Track ID as string, or undefined to skip fetching
 *
 * @example
 * const { secretUrl, regenerate, isRegenerating } = useSecretLink(trackId);
 */
export function useSecretLink(trackId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: secretLinkKey(trackId!),
    queryFn: () => trackService.getSecretLink(trackId!),
    enabled: !!trackId,
  });

  /** Full formatted URL e.g. https://localhost:3000/tracks/1?s=nQ7ENRPl */
  const secretUrl =
    data && trackId ? formatSecretUrl(trackId, data.secretLink) : null;

  const { mutate: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: () => trackService.regenerateSecretLink(trackId!),
    onSuccess: (newData) => {
      // Update cache directly with new token — no need to refetch
      queryClient.setQueryData(secretLinkKey(trackId!), newData);
    },
  });

  return { secretUrl, isLoading, isError, regenerate, isRegenerating };
}
