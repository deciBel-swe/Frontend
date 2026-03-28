import type { LoginUserDTO } from '@/types';
import type { PlaylistType } from '@/types/playlists';

type MockRole = 'LISTENER' | 'ARTIST' | 'OTHER';
type MockTier = 'FREE' | 'ARTIST' | 'ARTIST_PRO' | 'LISTENER' | 'OTHER';

export type MockAuthAccount = {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  password: string;
  emailVerified: boolean;
  tier: LoginUserDTO['tier'];
};

export type MockUserRecord = {
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
  playlists: MockPlaylistRecord[];
  tracks: Array<{ id: number; title: string; genre: string }>;
  history: Array<{ id: number; title: string }>;
  additionalEmails: string[];
};

export type MockTrackRecord = {
  id: number;
  title: string;
  artist: {
    id: number;
    username: string;
  };
  trackUrl: string;
  coverUrl: string;
  coverImageDataUrl?: string;
  waveformUrl: string;
  waveformData: string;
  genre: string;
  tags: string[];
  releaseDate: string;
  description?: string;
  isPrivate: boolean;
  durationSeconds: number;
  secretLink?: string;
};

export type MockPlaylistRecord = {
  id: number;
  title: string;
  description?: string;
  type: PlaylistType;
  isPrivate: boolean;
  CoverArt?: string;
  isLiked: boolean;
  owner: {
    id: number;
    username: string;
  };
  tracks: Array<{
    trackId: number;
    title: string;
    durationSeconds: number;
    trackUrl: string;
  }>;
};

const AUTH_USER_STORAGE_KEY = 'decibel_mock_user';
const ACCESS_TOKEN_STORAGE_KEY = 'decibel_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'decibel_refresh_token';
const LEGACY_TRACKS_STORAGE_KEY = 'decibel_mock_tracks';
const MOCK_SYSTEM_STORAGE_KEY = 'decibel_mock_system_state_v1';
const MAX_PERSISTED_DATA_URL_LENGTH = 100_000;

type PersistOptions = {
  stripWaveformData?: boolean;
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

const seedAccounts: MockAuthAccount[] = [
  {
    id: 1,
    email: 'mockuser@email.com',
    username: 'mockuser',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'ARTIST',
  },
  {
    id: 2,
    email: 'listenertwo@email.com',
    username: 'listenertwo',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'FREE',
  },
  {
    id: 3,
    email: 'beatpilot@email.com',
    username: 'beatpilot',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: false,
    tier: 'ARTIST_PRO',
  },
  {
    id: 7,
    email: 'artist@decibel.test',
    username: 'mockartist',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'ARTIST',
  },
  {
    id: 5,
    email: 'listener@decibel.test',
    username: 'mocklistener',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'FREE',
  },
  {
    id: 9,
    email: 'nightlistener@decibel.test',
    username: 'nightlistener',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'FREE',
  },
  {
    id: 12,
    email: 'guestproducer@decibel.test',
    username: 'guestproducer',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'ARTIST',
  },
  {
    id: 15,
    email: 'soundpilot@decibel.test',
    username: 'soundpilot',
    password:
      '0c259750cf512f112aa470d477f7fd002fea27aa2893fe2e077555e28fcd4541',
    emailVerified: true,
    tier: 'ARTIST',
  },
];

const seedUsers = (): MockUserRecord[] => [
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
      {
        id: 1001,
        title: 'Late Night Mix',
        description: 'After-hours loops and neon moods.',
        type: 'PLAYLIST',
        isPrivate: false,
        CoverArt: '',
        isLiked: false,
        owner: { id: 1, username: 'mockuser' },
        tracks: [],
      },
      {
        id: 1002,
        title: 'Studio Drafts',
        description: 'Work-in-progress sketches.',
        type: 'ALBUM',
        isPrivate: true,
        CoverArt: '',
        isLiked: false,
        owner: { id: 1, username: 'mockuser' },
        tracks: [],
      },
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
    playlists: [
      {
        id: 1003,
        title: 'Study Session',
        description: 'Low-key focus tracks.',
        type: 'PLAYLIST',
        isPrivate: false,
        CoverArt: '',
        isLiked: false,
        owner: { id: 2, username: 'listenertwo' },
        tracks: [],
      },
    ],
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
    playlists: [
      {
        id: 1004,
        title: 'Warehouse Cuts',
        description: 'Peak hour energy.',
        type: 'EP',
        isPrivate: false,
        CoverArt: '',
        isLiked: false,
        owner: { id: 3, username: 'beatpilot' },
        tracks: [],
      },
    ],
    tracks: [{ id: 205, title: 'Circuit Bloom', genre: 'House' }],
    history: [{ id: 305, title: 'Peak Hour' }],
    additionalEmails: [],
  },
];

