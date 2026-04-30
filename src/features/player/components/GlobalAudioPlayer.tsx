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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PlayerBar from '@/components/player/PlayerBar';
import type { GlobalAudioPlayerProps } from '@/features/player/components/playerComponent.contracts';
import {
  addToRecentlyPlayed,
  userCompletedTrack,
  userPlayedTrack,
} from '@/services/api/playbackTrackingService';
import { usePlayerStore } from '@/features/player/store/playerStore';
import {
  shouldMarkTrackCompleted,
} from '@/features/player/utils/playbackTracking';

const PREVIEW_DURATION_SECONDS = 10;

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
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const requestSeek = usePlayerStore((state) => state.seek);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const reorderQueue = usePlayerStore((state) => state.reorderQueue);
  const pause = usePlayerStore((state) => state.pause);

  // Queue panel visibility state exposed by the merged PlayerBar API.
  const [queueVisible, setQueueVisible] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);

  const canPlayCurrentTrack = useMemo(() => {
    return (
      !!currentTrack &&
      currentTrack.access !== 'BLOCKED' &&
      currentTrack.trackUrl.trim().length > 0
    );
  }, [currentTrack]);

  const getTrackDurationLimit = useCallback(() => {
    if (currentTrack?.access === 'PREVIEW') {
      return PREVIEW_DURATION_SECONDS;
    }

    return Number.POSITIVE_INFINITY;
  }, [currentTrack]);

  /**
   * Attempts to seek the real audio element.
   * Returns true when seek is applied immediately.
   * Returns false when the request is deferred (for example duration not ready).
   */
  const applySeek = useCallback((targetTime: number): boolean => {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }

    if (!Number.isFinite(targetTime) || targetTime < 0) {
      return false;
    }

    if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
      setPendingSeek(targetTime);
      return false;
    }

    const durationLimit = getTrackDurationLimit();
    const clamped = Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.max(0, Math.min(targetTime, audio.duration, durationLimit))
      : Math.max(0, targetTime);

    if (typeof audio.fastSeek === 'function') {
      try {
        audio.fastSeek(clamped);
      } catch {
        audio.currentTime = clamped;
      }
    } else {
      audio.currentTime = clamped;
    }

    setPendingSeek(null);
    return true;
  }, [getTrackDurationLimit]);

  /**
   * Public seek entrypoint used by the merged PlayerBar timeline.
   * 1) Update store for UI state.
   * 2) Try to apply to audio element immediately.
   * 3) Keep pending seek if media is not yet seekable.
   */
  const handleSeek = (time: number) => {
    if (!currentTrack || !canPlayCurrentTrack) {
      return;
    }

    requestSeek(time);
    applySeek(time);
  };

  useEffect(() => {
    // Apply queued seeks as soon as metadata is available.
    const audio = audioRef.current;
    if (!audio || pendingSeek === null) {
      return;
    }

    const applyPendingSeek = () => {
      const durationLimit = getTrackDurationLimit();
      const clamped = Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.max(0, Math.min(pendingSeek, audio.duration, durationLimit))
        : Math.max(0, pendingSeek);

      if (typeof audio.fastSeek === 'function') {
        try {
          audio.fastSeek(clamped);
        } catch {
          audio.currentTime = clamped;
        }
      } else {
        audio.currentTime = clamped;
      }

      setPendingSeek(null);
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      applyPendingSeek();
      return;
    }

    audio.addEventListener('loadedmetadata', applyPendingSeek);
    return () => {
      audio.removeEventListener('loadedmetadata', applyPendingSeek);
    };
  }, [getTrackDurationLimit, pendingSeek]);

  const handlePlay = () => {
    if (isPlaying) {
      return;
    }

    if (!currentTrack) {
      if (queue.length === 0) {
        return;
      }

      const startIndex = currentIndex >= 0 ? currentIndex : 0;
      const startTrack = queue[startIndex];
      if (startTrack) {
        playTrack(startTrack);
      }
      return;
    }

    togglePlay();
  };

  const handlePause = () => {
    pause();
  };

  const selectTrackById = useCallback(
    (trackId: number) => {
      const targetTrack = queue.find((item) => item.id === trackId);
      if (!targetTrack) {
        return;
      }

      playTrack(targetTrack);
    },
    [playTrack, queue]
  );

  const findPlayableIndex = useCallback(
    (startIndex: number, step: 1 | -1, wrap: boolean): number => {
      if (queue.length === 0) {
        return -1;
      }

      let cursor = startIndex;
      for (let checked = 0; checked < queue.length; checked += 1) {
        cursor += step;

        if (wrap) {
          cursor = (cursor + queue.length) % queue.length;
        } else if (cursor < 0 || cursor >= queue.length) {
          return -1;
        }

        const candidate = queue[cursor];
        if (candidate.access !== 'BLOCKED' && candidate.trackUrl.trim().length > 0) {
          return cursor;
        }
      }

      return -1;
    },
    [queue]
  );

  const handleNextTrack = useCallback(() => {
    if (queue.length === 0) {
      pause();
      return;
    }

    if (shuffleActive) {
      const playableTracks = queue.filter(
        (item) => item.access !== 'BLOCKED' && item.trackUrl.trim().length > 0
      );

      if (playableTracks.length === 0) {
        pause();
        return;
      }

      const nonCurrentTracks = currentTrack
        ? playableTracks.filter((item) => item.id !== currentTrack.id)
        : playableTracks;
      const pool = nonCurrentTracks.length > 0 ? nonCurrentTracks : playableTracks;
      const randomIndex = Math.floor(Math.random() * pool.length);
      playTrack(pool[randomIndex]);
      return;
    }

    const effectiveIndex = currentIndex >= 0
      ? currentIndex
      : currentTrack
        ? queue.findIndex((item) => item.id === currentTrack.id)
        : -1;

    const nextPlayableIndex = findPlayableIndex(
      effectiveIndex,
      1,
      repeatActive
    );

    if (nextPlayableIndex < 0) {
      pause();
      return;
    }

    playTrack(queue[nextPlayableIndex]);
  }, [currentIndex, currentTrack, findPlayableIndex, pause, playTrack, queue, repeatActive, shuffleActive]);

  const handlePreviousTrack = useCallback(() => {
    if (queue.length === 0) {
      return;
    }

    if (shuffleActive) {
      const playableTracks = queue.filter(
        (item) => item.access !== 'BLOCKED' && item.trackUrl.trim().length > 0
      );

      if (playableTracks.length === 0) {
        return;
      }

      const nonCurrentTracks = currentTrack
        ? playableTracks.filter((item) => item.id !== currentTrack.id)
        : playableTracks;
      const pool = nonCurrentTracks.length > 0 ? nonCurrentTracks : playableTracks;
      const randomIndex = Math.floor(Math.random() * pool.length);
      playTrack(pool[randomIndex]);
      return;
    }

    const effectiveIndex = currentIndex >= 0
      ? currentIndex
      : currentTrack
        ? queue.findIndex((item) => item.id === currentTrack.id)
        : -1;

    const previousPlayableIndex = findPlayableIndex(
      effectiveIndex,
      -1,
      repeatActive
    );

    if (previousPlayableIndex < 0) {
      return;
    }

    playTrack(queue[previousPlayableIndex]);
  }, [currentIndex, currentTrack, findPlayableIndex, playTrack, queue, repeatActive, shuffleActive]);

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

    let handleMetadataOnSourceSwitch: (() => void) | undefined;

    if (needsSourceSwitch) {
      handleMetadataOnSourceSwitch = () => {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
          return;
        }

        const effectiveDuration = Math.min(
          audio.duration,
          getTrackDurationLimit()
        );
        if (Math.abs(duration - effectiveDuration) > 0.01) {
          setDuration(effectiveDuration);
        }
      };

      audio.addEventListener('loadedmetadata', handleMetadataOnSourceSwitch, {
        once: true,
      });

      loadedTrackRef.current = {
        id: currentTrack.id,
        trackUrl: currentTrack.trackUrl,
      };
      audio.src = currentTrack.trackUrl;
      audio.load();

      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        handleMetadataOnSourceSwitch();
      }
    }

    return () => {
      if (handleMetadataOnSourceSwitch) {
        audio.removeEventListener('loadedmetadata', handleMetadataOnSourceSwitch);
      }
    };
  }, [canPlayCurrentTrack, currentTrack, duration, getTrackDurationLimit, setDuration]);

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
  }, [applySeek, currentTime, currentTrack]);

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
      const now = audio.currentTime;
      const durationLimit = getTrackDurationLimit();
      const clampedTime = Math.min(now, durationLimit);

      if (currentTrack.access === 'PREVIEW' && now >= PREVIEW_DURATION_SECONDS) {
        audio.pause();
        if (Math.abs(audio.currentTime - PREVIEW_DURATION_SECONDS) > 0.01) {
          audio.currentTime = PREVIEW_DURATION_SECONDS;
        }
        setCurrentTime(PREVIEW_DURATION_SECONDS);
        pause();
        return;
      }

      setCurrentTime(clampedTime);

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const effectiveDuration = Math.min(audio.duration, durationLimit);
        if (Math.abs(duration - effectiveDuration) > 0.01) {
          setDuration(effectiveDuration);
        }
      }

      const effectiveDuration = Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.min(audio.duration, durationLimit)
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
      // Metadata availability unlocks precise duration.
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const effectiveDuration = Math.min(
          audio.duration,
          getTrackDurationLimit()
        );
        if (Math.abs(duration - effectiveDuration) > 0.01) {
          setDuration(effectiveDuration);
        }
      }
    };

    const handleEnded = () => {
      // Queue-aware end behavior: auto-advance or stop.
      if (!autoAdvanceOnEnd) {
        pause();
        return;
      }

      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoAdvanceOnEnd, currentTrack, duration, getTrackDurationLimit, handleNextTrack, pause, setCurrentTime, setDuration]);

  useEffect(() => {
    // On track identity change, keep a queued seek if one already exists.
    const nextTrackId = currentTrack?.id ?? null;
    if (previousTrackIdRef.current === nextTrackId) {
      return;
    }

    previousTrackIdRef.current = nextTrackId;

    // Do not overwrite a user-requested seek that arrived during track switch.
    if (pendingSeek === null && currentTime <= 0.01) {
      setCurrentTime(0);
    }

    // Reset stale duration from the previous track immediately.
    const fallbackDuration =
      currentTrack?.access === 'PREVIEW'
        ? Math.min(currentTrack.durationSeconds ?? PREVIEW_DURATION_SECONDS, PREVIEW_DURATION_SECONDS)
        : (currentTrack?.durationSeconds ?? 0);
    setDuration(fallbackDuration);
  }, [currentTime, currentTrack, pendingSeek, setCurrentTime, setDuration]);

  return (
    <>
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />
      <PlayerBar
        track={currentTrack?.title ?? 'Nothing playing'}
        artist={currentTrack?.artistName ?? 'Unknown artist'}
        artwork={currentTrack?.coverUrl ?? '/images/default_song_image.png'}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNextTrack}
        onPrev={handlePreviousTrack}
        onScrub={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        queue={{
          visible: queueVisible,
          activeTrackId: currentTrack?.id,
          items: queue.map((item) => ({
            id: item.id,
            title: item.title,
            artist: item.artistName,
            artwork: item.coverUrl,
          })),
        }}
        onQueueSelect={selectTrackById}
        onQueueRemove={removeFromQueue}
        onQueueClear={clearQueue}
        onQueueReorder={reorderQueue}
        onQueueToggle={() => setQueueVisible((previous) => !previous)}
        shuffleActive={shuffleActive}
        repeatActive={repeatActive}
        onToggleShuffle={() => setShuffleActive((previous) => !previous)}
        onToggleRepeat={() => setRepeatActive((previous) => !previous)}
      />
    </>
  );
}
