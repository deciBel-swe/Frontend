'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  EmbedPlayer,
} from '@/components/share/embed/EmbedPreview';
import {
  STYLE_HEIGHT_MAP,
  type EmbedConfig,
  type EmbedStyle,
} from '@/components/share/embed/services/embedService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import type { PlaybackAccess, PlayerTrack } from '@/features/player/contracts/playerContracts';
import { playlistService, trackService } from '@/services';
import type { PlaylistResponse } from '@/types/playlists';
import type { TrackMetaData } from '@/types/tracks';
import { formatDuration } from '@/utils/formatDuration';
import {
  getSecretTokenFromQuery,
  resolvePlaylistIdFromIdentifier,
  resolveTrackIdFromIdentifier,
} from '@/utils/resourceIdentifierResolvers';

const FALLBACK_COLOR = '#ff5500';

const toEmbedStyle = (value: string | null): EmbedStyle => {
  if (value === 'mini' || value === 'text' || value === 'visual') {
    return value;
  }

  return 'visual';
};

const normalizeColor = (value: string | null): string => {
  const normalized = value?.trim().replace(/^#/, '') ?? '';
  return /^[0-9a-fA-F]{6}$/.test(normalized) ? `#${normalized}` : FALLBACK_COLOR;
};

const toBoolean = (value: string | null, fallback = false): boolean => {
  if (value === null) {
    return fallback;
  }

  return value === 'true';
};

const toPlaybackAccess = (
  access: TrackMetaData['access'] | undefined
): PlaybackAccess | undefined => {
  if (!access) {
    return undefined;
  }

  return access;
};

type ResourceKind = 'track' | 'playlist';
type PlaylistTrackDto = NonNullable<PlaylistResponse['tracks']>[number];

type EmbedResource = {
  kind: ResourceKind;
  title: string;
  artist: string;
  coverUrl?: string;
  durationSeconds: number;
  waveformData?: number[];
  waveformUrl?: string;
  queueTracks: PlayerTrack[];
};

const getResourcePathSegments = (resource: string): string[] => {
  try {
    return new URL(resource).pathname.split('/').filter(Boolean);
  } catch {
    return [];
  }
};

const getResourceKind = (resource: string): ResourceKind => {
  return getResourcePathSegments(resource).includes('sets') ? 'playlist' : 'track';
};

const extractResourceIdentifier = (
  resource: string,
  kind: ResourceKind
): string => {
  const trimmed = resource.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const pathSegments = getResourcePathSegments(trimmed);
  if (pathSegments.length > 0) {
    const setsIndex = pathSegments.indexOf('sets');
    if (kind === 'playlist' && setsIndex >= 0) {
      return pathSegments[setsIndex + 1] ?? '';
    }

    return pathSegments[pathSegments.length - 1] ?? '';
  }

  return trimmed;
};

const extractTokenFromResource = (resource: string): string | null => {
  try {
    const token = new URL(resource).searchParams.get('token');
    const normalized = token?.trim() ?? '';
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
};

const toWaveformSamples = (value: unknown): number[] | undefined => {
  if (Array.isArray(value)) {
    const samples = value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry))
      .map((entry) => Math.max(0, Math.min(1, entry)));

    return samples.length > 0 ? samples : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    try {
      return toWaveformSamples(JSON.parse(trimmed));
    } catch {
      return undefined;
    }
  }

  if (value && typeof value === 'object') {
    const payload = value as Record<string, unknown>;
    return toWaveformSamples(payload.waveformData ?? payload.samples);
  }

  return undefined;
};

const resolvePlaylistCover = (playlist: PlaylistResponse): string | undefined => {
  const directCover = playlist.coverArtUrl?.trim();
  if (directCover) {
    return directCover;
  }

  const legacy = playlist as PlaylistResponse & {
    CoverArt?: string;
    image?: string;
  };
  return legacy.CoverArt?.trim() || legacy.image?.trim() || undefined;
};

const getPlaylistTrackId = (track: PlaylistTrackDto): number | null => {
  if ('id' in track && typeof track.id === 'number') {
    return track.id;
  }

  if ('trackId' in track && typeof track.trackId === 'number') {
    return track.trackId;
  }

  return null;
};

const getPlaylistTrackArtist = (
  track: PlaylistTrackDto,
  fallbackArtist: string
): string => {
  if ('artist' in track && track.artist) {
    return track.artist.displayName || track.artist.username;
  }

  return fallbackArtist;
};

const getPlaylistTrackDuration = (track: PlaylistTrackDto): number | undefined => {
  if ('durationSeconds' in track && typeof track.durationSeconds === 'number') {
    return track.durationSeconds;
  }

  if (
    'trackDurationSeconds' in track &&
    typeof track.trackDurationSeconds === 'number'
  ) {
    return track.trackDurationSeconds;
  }

  return undefined;
};

