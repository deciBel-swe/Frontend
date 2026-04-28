import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import type { ResourceRefFullDTO } from '@/types/discovery';
import type { FeedResourceRefFullDTO } from '@/types/feed';
import { formatDuration } from '@/utils/formatDuration';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { TrackCardProps } from '@/components/tracks/track-card';
import type { UserCardData } from '@/features/social/components/UserCard';
import type {
  EverythingOrderItem,
  SearchBuckets,
  SearchResultKind,
} from '@/features/search/types/searchContracts';

const DEFAULT_IMAGE = '/images/default_song_image.png';
type PlaylistResourceTrack = NonNullable<
  NonNullable<ResourceRefFullDTO['playlist']>['tracks']
>[number];

const toDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) {
    return '0:00';
  }

  return formatDuration(seconds);
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

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
) => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED' as const;
  }

  return 'PLAYABLE' as const;
};

const toTrackDurationSeconds = (track: unknown): number | undefined => {
  const payload = track as {
    trackDurationSeconds?: number;
    durationSeconds?: number;
  };

  if (
    typeof payload.trackDurationSeconds === 'number' &&
    payload.trackDurationSeconds > 0
  ) {
    return payload.trackDurationSeconds;
  }

  if (
    typeof payload.durationSeconds === 'number' &&
    payload.durationSeconds > 0
  ) {
    return payload.durationSeconds;
  }

  return undefined;
};

const mapPlaylistTrackToCompactTrack = (track: PlaylistResourceTrack) => ({
  id: track.id,
  trackSlug: track.trackSlug,
  artistUsername: track.artist.username,
  title: track.title,
  artist: track.artist.displayName || track.artist.username,
  coverUrl: track.coverUrl || DEFAULT_IMAGE,
  plays: track.playCount.toLocaleString(),
  trackUrl: track.trackUrl,
  durationSeconds: toTrackDurationSeconds(track),
  available: track.access === 'PLAYABLE',
  isLiked: track.isLiked,
  isReposted: track.isReposted,
  likeCount: track.likeCount,
  repostCount: track.repostCount,
  access: track.access,
});

