import type {
  DiscoveryService,
  PaginationParams,
  SearchRequestOptions,
  SearchParams,
  TrendingParams,
} from '@/services/api/discoveryService';
import type {
  PaginatedSearchResponseDTO,
  PaginatedStationResponseDTO,
  ResourceRefFullDTO,
  TrendingTracksResponseDTO,
} from '@/types/discovery';
import type { UserSummaryDTO } from '@/types/user';
import type { TrackSummaryDTO } from '@/types/tracks';
import type { PlaylistSummaryDTO } from '@/types/playlists';
import type { FullTrackDTO } from '@/types/tracks';
import type { FullPlaylistDTO } from '@/types/playlists';
import {
  getMockTracksStore,
  getMockUsersStore,
  resolveCurrentMockUserId,
} from './mockSystemStore';
import {
  canAccessMockResource,
  resolveMockResourceAccess,
} from './mockResourceUtils';

const MOCK_DELAY_MS = 120;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const paginate = <T>(items: T[], params?: PaginationParams) => {
  const pageNumber = Math.max(0, params?.page ?? 0);
  const pageSize = Math.max(1, params?.size ?? 20);
  const totalElements = items.length;
  const totalPages =
    totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
  const start = pageNumber * pageSize;
  const content = items.slice(start, start + pageSize);
  const isLast = pageNumber >= totalPages - 1;

  return {
    content,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    isLast,
  };
};

const buildUserSummary = (userId: number): UserSummaryDTO => {
  const user = getMockUsersStore().find((item) => item.id === userId);
  if (!user) {
    return {
      id: userId,
      username: 'unknown',
      displayName: 'unknown',
      avatarUrl: '',
      isFollowing: false,
      followerCount: 0,
      trackCount: 0,
    };
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    avatarUrl: user.profile.profilePic ?? '',
    isFollowing: false,
    followerCount: user.followers.size,
    trackCount: user.tracks.length,
  };
};

const buildTrackSummary = (
  trackId: number,
  viewerId: number
): TrackSummaryDTO | null => {
  const track = getMockTracksStore().find((item) => item.id === trackId);
  if (!track) {
    return null;
  }
  if (
    !canAccessMockResource({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId,
    })
  ) {
    return null;
  }

  return {
    id: track.id,
    title: track.title,
    trackSlug: track.trackSlug,
    coverUrl: track.coverImageDataUrl ?? track.coverUrl,
    trackUrl: track.trackUrl,
    trackPreviewUrl: track.trackUrl,
    artist: buildUserSummary(track.artist.id),
    playCount: (track.likes ?? track.likeCount) * 25,
    likeCount: track.likes ?? track.likeCount,
    repostCount: track.reposters ?? track.repostCount,
    commentCount: 0,
    isLiked: false,
    isReposted: false,
    secretToken: track.secretLink ?? '',
    access: resolveMockResourceAccess({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId,
    }),
  };
};

const buildPlaylistSummary = (
  playlistId: number,
  viewerId: number
): PlaylistSummaryDTO | null => {
  const users = getMockUsersStore();
  for (const user of users) {
    const playlist = user.playlists.find((item) => item.id === playlistId);
    if (!playlist) {
      continue;
    }
    if (
      !canAccessMockResource({
        isPrivate: playlist.isPrivate,
        ownerId: user.id,
        viewerId,
      })
    ) {
      return null;
    }

    const tracks = playlist.tracks
      .map((track) => buildTrackSummary(track.trackId, viewerId))
      .filter((track): track is TrackSummaryDTO => Boolean(track));

    return {
      id: playlist.id,
      title: playlist.title,
      playlistSlug: playlist.playlistSlug,
      isLiked: playlist.isLiked,
      isPrivate: playlist.isPrivate,
      coverArtUrl: playlist.CoverArt ?? '',
      trackCount: tracks.length,
      owner: buildUserSummary(user.id),
      genre: 'playlist-genre',
      tracks,
      secretToken: playlist.secretLink ?? '',
    };
  }

  return null;
};

