import { formatDuration } from '@/utils/formatDuration';
import {
  resolvePlaylistIdFromIdentifier,
  resolveTrackIdFromIdentifier,
} from '@/utils/resourceIdentifierResolvers';
import type { PlaylistResponse } from '@/types/playlists';
import type { ResourceRefDTO } from '@/types/message';
import type { TrackMetaData } from '@/types/tracks';
import type { PlaylistData, TrackData } from '@/components/messages/types';

type ParsedShareTarget =
  | { kind: 'track'; identifier: string }
  | { kind: 'playlist'; identifier: string }
  | { kind: 'station' }
  | null;

const URL_PATTERN = /(https?:\/\/[^\s]+|\/[^\s]+)/gi;

const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  'signin',
  'register',
  'reset-password',
  'verify-email',
  'feed',
  'discover',
  'search',
  'notifications',
  'messages',
  'settings',
  'upload',
  'people',
  'checkout',
  'logout',
  'oauth',
  'you',
  'library',
  'history',
  'likes',
  'following',
  'followers',
]);

const toUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    try {
      return new URL(value, 'https://decibel.local');
    } catch {
      return null;
    }
  }
};

const parseShareTarget = (value: string): ParsedShareTarget => {
  const url = toUrl(value);

  if (!url) {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.includes('stations')) {
    return { kind: 'station' };
  }

  if (segments.length >= 3 && segments[1] === 'sets') {
    return { kind: 'playlist', identifier: segments[2] };
  }

  if (segments.length >= 2 && !RESERVED_TOP_LEVEL_SEGMENTS.has(segments[0])) {
    return { kind: 'track', identifier: segments[1] };
  }

  return null;
};

export const extractUrlsFromMessage = (value: string): string[] => {
  const matches = value.match(URL_PATTERN);
  return matches ? [...new Set(matches)] : [];
};

export const resolveSharedResourcesFromMessage = async (
  value: string
): Promise<{
  resources: ResourceRefDTO[];
  unsupportedStations: string[];
}> => {
  const urls = extractUrlsFromMessage(value);
  const resources: ResourceRefDTO[] = [];
  const unsupportedStations: string[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    const parsedTarget = parseShareTarget(url);

    if (!parsedTarget) {
      continue;
    }

    if (parsedTarget.kind === 'station') {
      unsupportedStations.push(url);
      continue;
    }

    try {
      if (parsedTarget.kind === 'track') {
        const resourceId = await resolveTrackIdFromIdentifier(
          parsedTarget.identifier
        );
        const dedupeKey = `TRACK:${resourceId}`;
        if (!seen.has(dedupeKey)) {
          resources.push({ resourceType: 'TRACK', resourceId });
          seen.add(dedupeKey);
        }
        continue;
      }

      const resourceId = await resolvePlaylistIdFromIdentifier(
        parsedTarget.identifier
      );
      const dedupeKey = `PLAYLIST:${resourceId}`;
      if (!seen.has(dedupeKey)) {
        resources.push({ resourceType: 'PLAYLIST', resourceId });
        seen.add(dedupeKey);
      }
    } catch {
      continue;
    }
  }

  return { resources, unsupportedStations };
};

export const toMessageTrackData = (track: TrackMetaData): TrackData => ({
  id: track.id,
  trackSlug: track.trackSlug,
  artistUsername: track.artist.username,
  title: track.title,
  artist: {
    username: track.artist.username,
    displayName: track.artist.displayName || track.artist.username,
    avatar: track.artist.avatarUrl || '/images/default_avatar_image_1.png',
  },
  cover: track.coverUrl || '/images/default_song_image_1.png',
  coverUrl: track.coverUrl,
  duration: formatDuration(track.durationSeconds ?? 0),
  durationSeconds: track.durationSeconds,
  trackUrl: track.trackUrl,
  access: track.access === 'PLAYABLE' ? 'PLAYABLE' : 'BLOCKED',
  waveformUrl: track.waveformUrl,
  waveformData: track.waveformData,
  plays: track.playCount ?? 0,
  comments: 0,
  createdAt: track.uploadDate,
  genre: track.genre,
  isLiked: track.isLiked,
  isReposted: track.isReposted,
  likeCount: track.likeCount ?? 0,
  repostCount: track.repostCount ?? 0,
});

const toPlaylistTrackData = (playlist: PlaylistResponse): TrackData[] =>
  (playlist.tracks || []).map((track, index) => {
    if ('artist' in track) {
      return {
        id: track.id,
        trackSlug: track.trackSlug,
        artistUsername: track.artist.username,
        title: track.title,
        artist: {
          username: track.artist.username,
          displayName: track.artist.displayName || track.artist.username,
          avatar:
            track.artist.avatarUrl || '/images/default_avatar_image_1.png',
        },
        cover: track.coverUrl || '/images/default_song_image_1.png',
        duration: '0:00',
        plays: track.playCount ?? 0,
        comments: track.commentCount,
        isLiked: track.isLiked,
        isReposted: track.isReposted,
        likeCount: track.likeCount ?? 0,
        repostCount: track.repostCount ?? 0,
      };
    }

    return {
      id: track.trackId,
      title: track.title,
      artist: {
        username: playlist.owner?.username || `playlist-owner-${index}`,
        displayName:
          playlist.owner?.displayName ||
          playlist.owner?.username ||
          'Playlist owner',
        avatar:
          playlist.owner?.avatarUrl || '/images/default_avatar_image_1.png',
      },
      cover: '/images/default_song_image_1.png',
      duration: formatDuration(track.durationSeconds ?? 0),
      plays: 0,
      likeCount: 0,
      repostCount: 0,
      isLiked: false,
      isReposted: false,
    };
  });

export const toMessagePlaylistData = (
  playlist: PlaylistResponse
): PlaylistData => ({
  id: playlist.id,
  playlistId: String(playlist.playlistSlug || playlist.id),
  title: playlist.title,
  owner: playlist.owner?.displayName || playlist.owner?.username || 'Unknown',
  cover:
    playlist.coverArtUrl ||
    ('tracks' in playlist &&
    Array.isArray(playlist.tracks) &&
    playlist.tracks[0] &&
    'coverUrl' in playlist.tracks[0]
      ? playlist.tracks[0].coverUrl
      : '/images/default_song_image_1.png'),
  trackCount: playlist.trackCount ?? playlist.tracks?.length ?? 0,
  tracks: toPlaylistTrackData(playlist),
});
