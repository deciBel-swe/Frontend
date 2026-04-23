import { useCallback, useEffect, useState } from 'react';
import { playlistService } from '@/services';
import { resolvePlaylistIdFromIdentifier } from '@/utils/resourceIdentifierResolvers';
import { buildPlaylistSecretUrl } from '@/utils/resourcePaths';

type UsePlaylistSecretLinkOptions = {
  shareUsername?: string;
  sharePathId?: string;
};

const extractSecretToken = (payload: {
  secretToken?: string;
  secretUrl?: string;
}): string | null => {
  if (payload.secretToken?.trim()) {
    return payload.secretToken.trim();
  }

  if (payload.secretUrl?.trim()) {
    try {
      const parsed = new URL(payload.secretUrl, 'https://decibel.local');
      const tokenFromQuery = parsed.searchParams.get('token');
      if (tokenFromQuery?.trim()) {
        return tokenFromQuery.trim();
      }

      const tokenFromPath = parsed.pathname.split('/').pop();
      return tokenFromPath?.trim() || null;
    } catch {
      return null;
    }
  }

  return null;
};

export function usePlaylistSecretLink(
  playlistId: string | undefined,
  options?: UsePlaylistSecretLinkOptions
) {
  const [secretToken, setSecretToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [resolvedPlaylistId, setResolvedPlaylistId] = useState<number | null>(
    null
  );

  useEffect(() => {
    let isCancelled = false;

    if (!playlistId) {
      setSecretToken(null);
      setIsLoading(false);
      setIsError(false);
      setResolvedPlaylistId(null);
      return;
    }

    const fetchSecretLink = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const resolvedId = await resolvePlaylistIdFromIdentifier(playlistId);
        const next = await playlistService.getPlaylistSecretLink(resolvedId);
        if (!isCancelled) {
          setResolvedPlaylistId(resolvedId);
          setSecretToken(extractSecretToken(next));
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
  }, [playlistId]);

  const secretUrl =
    secretToken && options?.shareUsername?.trim() && options?.sharePathId?.trim()
      ? buildPlaylistSecretUrl(
          options.shareUsername,
          options.sharePathId,
          secretToken
        )
      : null;

  const regenerate = useCallback(async () => {
    if (!playlistId) {
      return;
    }

    setIsRegenerating(true);
    setIsError(false);

    try {
      const resolvedId = await resolvePlaylistIdFromIdentifier(playlistId);
      const next = await playlistService.regeneratePlaylistSecretLink(
        resolvedId
      );
      setResolvedPlaylistId(resolvedId);
      setSecretToken(extractSecretToken(next));
    } catch {
      setIsError(true);
    } finally {
      setIsRegenerating(false);
    }
  }, [playlistId]);

  return {
    resolvedPlaylistId,
    secretToken,
    secretUrl,
    isLoading,
    isError,
    regenerate,
    isRegenerating,
  };
}
