import type { LoginUserDTO } from '@/types';
import type { PlaylistType } from '@/types/playlists';
import { normalizeStoredMockSlug } from './mockResourceUtils';

type MockRole = 'LISTENER' | 'ARTIST' | 'OTHER';
type MockTier = 'FREE' | 'ARTIST' | 'ARTIST_PRO' | 'LISTENER' | 'OTHER';

export type MockAuthAccount = {
  id: number;
  email: string;
  username: string;
  avatarUrl: string;
  password: string;
  emailVerified: boolean;
  displayName?: string;
  tier: LoginUserDTO['tier'];
};
type AccessType = 'BLOCKED' | 'PREVIEW' | 'PLAYABLE';

export type MockUserRecord = {
  id: number;
  username: string;
  displayName: string;
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
  playlists: MockPlaylistRecord[];
  likedPlaylists: number[];
  repostedPlaylists: number[];
  tracks: Array<{ id: number; title: string; genre: string }>;
  likedTracks: Array<{ id: number; title: string; genre: string }>;
  reposts: Array<{ id: number; title: string; genre: string }>;
  history: Array<{ id: number; title: string }>;
  additionalEmails: string[];
};

export type MockTrackRecord = {
  id: number;
  title: string;
  trackSlug: string;
  artist: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  trackUrl: string;
  coverUrl: string;
  waveformUrl: string;
  genre: string;
  isReposted: boolean;
  isLiked: boolean;
  tags: string[];
  releaseDate: string;
  playCount: number;
  completedPlayCount: number;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  isPrivate: boolean;
  trackDurationSeconds: number;
  uploadDate: string;
  description: string;
  trendingRank: number;
  access: AccessType;
  secretToken?: string;
  trackPreviewUrl: string;
  // Legacy compatibility fields still used in some mock services.
  likes?: number;
  reposters?: number;
  durationSeconds?: number;
  secretLink?: string;
  coverImageDataUrl?: string;
  waveformData?: number[];
};

export type MockPlaylistRecord = {
  id: number;
  title: string;
  playlistSlug: string;
  description?: string;
  type: PlaylistType;
  isPrivate: boolean;
  CoverArt?: string;
  isLiked: boolean;
  isReposted?: boolean;
  owner: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  tracks: Array<{
    trackId: number;
    title: string;
    durationSeconds: number;
    trackUrl: string;
  }>;
  secretLink?: string;
  secretLinkExpiresAt?: string;
};

export type MockCommentRecord = {
  id: number;
  trackId: number;
  parentCommentId?: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  body: string;
  timestampSeconds?: number;
  createdAt: string;
};

const AUTH_USER_STORAGE_KEY = 'user';
const ACCESS_TOKEN_STORAGE_KEY = 'decibel_access_token';
const LEGACY_TRACKS_STORAGE_KEY = 'decibel_mock_tracks';
const MOCK_SYSTEM_STORAGE_KEY = 'decibel_mock_system_state_v1';
const MAX_PERSISTED_DATA_URL_LENGTH = 100_000;

