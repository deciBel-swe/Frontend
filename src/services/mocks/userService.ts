import type { PaginationParams, UserService } from '@/services/api/userService';
import {
  getMockTracksStore,
  getMockUsersStore,
  getMockPlaylistsStore,
  persistMockSystemState,
  resolveCurrentMockUserId,
  syncAuthAccountsToMockUsers,
  MockPlaylistRecord,
  type MockUserRecord,
} from './mockSystemStore';
import {
  canAccessMockResource,
  resolveMockResourceAccess,
} from './mockResourceUtils';
import type {
  AddNewEmailRequest,
  FollowResponse,
  MessageResponse,
  PaginatedHistoryResponse,
  PaginatedFollowersResponse,
  PaginatedTracksResponse,
  PrivateSocialLinks,
  ResetLoggedInPasswordRequest,
  SearchUser,
  UpdateImagesResponse,
  UpdateMeRequest,
  UpdatePrimaryEmailRequest,
  UpdateRoleRequest,
  UpdateSocialLinksRequest,
  UpdateTierRequest,
  UpdateTierResponse,
  UserMe,
  UserPlaylistsResponse,
  UserPublic,
  UsersSuggestedResponse,
  ChangeEmailResponse,
  VerifyEmailChangeResponse,
} from '@/types/user';
import type {
  PaginatedPlaylistsResponse,
  PlaylistResponse,
  PlaylistType,
} from '@/types/playlists';
import type {
  PaginatedRepostResponseDTO,
  ResourceRefFullDTO,
} from '@/types/discovery';
import type { FullTrackDTO } from '@/types/tracks';
import type { FullPlaylistDTO } from '@/types/playlists';

const MOCK_DELAY_MS = 120;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

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

const inMemoryUsers = getMockUsersStore();

const syncAuthAccountsToUserStore = (): void => {
  syncAuthAccountsToMockUsers();
};

const resolveCurrentUserId = (): number => {
  return resolveCurrentMockUserId();
};

const commitMockUserState = (): void => {
  persistMockSystemState();
};

const getCurrentUser = (): MockUserRecord => {
  syncAuthAccountsToUserStore();
  const currentUserId = resolveCurrentUserId();
  const current = inMemoryUsers.find((user) => user.id === currentUserId);
  if (!current) {
    throw new Error('Current user not found');
  }
  return current;
};

const findUser = (userId: number): MockUserRecord => {
  syncAuthAccountsToUserStore();
  const user = inMemoryUsers.find((user) => user.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const toSearchUser = (
  target: MockUserRecord,
  viewer: MockUserRecord
): SearchUser => ({
  id: target.id,
  username: target.username,
  displayName: target.displayName,
  avatarUrl: target.profile.profilePic,
  tier: target.tier,
  isFollowing: viewer.following.has(target.id),
});

const mergeDefinedSocialLinks = (
  current: MockUserRecord['socialLinks'],
  updates: Partial<MockUserRecord['socialLinks']>
): MockUserRecord['socialLinks'] => {
  const merged = { ...current };

  for (const [key, value] of Object.entries(updates) as Array<
    [keyof MockUserRecord['socialLinks'], string | undefined]
  >) {
    if (typeof value === 'string') {
      merged[key] = value;
    }
  }

  return merged;
};

const toUserPublic = (
  user: MockUserRecord,
  viewer: MockUserRecord
): UserPublic => ({
  profile: {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName || user.username,
    tier: user.tier,
    followerCount: user.followers.size,
    followingCount: user.following.size,
    trackCount: user.tracks.length,
    isFollowed: user.following.has(viewer.id),
    isFollowing: viewer.following.has(user.id),
    isBlocked: viewer.blocked.has(user.id),
    bio: user.profile.bio,
    city: user.profile.city,
    country: user.profile.country || null,
    profilePic: user.profile.profilePic,
    coverPic: user.profile.coverPic,
    favoriteGenres: [...user.profile.favoriteGenres],
    socialLinksDto: [
      {
        instagram: user.socialLinks.instagram || null,
        twitter: user.socialLinks.twitter || null,
        website: user.socialLinks.website || null,
      },
    ],
  },
  privacySettings: user.privacySettings.isPrivate
    ? { ...user.privacySettings }
    : null,
});

const toUserMe = (user: MockUserRecord): UserMe => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName || user.username,
  isBlocked: false,
  tier: user.tier,
  profile: {
    displayName: user.displayName || user.username,
    bio: user.profile.bio,
    city: user.profile.city,
    country: user.profile.country,
    profilePic: user.profile.profilePic,
    coverPic: user.profile.coverPic,
    favoriteGenres: [...user.profile.favoriteGenres],
  },
  socialLinks: {
    instagram: user.socialLinks.instagram,
    website: user.socialLinks.website,
    supportLink: user.socialLinks.supportLink,
    twitter: user.socialLinks.twitter,
  },
  privacySettings: {
    ...user.privacySettings,
  },
  stats: {
    followers: user.followers.size,
    following: user.following.size,
    tracksCount: user.tracks.length,
  },
});

