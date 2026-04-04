import type { StateCreator } from 'zustand';

import type { PlayerStore } from '@/features/player/contracts/playerContracts';

/**
 * Store initializer contract for the global player.
 *
 * Implement this with Zustand create() in a runtime store file. This contract
 * file exists to lock the intended state/action surface before implementation.
 */
export type PlayerStoreCreator = StateCreator<PlayerStore, [], [], PlayerStore>;

/**
 * Initial player state contract.
 */
export const PLAYER_INITIAL_STATE: Pick<
  PlayerStore,
  | 'currentTrack'
  | 'isPlaying'
  | 'currentTime'
  | 'duration'
  | 'volume'
  | 'queue'
  | 'currentIndex'
  | 'blockedTrackId'
> = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  queue: [],
  currentIndex: -1,
  blockedTrackId: null,
};
