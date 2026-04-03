import type { MutableRefObject } from 'react';

import type {
  PlaybackAccess,
  PlayerState,
  PlayerTrack,
} from '@/features/player/contracts/playerContracts';

/**
 * Props contract for the single persistent GlobalAudioPlayer component.
 *
 * This component owns the one and only HTMLAudioElement and runs all side
 * effects (play/pause, source switching, completion detection, tracking calls).
 */
export interface GlobalAudioPlayerProps {
  autoAdvanceOnEnd?: boolean;
}

/**
 * Contract for internal audio controller helpers.
 */
export interface AudioControllerContext {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  state: Pick<
    PlayerState,
    'currentTrack' | 'isPlaying' | 'currentTime' | 'duration' | 'volume'
  >;
  track: PlayerTrack | null;
}

/**
 * Minimal playback fields TrackCard should carry after integration.
 */
export interface TrackCardPlaybackData {
  id: number;
  title: string;
  artistName: string;
  trackUrl: string;
  access: PlaybackAccess;
  durationSeconds?: number;
  waveformData?: number[];
}

/**
 * Queue wiring contract for feed/profile track list interactions.
 */
export interface QueueSelectionPayload {
  tracks: PlayerTrack[];
  selectedTrackId: number;
}
