'use client';

import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type {
  PlaybackAccess,
  PlayerTrack,
} from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import type { PlaylistResponse } from '@/types/playlists';
import { formatDuration } from '@/utils/formatDuration';

const DEFAULT_IMAGE = '/images/default_song_image.png';

type PlaylistTrack = NonNullable<PlaylistResponse['tracks']>[number];

export type ProfilePlaylistCardOptions = {
  fallbackUsername: string;
  fallbackAvatar?: string;
  showEditButton: boolean;
};

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
): PlaybackAccess => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED';
  }

  return 'PLAYABLE';
};

const toWaveform = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry))
      .map((entry) => Math.max(0, Math.min(1, entry)));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
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

const resolveTrackId = (track: PlaylistTrack): number | null => {
  if ('id' in track && typeof track.id === 'number') {
    return track.id;
  }

  if ('trackId' in track && typeof track.trackId === 'number') {
    return track.trackId;
  }

  return null;
};

const resolveTrackTitle = (track: PlaylistTrack): string => {
  if (typeof track.title === 'string' && track.title.trim().length > 0) {
    return track.title;
  }

  return 'Untitled Track';
};

const resolveTrackUrl = (track: PlaylistTrack): string | null => {
  if ('trackUrl' in track && typeof track.trackUrl === 'string') {
    return track.trackUrl;
  }

  return null;
};

const resolveTrackCover = (track: PlaylistTrack): string => {
  if ('coverUrl' in track && typeof track.coverUrl === 'string') {
    return track.coverUrl;
  }

  return DEFAULT_IMAGE;
};

const resolveTrackArtist = (track: PlaylistTrack, fallbackArtist: string): string => {
  if ('artist' in track && track.artist) {
    return track.artist.displayName || track.artist.username;
  }

  return fallbackArtist;
};

const resolveTrackAccess = (
  track: PlaylistTrack
): 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined => {
  if ('access' in track) {
    return track.access;
  }

  return undefined;
};

const resolveTrackDurationSeconds = (track: PlaylistTrack): number | undefined => {
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

const resolveTrackPlayCount = (track: PlaylistTrack): string | undefined => {
  if ('playCount' in track && typeof track.playCount === 'number') {
    return track.playCount.toLocaleString();
  }

  return undefined;
};

export function mapProfilePlaylistToCard(
  playlist: PlaylistResponse,
  options: ProfilePlaylistCardOptions
): PlaylistHorizontalProps {
  const ownerUsername =
    playlist.owner?.username?.trim() || options.fallbackUsername;
  const ownerDisplayName =
    playlist.owner?.displayName?.trim() || ownerUsername;
  const ownerAvatar =
    playlist.owner?.avatarUrl || options.fallbackAvatar || DEFAULT_IMAGE;
  const tracks = playlist.tracks ?? [];

  const queueTracks: PlayerTrack[] = tracks.flatMap((playlistTrack) => {
    const id = resolveTrackId(playlistTrack);
    const trackUrl = resolveTrackUrl(playlistTrack);

    if (id === null || !trackUrl) {
      return [];
    }

    const artistName = resolveTrackArtist(playlistTrack, ownerDisplayName);

    return [
      playerTrackMappers.fromAdapterInput(
        {
          id,
          title: resolveTrackTitle(playlistTrack),
          trackUrl,
          artist: artistName,
          durationSeconds: resolveTrackDurationSeconds(playlistTrack),
          coverUrl: resolveTrackCover(playlistTrack),
          waveformData: toWaveform(
            (playlistTrack as { waveformData?: unknown }).waveformData
          ),
        },
        {
          access: toPlaybackAccess(resolveTrackAccess(playlistTrack)),
          fallbackArtistName: artistName,
        }
      ),
    ];
  });

  const totalDurationSeconds =
    playlist.totalDurationSeconds ??
    tracks.reduce(
      (total, playlistTrack) =>
        total + (resolveTrackDurationSeconds(playlistTrack) ?? 0),
      0
    );

  return {
    trackId: String(playlist.id),
    postedText: 'posted a set',
    showEditButton: options.showEditButton,
    isPrivate: playlist.isPrivate,
    user: {
      username: ownerUsername,
      displayName: ownerDisplayName,
      avatar: ownerAvatar,
    },
    showHeader: true,
    track: {
      id: playlist.id,
      playlistSlug: playlist.playlistSlug,
      artistUsername: ownerUsername,
      artist: {
        username: ownerUsername,
        displayName: ownerDisplayName,
        avatar: ownerAvatar || DEFAULT_IMAGE,
      },
      title: playlist.title,
      cover:
        playlist.coverArtUrl ||
        (tracks[0] ? resolveTrackCover(tracks[0]) : DEFAULT_IMAGE),
      duration: formatDuration(Math.max(0, totalDurationSeconds)),
      waveformUrl: playlist.firstTrackWaveformUrl ?? undefined,
      plays: playlist.trackCount ?? tracks.length,
      genre: playlist.genre,
      isLiked: playlist.isLiked,
      isReposted: playlist.isReposted ?? false,
      likeCount: playlist.likeCount ?? 0,
      repostCount: playlist.repostCount ?? 0,
      createdAt: playlist.createdAt,
    },
    waveform: toWaveform(
      (playlist as { firstTrackWaveformData?: unknown }).firstTrackWaveformData
    ),
    playback: queueTracks[0],
    queueTracks,
    queueSource: 'playlist',
    relatedTracks: tracks.slice(0, 5).map((playlistTrack, index) => {
      const id = resolveTrackId(playlistTrack);
      const title = resolveTrackTitle(playlistTrack);
      const artist = resolveTrackArtist(playlistTrack, ownerDisplayName);

      return {
        id: id ?? index,
        trackSlug:
          'trackSlug' in playlistTrack &&
          typeof playlistTrack.trackSlug === 'string'
            ? playlistTrack.trackSlug
            : undefined,
        artistUsername:
          'artist' in playlistTrack && playlistTrack.artist?.username
            ? playlistTrack.artist.username
            : undefined,
        title,
        artist,
        coverUrl: resolveTrackCover(playlistTrack),
        plays: resolveTrackPlayCount(playlistTrack) ?? '0',
        trackUrl: resolveTrackUrl(playlistTrack) ?? undefined,
        durationSeconds: resolveTrackDurationSeconds(playlistTrack),
        available: resolveTrackAccess(playlistTrack) === 'PLAYABLE',
        isLiked: 'isLiked' in playlistTrack ? playlistTrack.isLiked : false,
        isReposted:
          'isReposted' in playlistTrack ? playlistTrack.isReposted : false,
        likeCount: 'likeCount' in playlistTrack ? playlistTrack.likeCount : 0,
        repostCount:
          'repostCount' in playlistTrack ? playlistTrack.repostCount : 0,
        access: resolveTrackAccess(playlistTrack),
      };
    }),
  };
}
