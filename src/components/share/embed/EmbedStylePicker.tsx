'use client';

/**
 * @file EmbedStylePicker.tsx
 * @description Three-option embed style selector (visual / mini / text).
 */

import { type FC } from 'react';
import type { EmbedStyle } from './services/embedService';

interface EmbedStylePickerProps {
  selected: EmbedStyle;
  onSelect: (style: EmbedStyle) => void;
  coverUrl?: string;
  title?: string;
  artist?: string;
}

const WAVEFORM_HEIGHTS = [6, 10, 14, 8, 12, 16, 6, 10, 8, 14, 12, 6, 10, 8, 12];

function MiniWaveform({
  x,
  y,
  colorClass = 'fill-brand-primary',
  opacity = 0.7,
}: {
  x: number;
  y: number;
  colorClass?: string;
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
          className={colorClass}
          opacity={opacity}
        />
      ))}
    </>
  );
}

function PlayButton({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} className="fill-brand-primary" />
      <path
        d={`M${cx - r * 0.3} ${cy - r * 0.4} L${cx - r * 0.3} ${cy + r * 0.4} L${cx + r * 0.45} ${cy} Z`}
        className="fill-neutral-0"
      />
    </>
  );
}

function CoverFallback({ x, y, size }: { x: number; y: number; size: number }) {
  return <rect x={x} y={y} width={size} height={size} rx="2" className="fill-surface-raised" />;
}

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

      <rect x="0" y="0" width="120" height="58" fill="url(#visual-grad)" rx="2" />

      <PlayButton cx={14} cy={42} r={8} />
      <MiniWaveform x={26} y={42} colorClass="fill-neutral-0" opacity={0.85} />

      <rect x="0" y="58" width="120" height="22" className="fill-surface-default" />
      <rect x="5" y="63" width="45" height="3" rx="1.5" className="fill-text-secondary/30" />
      {title && (
        <text x="5" y="74" fontSize="5" className="fill-text-secondary" fontFamily="sans-serif">
          {title.slice(0, 22)}
        </text>
      )}
    </svg>
  );
}

function MiniThumbnail({ coverUrl }: { coverUrl?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <rect width="120" height="80" className="fill-surface-default" rx="2" />
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

      <rect x="46" y="22" width="38" height="3.5" rx="1.75" className="fill-text-primary" opacity="0.5" />
      <rect x="46" y="29" width="28" height="2.5" rx="1.25" className="fill-text-secondary" opacity="0.5" />

      <MiniWaveform x={46} y={42} colorClass="fill-brand-primary" opacity={0.6} />

      <rect x="46" y="52" width="16" height="2" rx="1" className="fill-border-strong" />
    </svg>
  );
}

const STYLES: {
  id: EmbedStyle;
  label: string;
  Thumb: FC<{ coverUrl?: string; title?: string }>;
}[] = [
  { id: 'visual', label: 'Visual', Thumb: VisualThumbnail },
  { id: 'mini', label: 'Mini', Thumb: MiniThumbnail },
];

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