type PersistOptions = {
  stripLargeImages?: boolean;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const normalizeUsername = (username: string): string =>
  username.trim().toLowerCase();

const buildAvailableUsername = (
  requestedUsername: string,
  email: string
): string => {
  const normalizedEmail = normalizeEmail(email);
  const base = requestedUsername.trim() || 'user';
  let candidate = base;
  let suffix = 1;

  // Keep incrementing until username is free or belongs to the same account.
  while (true) {
    const existing = getMockAuthAccountByUsername(candidate);
    if (!existing || existing.email === normalizedEmail) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

const createFallbackPassword = (): string => {
  const runtimeCrypto = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;

  if (runtimeCrypto?.randomUUID) {
    return runtimeCrypto.randomUUID();
  }

  return `mock-pass-${Math.random().toString(36).slice(2)}`;
};
const TOTAL_USERS = 100;
const TOTAL_TRACKS = 1000;
const TOTAL_PLAYLISTS = 100;
const TOP_OWNER_COUNT = 10;
const FOLLOW_COUNT = 30;
const LIKED_TRACKS_PER_USER = 100;
const REPOSTED_TRACKS_PER_USER = 100;
const LIKED_PLAYLISTS_PER_USER = 10;
const REPOSTED_PLAYLISTS_PER_USER = 10;
const COMMENTS_PER_TRACK = 10;
const TRACK_DURATION_SECONDS = 2745;
const SHARED_AVATAR_URLS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=alex',
  'https://api.dicebear.com/7.x/avataaars/png?seed=sara',
  'https://api.dicebear.com/7.x/avataaars/png?seed=leo',
  'https://api.dicebear.com/7.x/avataaars/png?seed=nina',
  'https://api.dicebear.com/7.x/avataaars/png?seed=omar'
];
const SHARED_TRACK_COVER_URLS = [
  '/images/default_song_image_1.png',
  'https://picsum.photos/seed/track1/300/300',
  'https://picsum.photos/seed/track2/300/300',
  'https://picsum.photos/seed/track3/300/300',
  'https://picsum.photos/seed/track4/300/300',
  'https://picsum.photos/seed/track5/300/300',
  'https://picsum.photos/seed/track6/300/300',
  'https://picsum.photos/seed/track7/300/300',
]
const SHARED_PLAYLIST_COVER_URLS = [
  'https://picsum.photos/seed/playlist1/400/400',
  'https://picsum.photos/seed/playlist2/400/400',
  'https://picsum.photos/seed/playlist3/400/400',
  'https://picsum.photos/seed/playlist4/400/400',
  'https://picsum.photos/seed/playlist5/400/400',
  'https://picsum.photos/seed/playlist6/400/400',
  'https://picsum.photos/seed/playlist7/400/400',
]

const SHARED_USER_COVER_URLS = [
  'https://picsum.photos/seed/usercover1/800/300',
  'https://picsum.photos/seed/usercover2/800/300',
  'https://picsum.photos/seed/usercover3/800/300',
  'https://picsum.photos/seed/usercover4/800/300',
  'https://picsum.photos/seed/usercover5/800/300',
  'https://picsum.photos/seed/usercover6/800/300',
  'https://picsum.photos/seed/usercover7/800/300',
]

const DEFAULT_PASSWORD_HASH =
  '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541';

const pad = (value: number): string => value.toString().padStart(3, '0');

const buildUsername = (id: number): string => `user${pad(id)}`;
const buildDisplayName = (id: number): string => `User ${pad(id)}`;

const buildSeedAuthAccounts = (): MockAuthAccount[] =>
  Array.from({ length: TOTAL_USERS }, (_, index) => {
    const id = index + 1;
    const username = buildUsername(id);
    const isTopOwner = id <= TOP_OWNER_COUNT;

    return {
      id,
      email: `${username}@decibel.test`,
      username,
      displayName: buildDisplayName(id),
      avatarUrl: SHARED_AVATAR_URLS[index % SHARED_AVATAR_URLS.length],
      password: DEFAULT_PASSWORD_HASH,
      emailVerified: true,
      tier: isTopOwner ? 'ARTIST' : 'FREE',
    };
  });

const seedAccounts: MockAuthAccount[] = buildSeedAuthAccounts();

const buildBaseUser = (account: MockAuthAccount): MockUserRecord => {
  const isTopOwner = account.id <= TOP_OWNER_COUNT;

  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName?.trim() || account.username,
    email: account.email,
    emailVerified: true,
    role: isTopOwner ? 'ARTIST' : 'LISTENER',
    tier: isTopOwner ? 'ARTIST' : 'FREE',
    profile: {
      bio: `Profile for ${account.username}.`,
      city: '',
      country: '',
      profilePic: SHARED_AVATAR_URLS[account.id % SHARED_AVATAR_URLS.length],
      coverPic: SHARED_USER_COVER_URLS[account.id % SHARED_USER_COVER_URLS.length],
      favoriteGenres: [],
    },
    socialLinks: {
      instagram: '',
      website: '',
      supportLink: '',
      twitter: '',
    },
    privacySettings: {
      isPrivate: false,
      showHistory: true,
    },
    followers: new Set(),
    following: new Set(),
    blocked: new Set(),
    playlists: [],
    likedPlaylists: [],
    repostedPlaylists: [],
    tracks: [],
    likedTracks: [],
    reposts: [],
    history: [],
    additionalEmails: [],
  };
};

const connectUserGraph = (users: MockUserRecord[]): void => {
  const total = users.length;

  for (let index = 0; index < total; index += 1) {
    const sourceUser = users[index];

    for (let step = 1; step <= FOLLOW_COUNT; step += 1) {
      const targetIndex = (index + step) % total;
      const targetUser = users[targetIndex];
      sourceUser.following.add(targetUser.id);
      targetUser.followers.add(sourceUser.id);
    }
  }
};

const seedUsers = (): MockUserRecord[] => {
  const users = seedAccounts.map((account) => buildBaseUser(account));
  connectUserGraph(users);
  return users;
};


const BASE_TRACK_URL =
  'https://decibelblob.blob.core.windows.net/uploads/audio/b0a977d2-3903-49a4-8557-aae029c9f376_Taha.mp3';

const BASE_WAVEFORM_URL =
  'https://decibelblob.blob.core.windows.net/uploads/waveform-data/8d61bb34-377a-434c-a2ba-7372b5d32b75_Surat_Taha.json';

const TRACK_GENRES = [
  'Electronic',
  'Ambient',
  'House',
  'Techno',
  'Lo-Fi',
  'Breakbeat',
  'Indie',
  'Pop',
  'Hip-Hop',
  'Drum & Bass',
];

const makeTrack = (
  id: number,
  title: string,
  artist: { id: number; username: string; displayName: string, avatarUrl: string },
  genre: string,
  tags: string[],
  isPrivate = false,
): MockTrackRecord => {
  const trackSlug = normalizeStoredMockSlug(undefined, title, 'track');
  const secretToken = isPrivate ? `secret-track-${id}` : undefined;

  return {
    id,
    title,
    trackSlug,
    artist: {
      ...artist,
    },
    trackUrl: BASE_TRACK_URL,
    coverUrl: SHARED_TRACK_COVER_URLS[id % SHARED_TRACK_COVER_URLS.length] ,
    waveformUrl: BASE_WAVEFORM_URL,
    genre,
    isReposted: false,
    isLiked: false,
    tags,
    releaseDate: '2025-10-25',
    uploadDate: '2025-10-25',
    playCount: 0,
    completedPlayCount: 0,
    likeCount: 0,
    repostCount: 0,
    commentCount: COMMENTS_PER_TRACK,
    isPrivate,
    trackDurationSeconds: TRACK_DURATION_SECONDS,
    description: '',
    trendingRank: 0,
    access: 'PLAYABLE',
    secretToken,
    trackPreviewUrl: BASE_TRACK_URL,
    likes: 0,
    reposters: 0,
    durationSeconds: TRACK_DURATION_SECONDS,
    secretLink: secretToken,
    coverImageDataUrl: undefined,
    waveformData: undefined,
  };
};

export const seedTracks = (users: MockUserRecord[] = seedUsers()): MockTrackRecord[] => {
  const tracks: MockTrackRecord[] = [];
  const owners = users.slice(0, TOP_OWNER_COUNT);

  for (let index = 0; index < TOTAL_TRACKS; index += 1) {
    const id = 1000 + index;
    const owner = owners[index % owners.length];
    const genre = TRACK_GENRES[index % TRACK_GENRES.length];
    const title = `Track ${pad(index + 1)}`;
    const tags = [
      genre.toLowerCase().replace(/\s+/g, '-'),
      `set-${((index % 20) + 1).toString().padStart(2, '0')}`,
    ];

    const track = makeTrack(
      id,
      title,
      {
        id: owner.id,
        username: owner.username,
        displayName: owner.displayName,
        avatarUrl: owner.profile.profilePic,
      },
      genre,
      tags,
      false
    );

    tracks.push(track);
    owner.tracks.push({ id: track.id, title: track.title, genre: track.genre });
  }

  return tracks;
};

const seedPlaylists = (
  users: MockUserRecord[],
  tracks: MockTrackRecord[]
): MockPlaylistRecord[] => {
  const playlists: MockPlaylistRecord[] = [];
  const owners = users.slice(0, TOP_OWNER_COUNT);

  for (let index = 0; index < TOTAL_PLAYLISTS; index += 1) {
    const id = 2000 + index;
    const owner = owners[index % owners.length];
    const trackStart = (index * 10) % tracks.length;
    const playlistTracks = Array.from({ length: 10 }, (_, offset) => {
      const track = tracks[(trackStart + offset) % tracks.length];
      return {
        trackId: track.id,
        title: track.title,
        durationSeconds: track.trackDurationSeconds,
        trackUrl: track.trackUrl,
      };
    });

    const playlist: MockPlaylistRecord = {
      id,
      title: `Playlist ${pad(index + 1)}`,
      playlistSlug: normalizeStoredMockSlug(
        undefined,
        `Playlist ${pad(index + 1)}`,
        'playlist'
      ),
      description: `Curated collection ${index + 1}`,
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: SHARED_PLAYLIST_COVER_URLS[index % SHARED_PLAYLIST_COVER_URLS.length],
      isLiked: false,
      isReposted: false,
      owner: {
        id: owner.id,
        username: owner.username,
        displayName: owner.displayName,
        avatarUrl: owner.profile.profilePic,
      },
      tracks: playlistTracks,
      secretLink: undefined,
      secretLinkExpiresAt: undefined,
    };

    owner.playlists.push(playlist);
    playlists.push(playlist);
  }

  return playlists;
};

const assignTrackAndPlaylistEngagement = (
  users: MockUserRecord[],
  tracks: MockTrackRecord[],
  playlists: MockPlaylistRecord[]
): void => {
  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];

    const likedTrackStart = (index * 17) % tracks.length;
    user.likedTracks = Array.from({ length: LIKED_TRACKS_PER_USER }, (_, offset) => {
      const track = tracks[(likedTrackStart + offset) % tracks.length];
      return { id: track.id, title: track.title, genre: track.genre };
    });

    const repostTrackStart = (index * 29) % tracks.length;
    user.reposts = Array.from({ length: REPOSTED_TRACKS_PER_USER }, (_, offset) => {
      const track = tracks[(repostTrackStart + offset) % tracks.length];
      return { id: track.id, title: track.title, genre: track.genre };
    });

    const likedPlaylistStart = (index * 3) % playlists.length;
    user.likedPlaylists = Array.from({ length: LIKED_PLAYLISTS_PER_USER }, (_, offset) => {
      const playlist = playlists[(likedPlaylistStart + offset) % playlists.length];
      return playlist.id;
    });

    const repostedPlaylistStart = (index * 7) % playlists.length;
    user.repostedPlaylists = Array.from(
      { length: REPOSTED_PLAYLISTS_PER_USER },
      (_, offset) => {
        const playlist =
          playlists[(repostedPlaylistStart + offset) % playlists.length];
        return playlist.id;
      }
    );

    user.history = Array.from({ length: 30 }, (_, offset) => {
      const track = tracks[(index * 11 + offset) % tracks.length];
      return { id: track.id, title: track.title };
    });
  }
};

