import { generateWaveform } from '@/utils/waveform';

describe('utils/waveform generateWaveform', () => {
  it('returns the default waveform length and bounded integer values', () => {
    const waveform = generateWaveform();

    expect(waveform).toHaveLength(120);
    expect(waveform.every((v) => Number.isInteger(v))).toBe(true);
    expect(waveform.every((v) => v >= 0 && v <= 100)).toBe(true);
  });

  it('is deterministic for the same seed and length', () => {
    const first = generateWaveform(42, 30);
    const second = generateWaveform(42, 30);

    expect(first).toEqual(second);
  });

  it('varies with different seeds', () => {
    const a = generateWaveform(1, 20);
    const b = generateWaveform(2, 20);

    expect(a).not.toEqual(b);
  });
});
