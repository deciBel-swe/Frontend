import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackVisibilityService } from '@/services';
import type { UpdateTrackVisibilityDto, TrackVisibility } from '@/types';

const visibilityKey = (trackId: number) => ['trackVisibility', trackId];

export function useTrackVisibility(trackId: number | undefined) {
  const queryClient = useQueryClient();

  const { data: visibility, isLoading, isError } = useQuery({
    queryKey: visibilityKey(trackId!),
    queryFn: () => trackVisibilityService.getTrackVisibility(trackId!),
    enabled: !!trackId,
  });

  const { mutate: updateVisibility, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateTrackVisibilityDto) =>
      trackVisibilityService.updateTrackVisibility(trackId!, data),
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
      queryClient.invalidateQueries({ queryKey: visibilityKey(trackId!) });
    },
  });

  return { visibility, isLoading, isError, isUpdating, updateVisibility };
}