const seedComments = (
  users: MockUserRecord[],
  tracks: MockTrackRecord[]
): MockCommentRecord[] => {
  const comments: MockCommentRecord[] = [];
  let commentId = 1;

  for (const track of tracks) {
    for (let index = 0; index < COMMENTS_PER_TRACK; index += 1) {
      const commenter = users[(track.id + index) % users.length];
      const timestampSeconds = Math.floor(
        (index * TRACK_DURATION_SECONDS) / (COMMENTS_PER_TRACK - 1)
      );

      comments.push({
        id: commentId,
        trackId: track.id,
        user: {
          id: commenter.id,
          username: commenter.username,
          avatarUrl: commenter.profile.profilePic,
          displayName: commenter.displayName,
        },
        body: `Comment ${index + 1} on ${track.title}`,
        timestampSeconds,
        createdAt: new Date(
          Date.UTC(2026, 0, 1, 0, 0, (track.id + index) % 60)
        ).toISOString(),
      });

      commentId += 1;
    }
  }

  return comments;
};

type MockSystemState = {
  authAccountsByEmail: Map<string, MockAuthAccount>;
  users: MockUserRecord[];
  tracks: MockTrackRecord[];
  comments: MockCommentRecord[];
  emailVerification: Record<
    string,
    { email: string; token: string; verified: boolean }
  >;
};

