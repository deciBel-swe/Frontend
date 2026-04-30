'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
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
import { usePlayerStore } from '@/features/player/store/playerStore';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { playlistService } from '@/services';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import type { PlaylistResponse } from '@/types/playlists';
import { formatDuration } from '@/utils/formatDuration';

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

type PlaylistTrackDto = NonNullable<PlaylistResponse['tracks']>[number];

const toWaveform = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry))
      .map((entry) => Math.max(0, Math.min(1, entry)));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      return toWaveform(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    const payload = value as Record<string, unknown>;
    if ('waveformData' in payload) {
      return toWaveform(payload.waveformData);
    }

    if ('samples' in payload) {
      return toWaveform(payload.samples);
    }
  }

  return [];
};

const resolveTrackId = (track: PlaylistTrackDto): number | null => {
  if ('id' in track && typeof track.id === 'number') {
    return track.id;
  }

  if ('trackId' in track && typeof track.trackId === 'number') {
    return track.trackId;
  }

  return null;
};

const resolveTrackTitle = (track: PlaylistTrackDto): string => {
  return typeof track.title === 'string' && track.title.trim()
    ? track.title
    : 'Untitled Track';
};

const resolveTrackUrl = (track: PlaylistTrackDto): string | null => {
  return 'trackUrl' in track && typeof track.trackUrl === 'string'
    ? track.trackUrl
    : null;
};

const resolveTrackCover = (track: PlaylistTrackDto): string | undefined => {
  return 'coverUrl' in track && typeof track.coverUrl === 'string'
    ? track.coverUrl
    : undefined;
};

const resolveTrackArtist = (
  track: PlaylistTrackDto,
  fallbackArtist: string
): string => {
  if ('artist' in track && track.artist) {
    return track.artist.displayName || track.artist.username;
  }

  return fallbackArtist;
};

const resolveTrackDurationSeconds = (track: PlaylistTrackDto): number => {
  if ('durationSeconds' in track && typeof track.durationSeconds === 'number') {
    return track.durationSeconds;
  }

  if (
    'trackDurationSeconds' in track &&
    typeof track.trackDurationSeconds === 'number'
  ) {
    return track.trackDurationSeconds;
  }

  return 0;
};

const resolveTrackAccess = (
  track: PlaylistTrackDto
): 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined => {
  return 'access' in track ? track.access : undefined;
};

const mapPlaylistQueueTracks = (
  playlist: PlaylistResponse,
  fallbackArtist: string
): PlayerTrack[] => {
  return (playlist.tracks ?? []).flatMap((track) => {
    const id = resolveTrackId(track);
    const trackUrl = resolveTrackUrl(track);
    if (id === null || !trackUrl) {
      return [];
    }

    const access = resolveTrackAccess(track);

    return [
      playerTrackMappers.fromAdapterInput(
        {
          id,
          title: resolveTrackTitle(track),
          trackUrl,
          artist: resolveTrackArtist(track, fallbackArtist),
          durationSeconds: resolveTrackDurationSeconds(track),
          coverUrl: resolveTrackCover(track),
        },
        {
          access:
            access === 'BLOCKED' || access === 'PREVIEW'
              ? 'BLOCKED'
              : 'PLAYABLE',
          fallbackArtistName: fallbackArtist,
        }
      ),
    ];
  });
};

