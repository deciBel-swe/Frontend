import type { TrackService } from '@/services/api/trackService';
import type {
  PaginatedTrackMetadataResponse,
  paginationRepostUser,
  SecretLink,
  TrackMetaData,
  TrackResourceRefDTO,
  UploadTrackResponse,
  TrackUpdateResponse,
  TrackVisibility,
  UpdateTrackVisibilityDto,
  likeResponse,
  repostResponse,
  paginatedTrackResponse,
} from '@/types/tracks';
import {
  getMockTracksStore,
  getMockUsersStore,
  persistMockSystemState,
  replaceMockTracksStore,
  resolveCurrentMockUserId,
  type MockTrackRecord,
} from './mockSystemStore';
import { PaginationParams } from '../api/trackService';
import {
  canAccessMockResource,
  createUniqueMockSlug,
  resolveMockResourceAccess,
} from './mockResourceUtils';

const MOCK_DELAY_MS = 220;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const FALLBACK_AUDIO_TRACK_URL =
  'https://decibelblob.blob.core.windows.net/uploads/audio/b0a977d2-3903-49a4-8557-aae029c9f376_Taha.mp3';

const UPLOADED_TRACK_WAVEFORM_URL =
  'https://decibelblob.blob.core.windows.net/uploads/waveform-data/8d61bb34-377a-434c-a2ba-7372b5d32b75_Surat_Taha.json';

const DEFAULT_TRACK_DURATION_SECONDS_BY_ID: Record<number, number> = {
  101: 201,
  102: 188,
  103: 216,
  104: 174,
  105: 223,
  106: 195,
  204: 182,
};

const resolvePlayableTrackUrl = (
  _formData: FormData,
  _currentTrackUrl?: string
): string => {
  return FALLBACK_AUDIO_TRACK_URL;
};

const buildCoverUrl = (_trackId: number): string =>
  '/images/default_song_image.png';

const createSecretToken = (): string => Math.random().toString(36).slice(2, 10);

const cloneTrack = (track: MockTrackRecord): MockTrackRecord => ({
  ...(function () {
    const {...withoutLegacyWaveform } =
      track as MockTrackRecord & { waveformData?: number[] };
    return withoutLegacyWaveform;
  })(),
  artist: { ...track.artist },
  tags: [...track.tags],
});

const parseWaveformPayload = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((entry) => Number.isFinite(entry))
      .map((entry) => Math.max(0, Math.min(1, entry)));
  }

  if (typeof value === 'string') {
    if (value.trim().length === 0) {
      return [];
    }

    try {
      return parseWaveformPayload(JSON.parse(value));
    } catch {
      return [];
    }
  }

  return [];
};

const parseWaveformPayloadFromForm = (formData: FormData): number[] | undefined => {
  const waveformEntries = formData.getAll('waveformData');
  if (waveformEntries.length === 0) {
    return undefined;
  }

  const waveformJson =
    waveformEntries.length === 1 && typeof waveformEntries[0] === 'string'
      ? (waveformEntries[0] as string)
      : JSON.stringify(
          waveformEntries
            .filter((entry): entry is string => typeof entry === 'string')
            .map((entry) => Number(entry))
            .filter((value) => Number.isFinite(value))
        );

  return parseWaveformPayload(waveformJson);
};

const getWaveformSampleCountFromForm = (formData: FormData): number => {
  const waveformEntries = formData.getAll('waveformData');

  if (
    waveformEntries.length === 1 &&
    typeof waveformEntries[0] === 'string' &&
    waveformEntries[0].trim().startsWith('[')
  ) {
    try {
      const parsed = JSON.parse(waveformEntries[0] as string);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    } catch {
      return 0;
    }
  }

  return waveformEntries.length;
};

const waveformPayloadToUrl = (_trackId: number, _waveformData: number[]): string =>
  UPLOADED_TRACK_WAVEFORM_URL;

const parseWaveformDataUrl = (waveformUrl: string): number[] | null => {
  if (!waveformUrl.startsWith('data:')) {
    return null;
  }

  const commaIndex = waveformUrl.indexOf(',');
  if (commaIndex < 0) {
    return [];
  }

  const encoded = waveformUrl.slice(commaIndex + 1);

  try {
    return parseWaveformPayload(decodeURIComponent(encoded));
  } catch {
    return [];
  }
};

