import type {
  PaginationParams,
  PlaylistService,
} from '@/services/api/playlistService';
import type {
  CreatePlaylistRequest,
  PaginatedPlaylistsResponse,
  AddPlaylistTrackRequest,
  PaginatedPlaylistTracksResponse,
  PlaylistEmbedResponse,
  PlaylistResponse,
  PlaylistLikeResponse,
  PlaylistResourceRef,
  PlaylistSecretLinkRegenerateResponse,
  PlaylistSecretLinkResponse,
  PlaylistUpdateResponse,
  ReorderPlaylistTracksRequest,
  UpdatePlaylistRequest,
} from '@/types/playlists';
import type { TrackSummaryDTO } from '@/types/tracks';
import {
  getMockTracksStore,
  getMockUsersStore,
  type MockPlaylistRecord,
  type MockUserRecord,
  persistMockSystemState,
  resolveCurrentMockUserId,
} from './mockSystemStore';

const MOCK_DELAY_MS = 220;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const createSecretToken = (): string =>
  Math.random().toString(36).slice(2, 10);

const toIsoDate = (date: Date): string => date.toISOString();

const getNextPlaylistId = (): number => {
  const users = getMockUsersStore();
  const allPlaylists = users.flatMap((user) => user.playlists);
  if (allPlaylists.length === 0) {
    return 1;
  }
  return Math.max(...allPlaylists.map((playlist) => playlist.id)) + 1;
};

const toSlug = (value: string, id: number, fallback: string): string => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${normalized || fallback}-${id}`;
};

const getPlaylistCoverUrl = (playlistId: number): string =>
  `https://picsum.photos/seed/decibel-playlist-${playlistId}/640/640`;

const getUserAvatar = (user: MockUserRecord): string =>
  user.profile.profilePic ||
  `https://picsum.photos/seed/decibel-user-${user.id}/200/200`;

const resolvePlaylistOwner = (
  playlistId: number
): { owner: MockUserRecord; playlist: MockPlaylistRecord } | null => {
  const users = getMockUsersStore();
  for (const user of users) {
    const playlist = user.playlists.find((item) => item.id === playlistId);
    if (playlist) {
      return { owner: user, playlist };
    }
  }

  return null;
};

const resolvePlaylistByToken = (
  token: string
): { owner: MockUserRecord; playlist: MockPlaylistRecord } | null => {
  const users = getMockUsersStore();
  for (const user of users) {
    const playlist = user.playlists.find((item) => item.secretLink === token);
    if (playlist) {
      return { owner: user, playlist };
    }
  }

  return null;
};

const resolvePlaylistBySlug = (
  playlistSlug: string
): { owner: MockUserRecord; playlist: MockPlaylistRecord } | null => {
  const users = getMockUsersStore();
  for (const user of users) {
    for (const playlist of user.playlists) {
      const slug = toSlug(playlist.title, playlist.id, 'playlist');
      if (slug === playlistSlug) {
        return { owner: user, playlist };
      }
    }
  }

  return null;
};

const isTrackLikedByUser = (trackId: number, userId: number): boolean => {
  const viewer = getMockUsersStore().find((user) => user.id === userId);
  return Boolean(viewer?.likedTracks.some((track) => track.id === trackId));
};

const isTrackRepostedByUser = (trackId: number, userId: number): boolean => {
  const viewer = getMockUsersStore().find((user) => user.id === userId);
  return Boolean(viewer?.reposts.some((track) => track.id === trackId));
};

