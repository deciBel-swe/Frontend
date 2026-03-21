'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateWaveform } from '@/utils/generateWaveform';

type WaveformValue = number | string;

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
  return values.map((value) => {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(1, parsed));
  });
};

export default function Waveform({
  file,
  data,
  height = 300,
  className,
  barClassName,
  onGenerated,
}: WaveformProps) {
  const [waveform, setWaveform] = useState<number[]>(() =>
    normalizeWaveform(data)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return waveform.map((value, index) => {
      const barHeight = Math.max(2, Math.round(value * height));
      return { key: `bar-${index}`, height: barHeight };
    });
  }, [waveform, height]);

  return (
    <div className={`w-full ${className ?? ''}`}>
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
