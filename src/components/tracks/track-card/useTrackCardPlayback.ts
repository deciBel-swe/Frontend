'use client';

import { useEffect, useState } from 'react';
import { parseDurationToSeconds } from '@/utils/parseDuration';
import { usePlayerStore } from '@/features/player/store/playerStore';
import type { TrackCardPlaybackData } from '@/features/player/components/playerComponent.contracts';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';

type UseTrackCardPlaybackParams = {
  track: {
    id: number;
    duration: string;
  };
  playback?: TrackCardPlaybackData;
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;
  onSeekSelect: (timestamp: number) => void;
  onExternalTrackChange: () => void;
};

const isSameQueue = (
  currentQueue: PlayerTrack[],
  incomingQueue: PlayerTrack[]
): boolean => {
  if (currentQueue.length !== incomingQueue.length) {
    return false;
  }

  return currentQueue.every(
    (track, index) => track.id === incomingQueue[index]?.id
  );
};

export function useTrackCardPlayback({
  track,
  playback,
  queueTracks,
  queueSource,
  onSeekSelect,
  onExternalTrackChange,
}: UseTrackCardPlaybackParams) {
  const playerQueue = usePlayerStore((state) => state.queue);
  const currentPlayerTrackId = usePlayerStore(
    (state) => state.currentTrack?.id ?? null
  );
  const playerCurrentTime = usePlayerStore((state) => state.currentTime);
  const playerDuration = usePlayerStore((state) => state.duration);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const seek = usePlayerStore((state) => state.seek);

  const durationSeconds = parseDurationToSeconds(track.duration);
  const cardTrackId = playback?.id ?? track.id;
  const isBlocked = playback?.access === 'BLOCKED';
  const metadataDurationSeconds = playback?.durationSeconds ?? durationSeconds;
  const [knownDurationSeconds, setKnownDurationSeconds] = useState(
    metadataDurationSeconds > 0 ? metadataDurationSeconds : 0
  );

  const isCurrentPlaybackTrack = usePlayerStore(
    (state) => Number(state.currentTrack?.id ?? -1) === Number(cardTrackId)
  );
  const isCurrentTrackPlaying = usePlayerStore(
    (state) =>
      Number(state.currentTrack?.id ?? -1) === Number(cardTrackId) &&
      state.isPlaying
  );

  useEffect(() => {
    if (metadataDurationSeconds > 0) {
      setKnownDurationSeconds((previous) =>
        Math.abs(previous - metadataDurationSeconds) > 0.01
          ? metadataDurationSeconds
          : previous
      );
    }
  }, [metadataDurationSeconds]);

  useEffect(() => {
    if (isCurrentPlaybackTrack && playerDuration > 0) {
      setKnownDurationSeconds((previous) =>
        Math.abs(previous - playerDuration) > 0.01 ? playerDuration : previous
      );
    }
  }, [isCurrentPlaybackTrack, playerDuration]);

  useEffect(() => {
    if (!isCurrentPlaybackTrack) {
      onExternalTrackChange();
    }
  }, [isCurrentPlaybackTrack, onExternalTrackChange]);

  const ensureQueue = () => {
    if (!playback || !queueTracks || queueTracks.length === 0) {
      return;
    }

    const startIndex = queueTracks.findIndex((item) => item.id === playback.id);
    if (startIndex >= 0 && !isSameQueue(playerQueue, queueTracks)) {
      setQueue(queueTracks, startIndex, queueSource ?? 'unknown');
    }
  };

  const handlePlayFromCard = () => {
    if (!playback || isBlocked) {
      return;
    }

    const isSameTrack = Number(currentPlayerTrackId) === Number(playback.id);
    if (isSameTrack) {
      if (isCurrentTrackPlaying) {
        pausePlayback();
        return;
      }

      playTrack(playback);
      return;
    }

    ensureQueue();
    playTrack(playback);
  };

  const handleWaveformClick = (percent: number) => {
    if (isBlocked) {
      return;
    }

    if (playback) {
      const isSameTrack = Number(currentPlayerTrackId) === Number(playback.id);

      if (!isSameTrack) {
        ensureQueue();
        playTrack(playback);
      } else if (!isCurrentTrackPlaying) {
        playTrack(playback);
      }
    }

    const seekDuration = knownDurationSeconds;

    if (seekDuration <= 0) {
      return;
    }

    const timestamp = percent * seekDuration;

    if (playback) {
      seek(timestamp);
    }

    onSeekSelect(timestamp);
  };

  const handleAddToQueue = () => {
    if (
      !playback ||
      playback.access === 'BLOCKED' ||
      playback.trackUrl.trim().length === 0
    ) {
      return;
    }

    addToQueue(playback);
  };

  return {
    isBlocked,
    isCurrentTrackPlaying,
    waveformCurrentTime: isCurrentPlaybackTrack ? playerCurrentTime : 0,
    waveformDurationSeconds: knownDurationSeconds,
    handlePlayFromCard,
    handleWaveformClick,
    handleAddToQueue,
  };
}