const toPlaylistType = (type: MockPlaylistRecord['type']): PlaylistType => {
  return type as PlaylistType;
};

const toUserSummary = (target: MockUserRecord, viewer: MockUserRecord) => {
  return {
    id: target.id,
    username: target.username,
    displayName: target.displayName || target.username,
    avatarUrl: target.profile.profilePic || '/images/default_song_image.png',
    isFollowing: viewer.following.has(target.id),
    followerCount: target.followers.size,
    trackCount: target.tracks.length,
  };
};

const isTrackLikedByUser = (trackId: number, user: MockUserRecord): boolean => {
  return user.likedTracks.some((track) => track.id === trackId);
};

const isTrackRepostedByUser = (
  trackId: number,
  user: MockUserRecord
): boolean => {
  return user.reposts.some((track) => track.id === trackId);
};

const findTrackOwner = (trackId: number): MockUserRecord | undefined => {
  const track = getMockTracksStore().find((item) => item.id === trackId);
  if (!track) {
    return undefined;
  }

  return inMemoryUsers.find((user) => user.id === track.artist.id);
};

const buildFullTrack = (
  trackId: number,
  viewer: MockUserRecord
): FullTrackDTO | null => {
  const track = getMockTracksStore().find((item) => item.id === trackId);
  if (!track) {
    return null;
  }
  if (
    !canAccessMockResource({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId: viewer.id,
    })
  ) {
    return null;
  }

  const owner = findTrackOwner(trackId);
  const artist = owner
    ? toUserSummary(owner, viewer)
    : {
        id: track.artist.id,
        username: track.artist.username,
        displayName: track.artist.username,
        avatarUrl: '/images/default_song_image.png',
        isFollowing: false,
        followerCount: 0,
        trackCount: 0,
      };

  return {
    id: track.id,
    title: track.title,
    trackSlug: track.trackSlug,
    artist,
    trackUrl: track.trackUrl,
    coverUrl: track.coverImageDataUrl ?? track.coverUrl,
    waveformUrl: track.waveformUrl,
    genre: track.genre,
    isReposted: isTrackRepostedByUser(track.id, viewer),
    isLiked: isTrackLikedByUser(track.id, viewer),
    tags: track.tags,
    releaseDate: track.releaseDate,
    playCount: (track.likes ?? track.likeCount) * 25,
    CompletedPlayCount: 0,
    likeCount: track.likes ?? track.likeCount,
    repostCount: track.reposters ?? track.repostCount,
    commentCount: 0,
    isPrivate: track.isPrivate,
    trackDurationSeconds: track.durationSeconds ?? 0,
    uploadDate: track.releaseDate,
    description: track.description ?? '',
    trendingRank: 0,
    access: resolveMockResourceAccess({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId: viewer.id,
    }),
    secretToken: track.secretLink ?? '',
    trackPreviewUrl: track.trackUrl,
  };
};

const findPlaylistOwner = (
  playlistId: number
): { owner: MockUserRecord; playlist: MockPlaylistRecord } | null => {
  for (const owner of inMemoryUsers) {
    const playlist = owner.playlists.find((item) => item.id === playlistId);
    if (playlist) {
      return { owner, playlist };
    }
  }

  return null;
};

const playlistLikeCount = (playlistId: number): number => {
  return inMemoryUsers.filter((user) =>
    user.likedPlaylists.includes(playlistId)
  ).length;
};