const fetchWaveformPayloadFromUrl = async (waveformUrl: string): Promise<number[]> => {
  const embedded = parseWaveformDataUrl(waveformUrl);
  if (embedded) {
    return embedded;
  }

  if (typeof fetch !== 'function') {
    return [];
  }

  try {
    const response = await fetch(waveformUrl);
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as unknown;
    return parseWaveformPayload(payload);
  } catch {
    return [];
  }
};

const resolveDurationSeconds = (
  track: MockTrackRecord,
  waveformData: number[]
): number => {
  if (
    typeof track.trackDurationSeconds === 'number' &&
    Number.isFinite(track.trackDurationSeconds) &&
    track.trackDurationSeconds > 0
  ) {
    return Math.round(track.trackDurationSeconds);
  }

  const seededDuration = DEFAULT_TRACK_DURATION_SECONDS_BY_ID[track.id];
  if (typeof seededDuration === 'number' && seededDuration > 0) {
    return seededDuration;
  }

  if (waveformData.length > 0) {
    return Math.max(30, Math.min(1200, waveformData.length * 2));
  }

  return 2745;
};

const resolveTrackSlug = (track: MockTrackRecord): string => {
  return track.trackSlug?.trim() || `track-${track.id}`;
};

const toMetadata = async (
  track: MockTrackRecord,
  options?: {
    viewerId?: number;
    providedToken?: string | null;
  }
): Promise<TrackMetaData> => {
  const currentUserId = options?.viewerId ?? resolveCurrentMockUserId();
  const waveformDataFromUrl = await fetchWaveformPayloadFromUrl(track.waveformUrl);
  const waveformData =
    waveformDataFromUrl.length > 0
      ? waveformDataFromUrl
      : parseWaveformPayload(track.waveformData ?? []);
  const durationSeconds = resolveDurationSeconds(track, waveformData);

  return {
    id: track.id,
    title: track.title,
    trackSlug: resolveTrackSlug(track),
    artist: { ...track.artist },
    trackUrl: track.trackUrl,
    trackPreviewUrl: track.trackPreviewUrl || track.trackUrl,
    durationSeconds,
    coverUrl: track.coverImageDataUrl ?? track.coverUrl,
    waveformUrl: track.waveformUrl,
    waveformData,
    genre: track.genre,
    tags: [...track.tags],
    description: track.description ?? '',
    releaseDate: track.releaseDate,
    isPrivate: track.isPrivate,
    isLiked: isTrackLikedByUser(track.id, currentUserId),
    isReposted: isTrackRepostedByUser(track.id, currentUserId),
    likeCount: track.likes ?? track.likeCount,
    repostCount: track.reposters ?? track.repostCount,
    commentCount: track.commentCount,
    playCount: 0,
    secretToken: track.secretLink ?? '',
    uploadDate: track.uploadDate ?? track.releaseDate,
    access: resolveMockResourceAccess({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId: currentUserId,
      resourceToken: track.secretLink,
      providedToken: options?.providedToken,
    }),
  };
};

const readTracks = (): MockTrackRecord[] => {
  return getMockTracksStore().map(cloneTrack);
};

const writeTracks = (tracks: MockTrackRecord[]): void => {
  replaceMockTracksStore(tracks.map(cloneTrack));
};

const parseTrackId = (trackId: string): number => {
  const parsed = Number(trackId);
  if (!Number.isFinite(parsed)) {
    throw new Error('Invalid track id');
  }
  return parsed;
};

const resolveTrackBySecretToken = (token: string): MockTrackRecord | undefined => {
  const normalizedToken = token.trim();
  if (normalizedToken.length === 0) {
    return undefined;
  }

  return readTracks().find((track) => track.secretLink === normalizedToken);
};

const assertTrackOwner = (track: MockTrackRecord, viewerId: number): void => {
  if (track.artist.id !== viewerId) {
    throw new Error('Track not found');
  }
};

const assertTrackAccessible = (
  track: MockTrackRecord,
  viewerId: number,
  providedToken?: string | null
): void => {
  if (
    !canAccessMockResource({
      isPrivate: track.isPrivate,
      ownerId: track.artist.id,
      viewerId,
      resourceToken: track.secretLink,
      providedToken,
    })
  ) {
    throw new Error('Track not found');
  }
};

