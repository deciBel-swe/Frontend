//takes a number and formate it to a more readable format like 1.2K, 3.4M, etc.
export function formatNumber(num: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);
}
