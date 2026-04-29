'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useInfiniteScrollSentinel } from '@/features/search/hooks/useInfiniteScrollSentinel';

type PaginatedResponseMeta = {
  pageNumber?: number;
  number?: number;
  totalPages?: number;
  totalElements?: number;
  isLast?: boolean;
  last?: boolean;
};

export type InfinitePaginatedPage<T> = PaginatedResponseMeta & {
  items: T[];
};

type UseInfinitePaginatedResourceOptions<T> = {
  enabled?: boolean;
  pageSize: number;
  resetKey: string;
  fetchPage: (
    pageNumber: number,
    pageSize: number
  ) => Promise<InfinitePaginatedPage<T>>;
  dedupeBy?: (item: T) => string;
  initialErrorMessage?: string;
};

export type UseInfinitePaginatedResourceResult<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalElements: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  isPaginating: boolean;
  isError: boolean;
  errorMessage: string | null;
  loadNextPage: () => void;
  retry: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
};

const deriveHasMore = (page: InfinitePaginatedPage<unknown>): boolean => {
  const isLastPage = page.isLast ?? page.last;
  if (typeof isLastPage === 'boolean') {
    return !isLastPage;
  }

  const currentPage = page.pageNumber ?? page.number;
  if (
    typeof currentPage === 'number' &&
    typeof page.totalPages === 'number'
  ) {
    return currentPage + 1 < page.totalPages;
  }

  return page.items.length > 0;
};

const mergeItems = <T,>(
  previous: T[],
  incoming: T[],
  dedupeBy?: (item: T) => string
): T[] => {
  if (!dedupeBy) {
    return [...previous, ...incoming];
  }

  const merged = [...previous];
  const seen = new Set(previous.map(dedupeBy));

  for (const item of incoming) {
    const key = dedupeBy(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(item);
  }

  return merged;
};

export function useInfinitePaginatedResource<T>({
  enabled = true,
  pageSize,
  resetKey,
  fetchPage,
  dedupeBy,
  initialErrorMessage = 'Failed to load more items. Please try again.',
}: UseInfinitePaginatedResourceOptions<T>): UseInfinitePaginatedResourceResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const itemsRef = useRef<T[]>([]);
  const pageRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  const dedupeByRef = useRef(dedupeBy);
  const initialErrorMessageRef = useRef(initialErrorMessage);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    dedupeByRef.current = dedupeBy;
  }, [dedupeBy]);

  useEffect(() => {
    initialErrorMessageRef.current = initialErrorMessage;
  }, [initialErrorMessage]);

  const loadPage = useCallback(
    async (nextPage: number) => {
      if (!enabled) {
        return;
      }

      const requestId = ++requestIdRef.current;
      setErrorMessage(null);
      setIsError(false);

      if (nextPage === 0) {
        setIsInitialLoading(true);
      } else {
        setIsPaginating(true);
      }

      try {
        const response = await fetchPageRef.current(nextPage, pageSize);
        if (requestId !== requestIdRef.current) {
          return;
        }

        const nextItems =
          nextPage === 0
            ? response.items
            : mergeItems(itemsRef.current, response.items, dedupeByRef.current);

        itemsRef.current = nextItems;
        pageRef.current = nextPage;
        setItems(nextItems);
        setPage(nextPage);
        setTotalPages(response.totalPages ?? 0);
        setTotalElements(response.totalElements ?? nextItems.length);
        setHasMore(deriveHasMore(response));
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setIsError(true);
        setErrorMessage(initialErrorMessageRef.current);
        if (nextPage === 0) {
          itemsRef.current = [];
          pageRef.current = 0;
          setItems([]);
          setHasMore(false);
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsInitialLoading(false);
          setIsPaginating(false);
        }
      }
    },
    [enabled, pageSize]
  );

  useEffect(() => {
    requestIdRef.current += 1;
    itemsRef.current = [];
    pageRef.current = 0;
    setItems([]);
    setPage(0);
    setTotalPages(0);
    setTotalElements(0);
    setHasMore(false);
    setIsInitialLoading(false);
    setIsPaginating(false);
    setIsError(false);
    setErrorMessage(null);

    if (!enabled) {
      return;
    }

    void loadPage(0);
  }, [enabled, loadPage, resetKey]);

  const isLoading = isInitialLoading || isPaginating;

  const loadNextPage = useCallback(() => {
    if (!enabled || !hasMore || isLoading) {
      return;
    }

    void loadPage(pageRef.current + 1);
  }, [enabled, hasMore, isLoading, loadPage]);

  const retry = useCallback(() => {
    if (!enabled) {
      return;
    }

    void loadPage(0);
  }, [enabled, loadPage]);

  const { sentinelRef } = useInfiniteScrollSentinel({
    hasMore,
    isLoading,
    onLoadMore: loadNextPage,
  });

  return {
    items,
    page,
    totalPages,
    totalElements,
    hasMore,
    isLoading,
    isInitialLoading,
    isPaginating,
    isError,
    errorMessage,
    loadNextPage,
    retry,
    sentinelRef,
  };
}
