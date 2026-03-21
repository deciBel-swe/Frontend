import { formatDuration } from '@/utils/formatDuration';

describe('formatDuration', () => {
  it('formats durations under one hour as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(214)).toBe('3:34');
  });

  it('formats durations of one hour or more as h:mm:ss', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });
});
