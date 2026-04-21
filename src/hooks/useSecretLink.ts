import { useCallback, useEffect, useState } from 'react';
import { trackService } from '@/services';
import { formatSecretUrl } from '@/utils/formatSecretUrl';
import { resolveTrackIdFromIdentifier } from '@/utils/resourceIdentifierResolvers';

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
  const [resolvedTrackId, setResolvedTrackId] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!trackId) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      setResolvedTrackId(null);
      return;
    }

    const fetchSecretLink = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const resolvedId = await resolveTrackIdFromIdentifier(trackId);
        const next = await trackService.getSecretLink(String(resolvedId));
        if (!isCancelled) {
          setResolvedTrackId(resolvedId);
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
    data && resolvedTrackId !== null
      ? formatSecretUrl(String(resolvedTrackId), data.secretLink)
      : null;
  const secretToken = data?.secretLink ?? null;

  const regenerate = useCallback(async () => {
    if (!trackId) {
      return;
    }

    setIsRegenerating(true);
    setIsError(false);

    try {
      const resolvedId = await resolveTrackIdFromIdentifier(trackId);
      const next = await trackService.regenerateSecretLink(String(resolvedId));
      setResolvedTrackId(resolvedId);
      setData(next);
    } catch {
      setIsError(true);
    } finally {
      setIsRegenerating(false);
    }
  }, [trackId]);

  return { secretUrl, secretToken, isLoading, isError, regenerate, isRegenerating };
}
