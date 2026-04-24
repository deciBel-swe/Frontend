'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TrackListItem } from '@/components/tracks/TrackList';
import { useAuth } from '@/features/auth/useAuth';
import DiscoverPage from '@/features/discover/DiscoverPage';
import type {
  DiscoverPlaylistItem,
  DiscoverTrackItem,
} from '@/features/discover/types/DiscoverTypes';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { discoveryService, playbackService, trackService } from '@/services';
import type { ResourceRefFullDTO, StationItemDTO } from '@/types/discovery';
import type { TrackMetaData } from '@/types/tracks';
import type { ListeningHistoryItem } from '@/types/user';
import { formatDuration } from '@/utils/formatDuration';

const PAGE_SIZE = 5;
const QUEUE_LOOKAHEAD_PAGES = 4;
const DEFAULT_AVATAR = '/images/default_avatar.png';
const DEFAULT_COVER = '/images/default_song_image.png';

type DiscoverTrackSeed = {
  id: number;
  title?: string;
  trackSlug?: string;
  artist?: {
    username?: string;
    displayName?: string;
    avatarUrl?: string | null;
  };
  coverUrl?: string | null;
  trackUrl?: string | null;
  access?: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW';
  genre?: string;
  playCount?: number;
  likeCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  isReposted?: boolean;
  durationSeconds?: number;
  waveformData?: unknown;
  createdAt?: string;
  postedText: string;
};

type PaginatedWindowResponse<T> = {
  content: T[];
  pageNumber?: number;
  number?: number;
  totalPages?: number;
  isLast?: boolean;
  last?: boolean;
};

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
) => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED' as const;
  }

  return 'PLAYABLE' as const;
};

const normalizeWaveform = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
      .map((item) => Math.max(0, Math.min(1, item)));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      return normalizeWaveform(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    const payload = value as Record<string, unknown>;
    if ('waveformData' in payload) {
      return normalizeWaveform(payload.waveformData);
    }

    if ('samples' in payload) {
      return normalizeWaveform(payload.samples);
    }
  }

  return [];
};

const resolveDurationSeconds = (
  track: {
    trackDurationSeconds?: number | null;
    durationSeconds?: number | null;
  } | null | undefined
): number | undefined => {
  if (
    typeof track?.trackDurationSeconds === 'number' &&
    track.trackDurationSeconds > 0
  ) {
    return track.trackDurationSeconds;
  }

  if (
    typeof track?.durationSeconds === 'number' &&
    track.durationSeconds > 0
  ) {
    return track.durationSeconds;
  }

  return undefined;
};

const resolveHasNextPage = <T,>(
  response: PaginatedWindowResponse<T>
): boolean => {
  const isLastPage = response.isLast ?? response.last;
  if (typeof isLastPage === 'boolean') {
    return !isLastPage;
  }

  const currentPage = response.pageNumber ?? response.number;
  if (
    typeof currentPage === 'number' &&
    typeof response.totalPages === 'number'
  ) {
    return currentPage + 1 < response.totalPages;
  }

  return response.content.length === PAGE_SIZE;
};

const loadPaginatedWindow = async <T,>(
  page: number,
  loadPage: (pageNumber: number) => Promise<PaginatedWindowResponse<T>>
): Promise<PaginatedWindowResponse<T>[]> => {
  const firstPage = await loadPage(page);
  const pages: PaginatedWindowResponse<T>[] = [
    {
      ...firstPage,
      content: firstPage.content ?? [],
    },
  ];
  let currentPageNumber = page + 1;
  let hasNextPage = resolveHasNextPage(firstPage);

  while (pages.length < QUEUE_LOOKAHEAD_PAGES + 1 && hasNextPage) {
    try {
      const response = await loadPage(currentPageNumber);
      pages.push({
        ...response,
        content: response.content ?? [],
      });
      hasNextPage = resolveHasNextPage(response);
      currentPageNumber += 1;
    } catch {
      break;
    }
  }

  return pages;
};

