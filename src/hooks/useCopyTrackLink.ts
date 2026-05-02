import { useState, useCallback } from 'react';
import {
  buildTrackSecretUrl,
  buildTrackUrl,
} from '@/utils/resourcePaths';

interface UseCopyTrackLinkProps {
  trackId: string | number;
  routeTrackId?: string;
  isPrivate: boolean;
  secretToken?: string | null;
  artistName?: string;
  trackTitle?: string;
}

export function useCopyTrackLink({
  trackId,
  routeTrackId,
  isPrivate,
  secretToken,
  artistName,
}: UseCopyTrackLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    let urlToCopy = '';
    const routeId = routeTrackId?.trim() || String(trackId);
    const normalizedSecretToken = secretToken?.trim();

    if (isPrivate && artistName && normalizedSecretToken) {
      urlToCopy = buildTrackSecretUrl(artistName, routeId, normalizedSecretToken);
    } else if (!isPrivate && artistName) {
      urlToCopy = buildTrackUrl(artistName, routeId);
    }

    if (!urlToCopy) return;

    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [artistName, isPrivate, routeTrackId, secretToken, trackId]);

  return { copied, handleCopy };
}
