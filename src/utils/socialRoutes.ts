import type { PlaylistResponse } from '@/types/playlists';
import type { TrackMetaData } from '@/types/tracks';

const normalizeSegment = (value: string | number | null | undefined): string =>
  String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');

export const buildProfileHref = (username: string): string => {
  const normalized = normalizeSegment(username);
  return normalized.length > 0 ? `/${normalized}` : '/people';
};

export const buildTrackHref = (track: TrackMetaData): string => {
  const username = normalizeSegment(track.artist.username);
  const identifier = normalizeSegment(track.trackSlug || track.id);

  if (username.length === 0 || identifier.length === 0) {
    return '/feed';
  }

  return `/${username}/${identifier}`;
};

export const buildPlaylistHref = (playlist: PlaylistResponse): string => {
  const username = normalizeSegment(playlist.owner?.username);
  const identifier = normalizeSegment(playlist.playlistSlug || playlist.id);

  if (username.length === 0 || identifier.length === 0) {
    return '/feed';
  }

  return `/${username}/sets/${identifier}`;
};
