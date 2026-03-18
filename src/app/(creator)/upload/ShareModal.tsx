'use client';

import { useState } from 'react';
import { useSecretLink } from '@/hooks/useSecretLink';
import { CopyIcon } from '@/components/nav/TrackActionBar';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShareTab = 'share' | 'embed' | 'message';

export interface TrackPreview {
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
  track?: TrackPreview;
}

// ─── Waveform placeholder ─────────────────────────────────────────────────────

function WaveformPlaceholder() {
  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] bg-border-strong rounded-full"
          style={{ height: `${20 + Math.sin(i * 0.8) * 10 + Math.random() * 8}%` }}
        />
      ))}
    </div>
  );
}

// ─── Track preview ────────────────────────────────────────────────────────────

function TrackPreview({ track }: { track: TrackPreview }) {
  return (
    <div className="flex gap-3 mb-5">
      {/* Cover */}
      <div className="w-20 h-20 shrink-0 bg-surface-raised rounded overflow-hidden">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-raised flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" className="text-text-muted" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" className="text-text-muted" />
            </svg>
          </div>
        )}
      </div>

      {/* Info + waveform */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <p className="text-xs text-text-muted">{track.artist}</p>
          <p className="text-sm font-semibold text-text-primary truncate">{track.title}</p>
        </div>
        <WaveformPlaceholder />
      </div>
    </div>
  );
}

// ─── Share tab content ────────────────────────────────────────────────────────

function ShareTabContent({ trackId }: { trackId: string }) {
  const { secretUrl, isLoading, isError, regenerate, isRegenerating } = useSecretLink(trackId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!secretUrl) return;
    await navigator.clipboard.writeText(secretUrl);
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
    return <div className="h-10 w-full bg-surface-raised rounded animate-pulse" />;
  }

  if (isError || !secretUrl) {
    return <p className="text-xs text-status-error">Unable to load secret link.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">Private Share</p>

      {/* Link row */}
      <div className="flex items-center gap-2 border border-border-default rounded px-3 py-2 bg-surface-default">
        <input
          type="text"
          readOnly
          value={secretUrl}
          aria-label="Secret share link"
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
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <CopyIcon />
          )}
        </button>
      </div>

      {/* Shorten link — disabled for now */}
      <label className="flex items-center gap-2 opacity-40 cursor-not-allowed select-none">
        <input type="checkbox" disabled className="w-3.5 h-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>

      <p className="text-xs text-text-muted leading-snug">
        This track is set to private and can only be shared using the secret link above.
        You can reset the secret link if you want to revoke access.
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

// ─── ShareModal ───────────────────────────────────────────────────────────────

const PLACEHOLDER_TRACK: TrackPreview = {
  title: 'Untitled Track',
  artist: 'Unknown Artist',
  duration: '0:00',
};

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-surface-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-bg-base border border-border-default rounded-lg shadow-2xl overflow-hidden">

          {/* Tabs */}
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

          {/* Content */}
          <div className="p-5">
            <TrackPreview track={track} />

            {activeTab === 'share' && (
              <>
                {isPrivate ? (
                  <ShareTabContent trackId={trackId} />
                ) : (
                  <p className="text-xs text-text-muted">
                    This track is public and can be shared freely.
                  </p>
                )}
              </>
            )}

            {activeTab === 'embed' && (
              <p className="text-xs text-text-muted">Embed functionality coming soon.</p>
            )}

            {activeTab === 'message' && (
              <p className="text-xs text-text-muted">Message functionality coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}