import { useState, useCallback } from 'react';

interface UseCopyTrackLinkProps {
  trackId: string | number;
  isPrivate: boolean;
  secretUrl: string | null;
  artistName?: string;
  trackTitle?: string;
}

export function useCopyTrackLink({
  trackId,
  isPrivate,
  secretUrl,
  artistName,
}: UseCopyTrackLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    let urlToCopy = '';

    if (isPrivate && secretUrl) {
      if (artistName) {
        try {
          const parsed = new URL(secretUrl);
          const secretToken = parsed.searchParams.get('s');
          if (secretToken) {
            const userSlug = artistName.toLowerCase().replace(/\s+/g, '');
            urlToCopy = `${window.location.origin}/${userSlug}/${String(trackId)}?s=${secretToken}`;
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
      urlToCopy = `${window.location.origin}/${userSlug}/${String(trackId)}`;
    }

    if (!urlToCopy) return;

    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [isPrivate, secretUrl, artistName, trackId]);

  return { copied, handleCopy };
}
