/**
 * formatDuration
 *
 * Converts a duration in seconds to a human-readable `mm:ss` string.
 *
 * @param seconds - Total duration in seconds
 * @returns Formatted string e.g. `3:45`, `1:02:30` for durations over an hour
 *
 * @example
 * formatDuration(214)  // '3:34'
 * formatDuration(65)   // '1:05'
 * formatDuration(3661) // '1:01:01'
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
