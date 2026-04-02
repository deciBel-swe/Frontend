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
import type {
  AddNewEmailRequest,
  FollowResponse,
  MessageResponse,
  PaginatedFeedResponse,
  PaginatedFollowersResponse,
  PaginatedTracksResponse,
  PrivateSocialLinks,
  ResetLoggedInPasswordRequest,
  SearchUser,
  UpdateImagesJsonRequest,
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
} from '@/types/user';
import type {
  PaginatedPlaylistsResponse,
  PlaylistResponse,
  PlaylistType,
} from '@/types/playlists';

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
  avatarUrl: target.profile.profilePic,
  tier: target.tier,
  isFollowing: viewer.following.has(target.id),
});

const toUserPublic = (user: MockUserRecord): UserPublic => ({
  id: user.id,
  username: user.username,
  tier: user.tier,
  profile: {
    username: user.username,
    id: user.id,
    bio: user.profile.bio,
    location: [user.profile.city, user.profile.country]
      .filter(Boolean)
      .join(', '),
    avatarUrl: user.profile.profilePic,
    coverPhotoUrl: user.profile.coverPic,
    favoriteGenres: [...user.profile.favoriteGenres],
  },
  socialLinks: {
    instagram: user.socialLinks.instagram,
    twitter: user.socialLinks.twitter,
    website: user.socialLinks.website,
  },
  stats: {
    followersCount: user.followers.size,
    followingCount: user.following.size,
    trackCount: user.tracks.length,
  },
});

const toUserMe = (user: MockUserRecord): UserMe => ({
  id: user.id,
  Role: user.role,
  email: user.email,
  username: user.username,
  emailVerified: user.emailVerified,
  tier: user.tier,
  profile: {
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

export class MockUserService implements UserService {
  async getPublicUserById(userId: number): Promise<UserPublic> {
    await delay();
    syncAuthAccountsToUserStore();
    const user = findUser(userId);
    return toUserPublic(user);
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

    return toUserPublic(user);
  }

  async getUserMe(): Promise<UserMe> {
    await delay();
    return toUserMe(getCurrentUser());
  }

  async updateMe(payload: UpdateMeRequest): Promise<UserMe> {
    await delay();
    const me = getCurrentUser();

    if (payload.bio !== undefined) me.profile.bio = payload.bio;
    if (payload.city !== undefined) me.profile.city = payload.city;
    if (payload.country !== undefined) me.profile.country = payload.country;
    if (payload.favoriteGenres !== undefined) {
      me.profile.favoriteGenres = [...payload.favoriteGenres];
    }

    if (payload.socialLinks) {
      me.socialLinks = {
        ...me.socialLinks,
        ...payload.socialLinks,
      };
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

  async updateSocialLinks(
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks> {
    await delay();
    const me = getCurrentUser();
    me.socialLinks = {
      ...me.socialLinks,
      ...payload,
    };
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

  async updateImages(
    payload: UpdateImagesJsonRequest
  ): Promise<UpdateImagesResponse> {
    await delay();
    const me = getCurrentUser();

    if (payload.profilePic !== undefined) {
      me.profile.profilePic = payload.profilePic;
    }
    if (payload.coverPic !== undefined) {
      me.profile.coverPic = payload.coverPic;
    }

    commitMockUserState();

    return {
      profilePic: me.profile.profilePic,
      coverPic: me.profile.coverPic,
    };
  }

  async getHistory(params?: PaginationParams): Promise<PaginatedFeedResponse> {
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
    const usersWhoLiked = [...track.likes]
      .map((userId) => inMemoryUsers.find((user) => user.id === userId))
      .filter((user): user is MockUserRecord => Boolean(user))
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
        owner: {
          id: playlist.owner.id,
          username: playlist.owner.username,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tracks: playlist.tracks.map((track:any) => ({
          trackId: track.trackId,
          title: track.title,
          trackUrl: track.trackUrl,
          durationSeconds: track.durationSeconds,
        })),
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
    const usersWhoReposted = [...track.reposters]
      .map((userId) => inMemoryUsers.find((user) => user.id === userId))
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, getCurrentUser()));

    return paginate(usersWhoReposted, params);
  }
}
