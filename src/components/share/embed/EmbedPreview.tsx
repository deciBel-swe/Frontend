'use client';

/**
 * @file EmbedPreview.tsx
 * @description Live iframe preview of the generated embed code.
 * Uses a sandbox iframe so the widget renders safely inside the modal.
 * Presenter component — receives the iframe src URL to render.
 */

import { type FC } from 'react';
import type { EmbedConfig } from './embedService';
import { STYLE_HEIGHT_MAP } from './embedService';

interface EmbedPreviewProps {
  config: EmbedConfig;
}

/**
 * Renders a live iframe preview of the SoundCloud embed widget.
 * Height is capped at a preview-friendly size regardless of configured height.
 *
 * @param config - The current embed configuration used to build the widget src.
 */
export const EmbedPreview: FC<EmbedPreviewProps> = ({ config }) => {
  const params = new URLSearchParams({
    url: config.resourceUrl,
    color: config.color.replace('#', '%23'),
    auto_play: 'false', // never autoplay in previews
    hide_related: String(!config.showRecommendations),
    show_comments: String(config.showComments),
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'true',
    visual: String(config.style === 'visual'),
  });

  const src = `https://w.soundcloud.com/player/?${params.toString()}`;

  // Cap preview height so the modal doesn't become too tall
  const previewHeight = Math.min(config.height, STYLE_HEIGHT_MAP.visual);

  return (
    <div
      className="overflow-hidden rounded border border-border-default"
      style={{ height: previewHeight }}
    >
      <iframe
        title="Embed preview"
        src={src}
        width="100%"
        height={previewHeight}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        className="block"
      />
    </div>
  );
};