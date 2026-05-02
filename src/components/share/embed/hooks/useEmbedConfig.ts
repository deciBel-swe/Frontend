'use client';

/**
 * @file useEmbedConfig.ts
 * @description Custom hook encapsulating all embed configuration state.
 * Follows the Custom Hook pattern — keeps component files thin.
 */

import { useState, useCallback } from 'react';
import {
  type EmbedConfig,
  type EmbedStyle,
  STYLE_HEIGHT_MAP,
} from '../services/embedService';

interface UseEmbedConfigOptions {
  /** The public URL of the resource being embedded. */
  resourceUrl: string;
}

interface UseEmbedConfigReturn {
  config: EmbedConfig;
  setStyle: (style: EmbedStyle) => void;
  setColor: (color: string) => void;
  setHeight: (height: number) => void;
  toggleAutoPlay: () => void;
  toggleShowComments: () => void;
  toggleShowRecommendations: () => void;
  toggleShowOverlays: () => void;
}

/**
 * Manages the full state of an embed configuration.
 *
 * @param options - Initial options including the resource URL.
 * @returns Config state and individual setters / togglers.
 *
 * @example
 * const { config, setStyle, setColor } = useEmbedConfig({ resourceUrl: 'https://...' });
 */
export function useEmbedConfig({ resourceUrl }: UseEmbedConfigOptions): UseEmbedConfigReturn {
  const [config, setConfig] = useState<EmbedConfig>({
    resourceUrl,
    style: 'visual',
    color: '#ff5500',
    height: STYLE_HEIGHT_MAP.visual,
    autoPlay: false,
    showComments: true,
    showRecommendations: true,
    showOverlays: true,
  });

  const setStyle = useCallback((style: EmbedStyle) => {
    setConfig(prev => ({
      ...prev,
      style,
      height: STYLE_HEIGHT_MAP[style],
    }));
  }, []);

  const setColor = useCallback((color: string) => {
    setConfig(prev => ({ ...prev, color }));
  }, []);

  const setHeight = useCallback((height: number) => {
    setConfig(prev => ({ ...prev, height }));
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setConfig(prev => ({ ...prev, autoPlay: !prev.autoPlay }));
  }, []);

  const toggleShowComments = useCallback(() => {
    setConfig(prev => ({ ...prev, showComments: !prev.showComments }));
  }, []);

  const toggleShowRecommendations = useCallback(() => {
    setConfig(prev => ({ ...prev, showRecommendations: !prev.showRecommendations }));
  }, []);

  const toggleShowOverlays = useCallback(() => {
    setConfig(prev => ({ ...prev, showOverlays: !prev.showOverlays }));
  }, []);

  return {
    config,
    setStyle,
    setColor,
    setHeight,
    toggleAutoPlay,
    toggleShowComments,
    toggleShowRecommendations,
    toggleShowOverlays,
  };
}