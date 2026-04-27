/**
 * @file embedService.ts
 * @description Pure utility functions for generating embed codes.
 * Follows the Service Layer pattern — no side effects, easily testable.
 */
import { config as appConfig } from '@/config';

/** The visual style of the embedded player. */
export type EmbedStyle = 'visual' | 'mini' | 'text';

/** All configurable options for an embed. */
export interface EmbedConfig {
  /** Resource URL to embed (track or playlist). */
  resourceUrl: string;
  style: EmbedStyle;
  /** Accent color in hex format, e.g. "#ff5500". */
  color: string;
  /** Player height in pixels. */
  height: number;
  autoPlay: boolean;
  showComments: boolean;
  showRecommendations: boolean;
  showOverlays: boolean;
}

/** Maps embed style to the SoundCloud widget visual param. */
const STYLE_VISUAL_MAP: Record<EmbedStyle, boolean> = {
  visual: true,
  mini: false,
  text: false,
};

/** Maps embed style to fixed heights used by SoundCloud. */
export const STYLE_HEIGHT_MAP: Record<EmbedStyle, number> = {
  visual: 300,
  mini: 166,
  text: 400,
};

/**
 * Builds the query-string params for the SoundCloud widget URL.
 *
 * @param config - Full embed configuration.
 * @returns Encoded query string (without leading "?").
 */
// function buildWidgetParams(config: EmbedConfig): string {
//   const params = new URLSearchParams({
//     url: config.resourceUrl,
//     color: config.color.replace('#', '%23'),
//     auto_play: String(config.autoPlay),
//     hide_related: String(!config.showRecommendations),
//     show_comments: String(config.showComments),
//     show_user: 'true',
//     show_reposts: 'false',
//     show_teaser: 'true',
//     visual: String(STYLE_VISUAL_MAP[config.style]),
//   });
//   return params.toString();
// }

/**
 * Generates the standard HTML iframe embed code.
 *
 * @param config - Full embed configuration.
 * @returns Ready-to-paste iframe string.
 */
export function buildIframeCode(config: EmbedConfig): string {
 const embedUrl = buildEmbedUrl(config);
  // const frameHeight = config.height || 400;

  return `<iframe width="100%" height="${config.height}" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}" ></iframe>`;
}
function buildEmbedUrl(config: EmbedConfig): string {
  const base = appConfig.api.appUrl;
  const baseUrl = `${base}/embed/player`;
  const params = new URLSearchParams({
    trackId: config.resourceUrl, // resourceUrl holds the track ID
    color: config.color.replace('#', ''),
    auto_play: String(config.autoPlay),
    hide_related: String(!config.showRecommendations),
    show_comments: String(config.showComments),
    show_overlays: String(config.showOverlays),
    visual: String(STYLE_VISUAL_MAP[config.style]),
  });
  return `${baseUrl}?${params.toString()}`;
}
/**
 * Generates the WordPress shortcode equivalent.
 *
 * @param config - Full embed configuration.
 * @returns WordPress embed shortcode string.
 */
export function buildWordPressCode(config: EmbedConfig): string {
  return `[decibel url="${config.resourceUrl}" params="color=%23${config.color.replace('#', '')}&auto_play=${config.autoPlay}&hide_related=${!config.showRecommendations}&show_comments=${config.showComments}&show_user=true&show_reposts=false&show_teaser=true&visual=${STYLE_VISUAL_MAP[config.style]}" width="100%" height="${config.height}" iframe="true" /]`;
}

/** Preset color swatches shown in the embed options panel. */
export const EMBED_COLOR_PRESETS = [
  '#ff5500', // brand orange
  '#333333', // dark
  '#999999', // mid grey
  '#cccccc', // light grey
  '#e4e4e4', // off-white
] as const;

/** Available height options for the height dropdown. */
export const EMBED_HEIGHT_OPTIONS = [166, 300, 400, 450] as const;