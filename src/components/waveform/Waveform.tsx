'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { generateWaveform } from '@/utils/generateWaveform';

type WaveformValue = number | string;

const MIN_WAVEFORM_LENGTH = 200;
const BAR_SLOT_WIDTH_PX = 3;
const MIN_VISIBLE_BARS = 150;

export type TimedComment = {
  id: string;
  timestamp: number;
  comment: string;
  user: { name: string; avatar: string };
};

interface WaveformProps {
  file?: File | null;
  data?: WaveformValue[];
  className?: string;
  barClassName?: string;
  onGenerated?: (data: number[]) => void;
  onWaveformClick?: (percent: number) => void;
  currentTime?: number;
  durationSeconds?: number;
  comments?: TimedComment[];
  pendingTimestamp?: number | null;
}

const normalizeWaveform = (values: WaveformValue[] | undefined): number[] => {
  if (!values || values.length === 0) return [];
  const normalized = values.map((value) => {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(1, parsed));
  });

  if (normalized.length >= MIN_WAVEFORM_LENGTH) return normalized;

  return [
    ...normalized,
    ...Array.from({ length: MIN_WAVEFORM_LENGTH - normalized.length }, () => 0),
  ];
};

export default function Waveform({
  file,
  data,
  className,
  barClassName,
  onGenerated,
  onWaveformClick,
  currentTime = 0,
  durationSeconds = 1,
  comments = [],
  pendingTimestamp = null,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [waveform, setWaveform] = useState<number[]>(() =>
    normalizeWaveform(data)
  );
  const [containerWidth, setContainerWidth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(nextWidth);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setWaveform(normalizeWaveform(data));
  }, [data]);

  useEffect(() => {
    let isCancelled = false;
    if (!file) return;

    setLoading(true);
    setError(null);

    generateWaveform(file)
      .then((values) => {
        if (isCancelled) return;
        const normalized = normalizeWaveform(values);
        setWaveform(normalized);
        onGenerated?.(normalized);
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to generate waveform');
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [file, onGenerated]);

  const bars = useMemo(() => {
    if (!waveform.length) return [];
    const dynamicBarCount = Math.max(
      MIN_VISIBLE_BARS,
      Math.floor(containerWidth / BAR_SLOT_WIDTH_PX)
    );
    const visibleWaveform = waveform.slice(0, dynamicBarCount);

    return visibleWaveform.map((value, index) => ({
      key: `bar-${index}`,
      mainHeight: Math.max(2, Math.round(value * 100)),
      mirroredHeight: Math.max(1, Math.round(value * 40)),
    }));
  }, [waveform, containerWidth]);

  const currentBarIndex = Math.floor((currentTime / durationSeconds) * bars.length);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString();
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const activeCommentId = pendingTimestamp !== null ? 'pending' : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full cursor-pointer group ${className ?? ''}`}
    >
      {loading ? (
        <div className="text-xs text-text-muted">Generating waveform...</div>
      ) : error ? (
        <div className="text-xs text-status-error">{error}</div>
      ) : bars.length === 0 ? (
        <div className="text-xs text-text-muted">No waveform data yet.</div>
      ) : (
        <>
          {/* Floating time labels */}
          <div className="absolute w-full flex justify-between items-center -translate-y-1/2 pointer-events-none top-1/2 px-1">
            <div
              className="absolute top-5 transform -translate-y-1/2 text-[10px] px-1 rounded bg-surface-overlay text-text-on-brand pointer-events-none">
              {formatTime(currentTime)}
            </div>
            <div className="absolute top-5 right-0 transform -translate-y-1/2 text-[10px] px-1 rounded bg-surface-overlay text-text-on-brand pointer-events-none">
              {formatTime(durationSeconds)}
            </div>
          </div>

          {/* Waveform + mirror + comments */}
          <div className="flex flex-col items-center gap-[2px] relative group">
            {/* Top waveform */}
            <div className="flex items-end gap-px transition-opacity duration-200 opacity-60 group-hover:opacity-100">
              {bars.map((bar, index) => (
                <div
                  key={bar.key}
                  className={`w-0.5 rounded-xs ${
                    index <= currentBarIndex
                      ? 'bg-brand-accent' // active bar color
                      : barClassName ?? 'bg-text-muted'
                  }`}
                  style={{ height: bar.mainHeight }}
                  onClick={(e) => {
                    if (!onWaveformClick || !containerRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    onWaveformClick(percent);
                  }}
                />
              ))}
            </div>

            {/* Comments */}
            <div
              className="absolute flex gap-1 pointer-events-none transition-all duration-200"
              style={{ bottom: bars[0]?.mirroredHeight + 2 }}
            >
              {[...comments, ...(pendingTimestamp ? [{ id: 'pending', timestamp: pendingTimestamp, comment: '', user: { name: '', avatar: '' } }] : [])].map(
                (c) => {
                  const leftPercent = durationSeconds
                    ? (c.timestamp / durationSeconds) * 100
                    : 0;
                  const isActive = c.id === activeCommentId;
                  return (
                    <div
                      key={c.id}
                      className="absolute bottom-0 transition-all duration-200"
                      style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                    >
                      <img
                        src={c.user.avatar}
                        className={`rounded-full object-cover border border-border-default shadow-sm cursor-pointer ${
                          isActive ? 'w-6 h-6' : 'w-4 h-4'
                        }`}
                      />
                    </div>
                  );
                }
              )}
            </div>

            {/* Mirrored waveform */}
            <div className="flex items-start gap-px transition-opacity duration-200 opacity-50 group-hover:opacity-70">
              {bars.map((bar, index) => (
                <div
                  key={bar.key + '-mirrored'}
                        className={`w-0.5 rounded-xs ${
        index <= currentBarIndex
          ? 'bg-brand-muted' // active bar color
          : barClassName ?? 'bg-text-muted'
      }`}

                  style={{ height: bar.mirroredHeight }}
                  onClick={(e) => {
                    if (!onWaveformClick || !containerRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    onWaveformClick(percent);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}