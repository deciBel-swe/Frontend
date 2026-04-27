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
import { useWaveformData } from '@/hooks/useWaveformData';
import Waveform from '@/components/waveform/Waveform';

// Fallback waveform — used only when no real data is available
const FALLBACK_WAVEFORM: number[] = [
  0.40, 0.65, 0.80, 0.55, 0.70, 0.90, 0.45, 0.75, 0.60, 0.85,
  0.50, 0.70, 0.40, 0.60, 0.80, 0.55, 0.75, 0.65, 0.90, 0.45,
  0.70, 0.55, 0.80, 0.60, 0.75, 0.50, 0.65, 0.85, 0.45, 0.70,
  0.60, 0.80, 0.55, 0.70, 0.40, 0.65, 0.90, 0.50, 0.75, 0.60,
];

interface EmbedPreviewProps {
  config: EmbedConfig;
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  waveformData?: number[];
  waveformUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  durationSeconds?: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
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

/** App brand mark shown in top-right  watermark. */
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
  waveformData,
  currentTime,
  durationSeconds,
  onPlayPause,
  onWaveformSeek,
}: {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
  waveformData: number[];
  currentTime: number;
  durationSeconds: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded" style={{ height: 300 }}>
      {coverUrl ? (
        <Image src={coverUrl} alt={title} fill className="object-cover" sizes="448px" />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2">
        <div className="flex flex-col items-start gap-1">
          <span className=" bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {artist}
          </span>
          <span className=" bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {title}
          </span>
        </div>
        <BrandMark />
      </div>

      {/* Bottom gradient + controls */}
      <div
        className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onPlayPause} className="shrink-0">
            <PlayBtn color={color} size={36} />
          </button>
          <div className="flex-1">
            <Waveform
              data={waveformData}
              currentTime={currentTime}
              durationSeconds={durationSeconds}
              onWaveformClick={onWaveformSeek}
              barClassName="bg-text-muted hover:bg-brand-primary"
            />
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
  waveformData,
  currentTime,
  durationSeconds,
  onPlayPause,
  onWaveformSeek,
}: {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
  waveformData: number[];
  currentTime: number;
  durationSeconds: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded border border-border-default bg-white p-3" style={{ height: 90 }}>
      {/* Cover + play overlay */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="h-full w-full bg-neutral-200" />
        )}
        <button
          onClick={onPlayPause}
          className="absolute inset-0 flex items-center justify-center"
        >
          <PlayBtn color={color} size={28} />
        </button>
      </div>

      {/* Info + waveform */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[10px] text-neutral-400">{artist}</p>
        <p className="truncate text-xs font-semibold text-neutral-800">{title}</p>
        <Waveform
          data={waveformData}
          currentTime={currentTime}
          durationSeconds={durationSeconds}
          onWaveformClick={onWaveformSeek}
          barClassName="bg-text-muted hover:bg-brand-primary"
        />
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
  waveformData,
  currentTime,
  durationSeconds,
  onPlayPause,
  onWaveformSeek,
}: {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
  waveformData: number[];
  currentTime: number;
  durationSeconds: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
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
        <button onClick={onPlayPause} className="shrink-0">
          <PlayBtn color={color} size={24} />
        </button>
        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <p className="truncate text-[9px] text-neutral-400">{artist}</p>
          <Waveform
            data={waveformData}
            currentTime={currentTime}
            durationSeconds={durationSeconds}
            onWaveformClick={onWaveformSeek}
            barClassName="bg-text-muted hover:bg-brand-primary"
          />
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

type PreviewComponentProps = {
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  color: string;
  waveformData: number[];
  currentTime: number;
  durationSeconds: number;
  onPlayPause?: () => void;
  onWaveformSeek?: (fraction: number) => void;
};

const PREVIEW_MAP: Record<EmbedStyle, FC<PreviewComponentProps>> = {
  visual: VisualPreview,
  mini: MiniPreview,
  text: TextPreview,
};

// ─── PUBLIC COMPONENT ─────────────────────────────────────────────────────────

export const EmbedPreview: FC<EmbedPreviewProps> = ({
  config,
  title,
  artist,
  coverUrl,
  duration,
  waveformData,
  waveformUrl,
  isPlaying: _isPlaying,
  currentTime = 0,
  durationSeconds = 1,
  onPlayPause,
  onWaveformSeek,
}) => {
  const PreviewComponent = PREVIEW_MAP[config.style];

  const resolvedSamples = useWaveformData(waveformData, waveformUrl);
  const waveformForPreview = resolvedSamples.length > 0 ? resolvedSamples : FALLBACK_WAVEFORM;

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
        waveformData={waveformForPreview}
        currentTime={currentTime}
        durationSeconds={durationSeconds}
        onPlayPause={onPlayPause}
        onWaveformSeek={onWaveformSeek}
      />
    </div>
  );
};