const mergeUniqueBy = <T>(
  previous: T[],
  incoming: T[],
  toKey: (item: T) => string
): T[] => {
  if (incoming.length === 0) {
    return previous;
  }

  const merged = [...previous];
  const seen = new Set(previous.map(toKey));

  for (const item of incoming) {
    const key = toKey(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(item);
  }

  return merged;
};

const toEverythingOrderItem = (
  kind: SearchResultKind,
  id: string
): EverythingOrderItem => ({
  kind,
  id,
});

export function partitionResourcesByType(resources: ResourceRefFullDTO[]): {
  trackResources: ResourceRefFullDTO[];
  playlistResources: ResourceRefFullDTO[];
  userResources: ResourceRefFullDTO[];
} {
  const trackResources: ResourceRefFullDTO[] = [];
  const playlistResources: ResourceRefFullDTO[] = [];
  const userResources: ResourceRefFullDTO[] = [];

  for (const resource of resources) {
    if (resource.type === 'TRACK') {
      trackResources.push(resource);
      continue;
    }

    if (resource.type === 'PLAYLIST') {
      playlistResources.push(resource);
      continue;
    }

    if (resource.type === 'USER') {
      userResources.push(resource);
    }
  }

  return {
    trackResources,
    playlistResources,
    userResources,
  };
}

export function mapTrackResourceToTrackCard(
  resource: ResourceRefFullDTO | FeedResourceRefFullDTO
): TrackCardProps | null {
  if (resource.type !== 'TRACK' || !resource.track) {
    return null;
  }

  const track = resource.track;
  const artistName = track.artist.displayName || track.artist.username;
  const trackArtist = {
    username: track.artist.username,
    displayName: artistName,
    avatar: track.artist.avatarUrl || DEFAULT_IMAGE,
  };
  const cover = track.coverUrl || DEFAULT_IMAGE;
  const waveform = toWaveform(
    (track as { waveformData?: unknown }).waveformData
  );

  const playback = playerTrackMappers.fromAdapterInput(
    {
      id: track.id,
      title: track.title,
      trackUrl: track.trackUrl ?? track.trackPreviewUrl ?? '',
      artist: track.artist,
      durationSeconds: track.trackDurationSeconds,
      coverUrl: cover,
    },
    {
      access: toPlaybackAccess(track.access),
      fallbackArtistName: artistName,
    }
  );

  return {
    trackId: String(track.id),
    user: {
      username: track.artist.username,
      displayName: track.artist.displayName || track.artist.username,
      avatar: track.artist.avatarUrl || DEFAULT_IMAGE,
    },
    showHeader: true,
    track: {
      id: track.id,
      trackSlug: track.trackSlug ?? undefined,
      artistUsername: track.artist.username,
      artist: trackArtist,
      title: track.title,
      cover,
      duration: toDuration(track.trackDurationSeconds),
      waveformUrl: track.waveformUrl ?? undefined,
      plays: track.playCount,
      comments: track.commentCount,
      genre: track.genre,
      isLiked: track.isLiked,
      isReposted: track.isReposted,
      likeCount: track.likeCount,
      repostCount: track.repostCount,
      createdAt: track.uploadDate ?? undefined,
    },
    waveform,
    playback,
  };
}

export function mapPlaylistResourceToPlaylistCard(
  resource: ResourceRefFullDTO | FeedResourceRefFullDTO
): PlaylistHorizontalProps | null {
  if (resource.type !== 'PLAYLIST' || !resource.playlist) {
    return null;
  }

  const playlist = resource.playlist;
  const ownerDisplayName =
    playlist.owner.displayName || playlist.owner.username;
  const ownerArtist = {
    username: playlist.owner.username,
    displayName: ownerDisplayName,
    avatar: playlist.owner.avatarUrl || DEFAULT_IMAGE,
  };
  const cover = playlist.coverArtUrl || DEFAULT_IMAGE;
  const queueTracks = playlist.tracks.map((track) => {
    const artistDisplayName = track.artist.displayName || track.artist.username;

    return playerTrackMappers.fromAdapterInput(
      {
        id: track.id,
        title: track.title,
        trackUrl: track.trackUrl,
        artist: track.artist,
        durationSeconds: toTrackDurationSeconds(track),
        coverUrl: track.coverUrl || DEFAULT_IMAGE,
        waveformData: toWaveform(
          (track as { waveformData?: unknown }).waveformData
        ),
      },
      {
        access: toPlaybackAccess(track.access),
        fallbackArtistName: artistDisplayName,
      }
    );
  });
  const playback = queueTracks[0];

  return {
    trackId: String(playlist.id),
    postedText: 'posted a set',
    user: {
      username: playlist.owner.username,
      displayName: playlist.owner.displayName || playlist.owner.username,
      avatar: playlist.owner.avatarUrl || DEFAULT_IMAGE,
    },
    showHeader: true,
    track: {
      id: playlist.id,
      playlistSlug: playlist.playlistSlug,
      artistUsername: playlist.owner.username,
      artist: ownerArtist,
      title: playlist.title,
      cover,
      duration: toDuration(playlist.totalDurationSeconds),
      waveformUrl: playlist.firstTrackWaveformUrl ?? undefined,
      plays: playlist.trackCount,
      genre: playlist.genre,
      isLiked: playlist.isLiked,
      isReposted: playlist.isReposted ?? false,
      likeCount: playlist.likeCount ?? 0,
      repostCount: playlist.repostCount ?? 0,
      createdAt: playlist.createdAt,
    },
    waveform: toWaveform(
      (playlist as { firstTrackWaveformData?: unknown })
        .firstTrackWaveformData ?? undefined
    ),
    playback,
    queueTracks,
    queueSource: 'playlist',
    relatedTracks: playlist.tracks
      .slice(0, 5)
      .map(mapPlaylistTrackToCompactTrack),
  };
}

export function mapUserResourceToUserCard(
  resource: ResourceRefFullDTO
): UserCardData | null {
  if (resource.type !== 'USER' || !resource.user) {
    return null;
  }

  const user = resource.user;

  return {
    id: String(user.id),
    username: user.username,
    displayName: user.displayName || undefined,
    avatarSrc: user.avatarUrl || undefined,
    followerCount: user.followerCount,
    isFollowing: user.isFollowing,
  };
}

export function mapResourceToEverythingOrderItem(
  resource: ResourceRefFullDTO
): EverythingOrderItem | null {
  if (resource.type === 'TRACK') {
    return toEverythingOrderItem('track', String(resource.resourceId));
  }

  if (resource.type === 'PLAYLIST') {
    return toEverythingOrderItem('playlist', String(resource.resourceId));
  }

  if (resource.type === 'USER') {
    return toEverythingOrderItem('user', String(resource.resourceId));
  }

  return null;
}

export function mergeSearchBuckets(
  previous: SearchBuckets,
  incoming: SearchBuckets
): SearchBuckets {
  return {
    tracks: mergeUniqueBy(
      previous.tracks,
      incoming.tracks,
      (track) => track.trackId
    ),
    playlists: mergeUniqueBy(
      previous.playlists,
      incoming.playlists,
      (playlist) => playlist.trackId
    ),
    people: mergeUniqueBy(previous.people, incoming.people, (user) => user.id),
  };
}

export function mergeEverythingOrder(
  previous: EverythingOrderItem[],
  incoming: EverythingOrderItem[]
): EverythingOrderItem[] {
  return mergeUniqueBy(previous, incoming, (item) => `${item.kind}:${item.id}`);
}
