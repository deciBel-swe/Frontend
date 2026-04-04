/**
 * playerTrackMappers
 *
 * Normalization helpers for converting existing service/UI track shapes into
 * PlayerTrack, the canonical playback shape used by the global player.
 *
 * This utility avoids introducing parallel backend DTOs and keeps playback
 * integration aligned with existing track contracts.
 */
import type {
  PlaybackAccess,
  PlayerTrack,
  PlayerTrackAdapterInput,
  PlayerTrackMappers,
} from '@/features/player/contracts/playerContracts';
import type { TrackMetaData } from '@/types/tracks';

/**
 * Resolve artist display name from either API DTO object or plain string input.
 */
const resolveArtistName = (
  artist: PlayerTrackAdapterInput['artist'],
  fallbackArtistName = 'Unknown Artist'
): string => {
  if (typeof artist === 'string') {
    return artist.trim().length > 0 ? artist : fallbackArtistName;
  }

  const candidate = artist?.username ?? fallbackArtistName;
  return candidate.trim().length > 0 ? candidate : fallbackArtistName;
};

/** Map missing access to PLAYABLE by default. */
const toAccess = (access?: PlaybackAccess): PlaybackAccess => {
  return access ?? 'PLAYABLE';
};

/** Normalize a TrackMetaData DTO into PlayerTrack. */
const fromTrackMetaData: PlayerTrackMappers['fromTrackMetaData'] = (
  track: TrackMetaData,
  options
): PlayerTrack => {
  return {
    id: track.id,
    title: track.title,
    artistName: resolveArtistName(track.artist),
    trackUrl: track.trackUrl,
    access: toAccess(options?.access),
    durationSeconds: options?.durationSeconds ?? track.durationSeconds,
    coverUrl: track.coverUrl,
    waveformData: track.waveformData,
  };
};

/** Normalize generic adapter input into PlayerTrack. */
const fromAdapterInput: PlayerTrackMappers['fromAdapterInput'] = (
  input,
  options
): PlayerTrack => {
  return {
    id: input.id,
    title: input.title,
    artistName: resolveArtistName(input.artist, options?.fallbackArtistName),
    trackUrl: input.trackUrl,
    access: toAccess(options?.access),
    durationSeconds: input.durationSeconds,
    coverUrl: input.coverUrl,
    waveformData: input.waveformData,
  };
};

export const playerTrackMappers: PlayerTrackMappers = {
  fromTrackMetaData,
  fromAdapterInput,
};
