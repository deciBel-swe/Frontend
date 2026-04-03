'use client';

/**
 * GlobalAudioPlayer
 *
 * Single persistent audio runtime for the app.
 *
 * Responsibilities:
 * - Own exactly one HTMLAudioElement instance.
 * - Synchronize player store state with the audio element.
 * - Handle reliable seek behavior, including pending seeks before metadata loads.
 * - Trigger playback tracking side effects (played/completed/recently played).
 * - Advance queue playback on audio end when enabled.
 *
 * Important boundary:
 * - Store contains pure state/actions only.
 * - This component owns imperative side effects and browser audio API usage.
 */
import { useEffect, useMemo, useRef } from 'react';

import type { GlobalAudioPlayerProps } from '@/features/player/components/playerComponent.contracts';
import PlayerUI from '@/features/player/components/PlayerUI';
import {
  addToRecentlyPlayed,
  userCompletedTrack,
  userPlayedTrack,
} from '@/features/player/services/playbackTrackingService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import {
  shouldMarkTrackCompleted,
} from '@/features/player/utils/playbackTracking';

export default function GlobalAudioPlayer({
  autoAdvanceOnEnd = true,
}: GlobalAudioPlayerProps) {
  // Single global audio element instance.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Track-level analytics guards to ensure one-time trigger semantics.
  const startedTrackIdsRef = useRef<Set<number>>(new Set());
  const completedTrackIdsRef = useRef<Set<number>>(new Set());

  // Track identity refs used to avoid redundant reload/seek resets.
  const previousTrackIdRef = useRef<number | null>(null);
  const loadedTrackRef = useRef<{ id: number; trackUrl: string } | null>(null);

  // If seek is requested before metadata is ready, queue it until seekable.
  const pendingSeekRef = useRef<number | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);
  const queue = usePlayerStore((state) => state.queue);
  const queueLength = usePlayerStore((state) => state.queue.length);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const previousTrack = usePlayerStore((state) => state.previousTrack);
  const requestSeek = usePlayerStore((state) => state.seek);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const pause = usePlayerStore((state) => state.pause);

  const canPlayCurrentTrack = useMemo(() => {
    return (
      !!currentTrack &&
      currentTrack.access === 'PLAYABLE' &&
      currentTrack.trackUrl.trim().length > 0
    );
  }, [currentTrack]);

  /**
   * Attempts to seek the real audio element.
   * Returns true when seek is applied immediately.
   * Returns false when the request is deferred (for example duration not ready).
   */
  const applySeek = (targetTime: number): boolean => {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }

    if (!Number.isFinite(targetTime) || targetTime < 0) {
      return false;
    }

    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      pendingSeekRef.current = targetTime;
      return false;
    }

    const clamped = Math.max(0, Math.min(targetTime, audio.duration));

    if (typeof audio.fastSeek === 'function') {
      try {
        audio.fastSeek(clamped);
      } catch {
        audio.currentTime = clamped;
      }
    } else {
      audio.currentTime = clamped;
    }

    pendingSeekRef.current = null;
    return true;
  };

  /**
   * Public seek entrypoint used by PlayerUI.
   * 1) Update store for UI state.
   * 2) Try to apply to audio element immediately.
   * 3) Keep pending seek if media is not yet seekable.
   */
  const handleSeek = (time: number) => {
    pendingSeekRef.current = time;
    requestSeek(time);
    applySeek(time);
  };

  useEffect(() => {
    // Sync selected track source into the single audio element.
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!currentTrack || !canPlayCurrentTrack) {
      audio.pause();
      return;
    }

    const loadedTrack = loadedTrackRef.current;
    const needsSourceSwitch =
      !loadedTrack ||
      loadedTrack.id !== currentTrack.id ||
      loadedTrack.trackUrl !== currentTrack.trackUrl;

    if (needsSourceSwitch) {
      loadedTrackRef.current = {
        id: currentTrack.id,
        trackUrl: currentTrack.trackUrl,
      };
      audio.src = currentTrack.trackUrl;
      audio.load();
    }
  }, [canPlayCurrentTrack, currentTrack]);

  useEffect(() => {
    // Keep audio element volume in sync with store state.
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    // Keep audio currentTime synchronized with store seek state.
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    if (Math.abs(audio.currentTime - currentTime) > 0.05) {
      applySeek(currentTime);
    }
  }, [currentTime, currentTrack]);

  useEffect(() => {
    // Drive play/pause transitions from the global store state.
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!currentTrack || !canPlayCurrentTrack) {
      audio.pause();
      return;
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();
    if (!playPromise) {
      return;
    }

    void playPromise
      .then(() => {
        if (!startedTrackIdsRef.current.has(currentTrack.id)) {
          startedTrackIdsRef.current.add(currentTrack.id);
          userPlayedTrack(currentTrack.id);
          addToRecentlyPlayed(currentTrack.id);
        }
      })
      .catch(() => {
        pause();
      });
  }, [canPlayCurrentTrack, currentTrack, isPlaying, pause]);

  useEffect(() => {
    // Subscribe to audio lifecycle events and push updates back to store.
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    const handleTimeUpdate = () => {
      // If a seek was queued before metadata was ready, retry continuously.
      if (pendingSeekRef.current !== null) {
        applySeek(pendingSeekRef.current);
      }

      const now = audio.currentTime;
      setCurrentTime(now);

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        if (Math.abs(duration - audio.duration) > 0.01) {
          setDuration(audio.duration);
        }
      }

      const effectiveDuration = Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : duration;

      if (
        shouldMarkTrackCompleted(
          currentTrack.id,
          now,
          effectiveDuration,
          completedTrackIdsRef.current
        )
      ) {
        // One-time completion trigger for analytics.
        userCompletedTrack(currentTrack.id);
      }
    };

    const handleLoadedMetadata = () => {
      // Metadata availability unlocks precise duration and pending seek replay.
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        if (Math.abs(duration - audio.duration) > 0.01) {
          setDuration(audio.duration);
        }

        if (pendingSeekRef.current !== null) {
          applySeek(pendingSeekRef.current);
        }
      }
    };

    const handleEnded = () => {
      // Queue-aware end behavior: auto-advance or stop.
      if (!autoAdvanceOnEnd) {
        pause();
        return;
      }

      if (queueLength === 0 || currentIndex < 0 || currentIndex >= queueLength - 1) {
        pause();
        return;
      }

      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoAdvanceOnEnd, currentIndex, currentTrack, duration, nextTrack, pause, queueLength, setCurrentTime, setDuration]);

  useEffect(() => {
    // Reset time and pending-seek state when active track identity changes.
    const nextTrackId = currentTrack?.id ?? null;
    if (previousTrackIdRef.current === nextTrackId) {
      return;
    }

    previousTrackIdRef.current = nextTrackId;
    pendingSeekRef.current = null;
    setCurrentTime(0);

    if (currentTrack?.durationSeconds !== undefined) {
      setDuration(currentTrack.durationSeconds);
    }
  }, [currentTrack, setCurrentTime, setDuration]);

  return (
    <>
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />
      <PlayerUI
        queue={queue}
        currentIndex={currentIndex}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPreviousTrack={previousTrack}
        onNextTrack={nextTrack}
        onQueueItemClick={playTrack}
        onRemoveQueueItem={removeFromQueue}
        onTogglePlay={togglePlay}
        onSeek={handleSeek}
        onSetVolume={setVolume}
      />
    </>
  );
}
