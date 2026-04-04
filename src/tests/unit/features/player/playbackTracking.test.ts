import {
  shouldMarkTrackCompleted,
  shouldTriggerCompletion,
} from '@/features/player/utils/playbackTracking';

describe('playbackTracking', () => {
  it('returns false below completion threshold and true at threshold', () => {
    expect(shouldTriggerCompletion(89, 100)).toBe(false);
    expect(shouldTriggerCompletion(90, 100)).toBe(true);
  });

  it('marks completion only once per track id', () => {
    const completedTrackIds = new Set<number>();

    const first = shouldMarkTrackCompleted(123, 90, 100, completedTrackIds);
    const second = shouldMarkTrackCompleted(123, 95, 100, completedTrackIds);

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(completedTrackIds.has(123)).toBe(true);
  });
});