const toTrackListItem = (
  track: MockTrackRecord,
  viewerId: number
): NonNullable<paginatedTrackResponse['content']>[number] => ({
  trackDurationSeconds:
    track.durationSeconds ?? DEFAULT_TRACK_DURATION_SECONDS_BY_ID[track.id] ?? 180,
  artist: { ...track.artist },
  coverUrl: track.coverImageDataUrl ?? track.coverUrl,
  description: track.description ?? '',
  genre: track.genre,
  id: track.id,
  trackSlug: resolveTrackSlug(track),
  isLiked: isTrackLikedByUser(track.id, viewerId),
  isReposted: isTrackRepostedByUser(track.id, viewerId),
  likeCount: track.likes ?? track.likeCount,
  playCount: 0,
  commentCount: 0,
  releaseDate: new Date(track.releaseDate),
  repostCount: track.reposters ?? track.repostCount,
  access: resolveMockResourceAccess({
    isPrivate: track.isPrivate,
    ownerId: track.artist.id,
    viewerId,
  }),
  secretToken: track.secretLink ?? '',
  tags: [...track.tags],
  title: track.title,
  trackUrl: track.trackUrl,
  trackPreviewUrl: track.trackUrl,
  trendingRank: 0,
  uploadDate: new Date(track.releaseDate),
  waveformUrl: track.waveformUrl,
});

const getStringField = (
  formData: FormData,
  key: string,
  fallback = ''
): string => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const getOptionalStringField = (
  formData: FormData,
  key: string,
  options?: { allowEmpty?: boolean }
): string | undefined => {
  if (!formData.has(key)) {
    return undefined;
  }

  const value = formData.get(key);
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 && !options?.allowEmpty) {
    return undefined;
  }

  return trimmed;
};

const getBooleanField = (formData: FormData, key: string): boolean => {
  const value = formData.get(key);
  return typeof value === 'string' && value.toLowerCase() === 'true';
};

const getOptionalBooleanField = (
  formData: FormData,
  key: string
): boolean | undefined => {
  if (!formData.has(key)) {
    return undefined;
  }

  const value = formData.get(key);
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }

  return undefined;
};

const getTagsField = (formData: FormData): string[] => {
  const unique = new Set<string>();
  const entries = formData.getAll('tags');
  const hasSingleJsonString =
    entries.length === 1 &&
    typeof entries[0] === 'string' &&
    entries[0].trim().startsWith('[');

  if (hasSingleJsonString) {
    try {
      const parsed = JSON.parse(entries[0] as string);
      if (Array.isArray(parsed)) {
        parsed
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .forEach((tag) => unique.add(tag));
        return [...unique];
      }
    } catch {
      // Fall through to default parsing.
    }
  }

  entries
    .flatMap((entry) => (typeof entry === 'string' ? entry.split(',') : []))
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .forEach((tag) => unique.add(tag));

  return [...unique];
};

const getOptionalTagsField = (formData: FormData): string[] | undefined => {
  const entries = formData.getAll('tags');
  if (entries.length === 0) {
    return undefined;
  }
  return getTagsField(formData);
};

const getSessionArtist = (): {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
} | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  const sessionUserId = resolveCurrentMockUserId();
  const user = getMockUsersStore().find((item) => item.id === sessionUserId);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.profile.profilePic,
  };
};

const getUserById = (userId: number) =>
  getMockUsersStore().find((user) => user.id === userId);

const hasTrackInCollection = (
  collection: Array<{ id: number }>,
  trackId: number
): boolean => collection.some((item) => item.id === trackId);

const isTrackLikedByUser = (trackId: number, userId: number): boolean => {
  const user = getUserById(userId);
  return Boolean(user && hasTrackInCollection(user.likedTracks, trackId));
};

const isTrackRepostedByUser = (trackId: number, userId: number): boolean => {
  const user = getUserById(userId);
  return Boolean(user && hasTrackInCollection(user.reposts, trackId));
};

const incrementCounter = (value: number): number => Math.max(0, value) + 1;

const decrementCounter = (value: number): number => Math.max(0, value - 1);

