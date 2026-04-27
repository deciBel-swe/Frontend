/**
 * @file index.ts
 * @description Barrel export for the embed feature.
 * Import from '@/components/share/embed' for clean absolute imports.
 */

export { EmbedTabContent } from './EmbedTabContent';
export { EmbedStylePicker } from './EmbedStylePicker';
export { EmbedCodeBox } from './EmbedCodeBox';
export { EmbedOptions } from './EmbedOptions';
export { EmbedPreview } from './EmbedPreview';
export { useEmbedConfig } from './hooks/useEmbedConfig';
export {
  buildIframeCode,
  buildWordPressCode,
  EMBED_COLOR_PRESETS,
  EMBED_HEIGHT_OPTIONS,
  STYLE_HEIGHT_MAP,
  type EmbedConfig,
  type EmbedStyle,
} from './services/embedService';