const mapTrackResourceToSeed = (
  resource: ResourceRefFullDTO
): DiscoverTrackSeed | null => {
  if (resource.resourceType !== 'TRACK' || !resource.track) {
    return null;
  }

  const track = resource.track;

  return {
    id: track.id,
    title: track.title,
    trackSlug: track.trackSlug,
    artist: track.artist,
    coverUrl: track.coverUrl,
    trackUrl: track.trackUrl,
    access: track.access,
    genre: track.genre,
    playCount: track.playCount,
    likeCount: track.likeCount,
    repostCount: track.repostCount,
    isLiked: track.isLiked,
    isReposted: track.isReposted,
    durationSeconds: resolveDurationSeconds(track),
    waveformData: (track as { waveformData?: unknown }).waveformData,
    createdAt: track.uploadDate || track.releaseDate,
    postedText: 'posted a track',
  };
};

const mapStationTrackToSeed = (stationItem: StationItemDTO): DiscoverTrackSeed => {
  const track = stationItem.track;

  return {
    id: track.id,
    title: track.title,
    trackSlug: track.trackSlug,
    artist: track.artist,
    coverUrl: track.coverUrl,
    trackUrl: track.trackUrl,
    access: track.access,
    genre: (track as { genre?: string }).genre,
    playCount: track.playCount,
    likeCount: track.likeCount,
    repostCount: track.repostCount,
    isLiked: track.isLiked,
    isReposted: track.isReposted,
    durationSeconds: resolveDurationSeconds(
      track as { trackDurationSeconds?: number; durationSeconds?: number }
    ),
    waveformData: (track as { waveformData?: unknown }).waveformData,
    createdAt: stationItem.createdAt,
    postedText: 'posted a track',
  };
};

const mapHistoryEntryToSeed = (entry: ListeningHistoryItem): DiscoverTrackSeed => ({
  id: entry.id,
  title: entry.title,
  postedText: 'played a track',
});

const buildTrackListItem = (
  seed: DiscoverTrackSeed,
  metadata: TrackMetaData | null
): TrackListItem => {
  const artistUsername =
    metadata?.artist.username ?? seed.artist?.username ?? 'unknown';
  const artistDisplayName =
    metadata?.artist.displayName?.trim() ||
    seed.artist?.displayName?.trim() ||
    undefined;
  const artistAvatar =
    metadata?.artist.avatarUrl ?? seed.artist?.avatarUrl ?? DEFAULT_AVATAR;
  const durationSeconds =
    metadata?.durationSeconds ?? seed.durationSeconds ?? undefined;

  return {
    trackId: String(seed.id),
    user: {
      username: artistUsername,
      displayName: artistDisplayName,
      avatar: artistAvatar,
    },
    postedText: seed.postedText,
    track: {
      id: seed.id,
      trackSlug: metadata?.trackSlug ?? seed.trackSlug,
      artist: {
        username: artistUsername,
        displayName: artistDisplayName,
        avatar: artistAvatar,
      },
      title: metadata?.title ?? seed.title ?? `Track ${seed.id}`,
      cover: metadata?.coverUrl ?? seed.coverUrl ?? DEFAULT_COVER,
      duration: durationSeconds ? formatDuration(durationSeconds) : '0:00',
      plays: metadata?.playCount ?? seed.playCount,
      createdAt:
        metadata?.uploadDate || metadata?.releaseDate || seed.createdAt,
      genre: metadata?.genre ?? seed.genre,
      durationSeconds,
      isLiked: metadata?.isLiked ?? seed.isLiked,
      isReposted: metadata?.isReposted ?? seed.isReposted,
      likeCount: metadata?.likeCount ?? seed.likeCount,
      repostCount: metadata?.repostCount ?? seed.repostCount,
      secretToken: metadata?.secretToken ?? ""
    },
    trackUrl: metadata?.trackUrl ?? seed.trackUrl ?? undefined,
    access: toPlaybackAccess(metadata?.access ?? seed.access),
    waveform:
      metadata?.waveformData ?? normalizeWaveform(seed.waveformData),
  };
};

