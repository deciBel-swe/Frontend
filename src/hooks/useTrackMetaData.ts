import { useQuery } from '@tanstack/react-query';
import { trackVisibilityService } from '@/services';

const trackMetadataKey = (trackId: number) => ['trackMetadata', trackId];

/**
 * Fetches full track metadata for a given trackId.
 * Used to get trackUrl for public share links.
 *
 * @param trackId - numeric track ID,, or undefined to skip fetching
 * 
 * @example
 * const { metadata, isLoading } = useTrackMetadata(42);
 * const trackUrl = metadata?.trackUrl;
 */
export function useTrackMetadata(trackId: number | undefined) {
  const { data: metadata, isLoading, isError } = useQuery({
    queryKey: trackMetadataKey(trackId!),
    queryFn: () => trackVisibilityService.getTrackMetadata(trackId!),
    enabled: !!trackId,
  });

  return { metadata, isLoading, isError };
}