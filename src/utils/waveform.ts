/**
 * generateWaveform
 *
 * Produces a deterministic sine-based amplitude array suitable for rendering
 * an audio waveform visualiser. An optional `seed` shifts the phase so each
 * track gets a visually distinct waveform without randomness.
 *
 * Values range roughly from 20 to 90.
 *
 * @param seed   - Integer seed for per-track variation (default: 0)
 * @param length - Number of data points to generate (default: 120)
 * @returns        Array of integer amplitude values in [0, 100]
 *
 * @example
 * const bars = generateWaveform(track.id);        // 120 points, unique per track
 * const short = generateWaveform(track.id, 60);   // 60 points
 */
export function generateWaveform(
  seed: number = 0,
  length: number = 120
): number[] {
  const phase = seed * 0.3;
  return Array.from({ length }, (_, i) =>
    Math.round(
      50 + 30 * Math.sin(i * 0.25 + phase) + 10 * Math.sin(i * 0.05 + phase)
    )
  );
}
