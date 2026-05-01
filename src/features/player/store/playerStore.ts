'use client';

/**
 * playerStore
 *
 * Global Zustand store for audio playback and queue state.
 *
 * Responsibilities:
 * - Hold canonical player state (track, time, duration, volume, queue).
 * - Expose pure actions for playback toggles and queue management.
 * - Guard blocked tracks at state transition boundaries.
 * - Keep updates idempotent to avoid render/update loops.
 *
 * Non-responsibilities:
 * - No direct HTMLAudioElement control.
 * - No analytics/service side effects.
 */
import { create } from 'zustand';

import type { PlayerStore, PlayerTrack } from '@/features/player/contracts/playerContracts';
import { PLAYER_INITIAL_STATE } from '@/features/player/store/playerStore.contract';

/** Clamp volume to the HTML audio valid range. */
const clampVolume = (volume: number): number => {
  if (!Number.isFinite(volume)) {
    return 1;
  }

  return Math.max(0, Math.min(1, volume));
};

/** Normalize any time value into a safe non-negative number. */
const normalizeTime = (time: number): number => {
  if (!Number.isFinite(time)) {
    return 0;
  }

  return Math.max(0, time);
};

/** Find the queue index for a given track id. */
const findTrackIndex = (queue: PlayerTrack[], trackId: number): number => {
  return queue.findIndex((item) => item.id === trackId);
};