const buildResourceForTrack = (
  trackId: number,
  viewerId: number
): ResourceRefFullDTO | null => {
  const summary = buildTrackSummary(trackId, viewerId);
  if (!summary) {
    return null;
  }

  return {
    resourceType: 'TRACK',
    resourceId: trackId,
    playlist: null,
    track: {
      ...(summary as unknown as FullTrackDTO),
      waveformUrl: getMockTracksStore().find((t) => t.id === trackId)?.waveformUrl ?? '',
      genre: getMockTracksStore().find((t) => t.id === trackId)?.genre ?? '',
      isReposted: false,
      isLiked: false,
      tags: getMockTracksStore().find((t) => t.id === trackId)?.tags ?? [],
      releaseDate: getMockTracksStore().find((t) => t.id === trackId)?.releaseDate ?? '',
      playCount: getMockTracksStore().find((t) => t.id === trackId)?.likes ?? 0,
      CompletedPlayCount: 0,
      likeCount: getMockTracksStore().find((t) => t.id === trackId)?.likes ?? 0,
      repostCount: getMockTracksStore().find((t) => t.id === trackId)?.reposters ?? 0,
      commentCount: 0,
      isPrivate: Boolean(getMockTracksStore().find((t) => t.id === trackId)?.isPrivate),
      trackDurationSeconds: getMockTracksStore().find((t) => t.id === trackId)?.durationSeconds ?? 0,
      uploadDate: getMockTracksStore().find((t) => t.id === trackId)?.releaseDate ?? '',
      description: '',
      trendingRank: 0,
      access: resolveMockResourceAccess({
        isPrivate: Boolean(getMockTracksStore().find((t) => t.id === trackId)?.isPrivate),
        ownerId: getMockTracksStore().find((t) => t.id === trackId)?.artist.id ?? 0,
        viewerId,
      }),
      secretToken: getMockTracksStore().find((t) => t.id === trackId)?.secretLink ?? '',
      trackPreviewUrl: getMockTracksStore().find((t) => t.id === trackId)?.trackUrl ?? '',
    },
    user: null,
  };
};

const buildResourceForPlaylist = (
  playlistId: number,
  viewerId: number
): ResourceRefFullDTO | null => {
  const playlistSummary = buildPlaylistSummary(playlistId, viewerId);
  if (!playlistSummary) {
    return null;
  }
  const firstTrack = playlistSummary.tracks[0];
  const firstTrackRecord = getMockTracksStore().find(
    (track) => track.id === firstTrack?.id
  );

  return {
    resourceType: 'PLAYLIST',
    resourceId: playlistId,
    playlist: {
      ...(playlistSummary as unknown as FullPlaylistDTO),
      description: '',
      totalDurationSeconds: 0,
      createdAt: new Date().toISOString(),
      tracks: playlistSummary.tracks,
      isReposted: false,
      likeCount: (playlistSummary as { likeCount?: number }).likeCount ?? 0,
      repostCount: (playlistSummary as { repostCount?: number }).repostCount ?? 0,
      firstTrackWaveformUrl:
        firstTrackRecord?.waveformUrl ?? '/images/default-waveform.json',
      firstTrackWaveformData: firstTrackRecord?.waveformData ?? [],
    },
    track: null,
    user: null,
  };
};

const buildResourceForUser = (userId: number): ResourceRefFullDTO => ({
  resourceType: 'USER',
  resourceId: userId,
  playlist: null,
  track: null,
  user: buildUserSummary(userId),
});

