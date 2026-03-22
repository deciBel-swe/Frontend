'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { generateWaveform } from '@/utils/generateWaveform';

type WaveformValue = number | string;
const MIN_WAVEFORM_LENGTH = 200;
const BAR_SLOT_WIDTH_PX = 3;
const MIN_VISIBLE_BARS = 150;

interface WaveformProps {
  file?: File | null;
  data?: WaveformValue[];
  height?: number;
  className?: string;
  barClassName?: string;
  onGenerated?: (data: number[]) => void;
}

const normalizeWaveform = (values: WaveformValue[] | undefined): number[] => {
  if (!values || values.length === 0) return [];
  const normalized = values.map((value) => {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(1, parsed));
  });

  if (normalized.length >= MIN_WAVEFORM_LENGTH) {
    return normalized;
  }

  return [
    ...normalized,
    ...Array.from({ length: MIN_WAVEFORM_LENGTH - normalized.length }, () => 0),
  ];
};

export default function Waveform({
  file,
  data,
  height = 300,
  className,
  barClassName,
  onGenerated,
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
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(nextWidth);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
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
        setError(
          err instanceof Error ? err.message : 'Failed to generate waveform'
        );
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

    return visibleWaveform.map((value, index) => {
      const barHeight = Math.max(2, Math.round(value * height));
      return { key: `bar-${index}`, height: barHeight };
    });
  }, [waveform, height, containerWidth]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className ?? ''}`}>
      {loading ? (
        <div className="text-xs text-text-muted">Generating waveform...</div>
      ) : error ? (
        <div className="text-xs text-status-error">{error}</div>
      ) : bars.length === 0 ? (
        <div className="text-xs text-text-muted">No waveform data yet.</div>
      ) : (
        <div className="flex items-center gap-px" style={{ height }}>
          {bars.map((bar) => (
            <div
              key={bar.key}
              className={`w-0.5 rounded-xs bg-brand-primary ${barClassName ?? ''}`}
              style={{ height: bar.height }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