type PersistedMockUserRecord = Omit<
  MockUserRecord,
  'followers' | 'following' | 'blocked'
> & {
  followers: number[];
  following: number[];
  blocked: number[];
};

type PersistedMockSystemState = {
  authAccounts: MockAuthAccount[];
  users: PersistedMockUserRecord[];
  tracks: MockTrackRecord[];
  comments: MockCommentRecord[];
  emailVerification: Record<
    string,
    { email: string; token: string; verified: boolean }
  >;
};

let state: MockSystemState | null = null;

const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isOversizedDataUrl = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  return (
    value.startsWith('data:') && value.length > MAX_PERSISTED_DATA_URL_LENGTH
  );
};

const getFallbackCoverUrl = (_trackId: number): string =>
  SHARED_TRACK_COVER_URLS[0];

const normalizePlaylistRecord = (
  playlist: MockPlaylistRecord
): MockPlaylistRecord => ({
  ...playlist,
  playlistSlug: normalizeStoredMockSlug(
    playlist.playlistSlug,
    playlist.title,
    'playlist'
  ),
});

const normalizeTrackRecord = (track: MockTrackRecord): MockTrackRecord => {
  const secretToken = track.secretLink ?? track.secretToken;

  return {
    ...track,
    trackSlug: normalizeStoredMockSlug(track.trackSlug, track.title, 'track'),
    access: track.isPrivate ? 'BLOCKED' : 'PLAYABLE',
    secretToken,
    secretLink: secretToken,
  };
};

