import { playlistService, trackService } from '@/services';

export const parsePositiveInteger = (value: string): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const resolveTrackIdFromIdentifier = async (
  trackIdentifier: string
): Promise<number> => {
  const normalized = trackIdentifier.trim();
  if (normalized.length === 0) {
    throw new Error('Invalid track identifier');
  }

  try {
    const resolved = await trackService.resolveTrackSlug(normalized);
    if (resolved.resourceType === 'TRACK' && resolved.resourceId > 0) {
      return resolved.resourceId;
    }
  } catch {
    // Fall back to numeric id when slug resolution fails.
  }

  const numericId = parsePositiveInteger(normalized);
  if (numericId !== null) {
    return numericId;
  }

  throw new Error('Track not found');
};

export const resolvePlaylistIdFromIdentifier = async (
  playlistIdentifier: string
): Promise<number> => {
  const normalized = playlistIdentifier.trim();
  if (normalized.length === 0) {
    throw new Error('Invalid playlist identifier');
  }

  try {
    const resolved = await playlistService.resolvePlaylistSlug(normalized);
    if (resolved.resourceType === 'PLAYLIST' && resolved.resourceId > 0) {
      return resolved.resourceId;
    }
  } catch {
    // Fall back to numeric id when slug resolution fails.
  }

  const numericId = parsePositiveInteger(normalized);
  if (numericId !== null) {
    return numericId;
  }

  throw new Error('Playlist not found');
};

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export const getSecretTokenFromQuery = (
  searchParams: SearchParamsLike | null | undefined
): string | null => {
  if (!searchParams) {
    return null;
  }

  const token = searchParams.get('token') ?? searchParams.get('s');
  const normalized = token?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
};
