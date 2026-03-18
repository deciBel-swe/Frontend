'use client';

import { useState, type ReactNode } from 'react';
import { ShareModal } from '@/app/(creator)/upload/ShareModal';
import type { TrackPreview } from '@/app/(creator)/upload/ShareModal';
import { CopyIcon,ShareIcon } from '@/components/nav/TrackActionBar';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrackActionItem {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface TrackActionBarProps {
  trackId: string;
  isPrivate: boolean;
  track?: TrackPreview;
  /** Extra action items to append after the default ones */
  extraActions?: TrackActionItem[];
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionButton({ label, icon, onClick, disabled = false }: TrackActionItem) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        'flex items-center justify-center w-8 h-8 rounded',
        'border border-border-default bg-surface-default',
        'transition-colors duration-150',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-surface-raised cursor-pointer text-text-primary',
      ].join(' ')}
    >
      {icon}
    </button>
  );
}

// ─── TrackActionBar ───────────────────────────────────────────────────────────

export function TrackActionBar({
  trackId,
  isPrivate,
  track,
  extraActions = [],
}: TrackActionBarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultActions: TrackActionItem[] = [
    {
      id: 'share',
      label: 'Share',
      icon: <ShareIcon />,
      onClick: () => setIsShareOpen(true),
    },
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy link',
      icon: copied ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : <CopyIcon />,
      onClick: handleCopy,
    },
  ];

  const allActions = [...defaultActions, ...extraActions];

  return (
    <>
      {/* Row of icon buttons */}
      <div className="flex items-center gap-1.5">
        {allActions.map((action) => (
          <ActionButton key={action.id} {...action} />
        ))}
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trackId={trackId}
        isPrivate={isPrivate}
        track={track}
      />
    </>
  );
}