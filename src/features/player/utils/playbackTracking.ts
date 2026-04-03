/**
 * playbackTracking
 *
 * Pure helper functions for playback analytics thresholds.
 *
 * Provides reusable logic for:
 * - Determining if a track qualifies as completed (>= threshold of duration).
 * - Ensuring completion is counted once per track ID.
 */
export const COMPLETION_THRESHOLD = 0.9;

/**
 * Returns true when current progress meets or exceeds threshold.
 */
export const shouldTriggerCompletion = (
  currentTime: number,
  duration: number,
  threshold = COMPLETION_THRESHOLD
): boolean => {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) {
    return false;
  }

  if (duration <= 0) {
    return false;
  }

  return currentTime / duration >= threshold;
};

/**
 * Marks completion once per track id and returns whether this call caused it.
 */
export const shouldMarkTrackCompleted = (
  trackId: number,
  currentTime: number,
  duration: number,
  completedTrackIds: Set<number>,
  threshold = COMPLETION_THRESHOLD
): boolean => {
  if (!shouldTriggerCompletion(currentTime, duration, threshold)) {
    return false;
  }

  if (completedTrackIds.has(trackId)) {
    return false;
  }

  completedTrackIds.add(trackId);
  return true;
};
