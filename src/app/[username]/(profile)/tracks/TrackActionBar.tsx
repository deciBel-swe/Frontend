'use client';

import { useState, type ReactNode } from 'react';
import { ShareModal } from '@/app/[username]/(profile)/tracks/ShareModal';
import type { TrackPreview } from '@/app/[username]/(profile)/tracks/ShareModal';
import {
  CheckIcon,
  CopyIcon,
  ShareIcon,
} from '@/components/nav/TrackActionBar';
import { useSecretLink } from '@/hooks/useSecretLink';
import { useTrackMetadata } from '@/hooks/useTrackMetaData';

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

function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
}: TrackActionItem) {
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

/**
 * Extensible row of icon action buttons for a track.
 *
 * Default actions:
 * - **Share**: opens `ShareModal`
 * - **Copy**: copies the correct URL based on privacy
 *   - Private → copies secret link
 *   - Public  → copies `trackUrl` from API
 *
 * Pass `extraActions` to add more buttons without modifying this component.
 *
 * @example
 * <TrackActionBar
 *   trackId="42"
 *   isPrivate={true}
 *   track={{ title: 'My Track', artist: 'artist1' }}
 * />
 *
 * // With extra actions
 * <TrackActionBar
 *   trackId="42"
 *   isPrivate={false}
 *   extraActions={[{ id: 'edit', label: 'Edit', icon: <EditIcon />, onClick: handleEdit }]}
 * />
 */
export function TrackActionBar({
  trackId,
  isPrivate,
  track,
  extraActions = [],
}: TrackActionBarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { secretUrl } = useSecretLink(isPrivate ? trackId : undefined);
  const { metadata } = useTrackMetadata(
    !isPrivate ? Number(trackId) : undefined
  );

  const handleCopy = async () => {
    const urlToCopy = isPrivate
      ? (secretUrl ?? '')
      : (metadata?.trackUrl ?? '');

    if (!urlToCopy) return;
    await navigator.clipboard.writeText(urlToCopy);
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
      icon: copied ? <CheckIcon /> : <CopyIcon />,
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
