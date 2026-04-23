export function formatLocalTime(
  value: string | Date | null | undefined
): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '';
  }

  const nowMs = Date.now();
  const diffMs = nowMs - date.getTime();

  // Handle future timestamps gracefully (clock skew, delayed sync, etc.)
  if (diffMs < 0) {
    return 'just now';
  }

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return 'just now';
  }

  if (diffMs < hourMs) {
    const mins = Math.floor(diffMs / minuteMs);
    return `${mins} min${mins === 1 ? '' : 's'} ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(diffMs / dayMs);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
