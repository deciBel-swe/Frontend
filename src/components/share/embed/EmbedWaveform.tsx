'use client';

/**
 * @file EmbedWaveform.tsx
 * @description Thin wrapper around the shared <Waveform> component for use
 * inside the embed preview. Delegates all rendering, bar sizing, and
 * normalisation to Waveform so behaviour is identical to TrackHero.
 */

import { type FC } from 'react';
import Waveform from '@/components/waveform/Waveform';

interface EmbedWaveformProps {
  /** Resolved waveform samples (0–1), provided by the parent via useWaveformData. */
  data: number[];
  /** Current playback head position in seconds. */
  currentTime: number;
  /** Total duration in seconds. */
  durationSeconds: number;
  /**
   * Called with a fractional seek position (0–1) when the user clicks,
   * matching Waveform's onWaveformClick signature.
   */
  onSeek?: (fraction: number) => void;
  className?: string;
}

/**
 * Embed-preview waveform. Wraps the shared <Waveform> component so bar
 * heights, normalisation, and playback progress are pixel-perfect matches
 * to TrackHero — no custom bar rendering, no duplicated logic.
 *
 * Waveform data is resolved upstream in EmbedPreview via useWaveformData
 * and passed in as `data`, exactly as TrackHero does.
 */
export const EmbedWaveform: FC<EmbedWaveformProps> = ({
  data,
  currentTime,
  durationSeconds,
  onSeek,
  className = '',
}) => {
  return (
    <Waveform
      data={data}
      currentTime={currentTime}
      durationSeconds={durationSeconds}
      onWaveformClick={onSeek}
      className={className}
    />
  );
};