'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ShareModal } from '@/features/prof/components/ShareModal';
import { PlaylistTrack } from '@/components/playlist-page/components/PlaylistTrackItem';
import PlaylistBanner from '@/components/playlist-page/components/PlaylistBanner';
import PlaylistActionBar from '@/components/playlist-page/components/PlaylistActionBar';
import PlaylistTrackList from '@/components/playlist-page/components/PlaylistTrackItem';
import PlaylistTagsSection from '@/components/playlist-page/components/PlaylistTagsSection';
import PlaylistOwnerSidebar from '@/components/playlist-page/components/PlaylistOwnerSidebar';
import EditPlaylistModal from '@/components/playlist-page/components/EditPlaylistModal';
import PlaylistEngagementSidebar from '@/components/playlist-page/components/sidebar/sidebar';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { usePlaylistSecretLink } from '@/hooks/usePlaylistSecretLink';
import { useWaveformData } from '@/hooks/useWaveformData';
import { playlistService, trackService } from '@/services';
import type { PlaylistResponse } from '@/types/playlists';
import { formatDuration } from '@/utils/formatDuration';
import {
  buildPlaylistSecretUrl,
  buildPlaylistUrl,
} from '@/utils/resourcePaths';
import {
  getSecretTokenFromQuery,
  resolvePlaylistIdFromIdentifier,
} from '@/utils/resourceIdentifierResolvers';

/**
 * /sets/[id]/page.tsx
 *
 * Playlist detail page with service-backed metadata, queue integration,
 * owner-only metadata editing, and drag-and-drop playlist track reordering.
 */

const DEFAULT_IMAGE = '/images/default_song_image.png';

type PlaylistTrackDto = NonNullable<PlaylistResponse['tracks']>[number];

const normalizeIdentity = (value: string | undefined): string =>
  (value ?? '').trim().toLowerCase();

const resolvePlaylistCover = (
  playlist: PlaylistResponse | null | undefined
): string | undefined => {
  if (!playlist) {
    return undefined;
  }

  const canonicalCover = playlist.coverArtUrl?.trim();
  if (canonicalCover) {
    return canonicalCover;
  }

  const legacyCover = (
    playlist as PlaylistResponse & { CoverArt?: string; image?: string }
  ).CoverArt?.trim();
  if (legacyCover) {
    return legacyCover;
  }

  const imageCover = (
    playlist as PlaylistResponse & { CoverArt?: string; image?: string }
  ).image?.trim();
  if (imageCover) {
    return imageCover;
  }

  return undefined;
};

const normalizePlaylistResponse = (playlist: PlaylistResponse): PlaylistResponse => {
  const cover = resolvePlaylistCover(playlist);

  if (!cover) {
    return playlist;
  }

  return {
    ...playlist,
    coverArtUrl: cover,
  };
};

const toWaveform = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry))
      .map((entry) => Math.max(0, Math.min(1, entry)));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return [];
    }

    try {
      return toWaveform(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    const payload = value as Record<string, unknown>;
    if ('waveformData' in payload) {
      return toWaveform(payload.waveformData);
    }

    if ('samples' in payload) {
      return toWaveform(payload.samples);
    }
  }

  return [];
};

const resolveTrackId = (track: PlaylistTrackDto): number | null => {
  if ('id' in track && typeof track.id === 'number') {
    return track.id;
  }

  if ('trackId' in track && typeof track.trackId === 'number') {
    return track.trackId;
  }

  return null;
};

const resolveTrackTitle = (track: PlaylistTrackDto): string => {
  if (typeof track.title === 'string' && track.title.trim().length > 0) {
    return track.title;
  }

  return 'Untitled Track';
};

const resolveTrackUrl = (track: PlaylistTrackDto): string | null => {
  if ('trackUrl' in track && typeof track.trackUrl === 'string') {
    return track.trackUrl;
  }

  return null;
};

const resolveTrackCover = (track: PlaylistTrackDto): string => {
  if ('coverUrl' in track && typeof track.coverUrl === 'string') {
    return track.coverUrl;
  }

  return DEFAULT_IMAGE;
};

