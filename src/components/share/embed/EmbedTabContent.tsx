'use client';

/**
 * @file EmbedTabContent.tsx
 * @description Container component for the "Embed" tab inside ShareModal.
 * Orchestrates useEmbedConfig and delegates rendering to focused sub-components.
 * Follows the Container/Presenter pattern — logic here, UI in child presenters.
 */

import { type FC, useMemo } from 'react';
import { useEmbedConfig } from '@/components/share/embed/useEmbedConfig';
import { buildIframeCode, buildWordPressCode } from '@/components/share/embed/embedService';
import { EmbedStylePicker } from '@/components/share/embed/EmbedStylePicker';
import { EmbedCodeBox } from '@/components/share/embed/EmbedCodeBox';
import { EmbedOptions } from '@/components/share/embed/EmbedOptions';
import { EmbedPreview } from '@/components/share/embed/EmbedPreview';

interface EmbedTabContentProps {
  /** The public URL of the resource to embed (your app's URL, not SoundCloud). */
  resourceUrl: string;
  /** Track/playlist title shown in thumbnails and preview. */
  title: string;
  /** Artist/owner name shown in thumbnails and preview. */
  artist: string;
  /** Cover image URL injected into thumbnails and preview. */
  coverUrl?: string;
  /** Duration string e.g. "3:20" shown in preview. */
  duration?: string;
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

      <EmbedPreview config={config} />
    </div>
  );
};