const toEngagementCount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (Array.isArray(value)) {
    return value.length;
  }

  if (value instanceof Set) {
    return value.size;
  }

  return 0;
};

const compactImageForPersistence = (
  value: string | undefined,
  fallback = ''
): string => {
  if (!value) {
    return fallback;
  }

  if (isOversizedDataUrl(value)) {
    return fallback;
  }

  return value;
};

const compactTrackForPersistence = (
  track: MockTrackRecord,
  options?: PersistOptions
): MockTrackRecord => {
  const normalizedTrack = normalizeTrackRecord(track);
  const stripLargeImages = options?.stripLargeImages ?? false;
  const coverUrl = stripLargeImages
    ? compactImageForPersistence(
        normalizedTrack.coverUrl,
        getFallbackCoverUrl(normalizedTrack.id)
      )
    : normalizedTrack.coverUrl;

  const {
    likes: rawLikes,
    reposters: rawReposters,
    ...trackWithoutLegacyWaveformData
  } = normalizedTrack as MockTrackRecord & {
    waveformData?: number[];
    likes?: unknown;
    reposters?: unknown;
  };

  return {
    ...trackWithoutLegacyWaveformData,
    coverUrl,
    likeCount: toEngagementCount(rawLikes),
    repostCount: toEngagementCount(rawReposters),
    likes: toEngagementCount(rawLikes),
    reposters: toEngagementCount(rawReposters),
    durationSeconds: normalizedTrack.trackDurationSeconds,
    secretLink: normalizedTrack.secretToken,
  };
};

const syncTrackEngagementCounts = (): void => {
  if (!state) {
    return;
  }

  const likesByTrackId = new Map<number, number>();
  const repostsByTrackId = new Map<number, number>();

  for (const user of state.users) {
    for (const likedTrack of user.likedTracks) {
      likesByTrackId.set(
        likedTrack.id,
        (likesByTrackId.get(likedTrack.id) ?? 0) + 1
      );
    }

    for (const repostedTrack of user.reposts) {
      repostsByTrackId.set(
        repostedTrack.id,
        (repostsByTrackId.get(repostedTrack.id) ?? 0) + 1
      );
    }
  }

  for (const track of state.tracks) {
    const likeCount = likesByTrackId.get(track.id) ?? 0;
    const repostCount = repostsByTrackId.get(track.id) ?? 0;
    track.likeCount = likeCount;
    track.repostCount = repostCount;
    track.likes = likeCount;
    track.reposters = repostCount;
  }
};

const serializeUser = (
  user: MockUserRecord,
  options?: PersistOptions
): PersistedMockUserRecord => {
  const stripLargeImages = options?.stripLargeImages ?? false;

  return {
    ...user,
    profile: {
      ...user.profile,
      profilePic: stripLargeImages
        ? compactImageForPersistence(user.profile.profilePic)
        : user.profile.profilePic,
      coverPic: stripLargeImages
        ? compactImageForPersistence(user.profile.coverPic)
        : user.profile.coverPic,
    },
    followers: [...user.followers],
    following: [...user.following],
    blocked: [...user.blocked],
  };
};

const deserializeUser = (user: PersistedMockUserRecord): MockUserRecord => ({
  ...user,
  displayName: user.displayName?.trim() || user.username,
  playlists: (user.playlists ?? []).map((playlist) =>
    normalizePlaylistRecord(playlist as MockPlaylistRecord)
  ),
  likedPlaylists: user.likedPlaylists ?? [],
  repostedPlaylists: user.repostedPlaylists ?? [],
  followers: new Set(user.followers ?? []),
  following: new Set(user.following ?? []),
  blocked: new Set(user.blocked ?? []),
});

const toPersistedState = (
  current: MockSystemState,
  options?: PersistOptions
): PersistedMockSystemState => ({
  authAccounts: Array.from(current.authAccountsByEmail.values()),
  users: current.users.map((user) => serializeUser(user, options)),
  tracks: current.tracks.map((track) => compactTrackForPersistence(track, options)),
  comments: current.comments,
  emailVerification: current.emailVerification,
});

