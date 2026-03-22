import { useCallback, useEffect, useState } from 'react';
import { trackService } from '@/services';
import type { UpdateTrackVisibilityDto, TrackVisibility } from '@/types/tracks';

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
  const [visibility, setVisibility] = useState<TrackVisibility | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!trackId) {
      setVisibility(undefined);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchVisibility = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await trackService.getTrackVisibility(trackId);
        if (!isCancelled) {
          setVisibility(data);
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

    void fetchVisibility();

    return () => {
      isCancelled = true;
    };
  }, [trackId]);

  const updateVisibility = useCallback(
    async (data: UpdateTrackVisibilityDto) => {
      if (!trackId) {
        return;
      }

      setIsUpdating(true);
      setIsError(false);

      const previous = visibility;
      setVisibility((old) => ({
        ...(old ?? { isPrivate: false }),
        ...data,
      }));

      try {
        const updated = await trackService.updateTrackVisibility(trackId, data);
        setVisibility(updated);
      } catch {
        setVisibility(previous);
        setIsError(true);
      } finally {
        setIsUpdating(false);
      }
    },
    [trackId, visibility]
  );

  return { visibility, isLoading, isError, isUpdating, updateVisibility };
}
