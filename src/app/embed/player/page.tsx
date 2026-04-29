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
import { trackService } from '@/services';
import type { TrackMetaData } from '@/types/tracks';
import { formatDuration } from '@/utils/formatDuration';
import {
  getSecretTokenFromQuery,
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
  access: TrackMetaData['access']
): PlaybackAccess | undefined => {
  if (!access) {
    return undefined;
  }

  return access;
};

const extractTrackIdentifier = (resource: string): string => {
  const trimmed = resource.trim();
  if (trimmed.length === 0) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const setsIndex = pathSegments.indexOf('sets');

    if (setsIndex >= 0) {
      return '';
    }

    return pathSegments[pathSegments.length - 1] ?? '';
  } catch {
    return trimmed;
  }
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

export default function EmbedPlayerPage() {
  const searchParams = useSearchParams();
  const [track, setTrack] = useState<TrackMetaData | null>(null);
  const [playerTrack, setPlayerTrack] = useState<PlayerTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const currentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const seek = usePlayerStore((state) => state.seek);

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

    const loadTrack = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const token =
          getSecretTokenFromQuery(searchParams) ??
          extractTokenFromResource(config.resourceUrl);
        const metadata = token
          ? await trackService.getTrackByToken(token)
          : await (async () => {
              const identifier = extractTrackIdentifier(config.resourceUrl);
              const resolvedTrackId = await resolveTrackIdFromIdentifier(identifier);
              return trackService.getTrackMetadata(resolvedTrackId);
            })();

        if (isCancelled) {
          return;
        }

        const normalizedPlayerTrack = playerTrackMappers.fromTrackMetaData(
          metadata,
          { access: toPlaybackAccess(metadata.access) }
        );

        setTrack(metadata);
        setPlayerTrack(normalizedPlayerTrack);
      } catch {
        if (!isCancelled) {
          setTrack(null);
          setPlayerTrack(null);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadTrack();

    return () => {
      isCancelled = true;
    };
  }, [config.resourceUrl, searchParams]);

  useEffect(() => {
    if (config.autoPlay && playerTrack) {
      playTrack(playerTrack);
    }
  }, [config.autoPlay, playTrack, playerTrack]);

  const isCurrentTrack = Boolean(playerTrack) && currentTrackId === playerTrack?.id;
  const resolvedDurationSeconds =
    isCurrentTrack && playerDuration > 0
      ? playerDuration
      : track?.durationSeconds ?? 1;

  const handlePlayPause = () => {
    if (!playerTrack) {
      return;
    }

    if (isCurrentTrack && isPlaying) {
      pausePlayback();
      return;
    }

    playTrack(playerTrack);
  };

  const handleWaveformSeek = (fraction: number) => {
    if (!playerTrack) {
      return;
    }

    if (!isCurrentTrack || !isPlaying) {
      playTrack(playerTrack);
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

  if (isError || !track) {
    return (
      <main className="fixed inset-0 z-[300] flex items-center justify-center bg-surface-default text-xs text-text-muted">
        Unable to load this track.
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-[300] overflow-hidden bg-surface-default">
      <EmbedPlayer
        config={config}
        title={track.title}
        artist={track.artist.username}
        coverUrl={track.coverUrl}
        duration={formatDuration(track.durationSeconds ?? 0)}
        waveformData={track.waveformData}
        waveformUrl={track.waveformUrl}
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
