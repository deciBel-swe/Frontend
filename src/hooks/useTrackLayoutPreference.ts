'use client';

import { useCallback, useEffect, useState } from 'react';

export type TrackLayoutPreference = 'compact' | 'non-compact';

const STORAGE_KEY = 'you.track-layout.preference';

export function useTrackLayoutPreference(defaultValue: TrackLayoutPreference = 'compact') {
  const [layout, setLayoutState] = useState<TrackLayoutPreference>(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'compact' || stored === 'non-compact') {
      setLayoutState(stored);
    }
  }, []);

  const setLayout = useCallback((nextLayout: TrackLayoutPreference) => {
    setLayoutState(nextLayout);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLayout);
    }
  }, []);

  return {
    layout,
    setLayout,
    isCompact: layout === 'compact',
  };
}