const hydrateTrackSeed = async (
  seed: DiscoverTrackSeed
): Promise<TrackListItem> => {
  let metadata: TrackMetaData | null = null;

  try {
    metadata = await trackService.getTrackMetadata(seed.id);
  } catch {
    metadata = null;
  }

  return buildTrackListItem(seed, metadata);
};

const buildQueueTracksFromSeeds = (
  seeds: DiscoverTrackSeed[]
): PlayerTrack[] => {
  return seeds.flatMap((seed) => {
    const trackUrl = seed.trackUrl?.trim();
    if (!trackUrl) {
      return [];
    }

    return [
      playerTrackMappers.fromAdapterInput(
        {
          id: seed.id,
          title: seed.title ?? `Track ${seed.id}`,
          trackUrl,
          artist: seed.artist ?? { username: 'unknown' },
          coverUrl: seed.coverUrl ?? DEFAULT_COVER,
          waveformData: normalizeWaveform(seed.waveformData),
          durationSeconds: seed.durationSeconds,
        },
        {
          access: toPlaybackAccess(seed.access),
          fallbackArtistName:
            seed.artist?.displayName ??
            seed.artist?.username ??
            'Unknown Artist',
        }
      ),
    ];
  });
};

const buildQueueTracksFromItems = (items: TrackListItem[]): PlayerTrack[] => {
  return items.flatMap((item) => {
    const trackUrl = item.trackUrl?.trim();
    if (!trackUrl) {
      return [];
    }

    return [
      playerTrackMappers.fromAdapterInput(
        {
          id: item.track.id,
          title: item.track.title,
          trackUrl,
          artist: item.track.artist,
          coverUrl: item.track.cover,
          waveformData: item.waveform,
          durationSeconds: item.track.durationSeconds,
        },
        { access: item.access ?? 'PLAYABLE' }
      ),
    ];
  });
};

const buildDiscoverTrackItems = (
  items: TrackListItem[],
  queueTracks: PlayerTrack[],
  queueSource: QueueSource
): DiscoverTrackItem[] =>
  items.map((item) => ({
    item,
    queueTracks,
    queueSource,
  }));

