'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSecretLink } from '@/hooks/useSecretLink';
import { formatSecretUrlWithSlug } from '@/utils/formatSecretUrl';
import { CheckIcon, CopyIcon } from '@/components/nav/TrackActionBar';

// ─── Types ────────────────────────────────────────────────────────────────────
type ShareTab = 'share' | 'embed' | 'message';

/** Track metadata shown in the modal preview section */
export interface TrackPreviewData {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  isPrivate: boolean;
  track?: TrackPreviewData;
}

// ─── Waveform placeholder ─────────────────────────────────────────────────────

/**
 * Static waveform visualization placeholder.
 * Replaced with real waveform data when player is integrated.
 */
function WaveformPlaceholder() {
  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] bg-border-strong rounded-full"
          style={{
            height: `${20 + Math.sin(i * 0.8) * 10 + Math.random() * 8}%`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Track preview card ───────────────────────────────────────────────────────

/**
 * Stateless track preview shown at the top of the share modal.
 * Shows cover art, artist name, title, and waveform placeholder.
 */

function TrackPreview({ track }: { track: TrackPreviewData }) {
  return (
    <div className="flex gap-3 mb-5">
      {/* Cover */}
      <div className="relative w-20 h-20 shrink-0 bg-surface-raised rounded overflow-hidden">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface-raised flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18V5l12-2v13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-muted"
              />
              <circle
                cx="6"
                cy="18"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-text-muted"
              />
              <circle
                cx="18"
                cy="16"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-text-muted"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info + waveform */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <p className="text-xs text-text-muted">{track.artist}</p>
          <p className="text-sm font-semibold text-text-primary truncate">
            {track.title}
          </p>
        </div>
        <WaveformPlaceholder />
      </div>
    </div>
  );
}

// ─── Private share content ────────────────────────────────────────────────────

/**
 * Share tab content for private tracks.
 * Shows the secret link with copy button, shorten link (disabled),
 * description, and reset secret link button.
 */
function PrivateShareContent({trackId,track,}: {trackId: string;track: TrackPreviewData;}) {
  const {
    secretUrl,
    secretToken,
    isLoading,
    isError,
    regenerate,
    isRegenerating,
  } = useSecretLink(trackId);
  const [copied, setCopied] = useState(false);

  const slugShareUrl =
    secretToken && track
      ? formatSecretUrlWithSlug(track.artist, track.title, secretToken)
      : null;

  const urlToUse = slugShareUrl ?? secretUrl;

  const handleCopy = async () => {
    if (!urlToUse) return;
    await navigator.clipboard.writeText(urlToUse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const ok = window.confirm(
      'Resetting the secret link will invalidate the previous one. Anyone with the old link will lose access. Continue?'
    );
    if (!ok) return;
    regenerate();
  };

  if (isLoading) {
    return (
      <div className="h-10 w-full bg-surface-raised rounded animate-pulse" />
    );
  }

  if (isError || !secretUrl) {
    return (
      <p className="text-xs text-status-error">Unable to load secret link.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">Private Share</p>

      {/* Link row */}
      <div className="flex items-center gap-2 border border-border-default rounded px-3 py-2 bg-surface-default">
        <input
          type="text"
          readOnly
          value={urlToUse ?? ''}
          aria-label="Secret share link"
          className="flex-1 text-xs text-text-primary font-mono bg-transparent outline-none truncate"
        />
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          className={[
            'shrink-0 transition-colors duration-150',
            copied
              ? 'text-status-success'
              : 'text-text-muted hover:text-text-primary',
          ].join(' ')}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      {/* Shorten link — disabled for now */}
      <label className="flex items-center gap-2 opacity-40 cursor-not-allowed select-none">
        <input type="checkbox" disabled className="w-3.5 h-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>

      <p className="text-xs text-text-muted leading-snug">
        This track is set to private and can only be shared using the secret
        link above. You can reset the secret link if you want to revoke access.
      </p>

      {/* Reset secret link */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleReset}
          disabled={isRegenerating}
          className="text-xs font-medium text-text-primary border border-border-default rounded px-3 py-1.5 hover:bg-surface-raised transition-colors duration-150 disabled:opacity-40"
        >
          {isRegenerating ? 'Resetting…' : 'Reset secret link'}
        </button>
      </div>
    </div>
  );
}

// ─── Public share content ─────────────────────────────────────────────────────

/**
 * Share tab content for public tracks.
 * Shows the track URL from API with copy button and shorten link (disabled).
 */
function PublicShareContent({
  artist,
  title,
}: {
  artist: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
 
  const userSlug = artist.toLowerCase().replace(/\s+/g, '');
  const trackSlug = title.toLowerCase().replace(/\s+/g, '-');
  const trackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${userSlug}/${trackSlug}`;
 
  const handleCopy = async () => {
    await navigator.clipboard.writeText(trackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
 
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-border-default rounded px-3 py-2 bg-surface-default">
        <input
          type="text"
          readOnly
          value={trackUrl}
          aria-label="Track link"
          className="flex-1 text-xs text-text-primary font-mono bg-transparent outline-none truncate"
        />
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          className={[
            'shrink-0 transition-colors duration-150',
            copied ? 'text-status-success' : 'text-text-muted hover:text-text-primary',
          ].join(' ')}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <label className="flex items-center gap-2 select-none cursor-not-allowed opacity-40">
        <input type="checkbox" disabled className="w-3.5 h-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
    </div>
  );
}

const PLACEHOLDER_TRACK: TrackPreviewData = {
  title: 'Untitled Track',
  artist: 'Unknown Artist',
  duration: '0:00',
};
/**
 * Share modal with tabs for Share, Embed, and Message.
 *
 * - Public tracks: shows `trackUrl` from API with copy button
 * - Private tracks: shows secret link with copy + reset button
 * - Embed and Message tabs are placeholder shells for future implementation
 *
 * @example
 * <ShareModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   trackId="42"
 *   isPrivate={true}
 *   track={{ title: 'My Track', artist: 'Zeina' }}
 * />
 */

export function ShareModal({
  isOpen,
  onClose,
  trackId,
  isPrivate,
  track = PLACEHOLDER_TRACK,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('share');

  if (!isOpen) return null;

  const tabs: { id: ShareTab; label: string }[] = [
    { id: 'share', label: 'Share' },
    { id: 'embed', label: 'Embed' },
    { id: 'message', label: 'Message' },
  ];

  return (
    <>
 {/* BACKDROP */}


    {/* MODAL WRAPPER */}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
      className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
      onClick={onClose}
    />
      <div className="relative w-full max-w-md bg-white dark:bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden">

        {/* HEADER (optional but now consistent with your system) */}
        <div className="px-5 py-4 border-b border-border-default text-sm font-semibold">
          Share Track
        </div>

        {/* TABS */}
        <div className="border-b border-border-default">
          <nav className="flex">
            {tabs.map(({ id, label }) => {
              const isActive = activeTab === id;

              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={[
                    'relative px-5 py-3 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-muted hover:text-text-secondary',
                  ].join(' ')}
                >
                  {label}

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          <TrackPreview track={track} />

          {activeTab === 'share' &&
            (isPrivate ? (
              <PrivateShareContent trackId={trackId} track={track} />
            ) : (
              <PublicShareContent
                artist={track.artist}
                title={track.title}
              />
            ))}

          {activeTab === 'embed' && (
            <p className="text-xs text-text-muted">
              Embed functionality coming soon.
            </p>
          )}

          {activeTab === 'message' && (
            <p className="text-xs text-text-muted">
              Message functionality coming soon.
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
