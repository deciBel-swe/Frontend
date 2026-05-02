import { config } from '@/config';

/**
 * Formats a full shareable secret URL for a private track.
 *
 * Base URL is sourced from `config.api.appUrl` to support
 * dev / staging / production environments without hardcoding.
 *
 * @param trackId - The track's unique identifier
 * @param token   - The secret token returned from the API
 * @returns Full shareable URL e.g. `https://localhost:3000/tracks/1?token=nQ7ENRPl`
 *
 * @example
 * formatSecretUrl('42', 'nQ7ENRPl')
 * // → 'https://localhost:3000/tracks/42?token=nQ7ENRPl'
 */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export function formatSecretUrl(trackId: string, token: string): string {
  const base = config.api.appUrl;
  return `${base}/tracks/${trackId}?token=${token}`;
}

export function formatSecretUrlWithSlug(
  artist: string,
  title: string,
  token: string
): string {
  const base = config.api.appUrl;
  const userSlug = slugify(artist);
  const trackSlug = slugify(title);
  return `${base}/${userSlug}/${trackSlug}?token=${token}`;
}
