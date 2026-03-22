import { useEffect, useState } from 'react';
import { trackService } from '@/services';

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
  const [metadata, setMetadata] = useState<Awaited<
    ReturnType<typeof trackService.getTrackMetadata>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!trackId) {
      setMetadata(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchMetadata = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await trackService.getTrackMetadata(trackId);
        if (!isCancelled) {
          setMetadata(data);
        }
      } catch {
        if (!isCancelled) {
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchMetadata();

    return () => {
      isCancelled = true;
    };
  }, [trackId]);

  return { metadata, isLoading, isError };
}
