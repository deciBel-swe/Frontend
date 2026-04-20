'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface InfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '400px',
  threshold = 0,
}: InfiniteScrollOptions): { sentinelRef: (node: HTMLDivElement | null) => void } {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) {
            return;
          }

          if (!hasMore || isLoading) {
            return;
          }

          onLoadMore();
        },
        {
          root: null,
          rootMargin,
          threshold,
        }
      );

      observerRef.current.observe(node);
    },
    [hasMore, isLoading, onLoadMore, rootMargin, threshold]
  );

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
    },
    []
  );

  return { sentinelRef };
}
