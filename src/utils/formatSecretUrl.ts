import { config } from '@/config';

/**
 * Formats a full shareable secret URL for a private track.
 *
 * Base URL is sourced from `config.api.appUrl` to support
 * dev / staging / production environments without hardcoding.
 *
 * @param trackId - The track's unique identifier
 * @param token   - The secret token returned from the API
 * @returns Full shareable URL e.g. `https://localhost:3000/tracks/1?s=nQ7ENRPl`
 *
 * @example
 * formatSecretUrl('42', 'nQ7ENRPl')
 * // → 'https://localhost:3000/tracks/42?s=nQ7ENRPl'
 */
export function formatSecretUrl(trackId: string, token: string): string {
  const base = config.api.appUrl;
  return `${base}/tracks/${trackId}?s=${token}`;
}
