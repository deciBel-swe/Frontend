'use client';

/**
 * @file EmbedStylePicker.tsx
 * @description Three-option embed style selector (visual / mini / text).
 * Each button renders an SVG thumbnail that mimics the SoundCloud widget style.
 * Follows the Presenter pattern — pure UI, receives config via props.
 */

import { type FC } from 'react';
import type { EmbedStyle } from './embedService';

interface EmbedStylePickerProps {
  selected: EmbedStyle;
  onSelect: (style: EmbedStyle) => void;
}

/** SVG thumbnail for the large "visual" player (full cover + waveform). */
function VisualThumbnail() {
  return (
    <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* cover image area */}
      <rect x="0" y="0" width="80" height="40" rx="2" fill="currentColor" opacity="0.15" />
      {/* play button */}
      <circle cx="14" cy="20" r="8" fill="currentColor" opacity="0.5" />
      <path d="M11.5 16.5 L11.5 23.5 L18 20 Z" fill="white" />
      {/* waveform bars */}
      {[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56].map((x, i) => (
        <rect
          key={x}
          x={24 + x}
          y={18 - (i % 3 === 0 ? 6 : i % 3 === 1 ? 3 : 1)}
          width="3"
          height={i % 3 === 0 ? 12 : i % 3 === 1 ? 6 : 3}
          rx="1"
          fill="currentColor"
          opacity="0.4"
        />
      ))}
      {/* metadata strip */}
      <rect x="4" y="44" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      <rect x="4" y="50" width="20" height="2" rx="1" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/** SVG thumbnail for the "mini" player (compact single row). */
function MiniThumbnail() {
  return (
    <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* cover image */}
      <rect x="2" y="10" width="20" height="20" rx="2" fill="currentColor" opacity="0.15" />
      <circle cx="12" cy="20" r="5" fill="currentColor" opacity="0.4" />
      <path d="M10 17 L10 23 L15 20 Z" fill="white" />
      {/* info + waveform block */}
      <rect x="26" y="11" width="25" height="2.5" rx="1.25" fill="currentColor" opacity="0.35" />
      <rect x="26" y="16" width="18" height="2" rx="1" fill="currentColor" opacity="0.2" />
      {[0, 4, 8, 12, 16, 20, 24].map((x, i) => (
        <rect
          key={x}
          x={26 + x}
          y={22 - (i % 2 === 0 ? 3 : 1)}
          width="3"
          height={i % 2 === 0 ? 6 : 3}
          rx="1"
          fill="currentColor"
          opacity="0.35"
        />
      ))}
    </svg>
  );
}

/** SVG thumbnail for the "text" / classic player (waveform + text list). */
function TextThumbnail() {
  return (
    <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* top bar */}
      <rect x="2" y="6" width="76" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <circle cx="10" cy="14" r="5" fill="currentColor" opacity="0.4" />
      {[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44].map((x, i) => (
        <rect
          key={x}
          x={18 + x}
          y={11 - (i % 3 === 0 ? 3 : 1)}
          width="3"
          height={i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 2}
          rx="1"
          fill="currentColor"
          opacity="0.3"
        />
      ))}
      {/* text list rows */}
      <rect x="2" y="27" width="60" height="2.5" rx="1.25" fill="currentColor" opacity="0.25" />
      <rect x="2" y="33" width="50" height="2.5" rx="1.25" fill="currentColor" opacity="0.2" />
      <rect x="2" y="39" width="55" height="2.5" rx="1.25" fill="currentColor" opacity="0.2" />
      <rect x="2" y="45" width="45" height="2.5" rx="1.25" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

const STYLES: { id: EmbedStyle; label: string; Thumb: FC }[] = [
  { id: 'visual', label: 'Visual', Thumb: VisualThumbnail },
  { id: 'mini', label: 'Mini', Thumb: MiniThumbnail },
  { id: 'text', label: 'Classic', Thumb: TextThumbnail },
];

/**
 * Renders three clickable style thumbnails for selecting the embed player style.
 *
 * @param selected - Currently active style.
 * @param onSelect - Called when user clicks a style thumbnail.
 */
export const EmbedStylePicker: FC<EmbedStylePickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-2">
      {STYLES.map(({ id, label, Thumb }) => {
        const isActive = selected === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            aria-label={`${label} embed style`}
            aria-pressed={isActive}
            className={`
              flex-1 rounded border p-1.5 transition-all duration-150
              ${
                isActive
                  ? 'border-brand-primary text-brand-primary ring-1 ring-brand-primary'
                  : 'border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary'
              }
            `}
          >
            <Thumb />
          </button>
        );
      })}
    </div>
  );
};