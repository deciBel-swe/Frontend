import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import type { ResourceRefFullDTO } from '@/types/discovery';
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

const toDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) {
    return '0:00';
  }

  return formatDuration(seconds);
};

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
) => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED' as const;
  }

  return 'PLAYABLE' as const;
};

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
    if (resource.resourceType === 'TRACK') {
      trackResources.push(resource);
      continue;
    }

    if (resource.resourceType === 'PLAYLIST') {
      playlistResources.push(resource);
      continue;
    }

    if (resource.resourceType === 'USER') {
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
  resource: ResourceRefFullDTO
): TrackCardProps | null {
  if (resource.resourceType !== 'TRACK' || !resource.track) {
    return null;
  }

  const track = resource.track;
  const artistName = track.artist.displayName || track.artist.username;
  const cover = track.coverUrl || DEFAULT_IMAGE;

  const playback = playerTrackMappers.fromAdapterInput(
    {
      id: track.id,
      title: track.title,
      trackUrl: track.trackUrl,
      artist: {
        username: artistName,
      },
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
      displayName: track.artist.displayName,
      avatar: track.artist.avatarUrl || DEFAULT_IMAGE,
    },
    showHeader: true,
    track: {
      id: track.id,
      artist: artistName,
      title: track.title,
      cover,
      duration: toDuration(track.trackDurationSeconds),
      plays: track.playCount,
      comments: track.commentCount,
      genre: track.genre,
      isLiked: track.isLiked,
      isReposted: track.isReposted,
      likeCount: track.likeCount,
      repostCount: track.repostCount,
      createdAt: track.uploadDate,
    },
    waveform: [],
    playback,
  };
}

export function mapPlaylistResourceToPlaylistCard(
  resource: ResourceRefFullDTO
): PlaylistHorizontalProps | null {
  if (resource.resourceType !== 'PLAYLIST' || !resource.playlist) {
    return null;
  }

  const playlist = resource.playlist;
  const ownerDisplayName =
    playlist.owner.displayName || playlist.owner.username;
  const cover = playlist.coverArtUrl || DEFAULT_IMAGE;

  return {
    trackId: String(playlist.id),
    user: {
      username: playlist.owner.username,
      displayName: playlist.owner.displayName,
      avatar: playlist.owner.avatarUrl || DEFAULT_IMAGE,
    },
    showHeader: true,
    track: {
      id: playlist.id,
      artist: ownerDisplayName,
      title: playlist.title,
      cover,
      duration: toDuration(playlist.totalDurationSeconds),
      plays: playlist.trackCount,
      comments: playlist.tracks.length,
      genre: playlist.genre,
      isLiked: playlist.isLiked,
      isReposted: false,
      likeCount: 0,
      repostCount: 0,
      createdAt: playlist.createdAt,
    },
    waveform: [],
    relatedTracks: playlist.tracks.slice(0, 5).map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist.displayName || track.artist.username,
      coverUrl: track.coverUrl,
      plays: track.playCount.toLocaleString(),
    })),
  };
}

export function mapUserResourceToUserCard(
  resource: ResourceRefFullDTO
): UserCardData | null {
  if (resource.resourceType !== 'USER' || !resource.user) {
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
  if (resource.resourceType === 'TRACK') {
    return toEverythingOrderItem('track', String(resource.resourceId));
  }

  if (resource.resourceType === 'PLAYLIST') {
    return toEverythingOrderItem('playlist', String(resource.resourceId));
  }

  if (resource.resourceType === 'USER') {
    return toEverythingOrderItem('user', String(resource.resourceId));
  }

  return null;
}

export function mergeSearchBuckets(
  previous: SearchBuckets,
  incoming: SearchBuckets
): SearchBuckets {
  return {
    tracks: mergeUniqueBy(previous.tracks, incoming.tracks, (track) => track.trackId),
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
  return mergeUniqueBy(
    previous,
    incoming,
    (item) => `${item.kind}:${item.id}`
  );
}
