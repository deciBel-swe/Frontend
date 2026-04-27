'use client';

/**
 * @file EmbedTabContent.tsx
 * @description Container for the "Embed" tab inside ShareModal.
 *
 * Orchestrates useEmbedConfig and wires the playback/waveform data received
 * from ShareModal through to EmbedPreview so the preview is a real working
 * player using the same Zustand store as every other TrackCard on the page.
 *
 * Follows the Container/Presenter pattern — all state lives here, child
 * components are pure presenters.
 */

import { type FC, useMemo } from 'react';

import { useEmbedConfig } from './useEmbedConfig';
import { buildIframeCode, buildWordPressCode } from './embedService';
import { EmbedStylePicker } from './EmbedStylePicker';
import { EmbedCodeBox } from './EmbedCodeBox';
import { EmbedOptions } from './EmbedOptions';
import { EmbedPreview } from './EmbedPreview';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';

export interface EmbedTabContentProps {
  /** Canonical public URL used in the generated iframe/WordPress code. */
  resourceUrl: string;
  title: string;
  artist: string;
  coverUrl?: string;
  /** Duration string e.g. "3:20" — forwarded to useTrackCardPlayback. */
  duration: string;
  /**
   * Canonical PlayerTrack for this resource.
   * Comes from the same playerTrackMappers.fromAdapterInput call that
   * TrackList uses when building each TrackCard's playback prop.
   */
  playback: PlayerTrack;
  /**
   * All tracks in the surrounding list — gives the player queue context
   * so forward/back navigation works correctly from the embed preview.
   */
  queueTracks: PlayerTrack[];
  /**
   * Raw waveform amplitude array (item.waveform from TrackList).
   * This is the primary source; EmbedWaveform falls back to waveformUrl
   * if this is empty.
   */
  waveformData: number[];
  /**
   * Optional URL fallback for waveform data — passed through to
   * useWaveformData inside EmbedWaveform, matching TrackCard's behaviour.
   */
  waveformUrl?: string;
}

/**
 * Full "Embed" tab panel.
 *
 * Renders in order:
 *   1. Style picker thumbnails (with real cover art)
 *   2. Generated code box (iframe / WordPress)
 *   3. Options (color, height, feature toggles)
 *   4. Live playable preview
 *
 * @example
 * <EmbedTabContent
 *   resourceUrl="https://decibel.app/artist/ocean-eyes"
 *   title="Ocean Eyes"
 *   artist="Billie Eilish"
 *   coverUrl="/uploads/cover.jpg"
 *   duration="3:20"
 *   playback={playerTrack}
 *   queueTracks={queueTracks}
 *   waveformData={item.waveform}
 * />
 */
export const EmbedTabContent: FC<EmbedTabContentProps> = ({
  resourceUrl,
  title,
  artist,
  coverUrl,
  duration,
  playback,
  queueTracks,
  waveformData,
  waveformUrl,
}) => {
  const {
    config,
    setStyle,
    setColor,
    setHeight,
    toggleAutoPlay,
    toggleShowComments,
    toggleShowRecommendations,
    toggleShowOverlays,
  } = useEmbedConfig({ resourceUrl });

  // Only recompute embed code strings when config changes
  const iframeCode = useMemo(() => buildIframeCode(config), [config]);
  const wordPressCode = useMemo(() => buildWordPressCode(config), [config]);

  return (
    <div className="flex flex-col gap-4">
      <EmbedStylePicker
        selected={config.style}
        onSelect={setStyle}
        coverUrl={coverUrl}
        title={title}
      />

      <EmbedCodeBox iframeCode={iframeCode} wordPressCode={wordPressCode} />

      <EmbedOptions
        config={config}
        onColorChange={setColor}
        onHeightChange={setHeight}
        onToggleAutoPlay={toggleAutoPlay}
        onToggleShowComments={toggleShowComments}
        onToggleShowRecommendations={toggleShowRecommendations}
        onToggleShowOverlays={toggleShowOverlays}
      />

      <EmbedPreview
        config={config}
        title={title}
        artist={artist}
        coverUrl={coverUrl}
        duration={duration}
        playback={playback}
        queueTracks={queueTracks}
        waveformData={waveformData}
        waveformUrl={waveformUrl}
      />
    </div>
  );
};