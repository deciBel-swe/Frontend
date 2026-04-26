'use client';

/**
 * @file EmbedOptions.tsx
 * @description Embed configuration options panel.
 * Contains color swatches + hex input, height selector, and feature toggles.
 * Presenter component — all state managed externally via the useEmbedConfig hook.
 */

import { type FC, type ChangeEvent } from 'react';
import { EMBED_COLOR_PRESETS, EMBED_HEIGHT_OPTIONS, type EmbedConfig } from './embedService';

interface EmbedOptionsProps {
  config: EmbedConfig;
  onColorChange: (color: string) => void;
  onHeightChange: (height: number) => void;
  onToggleAutoPlay: () => void;
  onToggleShowComments: () => void;
  onToggleShowRecommendations: () => void;
  onToggleShowOverlays: () => void;
}

/** A single option checkbox row. */
function OptionCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2 ${
        disabled ? 'cursor-not-allowed opacity-40' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-3.5 w-3.5 accent-brand-primary"
      />
      <span className="text-xs text-text-secondary">{label}</span>
    </label>
  );
}

/**
 * Full options panel: color pickers, height dropdown, feature checkboxes.
 *
 * @param config - Current embed configuration snapshot.
 * @param onColorChange - Called with new hex color string.
 * @param onHeightChange - Called with new height in pixels.
 * @param onToggle* - Individual feature toggle handlers.
 */
export const EmbedOptions: FC<EmbedOptionsProps> = ({
  config,
  onColorChange,
  onHeightChange,
  onToggleAutoPlay,
  onToggleShowComments,
  onToggleShowRecommendations,
  onToggleShowOverlays,
}) => {
  const handleHexInput = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Accept partial input while typing; validate on blur is handled by native color picker
    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
      onColorChange(val);
    }
  };

  const handleHeightSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onHeightChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Options</p>

      {/* Color row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-secondary">Color:</span>

        {/* Preset swatches */}
        {EMBED_COLOR_PRESETS.map(preset => (
          <button
            key={preset}
            aria-label={`Set color to ${preset}`}
            onClick={() => onColorChange(preset)}
            className={`h-5 w-5 rounded-sm border-2 transition-transform hover:scale-110 ${
              config.color === preset ? 'border-text-primary' : 'border-transparent'
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}

        {/* Hex input */}
        <input
          type="text"
          value={config.color}
          onChange={handleHexInput}
          maxLength={7}
          aria-label="Custom hex color"
          className="w-20 rounded border border-border-default bg-surface-default px-2 py-0.5 font-mono text-xs text-text-primary outline-none focus:border-border-brand"
        />

        {/* Native color picker as a wheel button */}
        <label
          className="relative h-5 w-5 cursor-pointer overflow-hidden rounded-full border border-border-default"
          aria-label="Open color picker"
          title="Custom color"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            }}
          />
          <input
            type="color"
            value={config.color}
            onChange={e => onColorChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>

        {/* Height */}
        <span className="ml-auto text-xs text-text-secondary">Height:</span>
        <select
          value={config.height}
          onChange={handleHeightSelect}
          aria-label="Player height"
          className="rounded border border-border-default bg-surface-default px-2 py-0.5 text-xs text-text-primary outline-none focus:border-border-brand"
        >
          {EMBED_HEIGHT_OPTIONS.map(h => (
            <option key={h} value={h}>
              {h}px
            </option>
          ))}
        </select>
      </div>

      {/* Feature checkboxes */}
      <div className="flex flex-col gap-1.5">
        <OptionCheckbox
          label="Enable automatic play"
          checked={config.autoPlay}
          onChange={onToggleAutoPlay}
        />
        <OptionCheckbox
          label="Show comments"
          checked={config.showComments}
          onChange={onToggleShowComments}
        />
        <OptionCheckbox
          label="Show recommendations"
          checked={config.showRecommendations}
          onChange={onToggleShowRecommendations}
        />
        <OptionCheckbox
          label="Show Decibel overlays"
          checked={config.showOverlays}
          onChange={onToggleShowOverlays}
        />
      </div>
    </div>
  );
};