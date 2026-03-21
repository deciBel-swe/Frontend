import type { PaginationParams, UserService } from '@/services/api/userService';
import type {
  AddNewEmailRequest,
  FollowResponse,
  MessageResponse,
  PaginatedFeedResponse,
  PaginatedFollowersResponse,
  PaginatedTracksResponse,
  PrivateSocialLinks,
  ResetLoggedInPasswordRequest,
  SearchPlaylist,
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

type MockRole = 'LISTENER' | 'ARTIST' | 'OTHER';
type MockTier = 'FREE' | 'ARTIST' | 'ARTIST_PRO' | 'LISTENER' | 'OTHER';

type MockUserRecord = {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
  role: MockRole;
  tier: MockTier;
  profile: {
    bio: string;
    city: string;
    country: string;
    profilePic: string;
    coverPic: string;
    favoriteGenres: string[];
  };
  socialLinks: {
    instagram: string;
    website: string;
    supportLink: string;
    twitter: string;
  };
  privacySettings: {
    isPrivate: boolean;
    showHistory: boolean;
  };
  followers: Set<number>;
  following: Set<number>;
  blocked: Set<number>;
  playlists: SearchPlaylist[];
  tracks: Array<{ id: number; title: string; genre: string }>;
  history: Array<{ id: number; title: string }>;
  additionalEmails: string[];
};

const MOCK_DELAY_MS = 120;
const CURRENT_USER_ID = 1;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const paginate = <T>(items: T[], params?: PaginationParams) => {
  const pageNumber = Math.max(0, params?.page ?? 0);
  const pageSize = Math.max(1, params?.size ?? 20);
  const totalElements = items.length;
  const totalPages = totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
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

const buildSeedUsers = (): MockUserRecord[] => [
  {
    id: 1,
    username: 'mockuser',
    email: 'mockuser@email.com',
    emailVerified: true,
    role: 'ARTIST',
    tier: 'ARTIST',
    profile: {
      bio: 'This is my profile.',
      city: '6 October',
      country: 'Egypt',
      profilePic: 'https://i.ibb.co/SD1pMkyy/GRgo-Ocga-YAIm6-TF.jpg',
      coverPic: 'https://i.ibb.co/r2ZssgJZ/sl-063022-51250-12.jpg',
      favoriteGenres: ['Pop', 'Rock'],
    },
    socialLinks: {
      instagram: 'https://instagram.com/mockuser',
      website: 'https://decibel.foo',
      supportLink: 'https://support.mockuser.com',
      twitter: 'https://twitter.com/mockuser',
    },
    privacySettings: {
      isPrivate: false,
      showHistory: true,
    },
    followers: new Set([2]),
    following: new Set([2]),
    blocked: new Set(),
    playlists: [
      { id: 1001, title: 'Late Night Mix' },
      { id: 1002, title: 'Studio Drafts' },
    ],
    tracks: [
      { id: 201, title: 'Neon Skylines', genre: 'Electronic' },
      { id: 202, title: 'Quiet Transit', genre: 'Ambient' },
      { id: 203, title: 'Velvet Breakbeat', genre: 'Breakbeat' },
    ],
    history: [
      { id: 301, title: 'Morning Focus' },
      { id: 302, title: 'Night Ride' },
      { id: 303, title: 'Cloud Room Sessions' },
    ],
    additionalEmails: [],
  },
  {
    id: 2,
    username: 'listenertwo',
    email: 'listenertwo@email.com',
    emailVerified: true,
    role: 'LISTENER',
    tier: 'FREE',
    profile: {
      bio: 'Curates chill playlists.',
      city: 'Alexandria',
      country: 'Egypt',
      profilePic: 'https://picsum.photos/seed/listener/400/400',
      coverPic: 'https://picsum.photos/seed/listener-cover/1200/400',
      favoriteGenres: ['Lo-Fi', 'Ambient'],
    },
    socialLinks: {
      instagram: 'https://instagram.com/listenertwo',
      website: 'https://listener.example.com',
      supportLink: 'https://listener.example.com/support',
      twitter: 'https://twitter.com/listenertwo',
    },
    privacySettings: {
      isPrivate: false,
      showHistory: true,
    },
    followers: new Set([1]),
    following: new Set([1]),
    blocked: new Set(),
    playlists: [{ id: 1003, title: 'Study Session' }],
    tracks: [{ id: 204, title: 'Paper Lanterns', genre: 'Lo-Fi' }],
    history: [{ id: 304, title: 'Dawn Drifts' }],
    additionalEmails: [],
  },
  {
    id: 3,
    username: 'beatpilot',
    email: 'beatpilot@email.com',
    emailVerified: false,
    role: 'ARTIST',
    tier: 'ARTIST_PRO',
    profile: {
      bio: 'Produces club tracks.',
      city: 'Cairo',
      country: 'Egypt',
      profilePic: 'https://picsum.photos/seed/beatpilot/400/400',
      coverPic: 'https://picsum.photos/seed/beatpilot-cover/1200/400',
      favoriteGenres: ['House', 'Techno'],
    },
    socialLinks: {
      instagram: 'https://instagram.com/beatpilot',
      website: 'https://beatpilot.example.com',
      supportLink: 'https://beatpilot.example.com/support',
      twitter: 'https://twitter.com/beatpilot',
    },
    privacySettings: {
      isPrivate: false,
      showHistory: true,
    },
    followers: new Set(),
    following: new Set(),
    blocked: new Set(),
    playlists: [{ id: 1004, title: 'Warehouse Cuts' }],
    tracks: [{ id: 205, title: 'Circuit Bloom', genre: 'House' }],
    history: [{ id: 305, title: 'Peak Hour' }],
    additionalEmails: [],
  },
];

const inMemoryUsers = buildSeedUsers();

const assertToken = (token: string): void => {
  if (!token || token.trim().length === 0) {
    throw new Error('Missing auth token');
  }
};

const getCurrentUser = (): MockUserRecord => {
  const current = inMemoryUsers.find((user) => user.id === CURRENT_USER_ID);
  if (!current) {
    throw new Error('Current user not found');
  }
  return current;
};

const findUser = (userIdOrUsername: string): MockUserRecord => {
  const asNumber = Number(userIdOrUsername);
  const byId = Number.isFinite(asNumber)
    ? inMemoryUsers.find((user) => user.id === asNumber)
    : undefined;
  const byUsername = inMemoryUsers.find((user) => user.username === userIdOrUsername);
  const target = byId ?? byUsername;
  if (!target) {
    throw new Error('User not found');
  }
  return target;
};

const toSearchUser = (target: MockUserRecord, viewer: MockUserRecord): SearchUser => ({
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
    location: `${user.profile.city}, ${user.profile.country}`,
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

export class MockUserService implements UserService {
  async getPublicUser(username: string): Promise<UserPublic> {
    await delay();
    const user = findUser(username);
    return toUserPublic(user);
  }

  async getUserMe(token: string): Promise<UserMe> {
    await delay();
    assertToken(token);
    return toUserMe(getCurrentUser());
  }

  async updateMe(token: string, payload: UpdateMeRequest): Promise<UserMe> {
    await delay();
    assertToken(token);
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

    return toUserMe(me);
  }

  async resetLoggedInPassword(
    token: string,
    payload: ResetLoggedInPasswordRequest
  ): Promise<MessageResponse> {
    await delay();
    assertToken(token);
    if (payload.newPassword.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
    return { message: 'Password updated' };
  }

  async addNewEmail(
    token: string,
    payload: AddNewEmailRequest
  ): Promise<MessageResponse> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();
    if (!me.additionalEmails.includes(payload.newEmail)) {
      me.additionalEmails.push(payload.newEmail);
    }
    return { message: 'Email added' };
  }

  async updatePrimaryEmail(
    token: string,
    payload: UpdatePrimaryEmailRequest
  ): Promise<MessageResponse> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();
    me.email = payload.newEmail;
    me.emailVerified = false;
    return { message: 'Primary email updated' };
  }

  async updateSocialLinks(
    token: string,
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();
    me.socialLinks = {
      ...me.socialLinks,
      ...payload,
    };

    return {
      instagram: me.socialLinks.instagram,
      twitter: me.socialLinks.twitter,
      website: me.socialLinks.website,
      supportLink: me.socialLinks.supportLink,
    };
  }

  async updateRole(token: string, payload: UpdateRoleRequest): Promise<UserMe> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();
    me.role = payload.newRole;
    if (payload.newRole === 'LISTENER' && me.tier === 'ARTIST') {
      me.tier = 'FREE';
    }
    return toUserMe(me);
  }

  async updateTier(
    token: string,
    payload: UpdateTierRequest
  ): Promise<UpdateTierResponse> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();
    me.tier = payload.newTier;
    return {
      tier: payload.newTier,
    };
  }

  async updateImages(
    token: string,
    payload: UpdateImagesJsonRequest
  ): Promise<UpdateImagesResponse> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();

    if (payload.profilePic !== undefined) {
      me.profile.profilePic = payload.profilePic;
    }
    if (payload.coverPic !== undefined) {
      me.profile.coverPic = payload.coverPic;
    }

    return {
      profilePic: me.profile.profilePic,
      coverPic: me.profile.coverPic,
    };
  }

  async getHistory(
    token: string,
    params?: PaginationParams
  ): Promise<PaginatedFeedResponse> {
    await delay();
    assertToken(token);
    const me = getCurrentUser();
    return paginate(me.history, params);
  }

  async getSuggestedUsers(token: string, size?: number): Promise<UsersSuggestedResponse> {
    await delay();
    assertToken(token);
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
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedTracksResponse> {
    await delay();
    const user = findUser(userId);
    return paginate(user.tracks, params);
  }

  async getUserPlaylists(
    userId: string,
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

  async followUser(token: string, userId: string): Promise<FollowResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const target = findUser(userId);

    if (target.id === me.id) {
      throw new Error('Cannot follow yourself');
    }

    me.following.add(target.id);
    target.followers.add(me.id);

    return {
      message: `Now following ${target.username}`,
      isFollowing: true,
    };
  }

  async unfollowUser(token: string, userId: string): Promise<FollowResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const target = findUser(userId);

    me.following.delete(target.id);
    target.followers.delete(me.id);

    return {
      message: `Unfollowed ${target.username}`,
      isFollowing: false,
    };
  }

  async getFollowers(
    token: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const target = findUser(userId);
    const followers: SearchUser[] = [...target.followers]
      .map((followerId) => inMemoryUsers.find((user) => user.id === followerId))
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, me));

    return paginate(followers, params);
  }

  async getFollowing(
    token: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const target = findUser(userId);
    const following: SearchUser[] = [...target.following]
      .map((followingId) => inMemoryUsers.find((user) => user.id === followingId))
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, me));

    return paginate(following, params);
  }

  async blockUser(token: string, userId: string): Promise<MessageResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const target = findUser(userId);

    me.blocked.add(target.id);
    me.following.delete(target.id);
    me.followers.delete(target.id);
    target.following.delete(me.id);
    target.followers.delete(me.id);

    return { message: `Blocked ${target.username}` };
  }

  async unblockUser(token: string, userId: string): Promise<MessageResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const target = findUser(userId);

    me.blocked.delete(target.id);

    return { message: `Unblocked ${target.username}` };
  }

  async getBlockedUsers(
    token: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    await delay();
    assertToken(token);

    const me = getCurrentUser();
    const blockedUsers = [...me.blocked]
      .map((blockedId) => inMemoryUsers.find((user) => user.id === blockedId))
      .filter((user): user is MockUserRecord => Boolean(user))
      .map((user) => toSearchUser(user, me));

    return paginate(blockedUsers, params);
  }
}
