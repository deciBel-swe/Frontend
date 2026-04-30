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
    if (resolved.type === 'TRACK' && resolved.id > 0) {
      return resolved.id;
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
  playlistIdentifier: string,
  username?: string
): Promise<number> => {
  const normalized = playlistIdentifier.trim();
  if (normalized.length === 0) {
    throw new Error('Invalid playlist identifier');
  }

  const numericId = parsePositiveInteger(normalized);
  if (numericId !== null) {
    return numericId;
  }

  const normalizedUsername = username?.trim();

  const findPlaylistInCollection = async (
    loader: () => Promise<{ content: Array<{ id: number; playlistSlug?: string }> }>
  ): Promise<number | null> => {
    try {
      const response = await loader();
      const matched = response.content.find((playlist) => {
        const slug = playlist.playlistSlug?.trim().toLowerCase();
        return slug === normalized.toLowerCase();
      });

      return matched?.id ?? null;
    } catch {
      return null;
    }
  };

  const matchedFromMe = await findPlaylistInCollection(() =>
    playlistService.getMePlaylists({ page: 0, size: 100 })
  );
  if (matchedFromMe !== null) {
    return matchedFromMe;
  }

  if (normalizedUsername) {
    const matchedFromUser = await findPlaylistInCollection(() =>
      playlistService.getUserPlaylists(normalizedUsername, { page: 0, size: 100 })
    );
    if (matchedFromUser !== null) {
      return matchedFromUser;
    }
  }

  try {
    const resolved = await playlistService.resolvePlaylistSlug(normalized);
    if (resolved.type === 'PLAYLIST' && resolved.id > 0) {
      return resolved.id;
    }
  } catch {
    // Fall back to numeric id when slug resolution fails.
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
