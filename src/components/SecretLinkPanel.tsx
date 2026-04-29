'use client';

import { useEffect, useState } from 'react';
import { trackService } from '@/services';
import { buildTrackSecretUrl } from '@/utils/resourcePaths';

interface SecretLinkPanelProps {
  trackId: string;
  secretToken?: string | null;
  shareUsername?: string;
  sharePathId?: string;
}

export function SecretLinkPanel({
  trackId,
  secretToken: initialSecretToken,
  shareUsername,
  sharePathId,
}: SecretLinkPanelProps) {
  const [secretToken, setSecretToken] = useState(initialSecretToken?.trim() || '');
  const [isError, setIsError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSecretToken(initialSecretToken?.trim() || '');
    setIsError(false);
  }, [initialSecretToken]);

  const secretUrl =
    secretToken && shareUsername?.trim() && sharePathId?.trim()
      ? buildTrackSecretUrl(shareUsername, sharePathId, secretToken)
      : null;

  const handleCopy = async () => {
    if (!secretUrl) return;
    await navigator.clipboard.writeText(secretUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    const ok = window.confirm(
      'Regenerating the secret link will invalidate the previous one. Anyone with the old link will lose access. Continue?'
    );
    if (!ok) return;

    void (async () => {
      setIsRegenerating(true);
      setIsError(false);

      try {
        const next = await trackService.regenerateSecretLink(trackId);
        setSecretToken(next.secretLink.trim());
      } catch {
        console.error('Failed to regenerate secret link');
        setIsError(true);
      } finally {
        setIsRegenerating(false);
      }
    })();
  };

  if (isError || !secretUrl) {
    return (
      <p className="mt-3 text-xs text-status-error">
        Unable to load secret link.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        Private Share Link
      </span>

      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={secretUrl}
          aria-label="Secret share link"
          className="flex-1 text-xs bg-surface-default border border-border-default rounded px-3 py-2 text-text-primary font-mono truncate focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className={[
            'shrink-0 px-3 py-2 rounded text-xs font-semibold transition-colors duration-150',
            copied
              ? 'bg-status-success text-neutral-0'
              : 'bg-interactive-default hover:bg-interactive-hover text-text-primary',
          ].join(' ')}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      <button
        onClick={handleRegenerate}
        disabled={isRegenerating}
        className="self-start text-xs text-text-muted hover:text-text-secondary underline transition-colors duration-150 disabled:opacity-40"
      >
        {isRegenerating ? 'Regenerating...' : 'Regenerate link'}
      </button>

      <p className="text-xs text-text-muted leading-snug">
        This track is private and can only be shared using the link above.
        Regenerating the link will revoke access for anyone with the old one.
      </p>
    </div>
  );
}
