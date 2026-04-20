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
} from './mockSystemStore';

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

const toSlug = (value: string, id: number) =>
  `${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;

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
    displayName: user.username,
    avatarUrl: user.profile.profilePic ?? '',
    isFollowing: false,
    followerCount: user.followers.size,
    trackCount: user.tracks.length,
  };
};

const buildTrackSummary = (trackId: number): TrackSummaryDTO => {
  const track = getMockTracksStore().find((item) => item.id === trackId);
  if (!track) {
    return {
      id: trackId,
      title: 'Unknown track',
      trackSlug: `track-${trackId}`,
      coverUrl: '',
      trackUrl: '',
      trackPreviewUrl: '',
      artist: buildUserSummary(0),
      playCount: 0,
      likeCount: 0,
      repostCount: 0,
      commentCount: 0,
      isLiked: false,
      isReposted: false,
      secretToken: '',
      access: 'PLAYABLE',
    };
  }

  return {
    id: track.id,
    title: track.title,
    trackSlug: toSlug(track.title, track.id),
    coverUrl: track.coverImageDataUrl ?? track.coverUrl,
    trackUrl: track.trackUrl,
    trackPreviewUrl: track.trackUrl,
    artist: buildUserSummary(track.artist.id),
    playCount: track.likes * 25,
    likeCount: track.likes,
    repostCount: track.reposters,
    commentCount: 0,
    isLiked: false,
    isReposted: false,
    secretToken: track.secretLink ?? '',
    access: 'PLAYABLE',
  };
};

const buildPlaylistSummary = (playlistId: number): PlaylistSummaryDTO => {
  const users = getMockUsersStore();
  for (const user of users) {
    const playlist = user.playlists.find((item) => item.id === playlistId);
    if (!playlist) {
      continue;
    }

    return {
      id: playlist.id,
      title: playlist.title,
      playlistSlug: toSlug(playlist.title, playlist.id),
      isLiked: playlist.isLiked,
      isPrivate: playlist.isPrivate,
      coverArtUrl: playlist.CoverArt ?? '',
      trackCount: playlist.tracks.length,
      owner: buildUserSummary(user.id),
      genre: 'playlist-genre',
      tracks: playlist.tracks.map((track) =>
        buildTrackSummary(track.trackId)
      ),
      secretToken: playlist.secretLink ?? '',
    };
  }

  return {
    id: playlistId,
    title: 'Unknown playlist',
    playlistSlug: `playlist-${playlistId}`,
    isLiked: false,
    isPrivate: false,
    coverArtUrl: '',
    trackCount: 0,
    owner: buildUserSummary(0),
    genre: 'playlist-genre',
    tracks: [],
    secretToken: '',
  };
};

const buildResourceForTrack = (trackId: number): ResourceRefFullDTO => ({
  resourceType: 'TRACK',
  resourceId: trackId,
  playlist: null,
  track: {
    ...(buildTrackSummary(trackId) as unknown as FullTrackDTO),
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
    isPrivate: false,
    trackDurationSeconds: getMockTracksStore().find((t) => t.id === trackId)?.durationSeconds ?? 0,
    uploadDate: getMockTracksStore().find((t) => t.id === trackId)?.releaseDate ?? '',
    description: '',
    trendingRank: 0,
    access: 'PLAYABLE',
    secretToken: getMockTracksStore().find((t) => t.id === trackId)?.secretLink ?? '',
    trackPreviewUrl: getMockTracksStore().find((t) => t.id === trackId)?.trackUrl ?? '',
  },
  user: null,
});

const buildResourceForPlaylist = (playlistId: number): ResourceRefFullDTO => {
  const playlistSummary = buildPlaylistSummary(playlistId);
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

    const trackMatches = getMockTracksStore().filter((track) => {
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
      .flatMap((user) => user.playlists)
      .filter((playlist) =>
        playlist.title.toLowerCase().includes(query)
      );

    const trackResources = trackMatches.map((track) =>
      buildResourceForTrack(track.id)
    );
    const userResources = userMatches.map((user) => buildResourceForUser(user.id));
    const playlistResources = playlistMatches.map((playlist) =>
      buildResourceForPlaylist(playlist.id)
    );

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

    const tracks = [...getMockTracksStore()]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit)
      .map((track, index) => {
        const resource = buildResourceForTrack(track.id);
        if (resource.track) {
          resource.track.trendingRank = index + 1;
        }
        return resource;
      });

    return tracks;
  }

  async getGenreStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    await delay();
    const items = getMockTracksStore().map((track, index) => ({
      id: track.id,
      type: 'TRACK' as const,
      track: buildTrackSummary(track.id),
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    }));

    return paginate(items, params);
  }

  async getArtistStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    await delay();
    const items = getMockTracksStore().map((track, index) => ({
      id: track.id,
      type: 'TRACK' as const,
      track: buildTrackSummary(track.id),
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    }));

    return paginate(items, params);
  }

  async getLikesStation(
    params?: PaginationParams
  ): Promise<PaginatedStationResponseDTO> {
    await delay();
    const items = getMockTracksStore().map((track, index) => ({
      id: track.id,
      type: 'TRACK' as const,
      track: buildTrackSummary(track.id),
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    }));

    return paginate(items, params);
  }
}