const toRuntimeState = (
  persisted: PersistedMockSystemState
): MockSystemState => {
  const authAccountsByEmail = new Map<string, MockAuthAccount>(
    (persisted.authAccounts ?? []).map((account) => [
      normalizeEmail(account.email),
      { ...account },
    ])
  );

  return {
    authAccountsByEmail,
    users: (persisted.users ?? []).map(deserializeUser),
    tracks: (persisted.tracks ?? []).map((track) =>
      compactTrackForPersistence(track)
    ),
    comments: persisted.comments ?? [],
    emailVerification: persisted.emailVerification ?? {},
  };
};

const readPersistedState = (): MockSystemState | null => {
  if (!hasStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(MOCK_SYSTEM_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedMockSystemState>;
    if (
      !parsed ||
      !Array.isArray(parsed.authAccounts) ||
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.tracks) ||
      !Array.isArray(parsed.comments) ||
      typeof parsed.emailVerification !== 'object' ||
      parsed.emailVerification === null
    ) {
      return null;
    }

    return toRuntimeState(parsed as PersistedMockSystemState);
  } catch {
    return null;
  }
};

const toLegacyTracksPayload = (tracks: MockTrackRecord[]): string =>
  JSON.stringify(tracks);

const syncLegacyTracksStorage = (): void => {
  if (!hasStorage() || !state) {
    return;
  }

  try {
    window.localStorage.setItem(
      LEGACY_TRACKS_STORAGE_KEY,
      toLegacyTracksPayload(
        state.tracks.map((track) => compactTrackForPersistence(track))
      )
    );
  } catch {
    // Best-effort compatibility key; ignore quota failures.
  }
};

const isQuotaExceeded = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return error.name === 'QuotaExceededError' || error.code === 22;
};

export const persistMockSystemState = (): void => {
  if (!hasStorage() || !state) {
    return;
  }

  const primaryPayload = JSON.stringify(toPersistedState(state));

  try {
    window.localStorage.setItem(MOCK_SYSTEM_STORAGE_KEY, primaryPayload);
  } catch (error) {
    if (!isQuotaExceeded(error)) {
      return;
    }

    // Fallback payload strips the largest regenerated fields.
    try {
      const fallbackPayload = JSON.stringify(
        toPersistedState(state, {
          stripLargeImages: true,
        })
      );
      window.localStorage.setItem(MOCK_SYSTEM_STORAGE_KEY, fallbackPayload);
    } catch {
      // If storage is still full, keep runtime state only.
    }
  }

  syncLegacyTracksStorage();
};

export const flushMockLocalStorage = (): void => {
  if (!hasStorage()) {
    state = null;
    return;
  }

  const keys = [
    MOCK_SYSTEM_STORAGE_KEY,
    LEGACY_TRACKS_STORAGE_KEY,
    AUTH_USER_STORAGE_KEY,
    ACCESS_TOKEN_STORAGE_KEY,
  ];

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }

  state = null;
};