const resolveTrackArtist = (track: PlaylistTrackDto, fallbackArtist: string): string => {
  if ('artist' in track && track.artist) {
    return track.artist.displayName || track.artist.username;
  }

  return fallbackArtist;
};

const resolveTrackArtistUsername = (
  track: PlaylistTrackDto
): string | undefined => {
  if ('artist' in track && track.artist?.username) {
    return track.artist.username;
  }

  return undefined;
};

const resolveTrackSlug = (track: PlaylistTrackDto): string | undefined => {
  if ('trackSlug' in track && typeof track.trackSlug === 'string') {
    const normalized = track.trackSlug.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
};

const resolveTrackSecretToken = (
  track: PlaylistTrackDto
): string | undefined => {
  if ('secretToken' in track && typeof track.secretToken === 'string') {
    const normalized = track.secretToken.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
};

const resolveTrackDurationSeconds = (track: PlaylistTrackDto): number => {
  if ('durationSeconds' in track && typeof track.durationSeconds === 'number') {
    return track.durationSeconds;
  }

  if (
    'trackDurationSeconds' in track &&
    typeof track.trackDurationSeconds === 'number'
  ) {
    return track.trackDurationSeconds;
  }

  return 0;
};

const resolveTrackAccess = (
  track: PlaylistTrackDto
): 'PLAYABLE' | 'BLOCKED' | 'PREVIEW' | undefined => {
  if ('access' in track) {
    return track.access;
  }

  return undefined;
};

const resolveTrackPlays = (track: PlaylistTrackDto): string | undefined => {
  if ('playCount' in track && typeof track.playCount === 'number') {
    return track.playCount.toLocaleString();
  }

  return undefined;
};

const resolveTrackLiked = (track: PlaylistTrackDto): boolean => {
  if ('isLiked' in track && typeof track.isLiked === 'boolean') {
    return track.isLiked;
  }

  return false;
};

const resolveTrackReposted = (track: PlaylistTrackDto): boolean => {
  if ('isReposted' in track && typeof track.isReposted === 'boolean') {
    return track.isReposted;
  }

  return false;
};

const resolveTrackLikeCount = (track: PlaylistTrackDto): number => {
  if ('likeCount' in track && typeof track.likeCount === 'number') {
    return track.likeCount;
  }

  return 0;
};

const resolveTrackRepostCount = (track: PlaylistTrackDto): number => {
  if ('repostCount' in track && typeof track.repostCount === 'number') {
    return track.repostCount;
  }

  return 0;
};

const mapPlaylistTracksToItems = (
  tracks: PlaylistResponse['tracks'] | undefined,
  fallbackArtist: string
): PlaylistTrack[] => {
  if (!tracks) {
    return [];
  }

  return tracks.flatMap((track) => {
      const id = resolveTrackId(track);
      const trackUrl = resolveTrackUrl(track);
      if (id === null || !trackUrl) {
        return [];
      }

      const access = resolveTrackAccess(track);
      const plays = resolveTrackPlays(track);
      const coverUrl = resolveTrackCover(track);

      const item: PlaylistTrack = {
        id,
        trackSlug: resolveTrackSlug(track),
        artistUsername: resolveTrackArtistUsername(track),
        secretToken: resolveTrackSecretToken(track)?.trim() || '',
        title: resolveTrackTitle(track),
        artist: resolveTrackArtist(track, fallbackArtist),
        coverUrl,
        durationSeconds: resolveTrackDurationSeconds(track),
        trackUrl,
        available: access !== 'BLOCKED' && access !== 'PREVIEW',
        isLiked: resolveTrackLiked(track),
        isReposted: resolveTrackReposted(track),
        likeCount: resolveTrackLikeCount(track),
        repostCount: resolveTrackRepostCount(track),
        ...(plays ? { plays } : {}),
      };

      return [item];
    });
};

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export default function PlaylistPage() {
  const { username, id } = useParams<{ username: string; id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownerContext = useProfileOwnerContext();
  const secretToken = getSecretTokenFromQuery(searchParams);

  const [playlist, setPlaylist] = useState<PlaylistResponse | null>(null);
  const [orderedTracks, setOrderedTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReorderSaving, setIsReorderSaving] = useState(false);
  const [isPlaylistLikePending, setIsPlaylistLikePending] = useState(false);
  const [isPlaylistRepostPending, setIsPlaylistRepostPending] = useState(false);

  const playerCurrentTrackId = usePlayerStore((state) => state.currentTrack?.id ?? null);
  const playerIsPlaying = usePlayerStore((state) => state.isPlaying);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const pausePlayback = usePlayerStore((state) => state.pause);
  const addPlaylistToQueue = usePlayerStore((state) => state.addPlaylistToQueue);

  const ownerUsername = playlist?.owner?.username || username;
  const ownerDisplayName =
    playlist?.owner?.displayName?.trim() ||
    playlist?.owner?.username ||
    username;
  const playlistPathId = playlist?.playlistSlug?.trim() || id;
  const { secretUrl: playlistSecretUrl } = usePlaylistSecretLink(
    playlist?.isPrivate && !secretToken ? String(playlist.id) : undefined,
    {
      shareUsername: ownerUsername,
      sharePathId: playlistPathId,
    }
  );
  const resolvedPrivatePlaylistUrl = secretToken
    ? buildPlaylistSecretUrl(ownerUsername, playlistPathId, secretToken)
    : playlistSecretUrl;
  const canEditPlaylist =
    Boolean(ownerContext?.isOwner) &&
    normalizeIdentity(ownerUsername) === normalizeIdentity(username);

  useEffect(() => {
    let isCancelled = false;

    const loadPlaylist = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await (async (): Promise<PlaylistResponse> => {
          if (secretToken) {
            return normalizePlaylistResponse(
              await playlistService.getPlaylistByToken(secretToken)
            );
          }

          const resolvedPlaylistId = await resolvePlaylistIdFromIdentifier(id);
          return normalizePlaylistResponse(
            await playlistService.getPlaylist(resolvedPlaylistId)
          );
        })();

        if (isCancelled) {
          return;
        }

        setPlaylist(data);
        setOrderedTracks(
          mapPlaylistTracksToItems(
            data.tracks,
            data.owner?.displayName?.trim() || data.owner?.username || username
          )
        );
      } catch {
        if (!isCancelled) {
          setPlaylist(null);
          setOrderedTracks([]);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPlaylist();

    return () => {
      isCancelled = true;
    };
  }, [id, secretToken, username]);

  const loadPlaylistById = async (targetPlaylistId: number): Promise<PlaylistResponse> => {
    const data = normalizePlaylistResponse(
      await playlistService.getPlaylist(targetPlaylistId)
    );
    setPlaylist(data);
    setOrderedTracks(
      mapPlaylistTracksToItems(
        data.tracks,
        data.owner?.displayName?.trim() || data.owner?.username || username
      )
    );

    return data;
  };

  useEffect(() => {
    if (!playlist) {
      return;
    }

    setOrderedTracks(mapPlaylistTracksToItems(playlist.tracks, ownerDisplayName));
  }, [ownerDisplayName, playlist]);

  useEffect(() => {
    if (!playlist || !canEditPlaylist) {
      return;
    }

    if (searchParams.get('edit') === '1') {
      setIsEditModalOpen(true);
      router.replace(`/${username}/sets/${id}`);
    }
  }, [canEditPlaylist, id, playlist, router, searchParams, username]);

  const queueTracks = useMemo(() => {
    return orderedTracks.flatMap((track) => {
      if (!track.trackUrl) {
        return [];
      }

      return [
        playerTrackMappers.fromAdapterInput(
          {
            id: track.id,
            title: track.title,
            trackUrl: track.trackUrl,
            artist: track.artist ?? ownerDisplayName,
            durationSeconds: track.durationSeconds,
            coverUrl: track.coverUrl,
          },
          {
            access: track.available === false ? 'BLOCKED' : 'PLAYABLE',
            fallbackArtistName: track.artist ?? ownerDisplayName,
          }
        ),
      ];
    });
  }, [orderedTracks, ownerDisplayName]);

  const embeddedWaveform = useMemo(() => {
    return toWaveform(
      (playlist as { firstTrackWaveformData?: unknown } | null)
        ?.firstTrackWaveformData
    );
  }, [playlist]);

  const bannerWaveform = useWaveformData(
    embeddedWaveform,
    playlist?.firstTrackWaveformUrl ?? undefined
  );

  const activeTrack = useMemo(() => {
    return orderedTracks.find((track) => track.id === playerCurrentTrackId) ?? null;
  }, [orderedTracks, playerCurrentTrackId]);

  const activeTrackId = activeTrack?.id ?? null;
  const totalDurationSeconds =
    playlist?.totalDurationSeconds ??
    orderedTracks.reduce(
      (total, track) => total + (track.durationSeconds ?? 0),
      0
    );

  const handlePlayTrack = (trackId: number) => {
    const selectedTrack = queueTracks.find((track) => track.id === trackId);
    if (!selectedTrack) {
      return;
    }

    if (playerCurrentTrackId === trackId) {
      if (playerIsPlaying) {
        pausePlayback();
      } else {
        playTrack(selectedTrack);
      }
      return;
    }

    const startIndex = queueTracks.findIndex((track) => track.id === trackId);
    if (startIndex < 0) {
      return;
    }

    setQueue(queueTracks, startIndex, 'playlist');
    playTrack(selectedTrack);
  };

  const handleBannerPlayPause = () => {
    if (queueTracks.length === 0) {
      return;
    }

    if (activeTrack && playerCurrentTrackId === activeTrack.id) {
      const selectedTrack = queueTracks.find((track) => track.id === activeTrack.id);
      if (!selectedTrack) {
        return;
      }

      if (playerIsPlaying) {
        pausePlayback();
      } else {
        playTrack(selectedTrack);
      }
      return;
    }

    setQueue(queueTracks, 0, 'playlist');
    playTrack(queueTracks[0]);
  };

  const handleAddToQueue = () => {
    if (queueTracks.length === 0) {
      return;
    }

    addPlaylistToQueue(queueTracks);
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    const shareLink = playlist?.isPrivate
      ? resolvedPrivatePlaylistUrl
      : buildPlaylistUrl(ownerUsername, playlistPathId);
    if (!shareLink) {
      return;
    }

    void navigator.clipboard.writeText(shareLink).catch(() => {});
  };

  const handleDeletePlaylist = async () => {
    if (!playlist || !canEditPlaylist) {
      return;
    }

    const confirmed =
      typeof window === 'undefined'
        ? false
        : window.confirm('Delete this playlist?');
    if (!confirmed) {
      return;
    }

    try {
      await playlistService.deletePlaylist(playlist.id);
      router.push(`/${username}/sets`);
    } catch {
      // Keep user on page when delete fails.
    }
  };

  const handleSaveMetadata = async (payload: {
    title: string;
    description: string;
    genre?: string;
    tags?: string[];
    isPrivate: boolean;
    coverArt?: string;
  }) => {
    if (!playlist) {
      return;
    }

    setIsEditSaving(true);

    try {
      const updatePayload = {
        title: payload.title,
        description: payload.description,
        type: playlist.type ?? 'PLAYLIST',
        isPrivate: payload.isPrivate,
        CoverArt: payload.coverArt,
        genre: payload.genre,
        tags: payload.tags,
      } as Parameters<typeof playlistService.updatePlaylist>[1] & {
        genre?: string;
        tags?: string[];
      };

      const updated = normalizePlaylistResponse(
        await playlistService.updatePlaylist(playlist.id, updatePayload)
      );

      setPlaylist(updated);
      setOrderedTracks(mapPlaylistTracksToItems(updated.tracks, ownerDisplayName));
      setIsEditModalOpen(false);
    } finally {
      setIsEditSaving(false);
    }
  };

  const updateTrackState = (
    trackId: number,
    updater: (track: PlaylistTrack) => PlaylistTrack
  ) => {
    setOrderedTracks((previous) =>
      previous.map((track) => (track.id === trackId ? updater(track) : track))
    );
  };

  const handleLikeTrack = async (trackId: number) => {
    const current = orderedTracks.find((track) => track.id === trackId);
    if (!current) {
      return;
    }

    const nextLiked = !(current.isLiked ?? false);
    const delta = nextLiked ? 1 : -1;

    updateTrackState(trackId, (track) => ({
      ...track,
      isLiked: nextLiked,
      likeCount: Math.max(0, (track.likeCount ?? 0) + delta),
    }));

    try {
      if (nextLiked) {
        await trackService.likeTrack(trackId);
      } else {
        await trackService.unlikeTrack(trackId);
      }
    } catch {
      updateTrackState(trackId, (track) => ({
        ...track,
        isLiked: current.isLiked,
        likeCount: current.likeCount,
      }));
    }
  };

  const handleRepostTrack = async (trackId: number) => {
    const current = orderedTracks.find((track) => track.id === trackId);
    if (!current) {
      return;
    }

    const nextReposted = !(current.isReposted ?? false);
    const delta = nextReposted ? 1 : -1;

    updateTrackState(trackId, (track) => ({
      ...track,
      isReposted: nextReposted,
      repostCount: Math.max(0, (track.repostCount ?? 0) + delta),
    }));

    try {
      if (nextReposted) {
        await trackService.repostTrack(trackId);
      } else {
        await trackService.unrepostTrack(trackId);
      }
    } catch {
      updateTrackState(trackId, (track) => ({
        ...track,
        isReposted: current.isReposted,
        repostCount: current.repostCount,
      }));
    }
  };

  const handleLikePlaylist = async () => {
    if (!playlist || isPlaylistLikePending) {
      return;
    }

    const previousLiked = playlist.isLiked ?? false;
    const previousLikeCount = playlist.likeCount ?? 0;
    const nextLiked = !previousLiked;
    const delta = nextLiked ? 1 : -1;

    setIsPlaylistLikePending(true);
    setPlaylist((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        isLiked: nextLiked,
        likeCount: Math.max(0, (previous.likeCount ?? 0) + delta),
      };
    });

    try {
      const response = nextLiked
        ? await playlistService.likePlaylist(playlist.id)
        : await playlistService.unlikePlaylist(playlist.id);

      setPlaylist((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          isLiked: response.isLiked,
        };
      });
    } catch {
      setPlaylist((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          isLiked: previousLiked,
          likeCount: previousLikeCount,
        };
      });
    } finally {
      setIsPlaylistLikePending(false);
    }
  };

  const handleRepostPlaylist = async () => {
    if (!playlist || isPlaylistRepostPending) {
      return;
    }

    const previousReposted = playlist.isReposted ?? false;
    const previousRepostCount = playlist.repostCount ?? 0;
    const nextReposted = !previousReposted;
    const delta = nextReposted ? 1 : -1;

    setIsPlaylistRepostPending(true);
    setPlaylist((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        isReposted: nextReposted,
        repostCount: Math.max(0, (previous.repostCount ?? 0) + delta),
      };
    });

    try {
      const response = nextReposted
        ? await playlistService.repostPlaylist(playlist.id)
        : await playlistService.unrepostPlaylist(playlist.id);

      setPlaylist((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          isReposted: response.isReposted,
        };
      });
    } catch {
      setPlaylist((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          isReposted: previousReposted,
          repostCount: previousRepostCount,
        };
      });
    } finally {
      setIsPlaylistRepostPending(false);
    }
  };

  const handleModalReorder = async (trackIds: number[]) => {
    if (!playlist) {
      return;
    }

    const previousOrder = orderedTracks;
    const tracksById = new Map(previousOrder.map((track) => [track.id, track]));
    const nextOrder = trackIds
      .map((trackId) => tracksById.get(trackId))
      .filter((track): track is PlaylistTrack => Boolean(track));

    if (nextOrder.length === previousOrder.length) {
      setOrderedTracks(nextOrder);
    }

    setIsReorderSaving(true);

    try {
      const updated = await playlistService.reorderPlaylistTracks(playlist.id, {
        trackIds,
      });
      setPlaylist(updated);
      setOrderedTracks(mapPlaylistTracksToItems(updated.tracks, ownerDisplayName));
    } catch {
      setOrderedTracks(previousOrder);
      throw new Error('Unable to reorder playlist tracks.');
    } finally {
      setIsReorderSaving(false);
    }
  };

  const handleModalRemoveTrack = async (trackId: number) => {
    if (!playlist) {
      return;
    }

    const previousOrder = orderedTracks;
    setOrderedTracks((tracks) => tracks.filter((track) => track.id !== trackId));
    setIsReorderSaving(true);

    try {
      await playlistService.removeTrackFromPlaylist(playlist.id, trackId);
      await loadPlaylistById(playlist.id);
    } catch {
      setOrderedTracks(previousOrder);
      throw new Error('Unable to remove track from playlist.');
    } finally {
      setIsReorderSaving(false);
    }
  };

  const handleDragStart = (index: number) => {
    if (!canEditPlaylist || orderedTracks.length < 2) {
      return;
    }

    setDragIndex(index);
    setDragOverIndex(index);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLLIElement>,
    index: number
  ) => {
    if (dragIndex === null) {
      return;
    }

    event.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLLIElement>,
    targetIndex: number
  ) => {
    event.preventDefault();

    if (!playlist || dragIndex === null || dragIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const previousOrder = orderedTracks;
    const nextOrder = moveItem(previousOrder, dragIndex, targetIndex);

    setOrderedTracks(nextOrder);
    setIsReorderSaving(true);
    handleDragEnd();

    try {
      const updated = await playlistService.reorderPlaylistTracks(playlist.id, {
        trackIds: nextOrder.map((track) => track.id),
      });
      setPlaylist(updated);
      setOrderedTracks(mapPlaylistTracksToItems(updated.tracks, ownerDisplayName));
    } catch {
      setOrderedTracks(previousOrder);
    } finally {
      setIsReorderSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-w-0">
        <div className="h-75 rounded bg-surface-default animate-pulse" />
        <div className="mt-4 h-12 rounded bg-surface-default animate-pulse" />
        <div className="mt-4 h-70 rounded bg-surface-default animate-pulse" />
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <p className="text-text-muted text-sm">
        Failed to load playlist. Please try again later.
      </p>
    );
  }

  const playlistTags = Array.isArray((playlist as { tags?: unknown }).tags)
    ? ((playlist as { tags?: unknown[] }).tags ?? [])
        .filter((tag): tag is string => typeof tag === 'string')
    : [];

  const bannerPlaylist = {
    title: playlist.title,
    updatedAt: playlist.createdAt,
    coverUrl: resolvePlaylistCover(playlist),
    tracks: orderedTracks,
    owner: {
      username: playlist.owner?.username || username,
      displayName: playlist.owner?.displayName,
    },
    genre: playlist.genre,
  };

  return (
    <div className="w-full min-w-0">
      {/* ── Banner ── */}
      <PlaylistBanner
        playlist={bannerPlaylist}
        playingTrack={activeTrack}
        trackCount={orderedTracks.length}
        duration={formatDuration(Math.max(0, totalDurationSeconds))}
        waveform={bannerWaveform}
        isPlaying={Boolean(activeTrackId) && playerIsPlaying}
        onPlayPause={handleBannerPlayPause}
      />

      {/* ── Action bar ── */}
      <PlaylistActionBar
        onShare={() => setIsShareOpen(true)}
        onCopyLink={handleCopyLink}
        onAddToQueue={handleAddToQueue}
        onLike={() => {
          void handleLikePlaylist();
        }}
        onRepost={() => {
          void handleRepostPlaylist();
        }}
        onPlayPause={handleBannerPlayPause}
        isPlaying={Boolean(activeTrackId) && playerIsPlaying}
        isLiked={Boolean(playlist.isLiked)}
        isReposted={Boolean(playlist.isReposted)}
        onEdit={
          canEditPlaylist
            ? () => {
                void (async () => {
                  if (!playlist) {
                    return;
                  }

                  setIsEditSaving(true);
                  try {
                    await loadPlaylistById(playlist.id);
                    setIsEditModalOpen(true);
                  } finally {
                    setIsEditSaving(false);
                  }
                })();
              }
            : undefined
        }
        onDelete={canEditPlaylist ? handleDeletePlaylist : undefined}
      />

      {/* ── Body ── */}
      <div className="flex flex-col md:flex-row gap-0">
        {/* LEFT SIDEBAR — avatar + owner info */}
        <PlaylistOwnerSidebar
          owner={{
            username: playlist.owner?.username || username,
            displayName: playlist.owner?.displayName,
            avatarUrl: playlist.owner?.avatarUrl ?? undefined,
            id: playlist.owner?.id || username,
            followersCount: playlist.owner?.followerCount,
          }}
        />

        {/* LEFT — tracks + tags */}
        <div className="flex-1 min-w-0 px-4 py-5 space-y-5">
          <PlaylistTagsSection
            isPrivate={playlist.isPrivate}
            tags={playlistTags}
            editable={canEditPlaylist}
          />

          <ul className="flex flex-col list-none p-0 m-0">
            {orderedTracks.map((track, index) => (
              <PlaylistTrackList
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                isActive={activeTrackId === track.id}
                isPlaying={playerIsPlaying && activeTrackId === track.id}
                isDragTarget={
                  dragOverIndex === index &&
                  dragIndex !== null &&
                  dragIndex !== index
                }
                isDragging={dragIndex === index}
                draggable={canEditPlaylist && orderedTracks.length > 1}
                onPlay={() => handlePlayTrack(track.id)}
                onLike={() => {
                  void handleLikeTrack(track.id);
                }}
                onRepost={() => {
                  void handleRepostTrack(track.id);
                }}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={(event) => {
                  void handleDrop(event, index);
                }}
                onDragEnd={handleDragEnd}
              />
            ))}
          </ul>

          {isReorderSaving ? (
            <p className="text-xs text-text-muted">Saving playlist order...</p>
          ) : null}
        </div>

        {/* RIGHT — sidebar placeholder (wire up your own sidebar here) */}
        {/* <aside className="hidden md:block w-64 px-4 py-5 shrink-0">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
            You might also like
          </p>
        </aside> */}
        {/* RIGHT SIDEBAR */}
        <PlaylistEngagementSidebar
          username={username}
          playlistPathId={playlistPathId}
          likesCount={playlist.likeCount ?? 0}
          repostsCount={playlist.repostCount ?? 0}
        />
      </div>

      <EditPlaylistModal
        open={isEditModalOpen}
        isSaving={isEditSaving}
        playlist={{
          title: playlist.title,
          description: playlist.description ?? undefined,
          genre: playlist.genre,
          tags: playlistTags,
          isPrivate: playlist.isPrivate,
          coverArtUrl: resolvePlaylistCover(playlist),
        }}
        tracks={orderedTracks.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          coverUrl: track.coverUrl,
        }))}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveMetadata}
        isTrackMutationPending={isReorderSaving}
        onReorderTracks={handleModalReorder}
        onRemoveTrack={handleModalRemoveTrack}
      />

      <ShareModal
        variant="playlist"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        playlistId={String(playlist.id)}
        sharePathId={playlistPathId}
        shareUsername={ownerUsername}
        isPrivate={playlist.isPrivate? true : false}
        existingToken={playlist.secretToken}
        playlist={{
          title: playlist.title,
          owner: ownerDisplayName,
          coverUrl: resolvePlaylistCover(playlist),
          trackCount: orderedTracks.length,
        }}
      />
    </div>
  );
}