const getPlaylistTrackUrl = (track: PlaylistTrackDto): string | null => {
  if ('trackUrl' in track && typeof track.trackUrl === 'string') {
    return track.trackUrl;
  }

  return null;
};

const getPlaylistTrackCover = (track: PlaylistTrackDto): string | undefined => {
  if ('coverUrl' in track && typeof track.coverUrl === 'string') {
    return track.coverUrl;
  }

  return undefined;
};

const getPlaylistTrackAccess = (
  track: PlaylistTrackDto
): PlaybackAccess | undefined => {
  if ('access' in track) {
    return toPlaybackAccess(track.access);
  }

  return undefined;
};

const getPlaylistTrackWaveformData = (
  track: PlaylistTrackDto
): number[] | undefined => {
  return toWaveformSamples((track as Record<string, unknown>).waveformData);
};

const getPlaylistTrackWaveformUrl = (
  track: PlaylistTrackDto
): string | undefined => {
  const value = (track as Record<string, unknown>).waveformUrl;
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined;
};

const playlistTrackToPlayerTrack = (
  track: PlaylistTrackDto,
  fallbackArtist: string
): PlayerTrack | null => {
  const id = getPlaylistTrackId(track);
  const trackUrl = getPlaylistTrackUrl(track);

  if (id === null || !trackUrl) {
    return null;
  }

  return playerTrackMappers.fromAdapterInput(
    {
      id,
      title: track.title,
      trackUrl,
      artist: getPlaylistTrackArtist(track, fallbackArtist),
      durationSeconds: getPlaylistTrackDuration(track),
      coverUrl: getPlaylistTrackCover(track),
      waveformData: getPlaylistTrackWaveformData(track),
    },
    { access: getPlaylistTrackAccess(track), fallbackArtistName: fallbackArtist }
  );
};

const loadTrackResource = async (
  resourceUrl: string,
  token: string | null
): Promise<EmbedResource> => {
  const metadata = token
    ? await trackService.getTrackByToken(token)
    : await (async () => {
        const identifier = extractResourceIdentifier(resourceUrl, 'track');
        const resolvedTrackId = await resolveTrackIdFromIdentifier(identifier);
        return trackService.getTrackMetadata(resolvedTrackId);
      })();

  const normalizedPlayerTrack = playerTrackMappers.fromTrackMetaData(
    metadata,
    { access: toPlaybackAccess(metadata.access) }
  );

  return {
    kind: 'track',
    title: metadata.title,
    artist: metadata.artist.username,
    coverUrl: metadata.coverUrl,
    durationSeconds: metadata.durationSeconds ?? 0,
    waveformData: metadata.waveformData,
    waveformUrl: metadata.waveformUrl,
    queueTracks: [normalizedPlayerTrack],
  };
};

const loadPlaylistResource = async (
  resourceUrl: string,
  token: string | null
): Promise<EmbedResource> => {
  const playlist = token
    ? await playlistService.getPlaylistByToken(token)
    : await (async () => {
        const identifier = extractResourceIdentifier(resourceUrl, 'playlist');
        const resolvedPlaylistId = await resolvePlaylistIdFromIdentifier(identifier);
        return playlistService.getPlaylist(resolvedPlaylistId);
      })();

  const fallbackArtist =
    playlist.owner?.displayName?.trim() ||
    playlist.owner?.username ||
    'Unknown Artist';
  const queueTracks = (playlist.tracks ?? [])
    .map((track) => playlistTrackToPlayerTrack(track, fallbackArtist))
    .filter((track): track is PlayerTrack => track !== null);
  const firstPlayableTrack = queueTracks[0];
  const firstTrackDto = playlist.tracks?.find(
    (track) => getPlaylistTrackId(track) === firstPlayableTrack?.id
  );

  if (!firstPlayableTrack) {
    throw new Error('Playlist has no playable tracks.');
  }

  return {
    kind: 'playlist',
    title: firstPlayableTrack.title,
    artist: firstPlayableTrack.artistName,
    coverUrl: firstPlayableTrack.coverUrl ?? resolvePlaylistCover(playlist),
    durationSeconds: firstPlayableTrack.durationSeconds ?? 0,
    waveformData:
      firstPlayableTrack.waveformData ??
      (firstTrackDto ? getPlaylistTrackWaveformData(firstTrackDto) : undefined) ??
      toWaveformSamples(playlist.firstTrackWaveformData),
    waveformUrl:
      (firstTrackDto ? getPlaylistTrackWaveformUrl(firstTrackDto) : undefined) ??
      playlist.firstTrackWaveformUrl ??
      undefined,
    queueTracks,
  };
};