declare global {
  interface Window {
    __flushDecibelMockStorage?: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.__flushDecibelMockStorage = flushMockLocalStorage;
}

const createDefaultUserFromAccount = (
  account: MockAuthAccount
): MockUserRecord => ({
  id: account.id,
  username: account.username,
  displayName: account.displayName?.trim() || account.username,
  email: account.email,
  emailVerified: account.emailVerified,
  role: 'LISTENER',
  tier: account.tier,
  profile: {
    bio: '',
    city: '',
    country: '',
    profilePic: account.avatarUrl ?? '/images/default_avatar.png',
    coverPic: '',
    favoriteGenres: [],
  },
  socialLinks: {
    instagram: '',
    website: '',
    supportLink: '',
    twitter: '',
  },
  privacySettings: {
    isPrivate: false,
    showHistory: true,
  },
  followers: new Set(),
  following: new Set(),
  blocked: new Set(),
  playlists: [],
  likedPlaylists: [],
  repostedPlaylists: [],
  likedTracks: [],
  tracks: [],
  reposts: [],
  history: [],
  additionalEmails: [],
});

const getNextAccountId = (): number => {
  const current = getMockSystemState();
  let maxId = 0;
  for (const account of current.authAccountsByEmail.values()) {
    if (account.id > maxId) {
      maxId = account.id;
    }
  }
  return maxId + 1;
};

const ensureUserFromAccount = (account: MockAuthAccount): MockUserRecord => {
  const current = getMockSystemState();
  const existing = current.users.find((user) => user.id === account.id);

  if (existing) {
    existing.email = account.email;
    existing.username = account.username;
    existing.displayName =
    account.displayName?.trim() ||
    existing.displayName ||
    account.username;
    existing.emailVerified = account.emailVerified;
    existing.tier = account.tier;
    existing.profile.profilePic =
    account.avatarUrl || existing.profile.profilePic;
    return existing;
  }

  const created = createDefaultUserFromAccount(account);
  current.users.push(created);
  return created;
};

const syncUserProfilesWithCredentials = (): void => {
  const current = getMockSystemState();
  const accounts = Array.from(current.authAccountsByEmail.values());
  const allowedIds = new Set(accounts.map((account) => account.id));

  const filteredUsers = current.users.filter((user) => allowedIds.has(user.id));
  current.users.splice(0, current.users.length, ...filteredUsers);

  for (const account of accounts) {
    ensureUserFromAccount(account);
  }
};

const syncTracksWithCredentialUsers = (): void => {
  const current = getMockSystemState();
  syncUserProfilesWithCredentials();

  const usersById = new Map(current.users.map((user) => [user.id, user]));
  const syncedTracks = current.tracks
    .filter((track) => usersById.has(track.artist.id))
    .map((track) => {
      const owner = usersById.get(track.artist.id);
      if (!owner) {
        return track;
      }

      return {
        ...track,
        artist: {
          id: owner.id,
          username: owner.username,
          displayName: owner.displayName,
          avatarUrl: owner.profile.profilePic,
        },
      };
    });

  current.tracks.splice(0, current.tracks.length, ...syncedTracks);
};

const syncCommentsWithCredentialUsers = (): void => {
  const current = getMockSystemState();
  syncUserProfilesWithCredentials();

  const usersById = new Map(current.users.map((user) => [user.id, user]));
  const syncedComments = current.comments.map((comment) => {
    const owner = usersById.get(comment.user.id);
    if (!owner) {
      return comment;
    }

    return {
      ...comment,
      user: {
        ...comment.user,
        username: owner.username,
        avatarUrl: owner.profile.profilePic,
      },
    };
  });

  current.comments.splice(0, current.comments.length, ...syncedComments);
};

export const getMockSystemState = (): MockSystemState => {
  if (state) {
    return state;
  }

  const persisted = readPersistedState();
  if (persisted) {
    state = persisted;
  } else {
    const users = seedUsers();
    const tracks = seedTracks(users);
    const playlists = seedPlaylists(users, tracks);
    assignTrackAndPlaylistEngagement(users, tracks, playlists);

    const authAccountsByEmail = new Map<string, MockAuthAccount>(
      seedAccounts.map((account) => [
        normalizeEmail(account.email),
        { ...account },
      ])
    );
    state = {
      authAccountsByEmail,
      users,
      tracks,
      comments: seedComments(users, tracks),
      emailVerification: {},
    };
  }

  state.tracks = state.tracks.map((track) => compactTrackForPersistence(track));

  syncUserProfilesWithCredentials();
  syncTracksWithCredentialUsers();
  syncCommentsWithCredentialUsers();
  syncTrackEngagementCounts();

  persistMockSystemState();
  if (!state) {
    throw new Error('Failed to initialize mock system state');
  }

  return state;
};

export const getMockEmailVerificationStore = (): Record<
  string,
  { email: string; token: string; verified: boolean }
> => {
  return getMockSystemState().emailVerification;
};

export const getMockUsersStore = (): MockUserRecord[] => {
  return getMockSystemState().users;
};

export const getMockTracksStore = (): MockTrackRecord[] => {
  return getMockSystemState().tracks;
};

export const getMockCommentsStore = (): MockCommentRecord[] => {
  return getMockSystemState().comments;
};

export const getMockPlaylistsStore = (): MockPlaylistRecord[] => {
  return getMockSystemState().users.flatMap((user) => user.playlists);
};

export const replaceMockTracksStore = (tracks: MockTrackRecord[]): void => {
  const current = getMockSystemState();
  current.tracks.splice(
    0,
    current.tracks.length,
    ...tracks.map((track) => compactTrackForPersistence(track))
  );
  syncTracksWithCredentialUsers();
  syncTrackEngagementCounts();
  persistMockSystemState();
};

export const getMockAuthAccountByEmail = (
  email: string
): MockAuthAccount | undefined => {
  return getMockSystemState().authAccountsByEmail.get(normalizeEmail(email));
};

export const getMockAuthAccountByUsername = (
  username: string
): MockAuthAccount | undefined => {
  const normalizedUsername = normalizeUsername(username);
  const accounts = getAllMockAuthAccounts();
  return accounts.find(
    (account) => normalizeUsername(account.username) === normalizedUsername
  );
};

export const getAllMockAuthAccounts = (): MockAuthAccount[] => {
  return Array.from(getMockSystemState().authAccountsByEmail.values());
};

export const createMockAuthAccount = (params: {
  email: string;
  username: string;
  avatarUrl?: string;
  password: string;
  emailVerified?: boolean;
  displayName?: string;
  tier?: LoginUserDTO['tier'];
}): MockAuthAccount => {
  const normalizedEmail = normalizeEmail(params.email);
  const normalizedUsername = normalizeUsername(params.username);
  const current = getMockSystemState();

  if (current.authAccountsByEmail.has(normalizedEmail)) {
    throw new Error(
      'Email already registered. Please use a different email address.'
    );
  }

  const existingByUsername = getMockAuthAccountByUsername(normalizedUsername);
  if (existingByUsername) {
    throw new Error(
      'Username already exists. Please choose a different username.'
    );
  }

  const account: MockAuthAccount = {
    id: getNextAccountId(),
    email: normalizedEmail,
    username: params.username.trim(),
    avatarUrl: params.avatarUrl ?? '/images/default_avatar.png',
    displayName: params.displayName ?? '',
    password: params.password,
    emailVerified: params.emailVerified ?? false,
    tier: params.tier ?? 'FREE',
  };

  current.authAccountsByEmail.set(normalizedEmail, account);
  ensureUserFromAccount(account);
  persistMockSystemState();
  return account;
};

export const upsertMockAuthAccount = (params: {
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  password?: string;
  emailVerified?: boolean;
  tier?: LoginUserDTO['tier'];
}): MockAuthAccount => {
  const normalizedEmail = normalizeEmail(params.email);
  const resolvedUsername = buildAvailableUsername(
    params.username,
    normalizedEmail
  );
  const existing = getMockAuthAccountByEmail(normalizedEmail);

  if (existing) {
    existing.username = resolvedUsername.trim() || existing.username;
    if (params.displayName !== undefined) {
      existing.displayName = params.displayName;
    }
    if (params.avatarUrl !== undefined) {
      existing.avatarUrl = params.avatarUrl;
    }
    if (params.password) {
      existing.password = params.password;
    }
    if (typeof params.emailVerified === 'boolean') {
      existing.emailVerified = params.emailVerified;
    }
    if (params.tier) {
      existing.tier = params.tier;
    }
    ensureUserFromAccount(existing);
    persistMockSystemState();
    return existing;
  }

  const created: MockAuthAccount = {
    id: getNextAccountId(),
    email: normalizedEmail,
    username: resolvedUsername.trim(),
    avatarUrl: params.avatarUrl ?? '/images/default_avatar.png',
    displayName: params.displayName ?? '',
    password: params.password ?? createFallbackPassword(),
    emailVerified: params.emailVerified ?? true,
    tier: params.tier ?? 'FREE',
  };

  getMockSystemState().authAccountsByEmail.set(normalizedEmail, created);
  ensureUserFromAccount(created);
  persistMockSystemState();
  return created;
};

export const updateMockAuthEmailVerification = (
  email: string,
  verified: boolean
): boolean => {
  const account = getMockAuthAccountByEmail(email);
  if (!account) {
    return false;
  }

  account.emailVerified = verified;
  ensureUserFromAccount(account);
  persistMockSystemState();
  return true;
};

export const syncAuthAccountsToMockUsers = (): void => {
  syncUserProfilesWithCredentials();
  syncTracksWithCredentialUsers();
  syncTrackEngagementCounts();
  persistMockSystemState();
};

export const resolveCurrentMockUserId = (): number => {
  if (typeof window === 'undefined') {
    return 1;
  }

  try {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!rawUser) {
      return 1;
    }

    const parsed = JSON.parse(rawUser) as { id?: unknown };
    if (typeof parsed.id === 'number' && Number.isFinite(parsed.id)) {
      return parsed.id;
    }
  } catch {
    return 1;
  }

  return 1;
};

export const trackStoreChanged = (): void => {
  persistMockSystemState();
};
