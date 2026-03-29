'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useSecretLink } from '@/hooks/useSecretLink';
import { formatSecretUrlWithSlug } from '@/utils/formatSecretUrl';
import { CheckIcon, CopyIcon } from '@/components/nav/TrackActionBar';
import {SocialShareButtons} from '@/components/icons/SocialIcons';

// ─── Types ────────────────────────────────────────────────────────────────────
type ShareTab = 'share' | 'embed' | 'message';

/** Track metadata shown in the modal preview section */
export interface TrackPreviewData {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
}

// ─── Base modal props shared by all callers ───────────────────────────────────
interface ShareModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  /** Node rendered above the share controls — cover art, avatar, etc. */
  preview?: ReactNode;
  /** Tabs to show. Defaults to ['share', 'embed', 'message']. */
  tabs?: { id: ShareTab; label: string }[];
}

// ─── Track variant ────────────────────────────────────────────────────────────
interface TrackShareModalProps extends ShareModalBaseProps {
  variant: 'track';
  trackId: string;
  isPrivate: boolean;
  track?: TrackPreviewData;
}

// ─── Profile variant ──────────────────────────────────────────────────────────
interface ProfileShareModalProps extends ShareModalBaseProps {
  variant: 'profile';
  /** The public profile URL to share */
  profileUrl: string;
}

export type ShareModalProps = TrackShareModalProps | ProfileShareModalProps;

// ─── Shared URL row ───────────────────────────────────────────────────────────

function UrlRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 border border-border-default rounded px-3 py-2 bg-surface-default">
      <input
        type="text"
        readOnly
        value={url}
        aria-label="Share link"
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
  );
}

// ─── Share tab content variants ───────────────────────────────────────────────

/** Profile share — social buttons + URL row */
function ProfileShareContent({ profileUrl }: { profileUrl: string }) {
  return (
    <div className="flex flex-col gap-3">
      <SocialShareButtons url={profileUrl} />
      <UrlRow url={profileUrl} />
      <label className="flex items-center gap-2 opacity-40 cursor-not-allowed select-none">
        <input type="checkbox" disabled className="w-3.5 h-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
    </div>
  );
}

/** Private track share — secret link + reset */
function PrivateShareContent({
  trackId,
  track,
}: {
  trackId: string;
  track: TrackPreviewData;
}) {
  const { secretUrl, secretToken, isLoading, isError, regenerate, isRegenerating } =
    useSecretLink(trackId);
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

  if (isLoading)
    return <div className="h-10 w-full bg-surface-raised rounded animate-pulse" />;

  if (isError || !secretUrl)
    return <p className="text-xs text-status-error">Unable to load secret link.</p>;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">Private Share</p>
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
            copied ? 'text-status-success' : 'text-text-muted hover:text-text-primary',
          ].join(' ')}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <label className="flex items-center gap-2 opacity-40 cursor-not-allowed select-none">
        <input type="checkbox" disabled className="w-3.5 h-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
      <p className="text-xs text-text-muted leading-snug">
        This track is set to private and can only be shared using the secret link above.
        You can reset the secret link if you want to revoke access.
      </p>
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

