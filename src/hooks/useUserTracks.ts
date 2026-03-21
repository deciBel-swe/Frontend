import { useQuery } from '@tanstack/react-query';
import { trackService } from '@/services';

const userTracksKey = (userId: number) => ['userTracks', userId];

/**
 * Lightweight hook for requesting user tracks.
 *
 * This is intentionally simple and can be expanded later with
 * pagination/filtering once real page logic is finalized.
 */
export function useUserTracks(userId: number) {
  const {
    data: tracks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: userTracksKey(userId),
    queryFn: () => trackService.getUserTracks(userId),
  });

  return {
    tracks: tracks ?? [],
    isLoading,
    isError,
  };
}
