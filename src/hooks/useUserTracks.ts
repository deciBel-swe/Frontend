import { useQuery } from '@tanstack/react-query';
import { trackService } from '@/services';

const userTracksKey = (username?: string) => ['userTracks', username ?? 'me'];

/**
 * Lightweight hook for requesting user tracks.
 *
 * This is intentionally simple and can be expanded later with
 * pagination/filtering once real page logic is finalized.
 */
export function useUserTracks(username?: string) {
  const normalizedUsername = username?.trim();

  const {
    data: tracks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: userTracksKey(normalizedUsername),
    queryFn: () => trackService.getUserTracks(normalizedUsername),
  });

  return {
    tracks: tracks ?? [],
    isLoading,
    isError,
  };
}
