'use client';

/**
 * @file EmbedTabContent.tsx
 * @description Container component for the "Embed" tab inside ShareModal.
 * Orchestrates useEmbedConfig and delegates rendering to focused sub-components.
 * Follows the Container/Presenter pattern — logic here, UI in child presenters.
 */

import { type FC, useMemo } from 'react';
import { useEmbedConfig } from '@/components/share/embed/hooks/useEmbedConfig';
import { buildIframeCode, buildWordPressCode } from '@/components/share/embed/services/embedService';
import { EmbedStylePicker } from '@/components/share/embed/EmbedStylePicker';
import { EmbedCodeBox } from '@/components/share/embed/EmbedCodeBox';
import { EmbedOptions } from '@/components/share/embed/EmbedOptions';
import { EmbedPreview } from '@/components/share/embed/EmbedPreview';

interface EmbedTabContentProps {
  resourceUrl: string;
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  waveformData?: number[];
  waveformUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  durationSeconds?: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
}

/**
 * Full "Embed" tab panel.
 * Composes style picker → code box → options → live preview.
 *
 * @param resourceUrl - The canonical resource URL to embed.
 * @param title - The title of the track or playlist.
 * @param artist - The artist or owner of the track or playlist.
 * @param coverUrl - The URL of the cover image.
 * @param duration - The duration of the track.
 *
 * @example
 * <EmbedTabContent resourceUrl="https://soundground.app/tracks/ocean-eyes" />
 */
export const EmbedTabContent: FC<EmbedTabContentProps> = ({
  resourceUrl,
  title,
  artist,
  coverUrl,
  duration,
  waveformData,
  waveformUrl,
  isPlaying,
  currentTime,
  durationSeconds,
  onPlayPause,
  onWaveformSeek,
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

  /** Memoised so codes only regenerate when config actually changes. */
  const iframeCode = useMemo(() => buildIframeCode(config), [config]);
  const wordPressCode = useMemo(() => buildWordPressCode(config), [config]);

  return (
    <div className="flex flex-col gap-4">
       <EmbedStylePicker
        selected={config.style}
        onSelect={setStyle}
        coverUrl={coverUrl}
        title={title}
        artist={artist}
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
        waveformData={waveformData}
        waveformUrl={waveformUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        durationSeconds={durationSeconds}
        onPlayPause={onPlayPause}
        onWaveformSeek={onWaveformSeek}
      />
    </div>
  );
};