export function ShareModal(props: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('share');
  const [hydratedPlaylist, setHydratedPlaylist] =
    useState<PlaylistResponse | null>(null);

  const playerCurrentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const playerIsPlaying = usePlayerStore((state) => state.isPlaying);
  const playerCurrentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const seek = usePlayerStore((state) => state.seek);
  const playlistActiveTrackPreview =
    props.variant === 'playlist' ? props.activeTrackPreview : undefined;
  const playlistExistingToken =
    props.variant === 'playlist' ? props.existingToken : undefined;
  const playlistIsPrivate =
    props.variant === 'playlist' ? props.isPrivate : false;
  const playlistId =
    props.variant === 'playlist' ? props.playlistId : undefined;
  const playlistOwner =
    props.variant === 'playlist' ? props.playlist?.owner : undefined;
  const playlistCoverUrl =
    props.variant === 'playlist' ? props.playlist?.coverUrl : undefined;

  const tabs = useMemo(
    () =>
      props.tabs ??
      (props.variant === 'profile' ? DEFAULT_PROFILE_TABS : DEFAULT_MEDIA_TABS),
    [props.tabs, props.variant]
  );

  useEffect(() => {
    if (
      !props.isOpen ||
      activeTab !== 'embed' ||
      props.variant !== 'playlist' ||
      playlistActiveTrackPreview
    ) {
      return;
    }

    const numericPlaylistId = Number(playlistId);
    if (!Number.isFinite(numericPlaylistId)) {
      return;
    }

    let isCancelled = false;

    const loadPlaylist = async () => {
      try {
        const playlist =
          playlistIsPrivate && playlistExistingToken?.trim()
            ? await playlistService.getPlaylistByToken(playlistExistingToken.trim())
            : await playlistService.getPlaylist(numericPlaylistId);

        if (!isCancelled) {
          setHydratedPlaylist(playlist);
        }
      } catch {
        if (!isCancelled) {
          setHydratedPlaylist(null);
        }
      }
    };

    void loadPlaylist();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
    props.isOpen,
    props.variant,
    playlistActiveTrackPreview,
    playlistExistingToken,
    playlistId,
    playlistIsPrivate,
  ]);

  const hydratedPlaylistQueueTracks = useMemo(() => {
    if (props.variant !== 'playlist' || !hydratedPlaylist) {
      return [];
    }

    const fallbackArtist =
      hydratedPlaylist.owner?.displayName?.trim() ||
      hydratedPlaylist.owner?.username ||
      playlistOwner ||
      'Unknown Artist';

    return mapPlaylistQueueTracks(hydratedPlaylist, fallbackArtist);
  }, [hydratedPlaylist, playlistOwner, props.variant]);

  const hydratedPlaylistPreview = useMemo<TrackPreviewData | undefined>(() => {
    if (
      props.variant !== 'playlist' ||
      playlistActiveTrackPreview ||
      !hydratedPlaylist ||
      hydratedPlaylistQueueTracks.length === 0
    ) {
      return undefined;
    }

    const activeQueueTrack =
      hydratedPlaylistQueueTracks.find((track) => track.id === playerCurrentTrackId) ??
      hydratedPlaylistQueueTracks[0];
    const isCurrentTrack = activeQueueTrack.id === playerCurrentTrackId;
    const embeddedWaveform = toWaveform(
      (hydratedPlaylist as { firstTrackWaveformData?: unknown })
        .firstTrackWaveformData
    );
    const durationSeconds =
      isCurrentTrack && playerDuration > 0
        ? playerDuration
        : activeQueueTrack.durationSeconds ?? 1;

    return {
      title: activeQueueTrack.title,
      artist: activeQueueTrack.artistName,
      coverUrl: activeQueueTrack.coverUrl ?? playlistCoverUrl,
      duration: formatDuration(durationSeconds),
      waveformData: embeddedWaveform,
      waveformUrl: hydratedPlaylist.firstTrackWaveformUrl ?? undefined,
      isPlaying: isCurrentTrack && playerIsPlaying,
      currentTime: isCurrentTrack ? playerCurrentTime : 0,
      durationSeconds,
    };
  }, [
    hydratedPlaylist,
    hydratedPlaylistQueueTracks,
    playerCurrentTime,
    playerCurrentTrackId,
    playerDuration,
    playerIsPlaying,
    playlistActiveTrackPreview,
    playlistCoverUrl,
    props.variant,
  ]);

  const handleHydratedPlaylistPlayPause = useCallback(() => {
    if (!hydratedPlaylistPreview || hydratedPlaylistQueueTracks.length === 0) {
      return;
    }

    const selectedTrack =
      hydratedPlaylistQueueTracks.find(
        (track) => track.id === playerCurrentTrackId
      ) ?? hydratedPlaylistQueueTracks[0];

    if (selectedTrack.id === playerCurrentTrackId && playerIsPlaying) {
      pausePlayback();
      return;
    }

    const startIndex = Math.max(
      0,
      hydratedPlaylistQueueTracks.findIndex((track) => track.id === selectedTrack.id)
    );
    setQueue(hydratedPlaylistQueueTracks, startIndex, 'playlist');
    playTrack(selectedTrack);
  }, [
    hydratedPlaylistPreview,
    hydratedPlaylistQueueTracks,
    pausePlayback,
    playTrack,
    playerCurrentTrackId,
    playerIsPlaying,
    setQueue,
  ]);

  const handleHydratedPlaylistWaveformSeek = useCallback(
    (fraction: number) => {
      if (!hydratedPlaylistPreview || hydratedPlaylistQueueTracks.length === 0) {
        return;
      }

      const selectedTrack =
        hydratedPlaylistQueueTracks.find(
          (track) => track.id === playerCurrentTrackId
        ) ?? hydratedPlaylistQueueTracks[0];
      const isCurrentTrack = selectedTrack.id === playerCurrentTrackId;

      if (!isCurrentTrack || !playerIsPlaying) {
        const startIndex = Math.max(
          0,
          hydratedPlaylistQueueTracks.findIndex(
            (track) => track.id === selectedTrack.id
          )
        );
        setQueue(hydratedPlaylistQueueTracks, startIndex, 'playlist');
        playTrack(selectedTrack);
      }

      const durationSeconds =
        isCurrentTrack && playerDuration > 0
          ? playerDuration
          : selectedTrack.durationSeconds ?? 1;
      seek(Math.max(0, Math.min(1, fraction)) * durationSeconds);
    },
    [
      hydratedPlaylistPreview,
      hydratedPlaylistQueueTracks,
      playTrack,
      playerCurrentTrackId,
      playerDuration,
      playerIsPlaying,
      seek,
      setQueue,
    ]
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
    if (props.isPrivate && props.existingToken?.trim()) {
      return buildPlaylistSecretUrl(
        props.shareUsername?.trim() || playlist.owner,
        props.sharePathId?.trim() || props.playlistId,
        props.existingToken.trim()
      );
    }

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
    const effectivePlaylistTrackPreview =
      props.variant === 'playlist'
        ? playlistActiveTrackPreview ??
          (hydratedPlaylistPreview
            ? {
                ...hydratedPlaylistPreview,
                onPlayPause: handleHydratedPlaylistPlayPause,
                onWaveformSeek: handleHydratedPlaylistWaveformSeek,
              }
            : undefined)
        : undefined;
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
      props.variant === 'track'
        ? props.track?.duration
        : effectivePlaylistTrackPreview?.duration;
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
      } else if (props.variant === 'playlist' && effectivePlaylistTrackPreview) {
        embedIsPlaying = effectivePlaylistTrackPreview.isPlaying;
        embedCurrentTime = effectivePlaylistTrackPreview.currentTime;
        embedDurationSeconds = effectivePlaylistTrackPreview.durationSeconds;
        embedOnPlayPause = effectivePlaylistTrackPreview.onPlayPause;
        embedOnWaveformSeek = effectivePlaylistTrackPreview.onWaveformSeek;
        embedWaveformData = effectivePlaylistTrackPreview.waveformData;
        embedWaveformUrl = effectivePlaylistTrackPreview.waveformUrl;
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
