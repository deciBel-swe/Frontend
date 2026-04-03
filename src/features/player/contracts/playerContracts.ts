import type { TrackMetaData } from '@/types/tracks';

/**
 * Current access model implemented in this phase.
 *
 * NOTE: Preview playback is intentionally excluded for now.
 */
export type PlaybackAccess = 'PLAYABLE' | 'BLOCKED';

/**
 * Canonical player track shape used by the global player store and UI.
 *
 * This is intentionally normalized for playback concerns and must be derived
 * from existing backend-facing DTOs (for example TrackMetaData) rather than
 * replacing those DTOs.
 */
export interface PlayerTrack {
  id: number;
  title: string;
  artistName: string;
  trackUrl: string;
  access: PlaybackAccess;
  durationSeconds?: number;
  coverUrl?: string;
  waveformData?: number[];
}

/**
 * Input contract for adapters that normalize existing DTOs into PlayerTrack.
 *
 * This aligns with current service and UI shapes:
 * - services use numeric IDs and trackUrl
 * - artist can appear as an object in service DTOs or plain string in UI data
 */
export interface PlayerTrackAdapterInput {
  id: number;
  title: string;
  trackUrl: string;
  artist: TrackMetaData['artist'] | string | { username?: string | null };
  durationSeconds?: number;
  coverUrl?: string;
  waveformData?: number[];
  isPrivate?: boolean;
}

/**
 * Optional metadata for queue sources. Useful for future analytics/debugging.
 */
export type QueueSource =
  | 'feed'
  | 'profile-tracks'
  | 'likes'
  | 'playlist'
  | 'track-page'
  | 'unknown';

/**
 * Runtime queue state for the player.
 */
export interface PlayerQueueState {
  queue: PlayerTrack[];
  currentIndex: number;
  queueSource?: QueueSource;
}

/**
 * Runtime playback state for the player.
 */
export interface PlayerPlaybackState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

/**
 * Optional lightweight UI state for blocked-attempt feedback.
 */
export interface PlayerUiState {
  blockedTrackId: number | null;
}

/**
 * Full store state contract.
 */
export interface PlayerState
  extends PlayerPlaybackState,
    PlayerQueueState,
    PlayerUiState {}

/**
 * Pure store actions only.
 *
 * Side effects (audio element control, analytics calls, completion detection)
 * must remain in React components.
 */
export interface PlayerActions {
  playTrack: (track: PlayerTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;

  setQueue: (tracks: PlayerTrack[], startIndex?: number, source?: QueueSource) => void;
  addToQueue: (track: PlayerTrack) => void;
  addPlaylistToQueue: (tracks: PlayerTrack[]) => void;
  removeFromQueue: (trackId: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

/**
 * Complete Zustand store contract.
 */
export type PlayerStore = PlayerState & PlayerActions;

/**
 * Contract for one-time-per-track analytics state owned by the audio component.
 *
 * This must not be placed in Zustand because it is component-side effect state.
 */
export interface PlaybackTrackingRuntime {
  startedTrackIds: Set<number>;
  completedTrackIds: Set<number>;
}

/**
 * Contract for mapping helpers used by feed/profile/track-card integrations.
 */
export interface PlayerTrackMappers {
  fromTrackMetaData: (
    track: TrackMetaData,
    options?: { access?: PlaybackAccess; durationSeconds?: number }
  ) => PlayerTrack;
  fromAdapterInput: (
    input: PlayerTrackAdapterInput,
    options?: { access?: PlaybackAccess; fallbackArtistName?: string }
  ) => PlayerTrack;
}
