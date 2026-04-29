'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';

import { CheckIcon, CopyIcon } from '@/components/nav/TrackActionBar';
import { SocialShareButtons } from '@/components/icons/SocialIcons';
import {
  buildPlaylistSecretUrl,
  buildPlaylistUrl,
  buildTrackSecretUrl,
  buildTrackUrl,
} from '@/utils/resourcePaths';
import { EmbedTabContent } from '@/components/share/embed/EmbedTabContent';
import ScrollableArea from '@/components/scroll/ScrollableArea';

type ShareTab = 'share' | 'embed';

export interface TrackPreviewData {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  /** Inline waveform samples (0–1). Takes priority over waveformUrl. */
  waveformData?: number[];
  /** URL to fetch waveform JSON from (used if waveformData is absent). */
  waveformUrl?: string;
  /** Live playback state forwarded from the layout. */
  isPlaying?: boolean;
  currentTime?: number;
  durationSeconds?: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
}

export interface PlaylistPreviewData {
  title: string;
  owner: string;
  coverUrl?: string;
  trackCount?: number;
}

interface ShareModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  preview?: ReactNode;
  tabs?: { id: ShareTab; label: string }[];
}

interface TrackShareModalProps extends ShareModalBaseProps {
  variant: 'track';
  trackId: string;
  sharePathId?: string;
  shareUsername?: string;
  isPrivate: boolean;
  existingToken?: string | null;
  track?: TrackPreviewData;
}

interface PlaylistShareModalProps extends ShareModalBaseProps {
  variant: 'playlist';
  playlistId: string;
  sharePathId?: string;
  shareUsername?: string;
  isPrivate: boolean;
  existingToken?: string | null;
  playlist?: PlaylistPreviewData;
  activeTrackPreview?: TrackPreviewData;
}

interface ProfileShareModalProps extends ShareModalBaseProps {
  variant: 'profile';
  profileUrl: string;
}

export type ShareModalProps =
  | TrackShareModalProps
  | PlaylistShareModalProps
  | ProfileShareModalProps;

function UrlRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded border border-border-default bg-surface-default px-3 py-2">
      <input
        type="text"
        readOnly
        value={url}
        aria-label="Share link"
        className="flex-1 truncate bg-transparent font-mono text-xs text-text-primary outline-none"
      />
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className={`shrink-0 transition-colors duration-150 ${
          copied
            ? 'text-status-success'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

function ProfileShareContent({ profileUrl }: { profileUrl: string }) {
  return (
    <div className="flex flex-col gap-3">
      <SocialShareButtons url={profileUrl} />
      <UrlRow url={profileUrl} />
      <label className="flex cursor-not-allowed select-none items-center gap-2 opacity-40">
        <input type="checkbox" disabled className="h-3.5 w-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
    </div>
  );
}

function PrivateTrackShareContent({
  sharePathId,
  shareUsername,
  existingToken,
}: {
  sharePathId?: string;
  shareUsername?: string;
  existingToken?: string | null;
}) {
  const secretToken = existingToken?.trim() || '';
  console.log('Existing token:', existingToken, 'Trimmed token:', secretToken);
  const effectiveUrl =
    secretToken && shareUsername?.trim() && sharePathId?.trim()
      ? buildTrackSecretUrl(shareUsername, sharePathId, secretToken)
      : null;
  if (!effectiveUrl) {
    return (
      <p className="text-xs text-status-error">Unable to load secret link.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">Private Share</p>
      <UrlRow url={effectiveUrl} />
      <p className="text-xs leading-snug text-text-muted">
        This track is private and can only be shared with the link above.
      </p>
    </div>
  );
}

function PrivatePlaylistShareContent({
  sharePathId,
  shareUsername,
  existingToken,
}: {
  sharePathId?: string;
  shareUsername?: string;
  existingToken?: string | null;
}) {
  const effectiveToken = existingToken?.trim() || '';
  const effectiveUrl =
    effectiveToken && shareUsername?.trim() && sharePathId?.trim()
      ? buildPlaylistSecretUrl(shareUsername, sharePathId, effectiveToken)
      : null;

  if (!effectiveUrl) {
    return (
      <p className="text-xs text-status-error">Unable to load secret link.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">Private Share</p>
      <UrlRow url={effectiveUrl} />
      <p className="text-xs leading-snug text-text-muted">
        This playlist is private and can only be opened with the link above.
      </p>
    </div>
  );
}

function PublicTrackShareContent({
  artist,
  trackId,
  sharePathId,
  shareUsername,
}: {
  artist: string;
  trackId: string;
  sharePathId?: string;
  shareUsername?: string;
}) {
  const routeTrackId = sharePathId?.trim() || trackId;
  const shareOwner = shareUsername?.trim() || artist;
  const trackUrl = buildTrackUrl(shareOwner, routeTrackId);

  return (
    <div className="flex flex-col gap-3">
      <SocialShareButtons url={trackUrl} />
      <UrlRow url={trackUrl} />
      <label className="flex cursor-not-allowed select-none items-center gap-2 opacity-40">
        <input type="checkbox" disabled className="h-3.5 w-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
    </div>
  );
}

function PublicPlaylistShareContent({
  owner,
  playlistId,
  sharePathId,
  shareUsername,
}: {
  owner: string;
  playlistId: string;
  sharePathId?: string;
  shareUsername?: string;
}) {
  const routePlaylistId = sharePathId?.trim() || playlistId;
  const shareOwner = shareUsername?.trim() || owner;
  const playlistUrl = buildPlaylistUrl(shareOwner, routePlaylistId);

  return (
    <div className="flex flex-col gap-3">
      <SocialShareButtons url={playlistUrl} />
      <UrlRow url={playlistUrl} />
      <label className="flex cursor-not-allowed select-none items-center gap-2 opacity-40">
        <input type="checkbox" disabled className="h-3.5 w-3.5" />
        <span className="text-xs text-text-secondary">Shorten link</span>
      </label>
    </div>
  );
}

function WaveformPlaceholder() {
  return (
    <div className="flex h-8 items-end gap-0.5">
      {Array.from({ length: 40 }).map((_, index) => (
        <div
          key={index}
          className="w-0.5 rounded-full bg-border-strong"
          style={{
            height: `${20 + Math.sin(index * 0.8) * 10 + Math.random() * 8}%`,
          }}
        />
      ))}
    </div>
  );
}

function MediaPreview({
  title,
  subtitle,
  coverUrl,
}: {
  title: string;
  subtitle: string;
  coverUrl?: string;
}) {
  return (
    <div className="mb-5 flex gap-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-surface-raised">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            width={80}
            height={80}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-raised">
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
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div>
          <p className="text-xs text-text-muted">{subtitle}</p>
          <p className="truncate text-sm font-semibold text-text-primary">
            {title}
          </p>
        </div>
        <WaveformPlaceholder />
      </div>
    </div>
  );
}

export function TrackPreview({ track }: { track: TrackPreviewData }) {
  return (
    <MediaPreview
      title={track.title}
      subtitle={track.artist}
      coverUrl={track.coverUrl}
    />
  );
}

export function PlaylistPreview({ playlist }: { playlist: PlaylistPreviewData }) {
  return (
    <MediaPreview
      title={playlist.title}
      subtitle={playlist.owner}
      coverUrl={playlist.coverUrl}
    />
  );
}

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
    <div className="mb-5 flex items-center gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-raised">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-text-muted">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {displayName}
        </p>
        <p className="text-xs text-text-muted">@{username}</p>
      </div>
    </div>
  );
}

const PLACEHOLDER_TRACK: TrackPreviewData = {
  title: 'Untitled Track',
  artist: 'Unknown Artist',
};

const PLACEHOLDER_PLAYLIST: PlaylistPreviewData = {
  title: 'Untitled Playlist',
  owner: 'Unknown Owner',
};

const DEFAULT_MEDIA_TABS: { id: ShareTab; label: string }[] = [
  { id: 'share', label: 'Share' },
  { id: 'embed', label: 'Embed' },
];

const DEFAULT_PROFILE_TABS: { id: ShareTab; label: string }[] = [
  { id: 'share', label: 'Share' },

];

export function ShareModal(props: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('share');

  const tabs = useMemo(
    () =>
      props.tabs ??
      (props.variant === 'profile' ? DEFAULT_PROFILE_TABS : DEFAULT_MEDIA_TABS),
    [props.tabs, props.variant]
  );

    /**
   * Resolves the public URL for the current resource so EmbedTabContent
   * can build its widget src without knowing about variants internally.
   */
  const embedResourceUrl = useMemo(() => {
    if (props.variant === 'profile') return props.profileUrl;
    if (props.variant === 'track') {
      const track = props.track ?? PLACEHOLDER_TRACK;
      if (props.isPrivate && props.existingToken?.trim()) {
        return buildTrackSecretUrl(
          props.shareUsername?.trim() || track.artist,
          props.sharePathId?.trim() || props.trackId,
          props.existingToken.trim()
        );
      }

      return buildTrackUrl(
        props.shareUsername?.trim() || track.artist,
        props.sharePathId?.trim() || props.trackId,
      );
    }
    // playlist
    const playlist = props.playlist ?? PLACEHOLDER_PLAYLIST;
    return buildPlaylistUrl(
      props.shareUsername?.trim() || playlist.owner,
      props.sharePathId?.trim() || props.playlistId,
    );
  }, [props]);

  if (!props.isOpen) {
    return null;
  }

  let resolvedPreview: ReactNode = props.preview;
  if (!resolvedPreview) {
    if (props.variant === 'track') {
      resolvedPreview = <TrackPreview track={props.track ?? PLACEHOLDER_TRACK} />;
    } else if (props.variant === 'playlist') {
      resolvedPreview = (
        <PlaylistPreview playlist={props.playlist ?? PLACEHOLDER_PLAYLIST} />
      );
    }
  }

  let shareContent: ReactNode = null;
  if (activeTab === 'share') {
    if (props.variant === 'profile') {
      shareContent = <ProfileShareContent profileUrl={props.profileUrl} />;
    } else if (props.variant === 'track') {
      const track = props.track ?? PLACEHOLDER_TRACK;
      shareContent = props.isPrivate ? (
        <PrivateTrackShareContent
          sharePathId={props.sharePathId}
          shareUsername={props.shareUsername}
          existingToken={props.existingToken}
        />
      ) : (
        <PublicTrackShareContent
          artist={track.artist}
          trackId={props.trackId}
          sharePathId={props.sharePathId}
          shareUsername={props.shareUsername}
        />
      );
    } else {
      const playlist = props.playlist ?? PLACEHOLDER_PLAYLIST;
      shareContent = props.isPrivate ? (
        <PrivatePlaylistShareContent
          sharePathId={props.sharePathId}
          shareUsername={props.shareUsername}
          existingToken={props.existingToken}
        />
      ) : (
        <PublicPlaylistShareContent
          owner={playlist.owner}
          playlistId={props.playlistId}
          sharePathId={props.sharePathId}
          shareUsername={props.shareUsername}
        />
      );
    }
  } else if (activeTab === 'embed') {
      // Resolve track/playlist metadata for the embed picker & preview
    const embedTitle =
      props.variant === 'track'
        ? (props.track ?? PLACEHOLDER_TRACK).title
        : props.variant === 'playlist'
        ? (props.playlist ?? PLACEHOLDER_PLAYLIST).title
        : '';
    const embedArtist =
      props.variant === 'track'
        ? (props.track ?? PLACEHOLDER_TRACK).artist
        : props.variant === 'playlist'
        ? (props.playlist ?? PLACEHOLDER_PLAYLIST).owner
        : '';
    const embedCover =
      props.variant === 'track'
        ? props.track?.coverUrl
        : props.variant === 'playlist'
        ? props.playlist?.coverUrl
        : undefined;
    const embedDuration =
      props.variant === 'track' ? props.track?.duration : undefined;
    // const embedWaveformData =
    //   props.variant === 'track' ? props.track?.waveformData : undefined;
    // const embedWaveformUrl =
    //   props.variant === 'track' ? props.track?.waveformUrl : undefined;
    // const embedIsPlaying =
    //   props.variant === 'track' ? props.track?.isPlaying : undefined;
    // const embedCurrentTime =
    //   props.variant === 'track' ? props.track?.currentTime : undefined;
    // const embedDurationSeconds =
    //   props.variant === 'track' ? props.track?.durationSeconds : undefined;
    // const embedOnPlayPause =
    //   props.variant === 'track' ? props.track?.onPlayPause : undefined;
    // const embedOnWaveformSeek =
    //   props.variant === 'track' ? props.track?.onWaveformSeek : undefined;
      let embedIsPlaying: boolean | undefined;
      let embedCurrentTime: number | undefined;
      let embedDurationSeconds: number | undefined;
      let embedOnPlayPause: (() => void) | undefined;
      let embedOnWaveformSeek: ((fraction: number) => void) | undefined;
      let embedWaveformData: number[] | undefined;
      let embedWaveformUrl: string | undefined;

      if (props.variant === 'track') {
        embedIsPlaying = props.track?.isPlaying;
        embedCurrentTime = props.track?.currentTime;
        embedDurationSeconds = props.track?.durationSeconds;
        embedOnPlayPause = props.track?.onPlayPause;
        embedOnWaveformSeek = props.track?.onWaveformSeek;
        embedWaveformData = props.track?.waveformData;
        embedWaveformUrl = props.track?.waveformUrl;
      } else if (props.variant === 'playlist' && props.activeTrackPreview) {
        embedIsPlaying = props.activeTrackPreview.isPlaying;
        embedCurrentTime = props.activeTrackPreview.currentTime;
        embedDurationSeconds = props.activeTrackPreview.durationSeconds;
        embedOnPlayPause = props.activeTrackPreview.onPlayPause;
        embedOnWaveformSeek = props.activeTrackPreview.onWaveformSeek;
        embedWaveformData = props.activeTrackPreview.waveformData;
        embedWaveformUrl = props.activeTrackPreview.waveformUrl;
      }
    shareContent = <EmbedTabContent
        resourceUrl={embedResourceUrl}
        title={embedTitle}
        artist={embedArtist}
        coverUrl={embedCover}
        duration={embedDuration}
        waveformData={embedWaveformData}
        waveformUrl={embedWaveformUrl}
        isPlaying={embedIsPlaying}
        currentTime={embedCurrentTime}
        durationSeconds={embedDurationSeconds}
        onPlayPause={embedOnPlayPause}
        onWaveformSeek={embedOnWaveformSeek}
      />;
  } 

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm dark:bg-white/60"
        onClick={props.onClose}
      />

      <div className="relative w-full max-w-lg h-[80vh] overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl dark:bg-black">
        {/* <div className="border-b border-border-default px-5 py-4 text-sm font-semibold">
          Share
        </div> */}

        <div className="border-b border-border-default">
          <nav className="flex">
            {tabs.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {label}
                  {isActive ? (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
    <ScrollableArea>
        <div className="space-y-4 p-5">
           {activeTab === 'share' && resolvedPreview}
          {shareContent}
        </div>
            </ScrollableArea>
      </div>

    </div>
  );
}
