'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import DiscoverPage from '@/features/discover/DiscoverPage';
import type {
  DiscoverPlaylistItem,
  DiscoverTrackItem,
} from '@/features/discover/types/DiscoverTypes';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { discoveryService, playbackService, trackService, userService } from '@/services';
import type { ResourceRefFullDTO, StationItemDTO } from '@/types/discovery';
import type { TrackListItem } from '@/components/tracks/TrackList';
import { formatDuration } from '@/utils/formatDuration';
import type { UserMe } from '@/types/user';

const toPlaybackAccess = (
  access: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined
) => {
  if (access === 'BLOCKED' || access === 'PREVIEW') {
    return 'BLOCKED' as const;
  }

  return 'PLAYABLE' as const;
};

const PAGE_SIZE = 12;

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

const mapTrackResourceToDiscoverTrack = (
  resource: ResourceRefFullDTO,
  queueSource: 'likes' | 'history'
): DiscoverTrackItem | null => {
  if (resource.resourceType !== 'TRACK' || !resource.track) {
    return null;
  }

  const track = resource.track;
  const artistDisplayName = track.artist.displayName || track.artist.username;

  const item: TrackListItem = {
    trackId: String(track.id),
    user: {
      username: track.artist.username,
      displayName: track.artist.displayName,
      avatar: track.artist.avatarUrl,
    },
    postedText: 'posted a track',
    track: {
      id: track.id,
      trackSlug: track.trackSlug,
      artist: {
        username: track.artist.username,
        displayName: track.artist.displayName,
        avatar: track.artist.avatarUrl,
      },
      title: track.title,
      cover: track.coverUrl,
      duration: `${Math.floor((track.trackDurationSeconds ?? 0) / 60)}:${String((track.trackDurationSeconds ?? 0) % 60).padStart(2, '0')}`,
      plays: track.playCount,
      createdAt: track.uploadDate,
      genre: track.genre,
      durationSeconds: track.trackDurationSeconds,
      isLiked: track.isLiked,
      isReposted: track.isReposted,
      likeCount: track.likeCount,
      repostCount: track.repostCount,
    },
    trackUrl: track.trackUrl,
    access: toPlaybackAccess(track.access),
    waveform: normalizeWaveform((track as { waveformData?: unknown }).waveformData),
  };

  return {
    item,
    queueTracks: [
      playerTrackMappers.fromAdapterInput(
        {
          id: track.id,
          title: track.title,
          trackUrl: track.trackUrl,
          artist: track.artist,
          coverUrl: track.coverUrl,
          waveformData: normalizeWaveform((track as { waveformData?: unknown }).waveformData),
          durationSeconds: track.trackDurationSeconds,
        },
        {
          access: track.access === 'BLOCKED' || track.access === 'PREVIEW' ? 'BLOCKED' : 'PLAYABLE',
          fallbackArtistName: artistDisplayName,
        }
      ),
    ],
    queueSource,
  };
};

const mapStationTrackToDiscoverTrack = (
  stationItem: StationItemDTO,
  queueSource: 'likes' | 'history'
): DiscoverTrackItem => {
  const track = stationItem.track;
  const artistDisplayName = track.artist.displayName || track.artist.username;

  const item: TrackListItem = {
    trackId: String(track.id),
    user: {
      username: track.artist.username,
      displayName: track.artist.displayName,
      avatar: track.artist.avatarUrl,
    },
    postedText: 'posted a track',
    track: {
      id: track.id,
      trackSlug: track.trackSlug,
      artist: {
        username: track.artist.username,
        displayName: track.artist.displayName,
        avatar: track.artist.avatarUrl,
      },
      title: track.title,
      cover: track.coverUrl,
      duration: '0:00',
      plays: track.playCount,
      createdAt: stationItem.createdAt,
      durationSeconds: undefined,
      isLiked: track.isLiked,
      isReposted: track.isReposted,
      likeCount: track.likeCount,
      repostCount: track.repostCount,
    },
    trackUrl: track.trackUrl,
    access: toPlaybackAccess(track.access),
    waveform: [],
  };

  return {
    item,
    queueTracks: [
      playerTrackMappers.fromAdapterInput(
        {
          id: track.id,
          title: track.title,
          trackUrl: track.trackUrl,
          artist: track.artist,
          coverUrl: track.coverUrl,
        },
        {
          access: track.access === 'BLOCKED' || track.access === 'PREVIEW' ? 'BLOCKED' : 'PLAYABLE',
          fallbackArtistName: artistDisplayName,
        }
      ),
    ],
    queueSource,
  };
};