export default function Page() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingLiked, setIsLoadingLiked] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingGenre, setIsLoadingGenre] = useState(true);
  const [isLoadingMoreTrending, setIsLoadingMoreTrending] = useState(true);

  const [trendingTracks, setTrendingTracks] = useState<DiscoverTrackItem[]>([]);
  const [likedTracks, setLikedTracks] = useState<DiscoverTrackItem[]>([]);
  const [recentlyPlayedItems, setRecentlyPlayedItems] = useState<
    (DiscoverTrackItem | DiscoverPlaylistItem)[]
  >([]);
  const [genreTracks, setGenreTracks] = useState<DiscoverTrackItem[]>([]);
  const [moreTrendingTracks, setMoreTrendingTracks] = useState<DiscoverTrackItem[]>(
    []
  );

  const [trendingPage, setTrendingPage] = useState(0);
  const [likedPage, setLikedPage] = useState(0);
  const [genrePage, setGenrePage] = useState(0);
  const [moreTrendingPage, setMoreTrendingPage] = useState(0);
  const [recentPage, setRecentPage] = useState(0);

  const [hasTrendingNextPage, setHasTrendingNextPage] = useState(false);
  const [hasLikedNextPage, setHasLikedNextPage] = useState(false);
  const [hasRecentNextPage, setHasRecentNextPage] = useState(false);
  const [hasGenreNextPage, setHasGenreNextPage] = useState(false);
  const [hasMoreTrendingNextPage, setHasMoreTrendingNextPage] = useState(false);

  useEffect(() => {
    if (isAuthLoading || isAuthenticated) {
      setTrendingTracks([]);
      setHasTrendingNextPage(false);
      setIsLoadingTrending(false);
      return;
    }

    let isCancelled = false;

    const loadTrending = async () => {
      setIsLoadingTrending(true);

      try {
        const offset = trendingPage * PAGE_SIZE;
        const limit =
          (trendingPage + QUEUE_LOOKAHEAD_PAGES + 1) * PAGE_SIZE;
        const response = await discoveryService.getTrending({ limit });

        const currentSeeds = response
          .slice(offset, offset + PAGE_SIZE)
          .flatMap((resource) => {
            const seed = mapTrackResourceToSeed(resource);
            return seed ? [seed] : [];
          });

        if (currentSeeds.length === 0 && trendingPage > 0) {
          if (!isCancelled) {
            setHasTrendingNextPage(false);
            setTrendingPage((value) => Math.max(0, value - 1));
          }
          return;
        }

        const queueSeeds = response
          .slice(
            offset,
            offset + (QUEUE_LOOKAHEAD_PAGES + 1) * PAGE_SIZE
          )
          .flatMap((resource) => {
            const seed = mapTrackResourceToSeed(resource);
            return seed ? [seed] : [];
          });
        const visibleItems = await Promise.all(currentSeeds.map(hydrateTrackSeed));
        const queueTracks = buildQueueTracksFromSeeds(queueSeeds);

        if (!isCancelled) {
          setTrendingTracks(
            buildDiscoverTrackItems(visibleItems, queueTracks, 'likes')
          );
          setHasTrendingNextPage(response.length > offset + PAGE_SIZE);
        }
      } catch {
        if (!isCancelled) {
          setTrendingTracks([]);
          setHasTrendingNextPage(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTrending(false);
        }
      }
    };

    void loadTrending();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, trendingPage]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setLikedTracks([]);
      setHasLikedNextPage(false);
      setIsLoadingLiked(false);
      return;
    }

    let isCancelled = false;

    const loadLikedStation = async () => {
      setIsLoadingLiked(true);

      try {
        const pages = await loadPaginatedWindow(likedPage, (pageNumber) =>
          discoveryService.getLikesStation({
            page: pageNumber,
            size: PAGE_SIZE,
          })
        );

        const currentSeeds = pages[0].content.map(mapStationTrackToSeed);

        if (currentSeeds.length === 0 && likedPage > 0) {
          if (!isCancelled) {
            setHasLikedNextPage(false);
            setLikedPage((value) => Math.max(0, value - 1));
          }
          return;
        }

        const queueSeeds = pages.flatMap((pageData) =>
          pageData.content.map(mapStationTrackToSeed)
        );
        const visibleItems = await Promise.all(currentSeeds.map(hydrateTrackSeed));
        const queueTracks = buildQueueTracksFromSeeds(queueSeeds);

        if (!isCancelled) {
          setLikedTracks(
            buildDiscoverTrackItems(visibleItems, queueTracks, 'likes')
          );
          setHasLikedNextPage(resolveHasNextPage(pages[0]));
        }
      } catch {
        if (!isCancelled) {
          setLikedTracks([]);
          setHasLikedNextPage(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingLiked(false);
        }
      }
    };

    void loadLikedStation();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, likedPage]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setGenreTracks([]);
      setHasGenreNextPage(false);
      setIsLoadingGenre(false);
      return;
    }

    let isCancelled = false;

    const loadGenreStation = async () => {
      setIsLoadingGenre(true);

      try {
        const pages = await loadPaginatedWindow(genrePage, (pageNumber) =>
          discoveryService.getGenreStation({
            page: pageNumber,
            size: PAGE_SIZE,
          })
        );

        const currentSeeds = pages[0].content.map(mapStationTrackToSeed);

        if (currentSeeds.length === 0 && genrePage > 0) {
          if (!isCancelled) {
            setHasGenreNextPage(false);
            setGenrePage((value) => Math.max(0, value - 1));
          }
          return;
        }

        const queueSeeds = pages.flatMap((pageData) =>
          pageData.content.map(mapStationTrackToSeed)
        );
        const visibleItems = await Promise.all(currentSeeds.map(hydrateTrackSeed));
        const queueTracks = buildQueueTracksFromSeeds(queueSeeds);

        if (!isCancelled) {
          setGenreTracks(
            buildDiscoverTrackItems(visibleItems, queueTracks, 'likes')
          );
          setHasGenreNextPage(resolveHasNextPage(pages[0]));
        }
      } catch {
        if (!isCancelled) {
          setGenreTracks([]);
          setHasGenreNextPage(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingGenre(false);
        }
      }
    };

    void loadGenreStation();

    return () => {
      isCancelled = true;
    };
  }, [genrePage, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setMoreTrendingTracks([]);
      setHasMoreTrendingNextPage(false);
      setIsLoadingMoreTrending(false);
      return;
    }

    let isCancelled = false;

    const loadArtistStation = async () => {
      setIsLoadingMoreTrending(true);

      try {
        const pages = await loadPaginatedWindow(
          moreTrendingPage,
          (pageNumber) =>
            discoveryService.getArtistStation({
              page: pageNumber,
              size: PAGE_SIZE,
            })
        );

        const currentSeeds = pages[0].content.map(mapStationTrackToSeed);

        if (currentSeeds.length === 0 && moreTrendingPage > 0) {
          if (!isCancelled) {
            setHasMoreTrendingNextPage(false);
            setMoreTrendingPage((value) => Math.max(0, value - 1));
          }
          return;
        }

        const queueSeeds = pages.flatMap((pageData) =>
          pageData.content.map(mapStationTrackToSeed)
        );
        const visibleItems = await Promise.all(currentSeeds.map(hydrateTrackSeed));
        const queueTracks = buildQueueTracksFromSeeds(queueSeeds);

        if (!isCancelled) {
          setMoreTrendingTracks(
            buildDiscoverTrackItems(visibleItems, queueTracks, 'likes')
          );
          setHasMoreTrendingNextPage(resolveHasNextPage(pages[0]));
        }
      } catch {
        if (!isCancelled) {
          setMoreTrendingTracks([]);
          setHasMoreTrendingNextPage(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMoreTrending(false);
        }
      }
    };

    void loadArtistStation();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, moreTrendingPage]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      setRecentlyPlayedItems([]);
      setHasRecentNextPage(false);
      setIsLoadingRecent(false);
      return;
    }

    let isCancelled = false;

    const loadRecent = async () => {
      setIsLoadingRecent(true);

      try {
        const pages = await loadPaginatedWindow(recentPage, (pageNumber) =>
          playbackService.getListeningHistory({
            page: pageNumber,
            size: PAGE_SIZE,
          })
        );

        const currentSeeds = pages[0].content
          .filter((entry) => typeof entry.id === 'number')
          .map(mapHistoryEntryToSeed);

        if (currentSeeds.length === 0 && recentPage > 0) {
          if (!isCancelled) {
            setHasRecentNextPage(false);
            setRecentPage((value) => Math.max(0, value - 1));
          }
          return;
        }

        const queueSeeds = pages.flatMap((pageData) =>
          pageData.content
            .filter((entry) => typeof entry.id === 'number')
            .map(mapHistoryEntryToSeed)
        );
        const queueItems = await Promise.all(queueSeeds.map(hydrateTrackSeed));
        const queueTracks = buildQueueTracksFromItems(queueItems);
        const visibleItems = queueItems.slice(0, currentSeeds.length);

        if (!isCancelled) {
          setRecentlyPlayedItems(
            buildDiscoverTrackItems(visibleItems, queueTracks, 'history')
          );
          setHasRecentNextPage(resolveHasNextPage(pages[0]));
        }
      } catch {
        if (!isCancelled) {
          setRecentlyPlayedItems([]);
          setHasRecentNextPage(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRecent(false);
        }
      }
    };

    void loadRecent();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, recentPage]);

  const hasDiscoverError = useMemo(() => {
    if (isAuthLoading) {
      return false;
    }

    if (!isAuthenticated) {
      return !isLoadingTrending && trendingTracks.length === 0;
    }

    return (
      !isLoadingLiked &&
      likedTracks.length === 0 &&
      !isLoadingGenre &&
      genreTracks.length === 0 &&
      !isLoadingRecent &&
      recentlyPlayedItems.length === 0 &&
      !isLoadingMoreTrending &&
      moreTrendingTracks.length === 0
    );
  }, [
    genreTracks.length,
    isAuthenticated,
    isAuthLoading,
    isLoadingGenre,
    isLoadingLiked,
    isLoadingMoreTrending,
    isLoadingRecent,
    isLoadingTrending,
    likedTracks.length,
    moreTrendingTracks.length,
    recentlyPlayedItems.length,
    trendingTracks.length,
  ]);

  if (!isAuthLoading && hasDiscoverError) {
    return (
      <p className="text-sm text-text-muted">
        Failed to load discover data. Please try again later.
      </p>
    );
  }

  const isLoggedIn = !isAuthLoading && isAuthenticated;

  return (
    <div className="w-full">
      <DiscoverPage
        isLoggedIn={isLoggedIn}
        trendingTracks={trendingTracks}
        likedTracks={likedTracks}
        recentlyPlayedItems={recentlyPlayedItems}
        genreTracks={genreTracks}
        moreTrendingTracks={moreTrendingTracks}
        isLoadingTrending={isLoadingTrending || isAuthLoading}
        isLoadingLiked={isLoadingLiked || isAuthLoading}
        isLoadingRecent={isLoadingRecent || isAuthLoading}
        isLoadingGenre={isLoadingGenre || isAuthLoading}
        isLoadingMoreTrending={isLoadingMoreTrending || isAuthLoading}
        onTrendingPrevPage={() =>
          setTrendingPage((value) => Math.max(0, value - 1))
        }
        onTrendingNextPage={() => setTrendingPage((value) => value + 1)}
        canTrendingPrevPage={trendingPage > 0 && !isLoadingTrending}
        canTrendingNextPage={hasTrendingNextPage && !isLoadingTrending}
        onLikedPrevPage={() => setLikedPage((value) => Math.max(0, value - 1))}
        onLikedNextPage={() => setLikedPage((value) => value + 1)}
        canLikedPrevPage={likedPage > 0 && !isLoadingLiked}
        canLikedNextPage={hasLikedNextPage && !isLoadingLiked}
        onRecentPrevPage={() => setRecentPage((value) => Math.max(0, value - 1))}
        onRecentNextPage={() => setRecentPage((value) => value + 1)}
        canRecentPrevPage={recentPage > 0 && !isLoadingRecent}
        canRecentNextPage={hasRecentNextPage && !isLoadingRecent}
        onGenrePrevPage={() => setGenrePage((value) => Math.max(0, value - 1))}
        onGenreNextPage={() => setGenrePage((value) => value + 1)}
        canGenrePrevPage={genrePage > 0 && !isLoadingGenre}
        canGenreNextPage={hasGenreNextPage && !isLoadingGenre}
        onMoreTrendingPrevPage={() =>
          setMoreTrendingPage((value) => Math.max(0, value - 1))
        }
        onMoreTrendingNextPage={() => setMoreTrendingPage((value) => value + 1)}
        canMoreTrendingPrevPage={moreTrendingPage > 0 && !isLoadingMoreTrending}
        canMoreTrendingNextPage={
          hasMoreTrendingNextPage && !isLoadingMoreTrending
        }
      />
    </div>
  );
}