export default function EmbedPlayerPage() {
  const searchParams = useSearchParams();
  const [resource, setResource] = useState<EmbedResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const currentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const seek = usePlayerStore((state) => state.seek);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const style = toEmbedStyle(searchParams.get('style'));
  const config: EmbedConfig = useMemo(
    () => ({
      resourceUrl: searchParams.get('url') ?? searchParams.get('trackId') ?? '',
      style,
      color: normalizeColor(searchParams.get('color')),
      height: STYLE_HEIGHT_MAP[style],
      autoPlay: toBoolean(searchParams.get('auto_play')),
      showComments: toBoolean(searchParams.get('show_comments'), true),
      showRecommendations: !toBoolean(searchParams.get('hide_related')),
      showOverlays: toBoolean(searchParams.get('show_overlays'), true),
    }),
    [searchParams, style]
  );

  useEffect(() => {
    let isCancelled = false;

    const loadResource = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const token =
          getSecretTokenFromQuery(searchParams) ??
          extractTokenFromResource(config.resourceUrl);
        const resourceKind = getResourceKind(config.resourceUrl);
        const nextResource =
          resourceKind === 'playlist'
            ? await loadPlaylistResource(config.resourceUrl, token)
            : await loadTrackResource(config.resourceUrl, token);

        if (isCancelled) {
          return;
        }

        setResource(nextResource);
      } catch {
        if (!isCancelled) {
          setResource(null);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResource();

    return () => {
      isCancelled = true;
    };
  }, [config.resourceUrl, searchParams]);

  useEffect(() => {
    if (config.autoPlay && resource?.queueTracks.length) {
      setQueue(resource.queueTracks, 0, resource.kind === 'playlist' ? 'playlist' : 'track-page');
      playTrack(resource.queueTracks[0]);
    }
  }, [config.autoPlay, playTrack, resource, setQueue]);

  const activeQueueTrack = useMemo(() => {
    if (!resource) {
      return null;
    }

    return (
      resource.queueTracks.find((track) => track.id === currentTrackId) ??
      resource.queueTracks[0] ??
      null
    );
  }, [currentTrackId, resource]);
  const isCurrentTrack = Boolean(activeQueueTrack) && currentTrackId === activeQueueTrack?.id;
  const resolvedDurationSeconds =
    isCurrentTrack && playerDuration > 0
      ? playerDuration
      : activeQueueTrack?.durationSeconds ?? resource?.durationSeconds ?? 1;

  const handlePlayPause = () => {
    if (!resource || !activeQueueTrack) {
      return;
    }

    if (isCurrentTrack && isPlaying) {
      pausePlayback();
      return;
    }

    const startIndex = Math.max(
      0,
      resource.queueTracks.findIndex((track) => track.id === activeQueueTrack.id)
    );
    setQueue(resource.queueTracks, startIndex, resource.kind === 'playlist' ? 'playlist' : 'track-page');
    playTrack(activeQueueTrack);
  };

  const handleWaveformSeek = (fraction: number) => {
    if (!resource || !activeQueueTrack) {
      return;
    }

    if (!isCurrentTrack || !isPlaying) {
      const startIndex = Math.max(
        0,
        resource.queueTracks.findIndex((track) => track.id === activeQueueTrack.id)
      );
      setQueue(resource.queueTracks, startIndex, resource.kind === 'playlist' ? 'playlist' : 'track-page');
      playTrack(activeQueueTrack);
    }

    seek(Math.max(0, Math.min(1, fraction)) * resolvedDurationSeconds);
  };

  if (isLoading) {
    return (
      <main className="fixed inset-0 z-[300] flex items-center justify-center bg-surface-default text-xs text-text-muted">
        Loading track...
      </main>
    );
  }

  if (isError || !resource || !activeQueueTrack) {
    return (
      <main className="fixed inset-0 z-[300] flex items-center justify-center bg-surface-default text-xs text-text-muted">
        Unable to load this embed.
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-[300] overflow-hidden bg-surface-default">
      <EmbedPlayer
        config={config}
        title={activeQueueTrack.title || resource.title}
        artist={activeQueueTrack.artistName || resource.artist}
        coverUrl={activeQueueTrack.coverUrl ?? resource.coverUrl}
        duration={formatDuration(resolvedDurationSeconds)}
        waveformData={activeQueueTrack.waveformData ?? resource.waveformData}
        waveformUrl={resource.waveformUrl}
        isPlaying={isCurrentTrack && isPlaying}
        currentTime={isCurrentTrack ? currentTime : 0}
        durationSeconds={resolvedDurationSeconds}
        onPlayPause={handlePlayPause}
        onWaveformSeek={handleWaveformSeek}
        className="h-full w-full"
      />
    </main>
  );
}