const mapHistoryTrackToDiscoverTrack = (trackItem: TrackListItem): DiscoverTrackItem => {
  const artistDisplayName =
    trackItem.track.artist.displayName || trackItem.track.artist.username;

  const queueTrack = playerTrackMappers.fromAdapterInput(
    {
      id: trackItem.track.id,
      title: trackItem.track.title,
      trackUrl: trackItem.trackUrl ?? '',
      artist: trackItem.track.artist,
      coverUrl: trackItem.track.cover,
      waveformData: trackItem.waveform,
      durationSeconds: trackItem.track.durationSeconds,
    },
    {
      access: trackItem.access === 'BLOCKED' ? 'BLOCKED' : 'PLAYABLE',
      fallbackArtistName: artistDisplayName,
    }
  );

  return {
    item: trackItem,
    queueTracks: [queueTrack],
    queueSource: 'history',
  };
};

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
  const [moreTrendingTracks, setMoreTrendingTracks] = useState<DiscoverTrackItem[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserMe | null>(null);
  const [seedArtistId, setSeedArtistId] = useState<number | null>(null);

  const [trendingPage, setTrendingPage] = useState(0);
  const [likedPage, setLikedPage] = useState(0);
  const [genrePage, setGenrePage] = useState(0);
  const [moreTrendingPage, setMoreTrendingPage] = useState(0);
  const [recentPage, setRecentPage] = useState(0);

  const preferredGenre = useMemo(() => {
    const genres = currentUserProfile?.profile.favoriteGenres ?? [];
    return genres.find((genre) => genre.trim().length > 0) ?? null;
  }, [currentUserProfile]);

  useEffect(() => {
    let isCancelled = false;

    const loadCurrentUserProfile = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        if (!isCancelled) {
          setCurrentUserProfile(null);
        }
        return;
      }

      try {
        const response = await userService.getUserMe();
        if (!isCancelled) {
          setCurrentUserProfile(response);
        }
      } catch {
        if (!isCancelled) {
          setCurrentUserProfile(null);
        }
      }
    };

    void loadCurrentUserProfile();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    let isCancelled = false;

    const loadTrending = async () => {
      setIsLoadingTrending(true);
      try {
        const offset = trendingPage * PAGE_SIZE;
        const response = await discoveryService.getTrending({
          limit: offset + PAGE_SIZE,
        });
        const pageSlice = response.slice(offset, offset + PAGE_SIZE);
        const mapped = pageSlice.flatMap((resource) => {
          const track = mapTrackResourceToDiscoverTrack(resource, 'likes');
          return track ? [track] : [];
        });
        const nextSeedArtistId =
          pageSlice.find(
            (resource) =>
              resource.resourceType === 'TRACK' && typeof resource.track?.artist.id === 'number'
          )?.track?.artist.id ?? null;

        if (!isCancelled) {
          setTrendingTracks(mapped);
          setSeedArtistId(nextSeedArtistId);
        }
      } catch {
        if (!isCancelled) {
          setTrendingTracks([]);
          setSeedArtistId(null);
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
  }, [trendingPage]);

  useEffect(() => {
    let isCancelled = false;

    const loadLikedStation = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        setLikedTracks([]);
        setIsLoadingLiked(false);
        return;
      }

      setIsLoadingLiked(true);
      try {
        const response = await discoveryService.getLikesStation({
          page: likedPage,
          size: PAGE_SIZE,
        });

        if (!isCancelled) {
          setLikedTracks(
            response.content.map((item) =>
              mapStationTrackToDiscoverTrack(item, 'likes')
            )
          );
        }
      } catch {
        if (!isCancelled) {
          setLikedTracks([]);
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
    let isCancelled = false;

    const loadGenreStation = async () => {
      if (!preferredGenre) {
        setGenreTracks([]);
        setIsLoadingGenre(false);
        return;
      }

      setIsLoadingGenre(true);
      try {
        const response = await discoveryService.getGenreStation({
          genre: preferredGenre,
          page: genrePage,
          size: PAGE_SIZE,
        });

        if (!isCancelled) {
          setGenreTracks(
            response.content.map((item) =>
              mapStationTrackToDiscoverTrack(item, 'likes')
            )
          );
        }
      } catch {
        if (!isCancelled) {
          setGenreTracks([]);
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
  }, [genrePage, preferredGenre]);

  useEffect(() => {
    let isCancelled = false;

    const loadArtistStation = async () => {
      if (seedArtistId === null) {
        setMoreTrendingTracks([]);
        setIsLoadingMoreTrending(false);
        return;
      }

      setIsLoadingMoreTrending(true);
      try {
        const response = await discoveryService.getArtistStation({
          artistId: seedArtistId,
          page: moreTrendingPage,
          size: PAGE_SIZE,
        });

        if (!isCancelled) {
          setMoreTrendingTracks(
            response.content.map((item) =>
              mapStationTrackToDiscoverTrack(item, 'likes')
            )
          );
        }
      } catch {
        if (!isCancelled) {
          setMoreTrendingTracks([]);
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
  }, [moreTrendingPage, seedArtistId]);

  useEffect(() => {
    let isCancelled = false;

    const loadRecent = async () => {
      setIsLoadingRecent(true);

      try {
        const response = await playbackService.getListeningHistory({
          page: recentPage,
          size: PAGE_SIZE,
        });

        const mappedItems = await Promise.all(
          response.content.map(async (entry) => {
            if (typeof entry.id !== 'number') {
              return null;
            }

            try {
              const track = await trackService.getTrackMetadata(entry.id);

              const trackItem: TrackListItem = {
                trackId: String(track.id),
                user: {
                  username: track.artist.username,
                  displayName: track.artist.displayName,
                  avatar: track.artist.avatarUrl ?? '/images/default_avatar.png',
                },
                postedText: 'played a track',
                track: {
                  id: track.id,
                  trackSlug: track.trackSlug,
                  artist: {
                    username: track.artist.username,
                    displayName: track.artist.displayName,
                    avatar: track.artist.avatarUrl ?? '/images/default_avatar.png',
                  },
                  title: track.title,
                  cover: track.coverUrl,
                  duration: track.durationSeconds
                    ? formatDuration(track.durationSeconds)
                    : '0:00',
                  plays: track.playCount,
                  createdAt: track.uploadDate || track.releaseDate,
                  genre: track.genre,
                  durationSeconds: track.durationSeconds,
                  isLiked: track.isLiked,
                  isReposted: track.isReposted,
                  likeCount: track.likeCount,
                  repostCount: track.repostCount,
                },
                trackUrl: track.trackUrl,
                access: toPlaybackAccess(track.access),
                waveform: track.waveformData ?? [],
              };

              return mapHistoryTrackToDiscoverTrack(trackItem);
            } catch {
              return null;
            }
          })
        );

        if (!isCancelled) {
          setRecentlyPlayedItems(
            mappedItems.filter(
              (item): item is DiscoverTrackItem => item !== null
            )
          );
        }
      } catch {
        if (!isCancelled) {
          setRecentlyPlayedItems([]);
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
  }, [recentPage]);

  const hasDiscoverError = useMemo(() => {
    return (
      !isLoadingTrending && trendingTracks.length === 0 &&
      !isLoadingLiked && likedTracks.length === 0 &&
      !isLoadingGenre && genreTracks.length === 0 &&
      !isLoadingRecent && recentlyPlayedItems.length === 0
    );
  }, [
    genreTracks.length,
    isLoadingGenre,
    isLoadingLiked,
    isLoadingRecent,
    isLoadingTrending,
    likedTracks.length,
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
        canTrendingNextPage={!isLoadingTrending}
        onLikedPrevPage={() => setLikedPage((value) => Math.max(0, value - 1))}
        onLikedNextPage={() => setLikedPage((value) => value + 1)}
        canLikedPrevPage={likedPage > 0 && !isLoadingLiked}
        canLikedNextPage={!isLoadingLiked}
        onRecentPrevPage={() => setRecentPage((value) => Math.max(0, value - 1))}
        onRecentNextPage={() => setRecentPage((value) => value + 1)}
        canRecentPrevPage={recentPage > 0 && !isLoadingRecent}
        canRecentNextPage={!isLoadingRecent}
        onGenrePrevPage={() => setGenrePage((value) => Math.max(0, value - 1))}
        onGenreNextPage={() => setGenrePage((value) => value + 1)}
        canGenrePrevPage={genrePage > 0 && !isLoadingGenre}
        canGenreNextPage={!isLoadingGenre}
        onMoreTrendingPrevPage={() =>
          setMoreTrendingPage((value) => Math.max(0, value - 1))
        }
        onMoreTrendingNextPage={() => setMoreTrendingPage((value) => value + 1)}
        canMoreTrendingPrevPage={moreTrendingPage > 0 && !isLoadingMoreTrending}
        canMoreTrendingNextPage={!isLoadingMoreTrending}
      />
    </div>
  );
}
