'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { discoveryService } from '@/services';
import type {
  PaginatedSearchResponseDTO,
  ResourceRefFullDTO,
} from '@/types/discovery';
import type { SearchParams } from '@/services/api/discoveryService';
import { useSearchNavigation } from '@/features/search/hooks/useSearchNavigation';
import type {
  SearchBuckets,
  SearchFetchResult,
  SearchRequestContext,
  SearchUiTab,
  UseSearchPageDataResult,
} from '@/features/search/types/searchContracts';
import {
  EMPTY_SEARCH_BUCKETS,
  EMPTY_SEARCH_TOTALS,
  SEARCH_PAGE_SIZE,
  mapTabToApiType,
} from '@/features/search/types/searchContracts';
import {
  mapPlaylistResourceToPlaylistCard,
  mapResourceToEverythingOrderItem,
  mapTrackResourceToTrackCard,
  mapUserResourceToUserCard,
  mergeEverythingOrder,
  mergeSearchBuckets,
} from '@/features/search/mappers/searchResultMappers';
import { useInfiniteScrollSentinel } from '@/features/search/hooks/useInfiniteScrollSentinel';

const SEARCH_DEBOUNCE_MS = 350;

const withEmptyBuckets = (): SearchBuckets => EMPTY_SEARCH_BUCKETS();

const isAbortError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as {
    name?: string;
    code?: string;
    message?: string;
  };

  return (
    maybeError.name === 'AbortError' ||
    maybeError.name === 'CanceledError' ||
    maybeError.code === 'ERR_CANCELED'
  );
};

export function createSearchRequestKey(input: {
  query: string;
  tab: SearchUiTab;
  page: number;
  size: number;
  genre?: string;
}): string {
  return [
    input.tab,
    input.query,
    String(input.page),
    String(input.size),
    input.genre ?? '',
  ].join('|');
}

export function shouldFetchNextPage(input: {
  hasMore: boolean;
  isLoading: boolean;
  query: string;
}): boolean {
  if (!input.hasMore || input.isLoading) {
    return false;
  }

  return input.query.trim().length > 0;
}

export function deriveHasMore(meta: {
  isLast: boolean;
  pageNumber: number;
  totalPages: number;
}): boolean {
  if (meta.isLast) {
    return false;
  }

  return meta.pageNumber < Math.max(0, meta.totalPages - 1);
}

export function buildSearchParams(input: SearchRequestContext): SearchParams {
  return {
    q: input.query,
    type: mapTabToApiType(input.tab),
    page: input.page,
    size: input.size,
    genre: input.genre,
  };
}

export function transformSearchResponse(
  response: PaginatedSearchResponseDTO,
  tab: SearchUiTab
): SearchFetchResult {
  const buckets = withEmptyBuckets();
  const everythingOrder: SearchFetchResult['everythingOrder'] = [];

  response.content.forEach((resource: ResourceRefFullDTO) => {
    if (tab === 'everything' || tab === 'tracks') {
      const track = mapTrackResourceToTrackCard(resource);
      if (track) {
        buckets.tracks.push(track);
        if (tab === 'everything') {
          everythingOrder.push({ kind: 'track', id: track.trackId });
        }
      }
    }

    if (tab === 'everything' || tab === 'playlists') {
      const playlist = mapPlaylistResourceToPlaylistCard(resource);
      if (playlist) {
        buckets.playlists.push(playlist);
        if (tab === 'everything') {
          everythingOrder.push({ kind: 'playlist', id: playlist.trackId });
        }
      }
    }

    if (tab === 'everything' || tab === 'people') {
      const user = mapUserResourceToUserCard(resource);
      if (user) {
        buckets.people.push(user);
        if (tab === 'everything') {
          everythingOrder.push({ kind: 'user', id: user.id });
        }
      }
    }

    if (tab !== 'everything') {
      return;
    }

    const fallbackOrderItem = mapResourceToEverythingOrderItem(resource);
    if (!fallbackOrderItem) {
      return;
    }

    const alreadyExists = everythingOrder.some(
      (item) =>
        item.kind === fallbackOrderItem.kind && item.id === fallbackOrderItem.id
    );

    if (!alreadyExists) {
      everythingOrder.push(fallbackOrderItem);
    }
  });

  const totals: SearchFetchResult['totals'] = {};

  if (tab === 'tracks') {
    totals.totalTracks = response.totalElements;
  } else if (tab === 'playlists') {
    totals.totalPlaylists = response.totalElements;
  } else if (tab === 'people') {
    totals.totalPeople = response.totalElements;
  } else {
    totals.totalTracks = buckets.tracks.length;
    totals.totalPlaylists = buckets.playlists.length;
    totals.totalPeople = buckets.people.length;
  }

  return {
    buckets,
    totals,
    pageNumber: response.pageNumber,
    totalPages: response.totalPages,
    totalElements: response.totalElements,
    isLast: response.isLast,
    everythingOrder,
  };
}

