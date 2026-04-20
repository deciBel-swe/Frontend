'use client';

import { useEffect, useMemo, useState } from 'react';

const clampWaveformSample = (value: number): number => {
  return Math.max(0, Math.min(1, value));
};

const toWaveformSamples = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry))
      .map(clampWaveformSample);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return [];
    }

    try {
      return toWaveformSamples(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    const payload = value as Record<string, unknown>;
    if ('waveformData' in payload) {
      return toWaveformSamples(payload.waveformData);
    }

    if ('samples' in payload) {
      return toWaveformSamples(payload.samples);
    }
  }

  return [];
};

const parseWaveformDataUrl = (waveformUrl: string): number[] | null => {
  if (!waveformUrl.startsWith('data:')) {
    return null;
  }

  const commaIndex = waveformUrl.indexOf(',');
  if (commaIndex < 0) {
    return [];
  }

  const encodedPayload = waveformUrl.slice(commaIndex + 1);

  try {
    return toWaveformSamples(decodeURIComponent(encodedPayload));
  } catch {
    return [];
  }
};

const isSameWaveform = (left: number[], right: number[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((sample, index) => sample === right[index]);
};

export function useWaveformData(
  waveformData: number[] | undefined,
  waveformUrl: string | undefined
): number[] {
  const isTestEnvironment = process.env.NODE_ENV === 'test';

  const normalizedWaveformData = useMemo(
    () => toWaveformSamples(waveformData),
    [waveformData]
  );

  const [resolvedWaveform, setResolvedWaveform] = useState<number[]>(
    normalizedWaveformData
  );

  useEffect(() => {
    let isCancelled = false;

    if (normalizedWaveformData.length > 0) {
      setResolvedWaveform((previous) =>
        isSameWaveform(previous, normalizedWaveformData)
          ? previous
          : normalizedWaveformData
      );
      return;
    }

    if (!waveformUrl || waveformUrl.trim().length === 0) {
      setResolvedWaveform([]);
      return;
    }

    const embeddedWaveform = parseWaveformDataUrl(waveformUrl);
    if (embeddedWaveform) {
      setResolvedWaveform(embeddedWaveform);
      return;
    }

    if (isTestEnvironment) {
      setResolvedWaveform([]);
      return;
    }

    const fetchWaveform = async () => {
      if (typeof fetch !== 'function') {
        if (!isCancelled) {
          setResolvedWaveform([]);
        }
        return;
      }

      try {
        const response = await fetch(waveformUrl);
        if (!response.ok) {
          if (!isCancelled) {
            setResolvedWaveform([]);
          }
          return;
        }

        const payload = (await response.json()) as unknown;
        if (!isCancelled) {
          setResolvedWaveform(toWaveformSamples(payload));
        }
      } catch {
        if (!isCancelled) {
          setResolvedWaveform([]);
        }
      }
    };

    void fetchWaveform();

    return () => {
      isCancelled = true;
    };
  }, [isTestEnvironment, normalizedWaveformData, waveformUrl]);

  return resolvedWaveform;
}