const playlistRepostCount = (playlistId: number): number => {
  return inMemoryUsers.filter((user) =>
    user.repostedPlaylists.includes(playlistId)
  ).length;
};

const buildFullPlaylist = (
  playlistId: number,
  viewer: MockUserRecord
): FullPlaylistDTO | null => {
  const resolved = findPlaylistOwner(playlistId);
  if (!resolved) {
    return null;
  }

  const { owner, playlist } = resolved;
  if (
    !canAccessMockResource({
      isPrivate: playlist.isPrivate,
      ownerId: owner.id,
      viewerId: viewer.id,
    })
  ) {
    return null;
  }
  const ownerSummary = toUserSummary(owner, viewer);
  const tracks = playlist.tracks
    .map((item) => buildFullTrack(item.trackId, viewer))
    .filter((item): item is FullTrackDTO => Boolean(item));

  const totalDurationSeconds = tracks.reduce(
    (total, item) => total + (item.trackDurationSeconds ?? 0),
    0
  );
  const firstTrack = tracks[0];
  const firstTrackRecord = getMockTracksStore().find(
    (track) => track.id === firstTrack?.id
  );

  return {
    id: playlist.id,
    title: playlist.title,
    playlistSlug: playlist.playlistSlug,
    isLiked: viewer.likedPlaylists.includes(playlist.id),
    isReposted: viewer.repostedPlaylists.includes(playlist.id),
    likeCount: playlistLikeCount(playlist.id),
    repostCount: playlistRepostCount(playlist.id),
    description: playlist.description ?? '',
    isPrivate: playlist.isPrivate,
    coverArtUrl:
      playlist.CoverArt ||
      firstTrack?.coverUrl ||
      '/images/default_song_image.png',
    totalDurationSeconds,
    trackCount: tracks.length,
    owner: ownerSummary,
    genre: firstTrack?.genre ?? 'Unknown',
    createdAt: new Date().toISOString(),
    tracks,
    secretToken: playlist.secretLink ?? '',
    firstTrackWaveformUrl:
      firstTrack?.waveformUrl ?? '/images/default-waveform.json',
    firstTrackWaveformData: firstTrackRecord?.waveformData ?? [],
  };
};

const buildTrackResource = (
  trackId: number,
  viewer: MockUserRecord,
  repostedBy?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    isFollowing: boolean;
    followerCount: number;
    trackCount: number;
  }
): ResourceRefFullDTO | null => {
  const track = buildFullTrack(trackId, viewer);
  if (!track) {
    return null;
  }

  return {
    type: 'TRACK',
    id: trackId,
    track,
    playlist: null,
    user: null,
    repostedBy,
    repostedAt: repostedBy ? new Date().toISOString() : undefined,
  } as ResourceRefFullDTO;
};

const buildPlaylistResource = (
  playlistId: number,
  viewer: MockUserRecord,
  repostedBy?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    isFollowing: boolean;
    followerCount: number;
    trackCount: number;
  }
): ResourceRefFullDTO | null => {
  const playlist = buildFullPlaylist(playlistId, viewer);
  if (!playlist) {
    return null;
  }

  return {
    type: 'PLAYLIST',
    id: playlistId,
    track: null,
    playlist,
    user: null,
    repostedBy,
    repostedAt: repostedBy ? new Date().toISOString() : undefined,
  } as ResourceRefFullDTO;
};

export class MockUserService implements UserService {
  async getPublicUserById(userId: number): Promise<UserPublic> {
    await delay();
    syncAuthAccountsToUserStore();
    const viewer = getCurrentUser();
    const user = findUser(userId);
    return toUserPublic(user, viewer);
  }

