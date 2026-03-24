import { useCallback, useEffect, useState } from 'react';
import { trackService } from '@/services';
import { formatSecretUrl } from '@/utils/formatSecretUrl';

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
  const [data, setData] = useState<Awaited<
    ReturnType<typeof trackService.getSecretLink>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!trackId) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchSecretLink = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const next = await trackService.getSecretLink(trackId);
        if (!isCancelled) {
          setData(next);
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

    void fetchSecretLink();

    return () => {
      isCancelled = true;
    };
  }, [trackId]);

  /** Full formatted URL e.g. https://localhost:3000/tracks/1?s=nQ7ENRPl */
  const secretUrl =
    data && trackId ? formatSecretUrl(trackId, data.secretLink) : null;
  const secretToken = data?.secretLink ?? null;

  const regenerate = useCallback(async () => {
    if (!trackId) {
      return;
    }

    setIsRegenerating(true);
    setIsError(false);

    try {
      const next = await trackService.regenerateSecretLink(trackId);
      setData(next);
    } catch {
      setIsError(true);
    } finally {
      setIsRegenerating(false);
    }
  }, [trackId]);

  return { secretUrl, secretToken, isLoading, isError, regenerate, isRegenerating };
}
