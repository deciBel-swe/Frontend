'use client';

/**
 * @file EmbedPreview.tsx
 * @description Visual mock of the embedded player widget.
 *
 * Since this is a SoundCloud *clone* (not SoundCloud itself), the iframe
 * widget URL points to your own app. Until the widget endpoint exists,
 * this component renders a faithful HTML mock of what the embedded player
 * will look like — matching the three style variants.
 *
 * Presenter component — receives config + track metadata via props.
 */

import { type FC } from 'react';
import Image from 'next/image';
import type { EmbedConfig, EmbedStyle } from './embedService';
import { LogoIcon } from '@/components/icons/NavIcons';

// Deterministic waveform data — no Math.random() to avoid hydration issues
const WAVEFORM_BARS = [
  40, 65, 80, 55, 70, 90, 45, 75, 60, 85, 50, 70, 40, 60, 80,
  55, 75, 65, 90, 45, 70, 55, 80, 60, 75, 50, 65, 85, 45, 70,
  60, 80, 55, 70, 40, 65, 90, 50, 75, 60,
];

interface EmbedPreviewProps {
  config: EmbedConfig;
  /** Track or playlist title. */
  title: string;
  /** Artist or owner name. */
  artist: string;
  /** Cover image URL. */
  coverUrl?: string;
  /** Track duration string e.g. "3:20". */
  duration?: string;
  /** Accent color override (uses config.color by default). */
}

/** Small waveform rendered as inline divs. */
function Waveform({
  color,
  playedFraction = 0.27,
}: {
  color: string;
  playedFraction?: number;
}) {
  return (
    <div className="flex h-8 items-end gap-px">
      {WAVEFORM_BARS.map((pct, i) => {
        const played = i / WAVEFORM_BARS.length < playedFraction;
        return (
          <div
            key={i}
            className="w-1 rounded-sm"
            style={{
              height: `${pct}%`,
              backgroundColor: played ? color : '#d4d4d4',
              opacity: played ? 1 : 0.8,
            }}
          />
        );
      })}
    </div>
  );
}

/** The orange circular play button. */
function PlayBtn({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {/* Triangle */}
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `${size * 0.2}px solid transparent`,
          borderBottom: `${size * 0.2}px solid transparent`,
          borderLeft: `${size * 0.3}px solid white`,
          marginLeft: size * 0.06,
        }}
      />
    </div>
  );
}

/** App brand mark shown in top-right (mimics "SoundCloud ≋≋" watermark). */
function BrandMark() {
  return (
    <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
      <LogoIcon />
      Decibel
    </span>
  );
}

// ─── VISUAL STYLE PREVIEW ────────────────────────────────────────────────────

/** Full-bleed cover with play/waveform bar overlaid at the bottom. */
function VisualPreview({
  title,
  artist,
  coverUrl,
  duration,
  color,
}: {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded" style={{ height: 300 }}>
      {/* Cover image / fallback */}
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="448px"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {artist}
          </span>
          <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
            {title}
          </span>
        </div>
        <BrandMark />
      </div>

      {/* Bottom gradient + controls */}
      <div
        className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <PlayBtn color={color} size={36} />
          <div className="flex-1">
            <Waveform color={color} />
          </div>
          <span className="text-[10px] tabular-nums text-white/80">{duration ?? '0:00'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MINI STYLE PREVIEW ───────────────────────────────────────────────────────

/** Compact single-row player. */
function MiniPreview({
  title,
  artist,
  coverUrl,
  duration,
  color,
}: {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded border border-border-default bg-white p-3" style={{ height: 90 }}>
      {/* Cover */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="h-full w-full bg-neutral-200" />
        )}
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayBtn color={color} size={28} />
        </div>
      </div>

      {/* Info + waveform */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[10px] text-neutral-400">{artist}</p>
        <p className="truncate text-xs font-semibold text-neutral-800">{title}</p>
        <Waveform color={color} />
      </div>

      {/* Duration + brand */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <BrandMark />
        <span className="text-[10px] tabular-nums text-neutral-400">{duration ?? '0:00'}</span>
      </div>
    </div>
  );
}

// ─── CLASSIC/TEXT STYLE PREVIEW ───────────────────────────────────────────────

/** Player bar on top + a list of tracks below. */
function TextPreview({
  title,
  artist,
  coverUrl,
  duration,
  color,
}: {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
}) {
  const fakeTracks = [title, 'Another Track', 'Third Wave', 'Late Night', 'Echoes'];

  return (
    <div className="flex flex-col overflow-hidden rounded border border-border-default bg-white" style={{ minHeight: 200 }}>
      {/* Player bar */}
      <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
          {coverUrl ? (
            <Image src={coverUrl} alt={title} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="h-full w-full bg-neutral-200" />
          )}
        </div>
        <PlayBtn color={color} size={24} />
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <p className="truncate text-[9px] text-neutral-400">{artist}</p>
          <Waveform color={color} />
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
          {duration ?? '0:00'}
        </span>
        <BrandMark />
      </div>

      {/* Track list */}
      {fakeTracks.map((t, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
            i === 0
              ? 'bg-neutral-50 font-semibold text-neutral-800'
              : 'text-neutral-500 hover:bg-neutral-50'
          }`}
        >
          <span className="w-4 shrink-0 text-center text-[10px] text-neutral-300">{i + 1}</span>
          <span className="flex-1 truncate">{t}</span>
          <span className="shrink-0 text-[10px] tabular-nums text-neutral-300">
            {['3:20', '4:05', '2:58', '5:12', '3:44'][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── STYLE → COMPONENT MAP ────────────────────────────────────────────────────

const PREVIEW_MAP: Record<
  EmbedStyle,
  FC<{ title: string; artist: string; coverUrl?: string; duration?: string; color: string }>
> = {
  visual: VisualPreview,
  mini: MiniPreview,
  text: TextPreview,
};

// ─── PUBLIC COMPONENT ─────────────────────────────────────────────────────────

/**
 * Mock embed player preview — renders a faithful HTML simulation of the
 * embedded widget so the user can see exactly what their embed will look like.
 *
 * @param config   - Current embed config (style, color, height, etc.)
 * @param title    - Track/playlist title.
 * @param artist   - Artist/owner name.
 * @param coverUrl - Cover image URL.
 * @param duration - Duration string, e.g. "3:20".
 */
export const EmbedPreview: FC<EmbedPreviewProps> = ({
  config,
  title,
  artist,
  coverUrl,
  duration,
}) => {
  const PreviewComponent = PREVIEW_MAP[config.style];

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
        Preview
      </p>
      <PreviewComponent
        title={title}
        artist={artist}
        coverUrl={coverUrl}
        duration={duration}
        color={config.color}
      />
    </div>
  );
};