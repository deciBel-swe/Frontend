export function parseDurationToSeconds(duration: string): number {
  // supports: "5:08" or "01:05:30"
  const parts = duration.split(':').map(Number);

  if (parts.some((p) => Number.isNaN(p))) return 0;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}