  async getPublicUserByUsername(username: string): Promise<UserPublic> {
    await delay();
    syncAuthAccountsToUserStore();
    const users = getMockUsersStore();
    const user = users.find((u) => u.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    const currentUserId = resolveCurrentMockUserId();
    if (user.privacySettings.isPrivate && user.id !== currentUserId) {
      throw new Error('User not found');
    }

    const viewer = getCurrentUser();
    return toUserPublic(user, viewer);
  }

  async getUserMe(): Promise<UserMe> {
    await delay();
    return toUserMe(getCurrentUser());
  }

  async updateMe(payload: UpdateMeRequest): Promise<UserMe> {
    await delay();
    const me = getCurrentUser();

    if (
      payload.displayName !== undefined &&
      payload.displayName.trim().length > 0
    ) {
      me.displayName = payload.displayName.trim();
    }

    if (payload.bio !== undefined) me.profile.bio = payload.bio;
    if (payload.city !== undefined) me.profile.city = payload.city;
    if (payload.country !== undefined) me.profile.country = payload.country;
    if (payload.favoriteGenres !== undefined) {
      me.profile.favoriteGenres = [...payload.favoriteGenres];
    }

    if (payload.socialLinks) {
      me.socialLinks = mergeDefinedSocialLinks(
        me.socialLinks,
        payload.socialLinks
      );
    }

    commitMockUserState();

    return toUserMe(me);
  }

  async resetLoggedInPassword(
    payload: ResetLoggedInPasswordRequest
  ): Promise<MessageResponse> {
    await delay();
    if (payload.newPassword.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
    return { message: 'Password updated' };
  }

  async addNewEmail(payload: AddNewEmailRequest): Promise<MessageResponse> {
    await delay();
    const me = getCurrentUser();
    if (!me.additionalEmails.includes(payload.newEmail)) {
      me.additionalEmails.push(payload.newEmail);
      commitMockUserState();
    }
    return { message: 'Email added' };
  }

  async updatePrimaryEmail(
    payload: UpdatePrimaryEmailRequest
  ): Promise<MessageResponse> {
    await delay();
    const me = getCurrentUser();
    me.email = payload.newEmail;
    me.emailVerified = false;
    commitMockUserState();
    return { message: 'Primary email updated' };
  }

  async changeEmail(
    payload: UpdatePrimaryEmailRequest
  ): Promise<ChangeEmailResponse> {
    await delay();
    // In real flow, we don't change it here. We just send an email.
    // We could store it in a 'pendingEmail' field in the mock user if we wanted to be fancy.
    return { message: 'A verification link has been sent to your new email address.' };
  }

  async verifyEmailChange(token: string): Promise<VerifyEmailChangeResponse> {
    await delay();
    if (!token) throw new Error('Invalid token');
    
    const me = getCurrentUser();
    // For mock simplicity, we'll just say it's verified and maybe change it to something if we had the pending one.
    // Since we don't have the pending email easily accessible here without more mock state, 
    // we'll just return success.
    me.emailVerified = true;
    commitMockUserState();
    
    return { message: 'Email changed successfully' };
  }

  async updateSocialLinks(
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks> {
    await delay();
    const me = getCurrentUser();
    me.socialLinks = mergeDefinedSocialLinks(me.socialLinks, payload);
    commitMockUserState();

    return {
      instagram: me.socialLinks.instagram,
      twitter: me.socialLinks.twitter,
      website: me.socialLinks.website,
      supportLink: me.socialLinks.supportLink,
    };
  }

  async updateRole(payload: UpdateRoleRequest): Promise<UserMe> {
    await delay();
    const me = getCurrentUser();
    me.role = payload.newRole;
    if (payload.newRole === 'LISTENER' && me.tier === 'ARTIST') {
      me.tier = 'FREE';
    }
    commitMockUserState();
    return toUserMe(me);
  }

  async updateTier(payload: UpdateTierRequest): Promise<UpdateTierResponse> {
    await delay();
    const me = getCurrentUser();
    me.tier = payload.newTier;
    commitMockUserState();
    return {
      tier: payload.newTier,
    };
  }

  async updateImages(payload: FormData): Promise<UpdateImagesResponse> {
    await delay();
    const me = getCurrentUser();

    const removeProfilePic = payload.get('removeProfilePic');
    if (
      typeof removeProfilePic === 'string' &&
      removeProfilePic.toLowerCase() === 'true'
    ) {
      me.profile.profilePic = '';
    }

    const profilePic = payload.get('profilePic');
    if (profilePic instanceof File) {
      me.profile.profilePic = await readFileAsDataUrl(profilePic);
    }

    const removeCoverPic = payload.get('removeCoverPic');
    if (
      typeof removeCoverPic === 'string' &&
      removeCoverPic.toLowerCase() === 'true'
    ) {
      me.profile.coverPic = '';
    }

    const coverPic = payload.get('coverPic');
    if (coverPic instanceof File) {
      me.profile.coverPic = await readFileAsDataUrl(coverPic);
    }

    commitMockUserState();

    return {
      profilePic: me.profile.profilePic,
      coverPic: me.profile.coverPic,
    };
  }

  async getHistory(
    params?: PaginationParams
  ): Promise<PaginatedHistoryResponse> {
    await delay();
    const me = getCurrentUser();
    return paginate(me.history, params);
  }

  async getSuggestedUsers(size?: number): Promise<UsersSuggestedResponse> {
    await delay();
    const me = getCurrentUser();
    const limit = Math.max(1, size ?? 5);

    return inMemoryUsers
      .filter((user) => user.id !== me.id)
      .filter((user) => !me.following.has(user.id))
      .filter((user) => !me.blocked.has(user.id))
      .slice(0, limit)
      .map((user) => ({ id: user.id, username: user.username }));
  }

  async getUserTracks(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedTracksResponse> {
    await delay();
    const user = findUser(userId);
    return paginate(user.tracks, params);
  }

  async getUserPlaylists(
    userId: number,
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse> {
    await delay();
    const user = findUser(userId);
    if (!params) {
      return [...user.playlists];
    }

    const pageNumber = Math.max(0, params.page ?? 0);
    const pageSize = Math.max(1, params.size ?? 20);
    const start = pageNumber * pageSize;
    return user.playlists.slice(start, start + pageSize);
  }

  async getMyReposts(
    params?: PaginationParams
  ): Promise<PaginatedRepostResponseDTO> {
    await delay();

    const viewer = getCurrentUser();
    const repostedBy = toUserSummary(viewer, viewer);
    const resources: ResourceRefFullDTO[] = [];

    for (const repost of viewer.reposts) {
      const trackResource = buildTrackResource(repost.id, viewer, repostedBy);
      if (trackResource) {
        resources.push(trackResource);
      }
    }

    for (const playlistId of viewer.repostedPlaylists) {
      const playlistResource = buildPlaylistResource(
        playlistId,
        viewer,
        repostedBy
      );
      if (playlistResource) {
        resources.push(playlistResource);
      }
    }

    return paginate(resources, params);
  }

  async getUserReposts(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedRepostResponseDTO> {
    await delay();

    const viewer = getCurrentUser();
    const targetUser = inMemoryUsers.find((item) => item.username === username);
    if (!targetUser) {
      throw new Error('User not found');
    }
    const repostedBy = toUserSummary(targetUser, viewer);
    const resources: ResourceRefFullDTO[] = [];

    for (const repost of targetUser.reposts) {
      const trackResource = buildTrackResource(repost.id, viewer, repostedBy);
      if (trackResource) {
        resources.push(trackResource);
      }
    }

    for (const playlistId of targetUser.repostedPlaylists) {
      const playlistResource = buildPlaylistResource(
        playlistId,
        viewer,
        repostedBy
      );
      if (playlistResource) {
        resources.push(playlistResource);
      }
    }

    return paginate(resources, params);
  }

  async getMePlaylists(
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse> {
    await delay();
    const user = getCurrentUser();
    if (!params) {
      return [...user.playlists];
    }

    const pageNumber = Math.max(0, params.page ?? 0);
    const pageSize = Math.max(1, params.size ?? 20);
    const start = pageNumber * pageSize;
    return user.playlists.slice(start, start + pageSize);
  }

  async getUserLikedPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    await delay();

    const user = inMemoryUsers.find((item) => item.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    const playlistsById = new Map<number, PlaylistResponse>();
    for (const owner of inMemoryUsers) {
      for (const playlist of owner.playlists) {
        playlistsById.set(playlist.id, {
          id: playlist.id,
          title: playlist.title,
          type: playlist.type,
          isLiked: user.likedPlaylists.includes(playlist.id),
          owner: { id: owner.id, username: owner.username },
          tracks: playlist.tracks,
          isReposted: user.repostedPlaylists.includes(playlist.id),
          likeCount: playlistLikeCount(playlist.id),
          repostCount: playlistRepostCount(playlist.id),
        });
      }
    }

    const liked = user.likedPlaylists
      .map((id) => playlistsById.get(id))
      .filter((item): item is PlaylistResponse => Boolean(item));

    return paginate(liked, params);
  }

  async followUser(userId: number): Promise<FollowResponse> {
    await delay();

    const me = getCurrentUser();
    const target = findUser(userId);

    if (target.id === me.id) {
      throw new Error('Cannot follow yourself');
    }

    me.following.add(target.id);
    target.followers.add(me.id);
    commitMockUserState();

    return {
      message: `Now following ${target.username}`,
      isFollowing: true,
    };
  }

  async unfollowUser(userId: number): Promise<FollowResponse> {
    await delay();

    const me = getCurrentUser();
    const target = findUser(userId);

    me.following.delete(target.id);
    target.followers.delete(me.id);
    commitMockUserState();

    return {
      message: `Unfollowed ${target.username}`,
      isFollowing: false,
    };
  }

  async getFollowers(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();

    const me = getCurrentUser();
    const target = findUser(userId);
    const followers: SearchUser[] = [...target.followers]
      .map((followerId) => inMemoryUsers.find((user) => user.id === followerId))
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, me));

    return paginate(followers, params);
  }

  async getFollowing(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();

    const me = getCurrentUser();
    const target = findUser(userId);
    const following: SearchUser[] = [...target.following]
      .map((followingId) =>
        inMemoryUsers.find((user) => user.id === followingId)
      )
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, me));

    return paginate(following, params);
  }

  async blockUser(userId: number): Promise<MessageResponse> {
    await delay();

    const me = getCurrentUser();
    const target = findUser(userId);

    me.blocked.add(target.id);
    me.following.delete(target.id);
    me.followers.delete(target.id);
    target.following.delete(me.id);
    target.followers.delete(me.id);
    commitMockUserState();

    return { message: `Blocked ${target.username}` };
  }

  async unblockUser(userId: number): Promise<MessageResponse> {
    await delay();

    const me = getCurrentUser();
    const target = findUser(userId);

    me.blocked.delete(target.id);
    commitMockUserState();

    return { message: `Unblocked ${target.username}` };
  }

  async getBlockedUsers(
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();

    const me = getCurrentUser();
    const blockedUsers = [...me.blocked]
      .map((blockedId) => inMemoryUsers.find((user) => user.id === blockedId))
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, me));

    return paginate(blockedUsers, params);
  }

  async getUsersWhoLikedTrack(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();
    const track = getMockTracksStore().find((t) => t.id === trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    const usersWhoLiked = inMemoryUsers
      .filter((user) =>
        user.likedTracks.some((likedTrack) => likedTrack.id === trackId)
      )
      .map((user) => toSearchUser(user, getCurrentUser()));

    return paginate(usersWhoLiked, params);
  }

  async getUsersLikedPlaylists(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    await delay();
    const user = findUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const likedPlaylists = [...user.likedPlaylists]
      .map((playlistId) =>
        getMockPlaylistsStore().find((p) => p.id === playlistId)
      )
      .filter((playlist): playlist is MockPlaylistRecord => Boolean(playlist))
      .map((playlist) => ({
        id: playlist.id,
        title: playlist.title,
        type: toPlaylistType(playlist.type),
        isLiked: true,
        isReposted: user.repostedPlaylists.includes(playlist.id),
        likeCount: playlistLikeCount(playlist.id),
        repostCount: playlistRepostCount(playlist.id),
        owner: {
          id: playlist.owner.id,
          username: playlist.owner.username,
        },
        tracks: playlist.tracks.map(
          (track: {
            trackId: number;
            title: string;
            trackUrl: string;
            durationSeconds: number;
            [key: string]: unknown;
          }) => ({
            trackId: track.trackId,
            title: track.title,
            trackUrl: track.trackUrl,
            durationSeconds: track.durationSeconds,
          })
        ),
      }));

    return paginate(likedPlaylists, params);
  }

  async getUsersWhoRepostedTrack(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();
    const track = getMockTracksStore().find((t) => t.id === trackId);
    if (!track) {
      throw new Error('Track not found');
    }

    const usersWhoReposted = inMemoryUsers
      .filter((user) => user.reposts.some((repost) => repost.id === trackId))
      .map((user) => toSearchUser(user, getCurrentUser()));

    return paginate(usersWhoReposted, params);
  }
}