export class MockTrackService implements TrackService {
  async uploadTrack(
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse> {
    await delay();

    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(100, progress + 10);
        onProgress(progress);

        if (progress < 100) {
          return;
        }

        clearInterval(interval);

        const tracks = readTracks();
        const nextId =
          tracks.length > 0
            ? Math.max(...tracks.map((track) => track.id)) + 1
            : 1;

        const waveformSamples = parseWaveformPayloadFromForm(formData) ?? [];
        const waveformSampleCount = getWaveformSampleCountFromForm(formData);
        const durationSeconds =
          waveformSampleCount > 0
            ? Math.max(30, Math.min(1200, waveformSampleCount * 2))
            : 180;

        const sessionArtist = getSessionArtist();
        const title = getStringField(formData, 'title', `Untitled ${nextId}`);
        const genre = getStringField(formData, 'genre', 'Electronic');
        const description = getStringField(formData, 'description', '');
        const tags = getTagsField(formData);
        const isPrivate = getBooleanField(formData, 'isPrivate');
        const releaseDate = getStringField(
          formData,
          'releaseDate',
          new Date().toISOString().slice(0, 10)
        );
        const artistName = getStringField(
          formData,
          'artist',
          sessionArtist?.username ?? 'mockartist'
        );
        const artistId = sessionArtist?.id ?? 7;
        const trackSlug = createUniqueMockSlug(
          title,
          'track',
          tracks.map((track) => resolveTrackSlug(track))
        );

        const finalizeUpload = async () => {
          const coverImageDataUrl = undefined;

          const uploaded: MockTrackRecord = {
            id: nextId,
            title,
            trackSlug,
            artist: {
              id: artistId,
              username: artistName,
              displayName: sessionArtist?.displayName ?? artistName,
              avatarUrl: sessionArtist?.avatarUrl ?? '/images/default_avatar_image_1.png',
            },
            trackUrl: resolvePlayableTrackUrl(formData),
            coverUrl: buildCoverUrl(nextId),
            coverImageDataUrl,
            waveformUrl: UPLOADED_TRACK_WAVEFORM_URL,
            waveformData: waveformSamples,
            genre,
            isReposted: false,
            isLiked: false,
            description,
            tags,
            releaseDate,
            // uploadDate: releaseDate,
            uploadDate: new Date().toISOString(),
            playCount: 0,
            completedPlayCount: 0,
            likeCount: 0,
            repostCount: 0,
            commentCount: 0,
            isPrivate,
            trackDurationSeconds: durationSeconds,
            trendingRank: 0,
            access: 'PLAYABLE',
            trackPreviewUrl: FALLBACK_AUDIO_TRACK_URL,
            durationSeconds,
            secretLink: undefined,
            secretToken: undefined,
            likes: 0,
            reposters: 0,
          };

          if (isPrivate) {
            const token = createSecretToken();
            uploaded.secretLink = token;
            uploaded.secretToken = token;
          }

          const updated = [uploaded, ...tracks];
          writeTracks(updated);

          const uploader = getMockUsersStore().find(
            (user) => user.id === artistId
          );
          if (
            uploader &&
            !uploader.tracks.some((track) => track.id === uploaded.id)
          ) {
            uploader.tracks.unshift({
              id: uploaded.id,
              title: uploaded.title,
              genre: uploaded.genre,
            });
            persistMockSystemState();
          }

          resolve({
            id: uploaded.id,
            title: uploaded.title,
            artist: { ...uploaded.artist },
            trackSlug: uploaded.trackSlug,
            trackUrl: uploaded.trackUrl,
            trackPreviewUrl: uploaded.trackPreviewUrl ?? uploaded.trackUrl,
            coverUrl: uploaded.coverUrl,
            waveformUrl: uploaded.waveformUrl,
            genre: uploaded.genre,
            isReposted: false,
            isLiked: false,
            tags: [...uploaded.tags],
            releaseDate: uploaded.releaseDate,
            playCount: uploaded.playCount,
            likeCount: uploaded.likeCount,
            repostCount: uploaded.repostCount,
            commentCount: uploaded.commentCount,
            isPrivate: uploaded.isPrivate,
            trackDurationSeconds: uploaded.trackDurationSeconds,
            uploadDate: uploaded.uploadDate,
            description: uploaded.description ?? '',
            secretToken: uploaded.secretToken ?? '',
            durationSeconds: uploaded.durationSeconds ?? 0,
            access: 'PLAYABLE',
          });
        };

        void finalizeUpload().catch(reject);
      }, 120);
    });
  }

  async resolveTrackSlug(trackSlug: string): Promise<TrackResourceRefDTO> {
    await delay();

    const normalizedSlug = trackSlug.trim().toLowerCase();
    const track = readTracks().find(
      (item) => resolveTrackSlug(item).toLowerCase() === normalizedSlug
    );

    if (!track) {
      throw new Error('Track not found');
    }

    return {
      type: 'TRACK',
      id: track.id,
    };
  }

  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    await delay();
    const track = this.getTrackById(trackId);
    const currentUserId = resolveCurrentMockUserId();
    assertTrackAccessible(track, currentUserId);
    return toMetadata(track, { viewerId: currentUserId });
  }

  async getTrackByToken(token: string): Promise<TrackMetaData> {
    await delay();

    const track = resolveTrackBySecretToken(token);
    if (!track) {
      throw new Error('Track not found');
    }

    return toMetadata(track, {
      viewerId: resolveCurrentMockUserId(),
      providedToken: token,
    });
  }

  async getUserTracks(userId: number): Promise<TrackMetaData[]> {
    await delay();
    const currentUserId = resolveCurrentMockUserId();
    const isOwner = currentUserId === userId;

    const visibleTracks = readTracks()
      .filter((track) => track.artist.id === userId)
      .filter((track) => isOwner || !track.isPrivate);

    return Promise.all(
      visibleTracks.map((track) => toMetadata(track, { viewerId: currentUserId }))
    );
  }

  async getMyTracks(): Promise<TrackMetaData[]> {
    const response = await this.getMyTracksPage();
    return response.content;
  }

  async getMyTracksPage(
    params?: PaginationParams
  ): Promise<PaginatedTrackMetadataResponse> {
    await delay();
    const currentUserId = resolveCurrentMockUserId();

    const ownTracks = readTracks().filter(
      (track) => track.artist.id === currentUserId
    );

    const pageNumber = Math.max(0, params?.page ?? 0);
    const pageSize = Math.max(1, params?.size ?? 20);
    const start = pageNumber * pageSize;
    const content = await Promise.all(
      ownTracks
        .slice(start, start + pageSize)
        .map((track) => toMetadata(track, { viewerId: currentUserId }))
    );
    const totalElements = ownTracks.length;
    const totalPages =
      totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);

    return {
      content,
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
      isLast: pageNumber >= totalPages - 1,
    };
  }

  async getAllTracks(): Promise<TrackMetaData[]> {
    await delay();
    const publicTracks = readTracks().filter((track) => !track.isPrivate);
    const currentUserId = resolveCurrentMockUserId();
    return Promise.all(
      publicTracks.map((track) => toMetadata(track, { viewerId: currentUserId }))
    );
  }
  async updateTrack(
    trackId: number,
    formData: FormData
  ): Promise<TrackUpdateResponse> {
    await delay();

    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === trackId);
    if (index < 0) {
      throw new Error('Track not found');
    }

    const current = tracks[index];
    assertTrackOwner(current, resolveCurrentMockUserId());
    const title = getOptionalStringField(formData, 'title');
    const genre = getOptionalStringField(formData, 'genre');
    const description = getOptionalStringField(formData, 'description', {
      allowEmpty: true,
    });
    const releaseDate = getOptionalStringField(formData, 'releaseDate');
    const tags = getOptionalTagsField(formData);
    const artistName = getOptionalStringField(formData, 'artist');
    const isPrivate = getOptionalBooleanField(formData, 'isPrivate');
    const removeCover = getOptionalBooleanField(formData, 'removeCover');
    const nextWaveformSamples = parseWaveformPayloadFromForm(formData);

    const nextIsPrivate = isPrivate ?? current.isPrivate;
    const nextSecretLink = nextIsPrivate
      ? (current.secretLink ?? createSecretToken())
      : current.secretLink;

    const nextCoverUrl = removeCover ? buildCoverUrl(trackId) : buildCoverUrl(trackId);
    const nextCoverImageDataUrl = undefined;

    const nextTrackUrl = resolvePlayableTrackUrl(formData, current.trackUrl);

    const updated: MockTrackRecord = {
      ...current,
      title: title ?? current.title,
      genre: genre ?? current.genre,
      tags: tags ?? current.tags,
      description:
        description !== undefined ? description : current.description,
      releaseDate: releaseDate ?? current.releaseDate,
      artist: artistName
        ? { ...current.artist, username: artistName }
        : current.artist,
      trackUrl: nextTrackUrl,
      waveformUrl:
        nextWaveformSamples !== undefined
          ? waveformPayloadToUrl(trackId, nextWaveformSamples)
          : current.waveformUrl,
      waveformData:
        nextWaveformSamples !== undefined
          ? nextWaveformSamples
          : current.waveformData,
      durationSeconds:
        nextWaveformSamples !== undefined
          ? Math.max(30, Math.min(1200, nextWaveformSamples.length * 2))
          : current.durationSeconds,
      isPrivate: nextIsPrivate,
      access: 'PLAYABLE',
      secretToken: nextSecretLink,
      secretLink: nextSecretLink,
      coverUrl: nextCoverUrl,
      coverImageDataUrl: nextCoverImageDataUrl,
    };

    tracks[index] = updated;
    writeTracks(tracks);

    return {
      id: updated.id,
      coverUrl: updated.coverUrl,
      title: updated.title,
      trackSlug: updated.trackSlug,
      trackPreviewUrl: updated.trackPreviewUrl,
      genre: updated.genre,
      description: updated.description ?? '',
      isPrivate: updated.isPrivate,
      tags: [...updated.tags],
      releaseDate: updated.releaseDate,
      access: 'PLAYABLE',
    };
  }

  async deleteTrack(trackId: number): Promise<void> {
    await delay();

    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === trackId);
    if (index < 0) {
      throw new Error('Track not found');
    }

    assertTrackOwner(tracks[index], resolveCurrentMockUserId());

    tracks.splice(index, 1);
    writeTracks(tracks);

    const usersStore = getMockUsersStore();
    for (const user of usersStore) {
      user.tracks = user.tracks.filter((track) => track.id !== trackId);
      user.likedTracks = user.likedTracks.filter((track) => track.id !== trackId);
      user.reposts = user.reposts.filter((repost) => repost.id !== trackId);
    }

    persistMockSystemState();
  }

  async deleteTrackCover(trackId: number): Promise<void> {
    await delay();

    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === trackId);
    if (index < 0) {
      throw new Error('Track not found');
    }

    assertTrackOwner(tracks[index], resolveCurrentMockUserId());

    tracks[index] = {
      ...tracks[index],
      coverUrl: buildCoverUrl(trackId),
      coverImageDataUrl: undefined,
    };

    writeTracks(tracks);
  }

  async getTrackVisibility(trackId: number): Promise<TrackVisibility> {
    await delay();
    const track = this.getTrackById(trackId);
    assertTrackOwner(track, resolveCurrentMockUserId());
    return { isPrivate: track.isPrivate };
  }

  async updateTrackVisibility(
    trackId: number,
    data: UpdateTrackVisibilityDto
  ): Promise<TrackVisibility> {
    await delay();

    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === trackId);
    if (index < 0) {
      throw new Error('Track not found');
    }

    const current = tracks[index];
    assertTrackOwner(current, resolveCurrentMockUserId());
    const secretLink = data.isPrivate
      ? (current.secretLink ?? createSecretToken())
      : current.secretLink;
    const updated: MockTrackRecord = {
      ...current,
      isPrivate: data.isPrivate,
      access: 'PLAYABLE',
      secretLink,
      secretToken: secretLink,
    };

    tracks[index] = updated;
    writeTracks(tracks);

    return { isPrivate: updated.isPrivate };
  }

  async getSecretLink(trackId: string): Promise<SecretLink> {
    await delay();

    const numericTrackId = parseTrackId(trackId);
    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === numericTrackId);

    if (index < 0) {
      throw new Error('Track not found');
    }

    const current = tracks[index];
    assertTrackOwner(current, resolveCurrentMockUserId());
    const secretLink = current.secretLink ?? createSecretToken();

    tracks[index] = {
      ...current,
      secretLink,
      secretToken: secretLink,
    };
    writeTracks(tracks);

    return { secretLink };
  }

  async regenerateSecretLink(trackId: string): Promise<SecretLink> {
    await delay();

    const numericTrackId = parseTrackId(trackId);
    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === numericTrackId);

    if (index < 0) {
      throw new Error('Track not found');
    }

    const secretLink = createSecretToken();
    assertTrackOwner(tracks[index], resolveCurrentMockUserId());
    tracks[index] = {
      ...tracks[index],
      secretLink,
      secretToken: secretLink,
    };
    writeTracks(tracks);

    return { secretLink };
  }

  private getTrackById(trackId: number): MockTrackRecord {
    const track = readTracks().find((item) => item.id === trackId);
    if (!track) {
      throw new Error('Track not found');
    }
    return track;
  }

  async getRepostUsers(
    trackId: number,
    params?: PaginationParams
  ): Promise<paginationRepostUser> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const usersStore = getMockUsersStore();
        const track = getMockTracksStore().find((item) => item.id === trackId);
        if (!track) {
          resolve({
            content: [],
            isLast: true,
            pageNumber: params?.page ?? 0,
            pageSize: params?.size ?? 20,
            totalElements: 0,
            totalPages: 0,
          });
          return;
        }

        if (
          !canAccessMockResource({
            isPrivate: track.isPrivate,
            ownerId: track.artist.id,
            viewerId: currentUserId,
          })
        ) {
          resolve({
            content: [],
            isLast: true,
            pageNumber: params?.page ?? 0,
            pageSize: params?.size ?? 20,
            totalElements: 0,
            totalPages: 0,
          });
          return;
        }

        const repostUsers = usersStore
          .filter((user) =>
            user.reposts.some((repost) => repost.id === trackId)
          )
          .map((user) => ({
            id: user.id,
            username: user.username,
            avatarUrl: user.profile.profilePic,
            isFollowing: user.followers.has(currentUserId),
            tier: user.tier,
          }));

        const pageNumber = params?.page ?? 0;
        const pageSize = params?.size ?? (repostUsers.length || 20);
        const start = pageNumber * pageSize;
        const end = start + pageSize;
        const content = repostUsers.slice(start, end);
        const totalElements = repostUsers.length;
        const totalPages =
          pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0;
        const isLast = pageNumber >= Math.max(0, totalPages - 1);

        resolve({
          content,
          isLast,
          pageNumber,
          pageSize,
          totalElements,
          totalPages,
        });
      }, 1000);
    });
  }
  async likeTrack(trackId: number): Promise<likeResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const tracksStore = getMockTracksStore();
        const track = tracksStore.find((item) => item.id === trackId);
        if (!track) {
          reject(new Error('Track not found'));
          return;
        }
        if (
          !canAccessMockResource({
            isPrivate: track.isPrivate,
            ownerId: track.artist.id,
            viewerId: currentUserId,
          })
        ) {
          reject(new Error('Track not found'));
          return;
        }

        const user = getUserById(currentUserId);
        const alreadyLiked = isTrackLikedByUser(trackId, currentUserId);

        if (user && !alreadyLiked) {
          user.likedTracks.push({
            id: trackId,
            title: track.title,
            genre: track.genre,
          });
        }

        if (!alreadyLiked) {
          track.likes = incrementCounter(track.likes ?? 0);
          track.likeCount = track.likes;
        }

        persistMockSystemState();

        resolve({
          isLiked: true,
          message: 'Track liked successfully',
        });
      }, 1000);
    });
  }
  async unlikeTrack(trackId: number): Promise<likeResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const tracksStore = getMockTracksStore();
        const track = tracksStore.find((item) => item.id === trackId);
        if (!track) {
          reject(new Error('Track not found'));
          return;
        }
        if (
          !canAccessMockResource({
            isPrivate: track.isPrivate,
            ownerId: track.artist.id,
            viewerId: currentUserId,
          })
        ) {
          reject(new Error('Track not found'));
          return;
        }

        const user = getUserById(currentUserId);
        const wasLiked = isTrackLikedByUser(trackId, currentUserId);

        if (user) {
          user.likedTracks = user.likedTracks.filter(
            (likedTrack) => likedTrack.id !== trackId
          );
        }

        if (wasLiked) {
          track.likes = decrementCounter(track.likes ?? 0);
          track.likeCount = track.likes;
        }

        persistMockSystemState();
        resolve({
          isLiked: false,
          message: 'Track unliked successfully',
        });
      }, 1000);
    });
  }
  async repostTrack(trackId: number): Promise<repostResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        if (!currentUserId) {
          reject(new Error('User not authenticated'));
          return;
        }
        const tracksStore = getMockTracksStore();
        const track = tracksStore.find((item) => item.id === trackId);
        if (!track) {
          reject(new Error('Track not found'));
          return;
        }
        if (
          !canAccessMockResource({
            isPrivate: track.isPrivate,
            ownerId: track.artist.id,
            viewerId: currentUserId,
          })
        ) {
          reject(new Error('Track not found'));
          return;
        }

        const usersStore = getMockUsersStore();
        const user = usersStore.find((item) => item.id === currentUserId);
        if (!user) {
          reject(new Error('User not found'));
          return;
        }
        if (user.reposts.some((repost) => repost.id === trackId)) {
          reject(new Error('Track already reposted by user'));
          return;
        }
        user.reposts.push({
          id: trackId,
          title: track.title,
          genre: track.genre,
        });
        track.reposters = incrementCounter(track.reposters ?? 0);
        track.repostCount = track.reposters;

        persistMockSystemState();
        resolve({
          isReposted: true,
          message: 'Track reposted successfully',
        });
      }, 1000);
    });
  }

  async unrepostTrack(trackId: number): Promise<repostResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const tracksStore = getMockTracksStore();
        const track = tracksStore.find((item) => item.id === trackId);
        if (!track) {
          reject(new Error('Track not found'));
          return;
        }
        if (
          !canAccessMockResource({
            isPrivate: track.isPrivate,
            ownerId: track.artist.id,
            viewerId: currentUserId,
          })
        ) {
          reject(new Error('Track not found'));
          return;
        }
        const usersStore = getMockUsersStore();
        const user = usersStore.find((item) => item.id === currentUserId);
        if (!user) {
          reject(new Error('User not found'));
          return;
        }
        const repostIndex = user.reposts.findIndex(
          (repost) => repost.id === trackId
        );
        if (repostIndex < 0) {
          reject(new Error('Track not reposted by user'));
          return;
        }
        user.reposts.splice(repostIndex, 1);
        track.reposters = decrementCounter(track.reposters ?? 0);
        track.repostCount = track.reposters;

        persistMockSystemState();
        resolve({
          isReposted: false,
          message: 'Track unreposted successfully',
        });
      }, 1000);
    });
  }

  async getMyLikedTracks(
    params?: PaginationParams
  ): Promise<paginatedTrackResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const currentUser = getUserById(currentUserId);
        const tracksStore = getMockTracksStore();

        const likedTrackIds = currentUser?.likedTracks.map((track) => track.id) ?? [];
        const likedTracks = likedTrackIds
          .map((trackId) => tracksStore.find((track) => track.id === trackId))
          .filter((track): track is MockTrackRecord => Boolean(track))
          .filter((track) =>
            canAccessMockResource({
              isPrivate: track.isPrivate,
              ownerId: track.artist.id,
              viewerId: currentUserId,
            })
          );

        const allContent = likedTracks.map((track) =>
          toTrackListItem(track, currentUserId)
        );
        const pageNumber = Math.max(0, params?.page ?? 0);
        const pageSize = Math.max(1, params?.size ?? 20);
        const start = pageNumber * pageSize;
        const content = allContent.slice(start, start + pageSize);
        const totalElements = allContent.length;
        const totalPages =
          totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);

        resolve({
          content,
          isLast: pageNumber >= totalPages - 1,
          pageNumber,
          pageSize,
          totalElements,
          totalPages,
        });
      }, 1000);
    });
  }

  async getMyRepostedTracks(
    params?: PaginationParams
  ): Promise<paginatedTrackResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const currentUser = getUserById(currentUserId);
        const tracksStore = getMockTracksStore();

        const repostedTrackIds = currentUser?.reposts.map((track) => track.id) ?? [];
        const repostedTracks = repostedTrackIds
          .map((trackId) => tracksStore.find((track) => track.id === trackId))
          .filter((track): track is MockTrackRecord => Boolean(track))
          .filter((track) =>
            canAccessMockResource({
              isPrivate: track.isPrivate,
              ownerId: track.artist.id,
              viewerId: currentUserId,
            })
          );

        const content = repostedTracks.map((track) =>
          toTrackListItem(track, currentUserId)
        );

        resolve({
          content,
          isLast: true,
          pageNumber: params?.page ?? 0,
          pageSize: params?.size ?? content.length,
          totalElements: content.length,
          totalPages: 1,
        });
      }, 1000);
    });
  }
}