const isValidQueueIndex = (queue: PlayerTrack[], index: number): boolean => {
  return Number.isInteger(index) && index >= 0 && index < queue.length;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...PLAYER_INITIAL_STATE,

  // Start or resume a specific track. Only BLOCKED tracks are rejected at store level.
  playTrack: (track) => {
    if (track.access === 'BLOCKED' || track.trackUrl.trim().length === 0) {
      set({ blockedTrackId: track.id, isPlaying: false });
      return;
    }

    const state = get();
    const queueIndex = findTrackIndex(state.queue, track.id);
    const isSameTrack = state.currentTrack?.id === track.id;

    set({
      currentTrack: track,
      isPlaying: true,
      blockedTrackId: null,
      currentTime: isSameTrack ? state.currentTime : 0,
      duration: isSameTrack
        ? state.duration
        : track.durationSeconds ?? 0,
      currentIndex: queueIndex >= 0 ? queueIndex : state.currentIndex,
    });
  },

  // Toggle playback for the current track. BLOCKED tracks stay paused.
  togglePlay: () => {
    const state = get();
    if (!state.currentTrack) {
      return;
    }

    if (state.currentTrack.access === 'BLOCKED') {
      set({ blockedTrackId: state.currentTrack.id });
      return;
    }

    set({ isPlaying: !state.isPlaying });
  },

  // Explicit pause action.
  pause: () => {
    set((state) => (state.isPlaying ? { isPlaying: false } : state));
  },

  // Request a seek position in seconds.
  seek: (time) => {
    const nextTime = normalizeTime(time);
    set((state) => (state.currentTime !== nextTime ? { currentTime: nextTime } : state));
  },

  // Set output volume in the range [0, 1].
  setVolume: (volume) => {
    const nextVolume = clampVolume(volume);
    set((state) => (state.volume !== nextVolume ? { volume: nextVolume } : state));
  },

  // Replace queue and optionally define starting position/source.
  setQueue: (tracks, startIndex = 0, source) => {
    const safeIndex = tracks.length === 0
      ? -1
      : Math.max(0, Math.min(startIndex, tracks.length - 1));

    set((state) => ({
      queue: tracks,
      queueSource: source ?? state.queueSource,
      currentIndex: safeIndex,
      currentTrack: safeIndex >= 0 ? tracks[safeIndex] : null,
      currentTime: safeIndex >= 0 ? 0 : state.currentTime,
      duration: safeIndex >= 0 ? tracks[safeIndex].durationSeconds ?? 0 : state.duration,
    }));
  },

  // Append a single track to the queue.
  addToQueue: (track) => {
    set((state) => {
      if (state.queue.some((item) => item.id === track.id)) {
        return state;
      }

      return {
        queue: [...state.queue, track],
        currentIndex:
          state.currentIndex >= 0
            ? state.currentIndex
            : state.queue.length === 0
              ? 0
              : state.currentIndex,
        currentTrack:
          state.currentTrack ?? (state.queue.length === 0 ? track : state.currentTrack),
      };
    });
  },

  // Append multiple tracks to the queue.
  addPlaylistToQueue: (tracks) => {
    set((state) => {
      const existingIds = new Set(state.queue.map((item) => item.id));
      const seenIds = new Set<number>();

      const uniqueIncomingTracks = tracks.filter((track) => {
        if (existingIds.has(track.id) || seenIds.has(track.id)) {
          return false;
        }

        seenIds.add(track.id);
        return true;
      });

      if (uniqueIncomingTracks.length === 0) {
        return state;
      }

      return {
        queue: [...state.queue, ...uniqueIncomingTracks],
        currentIndex:
          state.currentIndex >= 0
            ? state.currentIndex
            : uniqueIncomingTracks.length > 0
              ? 0
              : state.currentIndex,
        currentTrack:
          state.currentTrack ?? (uniqueIncomingTracks.length > 0 ? uniqueIncomingTracks[0] : null),
      };
    });
  },

  // Remove a track from queue and keep playback/index coherent.
  removeFromQueue: (trackId) => {
    set((state) => {
      const removeIndex = state.queue.findIndex((item) => item.id === trackId);
      if (removeIndex < 0) {
        return state;
      }

      const nextQueue = state.queue.filter((item) => item.id !== trackId);

      if (nextQueue.length === 0) {
        return {
          queue: [],
          currentIndex: -1,
          currentTrack: null,
          currentTime: 0,
          duration: 0,
          isPlaying: false,
        };
      }

      if (removeIndex < state.currentIndex) {
        return {
          queue: nextQueue,
          currentIndex: state.currentIndex - 1,
        };
      }

      if (removeIndex > state.currentIndex) {
        return {
          queue: nextQueue,
        };
      }

      const fallbackIndex = Math.min(removeIndex, nextQueue.length - 1);
      const nextTrack = nextQueue[fallbackIndex];

      return {
        queue: nextQueue,
        currentIndex: fallbackIndex,
        currentTrack: nextTrack,
        currentTime: 0,
        duration: nextTrack.durationSeconds ?? 0,
        isPlaying: nextTrack.access !== 'BLOCKED' ? state.isPlaying : false,
      };
    });
  },

  // Clear queue and reset playback selection.
  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      currentTrack: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      queueSource: undefined,
    });
  },

  // Reorder queue by moving one item from source index to target index.
  reorderQueue: (fromIndex, toIndex) => {
    set((state) => {
      if (!isValidQueueIndex(state.queue, fromIndex) || !isValidQueueIndex(state.queue, toIndex)) {
        return state;
      }

      if (fromIndex === toIndex) {
        return state;
      }

      const nextQueue = [...state.queue];
      const [movedTrack] = nextQueue.splice(fromIndex, 1);
      nextQueue.splice(toIndex, 0, movedTrack);

      let nextCurrentIndex = state.currentIndex;

      if (state.currentIndex === fromIndex) {
        nextCurrentIndex = toIndex;
      } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
        nextCurrentIndex = state.currentIndex - 1;
      } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
        nextCurrentIndex = state.currentIndex + 1;
      }

      const nextCurrentTrack = isValidQueueIndex(nextQueue, nextCurrentIndex)
        ? nextQueue[nextCurrentIndex]
        : state.currentTrack;

      return {
        queue: nextQueue,
        currentIndex: nextCurrentIndex,
        currentTrack: nextCurrentTrack,
      };
    });
  },

  // Move to the next queue item when available.
  nextTrack: () => {
    const state = get();
    if (state.queue.length === 0) {
      return;
    }

    const nextIndex = state.currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= state.queue.length) {
      set({ isPlaying: false });
      return;
    }

    const next = state.queue[nextIndex];
    if (next.access === 'BLOCKED') {
      set({ currentIndex: nextIndex, currentTrack: next, isPlaying: false, currentTime: 0 });
      return;
    }

    set({
      currentIndex: nextIndex,
      currentTrack: next,
      isPlaying: true,
      currentTime: 0,
      duration: next.durationSeconds ?? 0,
    });
  },

  // Move to the previous queue item when available.
  previousTrack: () => {
    const state = get();
    if (state.queue.length === 0) {
      return;
    }

    const prevIndex = state.currentIndex - 1;
    if (prevIndex < 0 || prevIndex >= state.queue.length) {
      return;
    }

    const previous = state.queue[prevIndex];
    if (previous.access === 'BLOCKED') {
      set({ currentIndex: prevIndex, currentTrack: previous, isPlaying: false, currentTime: 0 });
      return;
    }

    set({
      currentIndex: prevIndex,
      currentTrack: previous,
      isPlaying: true,
      currentTime: 0,
      duration: previous.durationSeconds ?? 0,
    });
  },

  // Internal playback-time update (driven by audio events).
  setCurrentTime: (time) => {
    const nextTime = normalizeTime(time);
    set((state) => {
      if (Math.abs(state.currentTime - nextTime) < 0.01) {
        return state;
      }

      return { currentTime: nextTime };
    });
  },

  // Internal duration update (driven by audio metadata/events).
  setDuration: (duration) => {
    const nextDuration = normalizeTime(duration);
    set((state) => {
      if (Math.abs(state.duration - nextDuration) < 0.01) {
        return state;
      }

      return { duration: nextDuration };
    });
  },
}));
