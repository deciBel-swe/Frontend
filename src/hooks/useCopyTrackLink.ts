import { useState, useCallback } from 'react';

interface UseCopyTrackLinkProps {
  trackId: string | number;
  routeTrackId?: string;
  isPrivate: boolean;
  secretUrl: string | null;
  artistName?: string;
  trackTitle?: string;
}

export function useCopyTrackLink({
  trackId,
  routeTrackId,
  isPrivate,
  secretUrl,
  artistName,
}: UseCopyTrackLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    let urlToCopy = '';
    const routeId = routeTrackId?.trim() || String(trackId);

    if (isPrivate && secretUrl) {
      if (artistName) {
        try {
          const parsed = new URL(secretUrl);
          const secretToken = parsed.searchParams.get('s');
          if (secretToken) {
            const userSlug = artistName.toLowerCase().replace(/\s+/g, '');
            urlToCopy = `${window.location.origin}/${userSlug}/${routeId}?s=${secretToken}`;
          }
        } catch {
          // fall back to service formatted URL if parsing fails
        }
      }

      if (!urlToCopy) {
        urlToCopy = secretUrl;
      }
    } else if (!isPrivate && artistName) {
      const userSlug = artistName.toLowerCase().replace(/\s+/g, '');
      urlToCopy = `${window.location.origin}/${userSlug}/${routeId}`;
    }

    if (!urlToCopy) return;

    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [artistName, isPrivate, routeTrackId, secretUrl, trackId]);

  return { copied, handleCopy };
}
