import { formatNumber } from '@/utils/formatNumber';

describe('formatNumber', () => {
  it('formats small numbers without compact suffixes', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands and millions using compact notation', () => {
    expect(formatNumber(1_200)).toMatch(/^1(\.2)?K$/i);
    expect(formatNumber(1_000_000)).toMatch(/^1M$/i);
  });

  it('preserves the sign for negative values', () => {
    expect(formatNumber(-1_200)).toMatch(/^-1(\.2)?K$/i);
  });
});