const seedTracks = (): MockTrackRecord[] => [
  {
    id: 101,
    title: 'Neon Skylines',
    artist: { id: 7, username: 'mockartist' },
    trackUrl: '/tracks/101',
    coverUrl: 'https://picsum.photos/seed/decibel-cover-101/640/640',
    waveformUrl: '/mock/waveforms/101.json',
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08]',
    genre: 'Electronic',
    tags: ['synthwave', 'night-drive'],
    releaseDate: '2025-10-25',
    isPrivate: false,
    durationSeconds: 214,
  },
  {
    id: 102,
    title: 'Cloud Room Sessions',
    artist: { id: 7, username: 'mockartist' },
    trackUrl: '/tracks/102',
    coverUrl: 'https://picsum.photos/seed/decibel-cover-102/640/640',
    waveformUrl: '/mock/waveforms/102.json',
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08,0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14]',
    genre: 'Lo-Fi',
    tags: ['chill', 'study'],
    releaseDate: '2025-10-25',
    isPrivate: true,
    durationSeconds: 182,
    secretLink: 'c8n2x3ya',
  },
  {
    id: 103,
    title: 'Circuit Bloom',
    artist: { id: 12, username: 'guestproducer' },
    trackUrl: '/tracks/103',
    coverUrl: 'https://picsum.photos/seed/decibel-cover-103/640/640',
    waveformUrl: '/mock/waveforms/103.json',
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08]',
    genre: 'House',
    tags: ['club', 'warmup'],
    releaseDate: '2025-10-25',
    isPrivate: false,
    durationSeconds: 256,
  },
  {
    id: 104,
    title: 'Quiet Transit',
    artist: { id: 9, username: 'nightlistener' },
    trackUrl: '/tracks/104',
    coverUrl: 'https://picsum.photos/seed/decibel-cover-104/640/640',
    waveformUrl: '/mock/waveforms/104.json',
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08]',
    genre: 'Ambient',
    tags: ['meditation', 'sleep'],
    releaseDate: '2025-10-25',
    isPrivate: true,
    durationSeconds: 301,
    secretLink: 'f4m0qt9b',
  },
  {
    id: 105,
    title: 'Velvet Breakbeat',
    artist: { id: 7, username: 'mockartist' },
    trackUrl: '/tracks/105',
    coverUrl: 'https://picsum.photos/seed/decibel-cover-105/640/640',
    waveformUrl: '/mock/waveforms/105.json',
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08]',
    genre: 'Breakbeat',
    tags: ['drums', 'vinyl'],
    releaseDate: '2025-10-25',
    isPrivate: false,
    durationSeconds: 199,
  },
  {
    id: 106,
    title: 'Aurora Steps',
    artist: { id: 15, username: 'soundpilot' },
    trackUrl: '/tracks/106',
    coverUrl: 'https://picsum.photos/seed/decibel-cover-106/640/640',
    waveformUrl: '/mock/waveforms/106.json',
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08]',
    genre: 'Downtempo',
    tags: ['sunrise', 'focus'],
    releaseDate: '2025-10-25',
    isPrivate: false,
    durationSeconds: 238,
  },
];

type MockSystemState = {
  authAccountsByEmail: Map<string, MockAuthAccount>;
  users: MockUserRecord[];
  tracks: MockTrackRecord[];
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

  return value.startsWith('data:') && value.length > MAX_PERSISTED_DATA_URL_LENGTH;
};

const getFallbackCoverUrl = (trackId: number): string =>
  `https://picsum.photos/seed/decibel-cover-${trackId}/640/640`;

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
  const stripLargeImages = options?.stripLargeImages ?? false;
  const coverImageDataUrl = stripLargeImages
    ? isOversizedDataUrl(track.coverImageDataUrl)
      ? undefined
      : track.coverImageDataUrl
    : track.coverImageDataUrl;
  const coverUrl = stripLargeImages
    ? compactImageForPersistence(track.coverUrl, getFallbackCoverUrl(track.id))
    : track.coverUrl;

  return {
    ...track,
    coverUrl,
    coverImageDataUrl,
    waveformData: options?.stripWaveformData ? '[]' : track.waveformData,
  };
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
  emailVerification: current.emailVerification,
});

const toRuntimeState = (persisted: PersistedMockSystemState): MockSystemState => {
  const authAccountsByEmail = new Map<string, MockAuthAccount>(
    (persisted.authAccounts ?? []).map((account) => [
      normalizeEmail(account.email),
      { ...account },
    ])
  );

  return {
    authAccountsByEmail,
    users: (persisted.users ?? []).map(deserializeUser),
    tracks: persisted.tracks ?? [],
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
      toLegacyTracksPayload(state.tracks.map((track) => compactTrackForPersistence(track)))
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
          stripWaveformData: true,
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
    REFRESH_TOKEN_STORAGE_KEY,
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
  email: account.email,
  emailVerified: account.emailVerified,
  role: 'LISTENER',
  tier: account.tier,
  profile: {
    bio: '',
    city: '',
    country: '',
    profilePic: account.avatarUrl ?? '',
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
  tracks: [],
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
    existing.emailVerified = account.emailVerified;
    existing.tier = account.tier;
    if (account.avatarUrl) {
      existing.profile.profilePic = account.avatarUrl;
    }
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
        },
      };
    });

  current.tracks.splice(0, current.tracks.length, ...syncedTracks);
};

export const getMockSystemState = (): MockSystemState => {
  if (state) {
    return state;
  }

  const persisted = readPersistedState();
  if (persisted) {
    state = persisted;
  } else {
    const authAccountsByEmail = new Map<string, MockAuthAccount>(
      seedAccounts.map((account) => [normalizeEmail(account.email), { ...account }])
    );

    state = {
      authAccountsByEmail,
      users: seedUsers(),
      tracks: seedTracks(),
      emailVerification: {},
    };
  }

  syncUserProfilesWithCredentials();
  syncTracksWithCredentialUsers();

  persistMockSystemState();
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

export const replaceMockTracksStore = (tracks: MockTrackRecord[]): void => {
  const current = getMockSystemState();
  current.tracks.splice(0, current.tracks.length, ...tracks);
  syncTracksWithCredentialUsers();
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
    avatarUrl: params.avatarUrl,
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
    avatarUrl: params.avatarUrl,
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