const toTrackSummary = (
  trackId: number,
  currentUserId: number
): TrackSummaryDTO => {
  const users = getMockUsersStore();
  const track = getMockTracksStore().find((item) => item.id === trackId);

  if (!track) {
    return {
      id: trackId,
      title: `Track ${trackId}`,
      trackSlug: `track-${trackId}`,
      coverUrl: `https://picsum.photos/seed/decibel-cover-${trackId}/640/640`,
      trackUrl: `http://localhost:3000/tracks/${trackId}`,
      trackPreviewUrl: `http://localhost:3000/tracks/${trackId}`,
      artist: {
        id: 0,
        username: 'unknown',
        displayName: 'Unknown',
        avatarUrl: `https://picsum.photos/seed/decibel-user-${trackId}/200/200`,
        isFollowing: false,
        followerCount: 0,
        trackCount: 0,
      },
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

  const artistUser = users.find((item) => item.id === track.artist.id);
  const artistFollowers = artistUser?.followers.size ?? 0;
  const artistTrackCount = artistUser?.tracks.length ?? 0;

  return {
    id: track.id,
    title: track.title,
    trackSlug: toSlug(track.title, track.id, 'track'),
    coverUrl: track.coverImageDataUrl ?? track.coverUrl,
    trackUrl: track.trackUrl,
    trackPreviewUrl: track.trackUrl,
    artist: {
      id: track.artist.id,
      username: track.artist.username,
      displayName: artistUser?.username ?? track.artist.username,
      avatarUrl:
        artistUser?.profile.profilePic ??
        `https://picsum.photos/seed/decibel-user-${track.artist.id}/200/200`,
      isFollowing: artistUser
        ? artistUser.followers.has(currentUserId)
        : false,
      followerCount: artistFollowers,
      trackCount: artistTrackCount,
    },
    playCount: 0,
    likeCount: track.likes,
    repostCount: track.reposters,
    commentCount: 0,
    isLiked: isTrackLikedByUser(track.id, currentUserId),
    isReposted: isTrackRepostedByUser(track.id, currentUserId),
    secretToken: track.secretLink ?? '',
    access: track.isPrivate ? 'PREVIEW' : 'PLAYABLE',
  };
};

const toPlaylistResponse = (
  owner: MockUserRecord,
  playlist: MockPlaylistRecord,
  currentUserId = resolveCurrentMockUserId()
): PlaylistResponse => {
  const tracks = playlist.tracks.map((item) =>
    toTrackSummary(item.trackId, currentUserId)
  );

  const totalDurationSeconds = playlist.tracks.reduce(
    (total, track) => total + (track.durationSeconds ?? 0),
    0
  );
  const firstTrack = tracks[0];
  const firstTrackRecord = getMockTracksStore().find(
    (track) => track.id === playlist.tracks[0]?.trackId
  );

  return {
    id: playlist.id,
    title: playlist.title,
    type: playlist.type,
    isLiked: playlist.isLiked,
    playlistSlug: toSlug(playlist.title, playlist.id, 'playlist'),
    description: playlist.description ?? '',
    isPrivate: playlist.isPrivate,
    coverArtUrl: playlist.CoverArt || firstTrack?.coverUrl || getPlaylistCoverUrl(playlist.id),
    totalDurationSeconds,
    trackCount: tracks.length,
    owner: {
      id: owner.id,
      username: owner.username,
      displayName: owner.username,
      avatarUrl: getUserAvatar(owner),
      isFollowing: owner.followers.has(currentUserId),
      followerCount: owner.followers.size,
      trackCount: owner.tracks.length,
    },
    genre: firstTrackRecord?.genre ?? 'Unknown',
    createdAt: new Date().toISOString(),
    tracks,
    secretToken: playlist.secretLink ?? '',
    firstTrackWaveformUrl:
      firstTrackRecord?.waveformUrl ??
      'http://localhost:3000/images/default-waveform.json',
  };
};

const paginateTracks = (
  tracks: TrackSummaryDTO[],
  params?: PaginationParams
): PaginatedPlaylistTracksResponse => {
  const pageNumber = Math.max(0, params?.page ?? 0);
  const pageSize = Math.max(1, params?.size ?? 20);
  const start = pageNumber * pageSize;
  const end = start + pageSize;
  const content = tracks.slice(start, end);
  const totalElements = tracks.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const isLast = totalPages === 0 ? true : pageNumber >= totalPages - 1;

  return {
    content,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    isLast,
  };
};

const paginatePlaylists = (
  playlists: PlaylistResponse[],
  params?: PaginationParams
): PaginatedPlaylistsResponse => {
  const pageNumber = Math.max(0, params?.page ?? 0);
  const pageSize = Math.max(1, params?.size ?? 20);
  const start = pageNumber * pageSize;
  const end = start + pageSize;
  const content = playlists.slice(start, end);
  const totalElements = playlists.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const isLast = totalPages === 0 ? true : pageNumber >= totalPages - 1;

  return {
    content,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    isLast,
  };
};

export class MockPlaylistService implements PlaylistService {
  async createPlaylist(
    payload: CreatePlaylistRequest
  ): Promise<PlaylistResponse> {
    await delay();

    const currentUserId = resolveCurrentMockUserId();
    const users = getMockUsersStore();
    const owner = users.find((user) => user.id === currentUserId) ?? users[0];

    if (!owner) {
      throw new Error('No mock user available to own playlist');
    }

    const id = getNextPlaylistId();
    const title = payload.title.trim();
    const description = payload.description?.trim() || undefined;

    owner.playlists.unshift({
      id,
      title,
      description,
      type: payload.type,
      isPrivate: payload.isPrivate,
      CoverArt: payload.CoverArt,
      isLiked: false,
      owner: {
        id: owner.id,
        username: owner.username,
      },
      tracks: [],
      secretLink: payload.isPrivate ? createSecretToken() : undefined,
      secretLinkExpiresAt: payload.isPrivate
        ? toIsoDate(new Date(Date.now() + 1000 * 60 * 60 * 24))
        : undefined,
    });
    persistMockSystemState();

    const created = owner.playlists.find((item) => item.id === id);
    if (!created) {
      throw new Error('Playlist not found');
    }

    return toPlaylistResponse(owner, created, currentUserId);
  }

  async getPlaylist(playlistId: number): Promise<PlaylistResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    return toPlaylistResponse(
      resolved.owner,
      resolved.playlist,
      resolveCurrentMockUserId()
    );
  }

  async getUserPlaylists(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    await delay();

    const viewerId = resolveCurrentMockUserId();
    const owner = getMockUsersStore().find((user) => user.id === userId);

    if (!owner) {
      throw new Error('User not found');
    }

    const playlists = owner.playlists
      .filter((playlist) => !playlist.isPrivate || owner.id === viewerId)
      .map((playlist) => toPlaylistResponse(owner, playlist, viewerId));

    return paginatePlaylists(playlists, params);
  }

  async getMePlaylists(
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    await delay();

    const viewerId = resolveCurrentMockUserId();
    const owner = getMockUsersStore().find((user) => user.id === viewerId);

    if (!owner) {
      throw new Error('Current user not found');
    }

    const playlists = owner.playlists.map((playlist) =>
      toPlaylistResponse(owner, playlist, viewerId)
    );

    return paginatePlaylists(playlists, params);
  }

  async getUserLikedPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    await delay();

    const viewerId = resolveCurrentMockUserId();
    const users = getMockUsersStore();
    const user = users.find((item) => item.username === username);

    if (!user) {
      throw new Error('User not found');
    }

    const likedPlaylists = user.likedPlaylists
      .map((likedPlaylistId) => resolvePlaylistOwner(likedPlaylistId))
      .filter((resolved): resolved is NonNullable<typeof resolved> => Boolean(resolved))
      .filter(({ owner, playlist }) => !playlist.isPrivate || owner.id === viewerId)
      .map(({ owner, playlist }) => toPlaylistResponse(owner, playlist, viewerId));

    return paginatePlaylists(likedPlaylists, params);
  }

  async updatePlaylist(
    playlistId: number,
    payload: UpdatePlaylistRequest
  ): Promise<PlaylistUpdateResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const { owner, playlist } = resolved;

    playlist.title = payload.title.trim();
    playlist.description = payload.description?.trim() || undefined;
    playlist.type = payload.type;
    playlist.isPrivate = payload.isPrivate;
    playlist.CoverArt = payload.CoverArt;

    persistMockSystemState();

    return toPlaylistResponse(owner, playlist, resolveCurrentMockUserId());
  }

  async deletePlaylist(playlistId: number): Promise<void> {
    await delay();

    const users = getMockUsersStore();
    for (const user of users) {
      const index = user.playlists.findIndex(
        (playlist) => playlist.id === playlistId
      );
      if (index >= 0) {
        user.playlists.splice(index, 1);
        persistMockSystemState();
        return;
      }
    }

    throw new Error('Playlist not found');
  }

  async addTrackToPlaylist(
    playlistId: number,
    payload: AddPlaylistTrackRequest
  ): Promise<{ message: string }> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const playlist = resolved.playlist;

    const existing = playlist.tracks.some(
      (track) => track.trackId === payload.trackId
    );
    if (existing) {
      return { message: 'Track already in playlist' };
    }

    const track = getMockTracksStore().find((item) => item.id === payload.trackId);
    if (!track) {
      throw new Error('Playlist or track not found');
    }

    playlist.tracks.push({
      trackId: payload.trackId,
      title: track.title,
      durationSeconds: track.durationSeconds ?? 0,
      trackUrl: track.trackUrl,
    });

    persistMockSystemState();
    return { message: 'Track added to playlist' };
  }

  async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number
  ): Promise<void> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const playlist = resolved.playlist;

    const index = playlist.tracks.findIndex(
      (track) => track.trackId === trackId
    );
    if (index < 0) {
      throw new Error('Playlist/track mapping not found');
    }

    playlist.tracks.splice(index, 1);
    persistMockSystemState();
  }

  async reorderPlaylistTracks(
    playlistId: number,
    payload: ReorderPlaylistTracksRequest
  ): Promise<PlaylistUpdateResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const { owner, playlist } = resolved;

    const trackMap = new Map(
      playlist.tracks.map((track) => [track.trackId, track])
    );

    const ordered = payload.trackIds
      .map((trackId) => trackMap.get(trackId))
      .filter((track): track is NonNullable<typeof track> => Boolean(track));

    const remaining = playlist.tracks.filter(
      (track) => !payload.trackIds.includes(track.trackId)
    );

    playlist.tracks = [...ordered, ...remaining];
    persistMockSystemState();

    return toPlaylistResponse(owner, playlist, resolveCurrentMockUserId());
  }

  async getPlaylistEmbed(
    playlistId: number
  ): Promise<PlaylistEmbedResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }
  
    const embedCode =
      `<iframe src="/playlists/${playlistId}" ` +
      'width="100%" height="400" frameborder="0" allow="autoplay"></iframe>';

    return { embedCode };
  }

  async getPlaylistSecretLink(
    playlistId: number
  ): Promise<PlaylistSecretLinkResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const playlist = resolved.playlist;

    if (!playlist.secretLink) {
      playlist.secretLink = createSecretToken();
      playlist.secretLinkExpiresAt = toIsoDate(
        new Date(Date.now() + 1000 * 60 * 60 * 24)
      );
      persistMockSystemState();
    }

    return { secretToken: playlist.secretLink };
  }

  async regeneratePlaylistSecretLink(
    playlistId: number
  ): Promise<PlaylistSecretLinkRegenerateResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const playlist = resolved.playlist;

    playlist.secretLink = createSecretToken();
    playlist.secretLinkExpiresAt = toIsoDate(
      new Date(Date.now() + 1000 * 60 * 60 * 24)
    );
    persistMockSystemState();

    return {
      secretToken: playlist.secretLink,
      secretUrl: `/playlists/token/${playlist.secretLink}`,
      expiresAt: playlist.secretLinkExpiresAt,
    };
  }

  async getPlaylistByToken(token: string): Promise<PlaylistResponse> {
    await delay();

    const resolved = resolvePlaylistByToken(token);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    return toPlaylistResponse(
      resolved.owner,
      resolved.playlist,
      resolveCurrentMockUserId()
    );
  }

  async getPlaylistTracks(
    playlistId: number,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistTracksResponse> {
    await delay();

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const currentUserId = resolveCurrentMockUserId();
    const tracks = resolved.playlist.tracks.map((track) =>
      toTrackSummary(track.trackId, currentUserId)
    );

    return paginateTracks(tracks, params);
  }

  async resolvePlaylistSlug(playlistSlug: string): Promise<PlaylistResourceRef> {
    await delay();

    const resolved = resolvePlaylistBySlug(playlistSlug.trim());
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    return {
      resourceType: 'PLAYLIST',
      resourceId: resolved.playlist.id,
    };
  }

  async likePlaylist(playlistId: number): Promise<PlaylistLikeResponse> {
    await delay();

    const users = getMockUsersStore();
    const currentUserId = resolveCurrentMockUserId();
    const currentUser = users.find((user) => user.id === currentUserId);

    if (!currentUser) {
      throw new Error('Current user not found');
    }

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const playlist = resolved.playlist;

    if (!currentUser.likedPlaylists.includes(playlistId)) {
      currentUser.likedPlaylists.push(playlistId);
    }

    playlist.isLiked = true;
    persistMockSystemState();

    return { message: 'Playlist liked', isLiked: true };
  }

  async unlikePlaylist(playlistId: number): Promise<PlaylistLikeResponse> {
    await delay();

    const users = getMockUsersStore();
    const currentUserId = resolveCurrentMockUserId();
    const currentUser = users.find((user) => user.id === currentUserId);

    if (!currentUser) {
      throw new Error('Current user not found');
    }

    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }

    const playlist = resolved.playlist;

    currentUser.likedPlaylists = currentUser.likedPlaylists.filter(
      (id) => id !== playlistId
    );
    playlist.isLiked = false;
    persistMockSystemState();

    return { message: 'Playlist unliked', isLiked: false };
  }
}
