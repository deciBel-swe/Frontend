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
  PlaylistRepostResponse,
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
import {
  canAccessMockResource,
  createUniqueMockSlug,
  resolveMockResourceAccess,
} from './mockResourceUtils';

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

const getPlaylistCoverUrl = (playlistId: number): string =>
  `https://picsum.photos/seed/decibel-playlist-${playlistId}/640/640`;

const getUserAvatar = (user: MockUserRecord): string =>
  user.profile.profilePic ||
  `https://picsum.photos/seed/decibel-user-${user.id}/200/200`;

const resolvePlaylistSlugValue = (playlist: MockPlaylistRecord): string => {
  return playlist.playlistSlug?.trim() || `playlist-${playlist.id}`;
};

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
  const normalizedPlaylistSlug = playlistSlug.trim().toLowerCase();
  const users = getMockUsersStore();
  for (const user of users) {
    for (const playlist of user.playlists) {
      const slug = resolvePlaylistSlugValue(playlist).toLowerCase();
      if (slug === normalizedPlaylistSlug) {
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

const isPlaylistLikedByUser = (playlistId: number, userId: number): boolean => {
  const viewer = getMockUsersStore().find((user) => user.id === userId);
  return Boolean(viewer?.likedPlaylists.includes(playlistId));
};

const isPlaylistRepostedByUser = (
  playlistId: number,
  userId: number
): boolean => {
  const viewer = getMockUsersStore().find((user) => user.id === userId);
  return Boolean(viewer?.repostedPlaylists?.includes(playlistId));
};

const playlistLikeCount = (playlistId: number): number => {
  return getMockUsersStore().filter((user) =>
    user.likedPlaylists.includes(playlistId)
  ).length;
};

const playlistRepostCount = (playlistId: number): number => {
  return getMockUsersStore().filter((user) =>
    user.repostedPlaylists?.includes(playlistId)
  ).length;
};

const assertPlaylistOwner = (
  owner: MockUserRecord,
  viewerId: number
): void => {
  if (owner.id !== viewerId) {
    throw new Error('Playlist not found');
  }
};

const assertPlaylistAccessible = (
  owner: MockUserRecord,
  playlist: MockPlaylistRecord,
  viewerId: number,
  providedToken?: string | null
): void => {
  if (
    !canAccessMockResource({
      isPrivate: playlist.isPrivate,
      ownerId: owner.id,
      viewerId,
      resourceToken: playlist.secretLink,
      providedToken,
    })
  ) {
    throw new Error('Playlist not found');
  }
};

const toTrackSummary = (
  trackId: number,
  currentUserId: number
): TrackSummaryDTO | null => {
  const users = getMockUsersStore();
  const track = getMockTracksStore().find((item) => item.id === trackId);

  if (!track) {
    return null;
  }

  if (
    !canAccessMockResource({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId: currentUserId,
    })
  ) {
    return null;
  }

  const artistUser = users.find((item) => item.id === track.artist.id);
  const artistFollowers = artistUser?.followers.size ?? 0;
  const artistTrackCount = artistUser?.tracks.length ?? 0;

  return {
    id: track.id,
    title: track.title,
    trackSlug: track.trackSlug,
    coverUrl: track.coverImageDataUrl ?? track.coverUrl,
    trackUrl: track.trackUrl,
    trackPreviewUrl: track.trackUrl,
    artist: {
      id: track.artist.id,
      username: track.artist.username,
      displayName:
        artistUser?.displayName ?? track.artist.displayName ?? track.artist.username,
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
    likeCount: track.likes ?? track.likeCount,
    repostCount: track.reposters ?? track.repostCount,
    commentCount: 0,
    isLiked: isTrackLikedByUser(track.id, currentUserId),
    isReposted: isTrackRepostedByUser(track.id, currentUserId),
    secretToken: track.secretLink ?? '',
    access: resolveMockResourceAccess({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId: currentUserId,
    }),
  };
};

const toPlaylistResponse = (
  owner: MockUserRecord,
  playlist: MockPlaylistRecord,
  currentUserId = resolveCurrentMockUserId()
): PlaylistResponse => {
  const trackEntries = playlist.tracks
    .map((item) => ({
      item,
      summary: toTrackSummary(item.trackId, currentUserId),
    }))
    .filter(
      (
        entry
      ): entry is {
        item: MockPlaylistRecord['tracks'][number];
        summary: TrackSummaryDTO;
      } => Boolean(entry.summary)
    );
  const tracks = trackEntries.map((entry) => entry.summary);

  const totalDurationSeconds = trackEntries.reduce(
    (total, entry) => total + (entry.item.durationSeconds ?? 0),
    0
  );
  const firstTrack = tracks[0];
  const firstTrackRecord = getMockTracksStore().find(
    (track) => track.id === playlist.tracks[0]?.trackId
  );
  const likeCount = playlistLikeCount(playlist.id);
  const repostCount = playlistRepostCount(playlist.id);

  return {
    id: playlist.id,
    title: playlist.title,
    type: playlist.type,
    isLiked: isPlaylistLikedByUser(playlist.id, currentUserId),
    isReposted: isPlaylistRepostedByUser(playlist.id, currentUserId),
    likeCount,
    repostCount,
    playlistSlug: resolvePlaylistSlugValue(playlist),
    description: playlist.description ?? '',
    isPrivate: playlist.isPrivate,
    coverArtUrl: playlist.CoverArt || firstTrack?.coverUrl || getPlaylistCoverUrl(playlist.id),
    totalDurationSeconds,
    trackCount: tracks.length,
    owner: {
      id: owner.id,
      username: owner.username,
      displayName: owner.displayName || owner.username,
      avatarUrl: getUserAvatar(owner),
      isFollowing: owner.followers.has(currentUserId),
      followerCount: owner.followers.size,
      trackCount: owner.tracks.length,
    },
    genre: firstTrackRecord?.genre ?? 'Unknown',
    createdAt: new Date().toISOString(),
    tracks,
    trackSummary: tracks,
    secretToken: playlist.secretLink ?? '',
    firstTrackWaveformUrl:
      firstTrackRecord?.waveformUrl ??
      '/images/default-waveform.json',
    firstTrackWaveformData: firstTrackRecord?.waveformData ?? [],
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
    const playlistSlug = createUniqueMockSlug(
      title,
      'playlist',
      owner.playlists.map((playlist) => resolvePlaylistSlugValue(playlist))
    );
    const secretLink = payload.isPrivate ? createSecretToken() : undefined;

    owner.playlists.unshift({
      id,
      title,
      playlistSlug,
      description,
      type: payload.type,
      isPrivate: payload.isPrivate,
      CoverArt: payload.CoverArt,
      isLiked: false,
      owner: {
        id: owner.id,
        username: owner.username,
        displayName: owner.displayName,
        avatarUrl: owner.profile.profilePic,
      },
      tracks: [],
      secretLink,
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

    const viewerId = resolveCurrentMockUserId();
    assertPlaylistAccessible(resolved.owner, resolved.playlist, viewerId);

    return toPlaylistResponse(resolved.owner, resolved.playlist, viewerId);
  }

  async getUserPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    await delay();

    const viewerId = resolveCurrentMockUserId();
    const owner = getMockUsersStore().find((user) => user.username === username);

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
    assertPlaylistOwner(owner, resolveCurrentMockUserId());
    const nextIsPrivate = payload.isPrivate;
    const secretLink = nextIsPrivate
      ? (playlist.secretLink ?? createSecretToken())
      : playlist.secretLink;

    playlist.title = payload.title.trim();
    playlist.description = payload.description?.trim() || undefined;
    playlist.type = payload.type;
    playlist.isPrivate = nextIsPrivate;
    playlist.CoverArt = payload.CoverArt;
    playlist.secretLink = secretLink;
    playlist.secretLinkExpiresAt =
      nextIsPrivate && !playlist.secretLinkExpiresAt
        ? toIsoDate(new Date(Date.now() + 1000 * 60 * 60 * 24))
        : playlist.secretLinkExpiresAt;

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
        assertPlaylistOwner(user, resolveCurrentMockUserId());
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

    if (!resolvePlaylistOwner(playlistId)) {
      throw new Error('Playlist not found');
    }
    const resolved = resolvePlaylistOwner(playlistId);
    if (!resolved) {
      throw new Error('Playlist not found');
    }
    assertPlaylistOwner(resolved.owner, resolveCurrentMockUserId());
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
    if (
      !canAccessMockResource({
        isPrivate: track.isPrivate,
        ownerId: track.artist.id,
        viewerId: resolveCurrentMockUserId(),
      })
    ) {
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
    assertPlaylistOwner(resolved.owner, resolveCurrentMockUserId());

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
    assertPlaylistOwner(owner, resolveCurrentMockUserId());

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
    assertPlaylistAccessible(
      resolved.owner,
      resolved.playlist,
      resolveCurrentMockUserId()
    );
  
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
    assertPlaylistOwner(resolved.owner, resolveCurrentMockUserId());

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
    assertPlaylistOwner(resolved.owner, resolveCurrentMockUserId());

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
    assertPlaylistAccessible(resolved.owner, resolved.playlist, currentUserId);
    const tracks = resolved.playlist.tracks.map((track) =>
      toTrackSummary(track.trackId, currentUserId)
    ).filter((track): track is TrackSummaryDTO => Boolean(track));

    return paginateTracks(tracks, params);
  }

  async resolvePlaylistSlug(playlistSlug: string): Promise<PlaylistResourceRef> {
    await delay();

    const resolved = resolvePlaylistBySlug(playlistSlug.trim());
    if (!resolved) {
      throw new Error('Playlist not found');
    }
    assertPlaylistAccessible(
      resolved.owner,
      resolved.playlist,
      resolveCurrentMockUserId()
    );

    return {
      type: 'PLAYLIST',
      id: resolved.playlist.id,
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
    assertPlaylistAccessible(
      resolved.owner,
      resolved.playlist,
      currentUserId
    );

    if (!currentUser.likedPlaylists.includes(playlistId)) {
      currentUser.likedPlaylists.push(playlistId);
    }
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
    assertPlaylistAccessible(
      resolved.owner,
      resolved.playlist,
      currentUserId
    );

    currentUser.likedPlaylists = currentUser.likedPlaylists.filter(
      (id) => id !== playlistId
    );
    persistMockSystemState();

    return { message: 'Playlist unliked', isLiked: false };
  }

  async repostPlaylist(playlistId: number): Promise<PlaylistRepostResponse> {
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
    assertPlaylistAccessible(
      resolved.owner,
      resolved.playlist,
      currentUserId
    );

    if (!currentUser.repostedPlaylists.includes(playlistId)) {
      currentUser.repostedPlaylists.push(playlistId);
    }

    persistMockSystemState();

    return { message: 'Playlist reposted', isReposted: true };
  }

  async unrepostPlaylist(playlistId: number): Promise<PlaylistRepostResponse> {
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
    assertPlaylistAccessible(
      resolved.owner,
      resolved.playlist,
      currentUserId
    );

    currentUser.repostedPlaylists = currentUser.repostedPlaylists.filter(
      (id) => id !== playlistId
    );

    persistMockSystemState();

    return { message: 'Playlist unreposted', isReposted: false };
  }
}