export class MockDiscoveryService implements DiscoveryService {
  async search(
    params: SearchParams,
    _options?: SearchRequestOptions
  ): Promise<PaginatedSearchResponseDTO> {
    await delay();

    const query = params.q.trim().toLowerCase();
    const type = params.type ?? 'ALL';
    const viewerId = resolveCurrentMockUserId();

    const trackMatches = getMockTracksStore().filter((track) => {
      if (
        !canAccessMockResource({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId,
        })
      ) {
        return false;
      }
      const titleMatch = track.title.toLowerCase().includes(query);
      const tagMatch = track.tags.some((tag) =>
        tag.toLowerCase().includes(query)
      );
      return titleMatch || tagMatch;
    });

    const userMatches = getMockUsersStore().filter((user) =>
      user.username.toLowerCase().includes(query)
    );

    const playlistMatches = getMockUsersStore()
      .flatMap((user) =>
        user.playlists.filter((playlist) => {
          if (
            !canAccessMockResource({
              isPrivate: playlist.isPrivate,
              ownerId: user.id,
              viewerId,
            })
          ) {
            return false;
          }

          return playlist.title.toLowerCase().includes(query);
        })
      );

    const trackResources = trackMatches.map((track) =>
      buildResourceForTrack(track.id, viewerId)
    ).filter((resource): resource is ResourceRefFullDTO => Boolean(resource));
    const userResources = userMatches.map((user) => buildResourceForUser(user.id));
    const playlistResources = playlistMatches.map((playlist) =>
      buildResourceForPlaylist(playlist.id, viewerId)
    ).filter((resource): resource is ResourceRefFullDTO => Boolean(resource));

    if (type === 'TRACKS') {
      return paginate(trackResources, params);
    }

    if (type === 'USERS') {
      return paginate(userResources, params);
    }

    if (type === 'PLAYLISTS') {
      return paginate(playlistResources, params);
    }

    const results: ResourceRefFullDTO[] = [];
    const maxLength = Math.max(
      trackResources.length,
      userResources.length,
      playlistResources.length
    );

    for (let index = 0; index < maxLength; index += 1) {
      if (trackResources[index]) {
        results.push(trackResources[index]);
      }

      if (userResources[index]) {
        results.push(userResources[index]);
      }

      if (playlistResources[index]) {
        results.push(playlistResources[index]);
      }
    }

    return paginate(results, params);
  }

  async getTrending(params?: TrendingParams): Promise<TrendingTracksResponseDTO> {
    await delay();

    const limit = Math.max(1, Math.min(50, params?.limit ?? 20));
    const viewerId = resolveCurrentMockUserId();

    const tracks = [...getMockTracksStore()]
      .filter((track) =>
        canAccessMockResource({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId,
        })
      )
      .sort(
        (a, b) =>
          (b.likes ?? b.likeCount ?? 0) - (a.likes ?? a.likeCount ?? 0)
      )
      .slice(0, limit)
      .map((track, index) => {
        const resource = buildResourceForTrack(track.id, viewerId);
        if (resource?.track) {
          resource.track.trendingRank = index + 1;
        }
        return resource;
      })
      .filter((resource): resource is ResourceRefFullDTO => Boolean(resource));

    return tracks;
  }

  async getGenreStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    await delay();
    const viewerId = resolveCurrentMockUserId();
    const items = getMockTracksStore()
      .filter((track) =>
        canAccessMockResource({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId,
        })
      )
      .map((track, index) => ({
        id: track.id,
        type: 'TRACK' as const,
        track: buildTrackSummary(track.id, viewerId),
        createdAt: new Date(Date.now() - index * 60000).toISOString(),
      }))
      .filter(
        (
          item
        ): item is {
          id: number;
          type: 'TRACK';
          track: TrackSummaryDTO;
          createdAt: string;
        } => Boolean(item.track)
      );

    return paginate(items, params);
  }

  async getArtistStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    await delay();
    const viewerId = resolveCurrentMockUserId();
    const items = getMockTracksStore()
      .filter((track) =>
        canAccessMockResource({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId,
        })
      )
      .map((track, index) => ({
        id: track.id,
        type: 'TRACK' as const,
        track: buildTrackSummary(track.id, viewerId),
        createdAt: new Date(Date.now() - index * 60000).toISOString(),
      }))
      .filter(
        (
          item
        ): item is {
          id: number;
          type: 'TRACK';
          track: TrackSummaryDTO;
          createdAt: string;
        } => Boolean(item.track)
      );

    return paginate(items, params);
  }

  async getLikesStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    await delay();
    const viewerId = resolveCurrentMockUserId();
    const items = getMockTracksStore()
      .filter((track) =>
        canAccessMockResource({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId,
        })
      )
      .map((track, index) => ({
        id: track.id,
        type: 'TRACK' as const,
        track: buildTrackSummary(track.id, viewerId),
        createdAt: new Date(Date.now() - index * 60000).toISOString(),
      }))
      .filter(
        (
          item
        ): item is {
          id: number;
          type: 'TRACK';
          track: TrackSummaryDTO;
          createdAt: string;
        } => Boolean(item.track)
      );

    return paginate(items, params);
  }
}
