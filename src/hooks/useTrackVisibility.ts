import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackService } from '@/services';
import type { UpdateTrackVisibilityDto, TrackVisibility } from '@/types/tracks';

const visibilityKey = (trackId: number) => ['trackVisibility', trackId];

/**
 * Fetches and manages the privacy state of a track.
 *
 * Provides optimistic updates — the UI updates immediately on change
 * and rolls back if the server returns an error.
 *
 * Only fetches when `trackId` is defined.
 *
 * @param trackId - Numeric track ID, or undefined to skip fetching
 *
 * @example
 * const { visibility, updateVisibility, isUpdating } = useTrackVisibility(42);
 */
export function useTrackVisibility(trackId: number | undefined) {
  const queryClient = useQueryClient();

  const { data: visibility, isLoading, isError } = useQuery({
    queryKey: visibilityKey(trackId!),
    queryFn: () => trackService.getTrackVisibility(trackId!),
    enabled: !!trackId,
  });

  const { mutate: updateVisibility, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateTrackVisibilityDto) =>
      trackService.updateTrackVisibility(trackId!, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: visibilityKey(trackId!) });
      const previous = queryClient.getQueryData(visibilityKey(trackId!));
      queryClient.setQueryData(visibilityKey(trackId!), (old: TrackVisibility) => ({
        ...old,
        ...newData,
      }));
      return { previous };
    },
    onError: (_err, _newData, context) => {
      queryClient.setQueryData(visibilityKey(trackId!), context?.previous);
    },
    onSettled: () => {
      // Always refetch after mutation to sync with server
      queryClient.invalidateQueries({ queryKey: visibilityKey(trackId!) });
    },
  });

  return { visibility, isLoading, isError, isUpdating, updateVisibility };
}