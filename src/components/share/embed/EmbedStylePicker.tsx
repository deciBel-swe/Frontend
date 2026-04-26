'use client';

/**
 * @file EmbedStylePicker.tsx
 * @description Three-option embed style selector (visual / mini / text).
 * Each thumbnail renders a miniature version of that player style using
 * the actual track cover art when available.
 * Follows the Presenter pattern — pure UI, receives config via props.
 */

import { type FC } from 'react';
import type { EmbedStyle } from './embedService';

interface EmbedStylePickerProps {
  selected: EmbedStyle;
  onSelect: (style: EmbedStyle) => void;
  /** Track/playlist cover image URL — shown inside the thumbnails. */
  coverUrl?: string;
  title?: string;
  artist?: string;
}

// Deterministic waveform bar heights — avoids hydration mismatch from Math.random()
const WAVEFORM_HEIGHTS = [6, 10, 14, 8, 12, 16, 6, 10, 8, 14, 12, 6, 10, 8, 12];

/** Shared mini waveform used across all thumbnails. */
function MiniWaveform({
  x,
  y,
  color = '#ff5500',
  opacity = 0.7,
}: {
  x: number;
  y: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <>
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <rect
          key={i}
          x={x + i * 3.5}
          y={y - h / 2}
          width="2.5"
          height={h}
          rx="1"
          fill={color}
          opacity={opacity}
        />
      ))}
    </>
  );
}

/** Reusable orange play button (circle + triangle). */
function PlayButton({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#ff5500" />
      <path
        d={`M${cx - r * 0.3} ${cy - r * 0.4} L${cx - r * 0.3} ${cy + r * 0.4} L${cx + r * 0.45} ${cy} Z`}
        fill="white"
      />
    </>
  );
}

/** Dark placeholder square when no cover image is available. */
function CoverFallback({ x, y, size }: { x: number; y: number; size: number }) {
  return <rect x={x} y={y} width={size} height={size} rx="2" fill="#2a2a2a" />;
}

/** ── VISUAL: full-width cover + gradient + play + waveform ── */
function VisualThumbnail({
  coverUrl,
  title,
}: {
  coverUrl?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <defs>
        <clipPath id="visual-clip">
          <rect x="0" y="0" width="120" height="58" rx="2" />
        </clipPath>
        <linearGradient id="visual-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="black" stopOpacity="0.05" />
          <stop offset="100%" stopColor="black" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {coverUrl ? (
        <image
          href={coverUrl}
          x="0" y="0" width="120" height="58"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#visual-clip)"
        />
      ) : (
        <CoverFallback x={0} y={0} size={58} />
      )}

      {/* Gradient overlay for readability */}
      <rect x="0" y="0" width="120" height="58" fill="url(#visual-grad)" rx="2" />

      <PlayButton cx={14} cy={42} r={8} />
      <MiniWaveform x={26} y={42} color="white" opacity={0.85} />

      {/* Bottom metadata bar */}
      <rect x="0" y="58" width="120" height="22" fill="white" />
      <rect x="5" y="63" width="45" height="3" rx="1.5" fill="#bbb" />
      {title && (
        <text x="5" y="74" fontSize="5" fill="#555" fontFamily="sans-serif">
          {title.slice(0, 22)}
        </text>
      )}
    </svg>
  );
}

/** ── MINI: small square cover on the left + waveform on the right ── */
function MiniThumbnail({ coverUrl }: { coverUrl?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <rect width="120" height="80" fill="white" rx="2" />
      <defs>
        <clipPath id="mini-clip">
          <rect x="4" y="20" width="36" height="36" rx="2" />
        </clipPath>
      </defs>

      {coverUrl ? (
        <image
          href={coverUrl}
          x="4" y="20" width="36" height="36"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#mini-clip)"
        />
      ) : (
        <CoverFallback x={4} y={20} size={36} />
      )}

      <PlayButton cx={22} cy={38} r={7} />

      {/* Info text */}
      <rect x="46" y="22" width="38" height="3.5" rx="1.75" fill="#555" opacity="0.5" />
      <rect x="46" y="29" width="28" height="2.5" rx="1.25" fill="#aaa" opacity="0.5" />

      {/* Waveform */}
      <MiniWaveform x={46} y={42} color="#ff5500" opacity={0.6} />

      {/* Duration */}
      <rect x="46" y="52" width="16" height="2" rx="1" fill="#ddd" />
    </svg>
  );
}

// /** ── CLASSIC: compact player bar on top + track list rows below ── */
// function TextThumbnail({ coverUrl }: { coverUrl?: string }) {
//   return (
//     <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
//       <rect width="120" height="80" fill="white" rx="2" />

//       {/* Top player bar */}
//       <rect x="0" y="0" width="120" height="22" rx="2" fill="#f5f5f5" />

//       <defs>
//         <clipPath id="text-clip">
//           <rect x="2" y="2" width="18" height="18" rx="1" />
//         </clipPath>
//       </defs>
//       {coverUrl ? (
//         <image
//           href={coverUrl}
//           x="2" y="2" width="18" height="18"
//           preserveAspectRatio="xMidYMid slice"
//           clipPath="url(#text-clip)"
//         />
//       ) : (
//         <CoverFallback x={2} y={2} size={18} />
//       )}

//       <PlayButton cx={11} cy={11} r={5} />
//       <MiniWaveform x={24} y={11} color="#ff5500" opacity={0.6} />

//       {/* Track rows */}
//       {[28, 36, 44, 52, 60].map((y, i) => (
//         <rect
//           key={y}
//           x="4" y={y}
//           width={[80, 65, 72, 55, 68][i]}
//           height="3" rx="1.5"
//           fill={i === 0 ? '#ccc' : '#e8e8e8'}
//         />
//       ))}
//     </svg>
//   );
// }

const STYLES: {
  id: EmbedStyle;
  label: string;
  Thumb: FC<{ coverUrl?: string; title?: string }>;
}[] = [
  { id: 'visual', label: 'Visual', Thumb: VisualThumbnail },
  { id: 'mini', label: 'Mini', Thumb: MiniThumbnail },
//   { id: 'text', label: 'Classic', Thumb: TextThumbnail },
];

/**
 * Three clickable thumbnails for choosing the embed player style.
 * Thumbnails show the actual cover art when provided.
 *
 * @param selected - Currently active style.
 * @param onSelect - Callback when a style is selected.
 * @param coverUrl - Optional cover URL injected into each thumbnail.
 * @param title    - Optional title shown in the visual thumbnail footer.
 */
export const EmbedStylePicker: FC<EmbedStylePickerProps> = ({
  selected,
  onSelect,
  coverUrl,
  title,
}) => {
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
              flex-1 overflow-hidden rounded border p-1 transition-all duration-150
              ${
                isActive
                  ? 'border-brand-primary ring-1 ring-brand-primary'
                  : 'border-border-default hover:border-border-strong'
              }
            `}
          >
            <Thumb coverUrl={coverUrl} title={title} />
          </button>
        );
      })}
    </div>
  );
};