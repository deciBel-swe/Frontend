import { useState, useCallback } from 'react';

interface UseCopyTrackLinkProps {
  trackId: string | number;
  isPrivate: boolean;
  secretUrl: string | null;
  artistName?: string;
  trackTitle?: string;
}

export function useCopyTrackLink({
  isPrivate,
  secretUrl,
  artistName,
  trackTitle,
}: UseCopyTrackLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    let urlToCopy = '';

    if (isPrivate && secretUrl) {
      urlToCopy = secretUrl;
    } else if (!isPrivate && artistName && trackTitle) {
      const userSlug = artistName.toLowerCase().replace(/\s+/g, '');
      const trackSlug = trackTitle.toLowerCase().replace(/\s+/g, '-');
      urlToCopy = `${window.location.origin}/${userSlug}/${trackSlug}`;
    }

    if (!urlToCopy) return;

    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [isPrivate, secretUrl, artistName, trackTitle]);

  return { copied, handleCopy };
}