/** Public track share — social buttons + URL row */
function PublicTrackShareContent({ artist, title }: { artist: string; title: string }) {
  const userSlug = artist.toLowerCase().replace(/\s+/g, '');
  const trackSlug = title.toLowerCase().replace(/\s+/g, '-');
  const trackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${userSlug}/${trackSlug}`;

  return (
    <div className="flex flex-col gap-3">
      <SocialShareButtons url={trackUrl} />
      <UrlRow url={trackUrl} />
      <label className="flex items-center gap-2 select-none cursor-not-allowed opacity-40">
        <input type="checkbox" disabled className="w-3.5 h-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
    </div>
  );
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

// ─── Built-in previews ────────────────────────────────────────────────────────

/**
 * Default track preview (used when variant="track" and no custom preview is passed).
 */
export function TrackPreview({ track }: { track: TrackPreviewData }) {
  return (
    <div className="flex gap-3 mb-5">
      <div className="relative w-20 h-20 shrink-0 bg-surface-raised rounded overflow-hidden">
        {track.coverUrl ? (
          <Image src={track.coverUrl} alt={track.title} fill className="object-cover" />
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

/**
 * Default profile preview (used when variant="profile" and no custom preview is passed).
 */
export function ProfilePreview({
  displayName,
  username,
  avatarUrl,
}: {
  displayName: string;
  username: string;
  avatarUrl?: string;
}) {
  return (
    <div className="flex gap-3 mb-5 items-center">
      <div className="relative w-16 h-16 shrink-0 rounded-full bg-surface-raised overflow-hidden">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-text-muted">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
        <p className="text-xs text-text-muted">@{username}</p>
      </div>
    </div>
  );
}

// ─── Default placeholders ─────────────────────────────────────────────────────

const PLACEHOLDER_TRACK: TrackPreviewData = {
  title: 'Untitled Track',
  artist: 'Unknown Artist',
  duration: '0:00',
};

const DEFAULT_TRACK_TABS: { id: ShareTab; label: string }[] = [
  { id: 'share', label: 'Share' },
  { id: 'embed', label: 'Embed' },
  { id: 'message', label: 'Message' },
];

const DEFAULT_PROFILE_TABS: { id: ShareTab; label: string }[] = [
  { id: 'share', label: 'Share' },
  { id: 'message', label: 'Message' },
];

// ─── ShareModal ───────────────────────────────────────────────────────────────

/**
 * Generic share modal used for both tracks and profiles.
 *
 * @example — track (public)
 * <ShareModal
 *   variant="track"
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   trackId="42"
 *   isPrivate={false}
 *   track={{ title: 'My Track', artist: 'mockuser' }}
 * />
 *
 * @example — track (private)
 * <ShareModal
 *   variant="track"
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   trackId="42"
 *   isPrivate={true}
 *   track={{ title: 'My Track', artist: 'mockuser' }}
 * />
 *
 * @example — profile
 * <ShareModal
 *   variant="profile"
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   profileUrl="https://yourapp.com/mockuser"
 *   preview={<ProfilePreview displayName="mockuser" username="mockuser" avatarUrl="..." />}
 * />
 */
export function ShareModal(props: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('share');

  if (!props.isOpen) return null;

  // ── Resolve tabs ──────────────────────────────────────────────────────────
  const tabs =
    props.tabs ??
    (props.variant === 'profile' ? DEFAULT_PROFILE_TABS : DEFAULT_TRACK_TABS);

  // ── Resolve preview ───────────────────────────────────────────────────────
  let resolvedPreview: ReactNode = props.preview;

  if (!resolvedPreview) {
    if (props.variant === 'track') {
      resolvedPreview = <TrackPreview track={props.track ?? PLACEHOLDER_TRACK} />;
    }
    // profile variant: caller is expected to pass a preview; nothing shown if omitted
  }

  // ── Resolve share content for active tab ──────────────────────────────────
  let shareContent: ReactNode = null;

  if (activeTab === 'share') {
    if (props.variant === 'profile') {
      shareContent = <ProfileShareContent profileUrl={props.profileUrl} />;
    } else {
      const track = props.track ?? PLACEHOLDER_TRACK;
      shareContent = props.isPrivate ? (
        <PrivateShareContent trackId={props.trackId} track={track} />
      ) : (
        <PublicTrackShareContent artist={track.artist} title={track.title} />
      );
    }
  } else if (activeTab === 'embed') {
    shareContent = (
      <p className="text-xs text-text-muted">Embed functionality coming soon.</p>
    );
  } else if (activeTab === 'message') {
    shareContent = (
      <p className="text-xs text-text-muted">Message functionality coming soon.</p>
    );
  }

  return (
    <>
       {/* MODAL WRAPPER */}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
      className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
      onClick={props.onClose}
    />
      <div className="relative w-full max-w-md bg-white dark:bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden">

        {/* HEADER (optional but now consistent with your system) */}
        <div className="px-5 py-4 border-b border-border-default text-sm font-semibold">
          Share 
        </div>
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
          <div className="p-5 space-y-4">
            {resolvedPreview}
            {shareContent}
          </div>
        </div>
      </div>
    </>
  );
}