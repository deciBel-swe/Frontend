import { config } from '@/config';

const normalizePathSegment = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

const resolveBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return config.api.appUrl;
};

export const toUserPathSlug = (value: string): string =>
  normalizePathSegment(value);

export const buildTrackPath = (
  username: string,
  trackPathId: string | number
): string => {
  return `/${toUserPathSlug(username)}/${String(trackPathId).trim()}`;
};

export const buildPlaylistPath = (
  username: string,
  playlistPathId: string | number
): string => {
  return `/${toUserPathSlug(username)}/sets/${String(playlistPathId).trim()}`;
};

export const buildTrackUrl = (
  username: string,
  trackPathId: string | number
): string => {
  return `${resolveBaseUrl()}${buildTrackPath(username, trackPathId)}`;
};

export const buildPlaylistUrl = (
  username: string,
  playlistPathId: string | number
): string => {
  return `${resolveBaseUrl()}${buildPlaylistPath(username, playlistPathId)}`;
};

export const buildTrackSecretUrl = (
  username: string,
  trackPathId: string | number,
  token: string
): string => {
  const url = new URL(buildTrackUrl(username, trackPathId));
  url.searchParams.set('token', token);
  return url.toString();
};

export const buildPlaylistSecretUrl = (
  username: string,
  playlistPathId: string | number,
  token: string
): string => {
  const url = new URL(buildPlaylistUrl(username, playlistPathId));
  url.searchParams.set('token', token);
  return url.toString();
};