export function useSearchPageData(
  tabOverride?: SearchUiTab
): UseSearchPageDataResult {
  const { query, currentTab, activeFilters } = useSearchNavigation(tabOverride);

  const debouncedQuery = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const genreFilter = activeFilters.genre || undefined;

  const [buckets, setBuckets] = useState<SearchBuckets>(withEmptyBuckets);
  const [everythingOrder, setEverythingOrder] =
    useState<UseSearchPageDataResult['everythingOrder']>([]);
  const [totals, setTotals] = useState(EMPTY_SEARCH_TOTALS);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestCounterRef = useRef(0);
  const loadedRequestKeysRef = useRef<Set<string>>(new Set());
  const inFlightRequestKeyRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const bucketsRef = useRef<SearchBuckets>(withEmptyBuckets());
  const everythingOrderRef = useRef<UseSearchPageDataResult['everythingOrder']>(
    []
  );

  const resetState = useCallback(() => {
    const emptyBuckets = withEmptyBuckets();
    bucketsRef.current = emptyBuckets;
    everythingOrderRef.current = [];
    loadedRequestKeysRef.current.clear();
    inFlightRequestKeyRef.current = null;

    setBuckets(emptyBuckets);
    setEverythingOrder([]);
    setTotals(EMPTY_SEARCH_TOTALS);
    setPage(0);
    setHasMore(false);
    setErrorMessage(null);
    setIsInitialLoading(false);
    setIsPaginating(false);
  }, []);

  const fetchPage = useCallback(
    async (nextPage: number) => {
      const normalizedQuery = debouncedQuery.trim();

      if (normalizedQuery.length === 0) {
        return;
      }

      const requestContext: SearchRequestContext = {
        query: normalizedQuery,
        tab: currentTab,
        page: nextPage,
        size: SEARCH_PAGE_SIZE,
        genre: genreFilter,
      };

      const requestKey = createSearchRequestKey({
        query: requestContext.query,
        tab: requestContext.tab,
        page: requestContext.page,
        size: requestContext.size,
        genre: requestContext.genre,
      });

      if (
        loadedRequestKeysRef.current.has(requestKey) ||
        inFlightRequestKeyRef.current === requestKey
      ) {
        return;
      }

      const controller = new AbortController();
      requestContext.signal = controller.signal;

      abortControllerRef.current?.abort();
      abortControllerRef.current = controller;

      inFlightRequestKeyRef.current = requestKey;
      setErrorMessage(null);

      if (nextPage === 0) {
        setIsInitialLoading(true);
      } else {
        setIsPaginating(true);
      }

      const requestId = ++requestCounterRef.current;

      try {
        const response = await discoveryService.search(buildSearchParams(requestContext), {
          signal: requestContext.signal,
        });

        if (requestId !== requestCounterRef.current) {
          return;
        }

        const transformed = transformSearchResponse(response, currentTab);
        loadedRequestKeysRef.current.add(requestKey);
        setPage(nextPage);
        setHasMore(
          deriveHasMore({
            isLast: transformed.isLast,
            pageNumber: transformed.pageNumber,
            totalPages: transformed.totalPages,
          })
        );

        const nextBuckets =
          nextPage === 0
            ? transformed.buckets
            : mergeSearchBuckets(bucketsRef.current, transformed.buckets);

        bucketsRef.current = nextBuckets;
        setBuckets(nextBuckets);

        const nextEverythingOrder =
          nextPage === 0
            ? transformed.everythingOrder
            : mergeEverythingOrder(
                everythingOrderRef.current,
                transformed.everythingOrder
              );

        everythingOrderRef.current = nextEverythingOrder;
        setEverythingOrder(nextEverythingOrder);

        if (currentTab === 'everything') {
          setTotals({
            totalTracks: nextBuckets.tracks.length,
            totalPlaylists: nextBuckets.playlists.length,
            totalPeople: nextBuckets.people.length,
          });
        } else {
          setTotals({
            totalTracks: transformed.totals.totalTracks ?? 0,
            totalPlaylists: transformed.totals.totalPlaylists ?? 0,
            totalPeople: transformed.totals.totalPeople ?? 0,
          });
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        setErrorMessage('Failed to load search results. Please try again.');
        setHasMore(false);
      } finally {
        if (requestId === requestCounterRef.current) {
          inFlightRequestKeyRef.current = null;
          setIsInitialLoading(false);
          setIsPaginating(false);
        }
      }
    },
    [currentTab, debouncedQuery, genreFilter]
  );

  useEffect(() => {
    requestCounterRef.current += 1;
    abortControllerRef.current?.abort();

    resetState();

    if (debouncedQuery.trim().length === 0) {
      return;
    }

    void fetchPage(0);
  }, [debouncedQuery, currentTab, genreFilter, fetchPage, resetState]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  const isLoading = isInitialLoading || isPaginating;

  const loadNextPage = useCallback(() => {
    if (
      !shouldFetchNextPage({
        hasMore,
        isLoading,
        query: debouncedQuery,
      })
    ) {
      return;
    }

    void fetchPage(page + 1);
  }, [debouncedQuery, fetchPage, hasMore, isLoading, page]);

  const retry = useCallback(() => {
    requestCounterRef.current += 1;
    abortControllerRef.current?.abort();
    loadedRequestKeysRef.current.clear();
    inFlightRequestKeyRef.current = null;

    if (debouncedQuery.trim().length === 0) {
      return;
    }

    void fetchPage(0);
  }, [debouncedQuery, fetchPage]);

  const { sentinelRef } = useInfiniteScrollSentinel({
    hasMore,
    isLoading,
    onLoadMore: loadNextPage,
  });

  const queueTracks = useMemo(
    () => buckets.tracks.flatMap((track) => (track.playback ? [track.playback] : [])),
    [buckets.tracks]
  );

  const tracks = useMemo(
    () =>
      buckets.tracks.map((track) => ({
        ...track,
        queueTracks,
        queueSource: 'unknown' as const,
      })),
    [buckets.tracks, queueTracks]
  );

  return {
    query,
    tab: currentTab,
    tracks,
    playlists: buckets.playlists,
    people: buckets.people,
    totalTracks: totals.totalTracks,
    totalPlaylists: totals.totalPlaylists,
    totalPeople: totals.totalPeople,
    page,
    hasMore,
    isLoading,
    isInitialLoading,
    isPaginating,
    everythingOrder,
    errorMessage,
    loadNextPage,
    retry,
    sentinelRef,
  };
}
