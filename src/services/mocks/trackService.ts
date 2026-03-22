import { config } from '@/config';
import type { TrackService } from '@/services/api/trackService';
import type { UploadTrackResponse } from '@/types';
import type {
  SecretLink,
  TrackMetaData,
  TrackUpdateResponse,
  TrackVisibility,
  UpdateTrackVisibilityDto,
} from '@/types/tracks';

type MockTrackRecord = {
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
  isPrivate: boolean;
  durationSeconds: number;
  secretLink?: string;
};

const MOCK_DELAY_MS = 220;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const buildTrackUrl = (trackId: number): string =>
  `${config.api.appUrl}/tracks/${trackId}`;

const buildCoverUrl = (trackId: number): string =>
  `https://picsum.photos/seed/decibel-cover-${trackId}/640/640`;

const buildWaveformUrl = (trackId: number): string =>
  `${config.api.appUrl}/mock/waveforms/${trackId}.json`;

const createSecretToken = (): string => Math.random().toString(36).slice(2, 10);

const cloneTrack = (track: MockTrackRecord): MockTrackRecord => ({
  ...track,
  artist: { ...track.artist },
  tags: [...track.tags],
});

const toMetadata = (track: MockTrackRecord): TrackMetaData => ({
  id: track.id,
  title: track.title,
  artist: { ...track.artist },
  trackUrl: track.trackUrl,
  coverUrl: track.coverImageDataUrl ?? track.coverUrl,
  waveformUrl: track.waveformUrl,
  waveformData: track.waveformData,
  genre: track.genre,
  tags: [...track.tags],
});

const createSeedTracks = (): MockTrackRecord[] => [
  {
    id: 101,
    title: 'Neon Skylines',
    artist: { id: 7, username: 'mockartist' },
    trackUrl: buildTrackUrl(101),
    coverUrl: buildCoverUrl(101),
    waveformUrl: buildWaveformUrl(101),
    waveformData:
      '[0.05,0.12,0.08,0.2,0.3,0.55,0.9,0.6,0.35,0.2,0.1,0.05,0.08,0.12,0.18,0.3,0.45,0.7,0.85,0.5,0.25,0.15,0.08,0.06,0.1,0.16,0.28,0.42,0.6,0.78,0.92,0.7,0.48,0.33,0.22,0.14,0.09,0.05,0.08,0.14,0.22,0.36,0.52,0.68,0.8,0.62,0.4,0.26,0.18,0.12,0.08,0.06,0.09,0.15,0.24,0.38,0.55,0.73,0.88,0.66,0.44,0.3,0.2,0.13,0.08]',
    genre: 'Electronic',
    tags: ['synthwave', 'night-drive'],
    isPrivate: false,
    durationSeconds: 214,
  },
  {
    id: 102,
    title: 'Cloud Room Sessions',
    artist: { id: 7, username: 'mockartist' },
    trackUrl: buildTrackUrl(102),
    coverUrl: buildCoverUrl(102),
    waveformUrl: buildWaveformUrl(102),
    waveformData: '[]',
    genre: 'Lo-Fi',
    tags: ['chill', 'study'],
    isPrivate: true,
    durationSeconds: 182,
    secretLink: 'c8n2x3ya',
  },
  {
    id: 103,
    title: 'Circuit Bloom',
    artist: { id: 12, username: 'guestproducer' },
    trackUrl: buildTrackUrl(103),
    coverUrl: buildCoverUrl(103),
    waveformUrl: buildWaveformUrl(103),
    waveformData: '[]',
    genre: 'House',
    tags: ['club', 'warmup'],
    isPrivate: false,
    durationSeconds: 256,
  },
  {
    id: 104,
    title: 'Quiet Transit',
    artist: { id: 9, username: 'nightlistener' },
    trackUrl: buildTrackUrl(104),
    coverUrl: buildCoverUrl(104),
    waveformUrl: buildWaveformUrl(104),
    waveformData: '[]',
    genre: 'Ambient',
    tags: ['meditation', 'sleep'],
    isPrivate: true,
    durationSeconds: 301,
    secretLink: 'f4m0qt9b',
  },
  {
    id: 105,
    title: 'Velvet Breakbeat',
    artist: { id: 7, username: 'mockartist' },
    trackUrl: buildTrackUrl(105),
    coverUrl: buildCoverUrl(105),
    waveformUrl: buildWaveformUrl(105),
    waveformData: '[]',
    genre: 'Breakbeat',
    tags: ['drums', 'vinyl'],
    isPrivate: false,
    durationSeconds: 199,
  },
  {
    id: 106,
    title: 'Aurora Steps',
    artist: { id: 15, username: 'soundpilot' },
    trackUrl: buildTrackUrl(106),
    coverUrl: buildCoverUrl(106),
    waveformUrl: buildWaveformUrl(106),
    waveformData: '[]',
    genre: 'Downtempo',
    tags: ['sunrise', 'focus'],
    isPrivate: false,
    durationSeconds: 238,
  },
];

let inMemoryTracks: MockTrackRecord[] = createSeedTracks();

const hasStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeTrackRecord = (value: unknown): MockTrackRecord | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Partial<MockTrackRecord>;
  if (typeof raw.id !== 'number' || typeof raw.title !== 'string') {
    return null;
  }

  return {
    id: raw.id,
    title: raw.title,
    artist: {
      id: raw.artist?.id ?? 0,
      username: raw.artist?.username ?? 'mockartist',
    },
    trackUrl: raw.trackUrl ?? buildTrackUrl(raw.id),
    coverUrl: raw.coverUrl ?? buildCoverUrl(raw.id),
    coverImageDataUrl:
      typeof raw.coverImageDataUrl === 'string'
        ? raw.coverImageDataUrl
        : undefined,
    waveformUrl: raw.waveformUrl ?? buildWaveformUrl(raw.id),
    waveformData:
      typeof raw.waveformData === 'string' ? raw.waveformData : '[]',
    genre: raw.genre ?? 'Unknown',
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    isPrivate: Boolean(raw.isPrivate),
    durationSeconds: raw.durationSeconds ?? 180,
    secretLink: typeof raw.secretLink === 'string' ? raw.secretLink : undefined,
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

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const getSessionArtist = (): { id: number; username: string } | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem('decibel_mock_user');
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
  };
};

export class MockTrackService implements TrackService {
  async uploadTrack(
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse> {
    await delay();

    return new Promise((resolve) => {
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

        const waveformEntries = formData.getAll('waveformData');
        const waveformJson =
          waveformEntries.length === 1 && typeof waveformEntries[0] === 'string'
            ? (waveformEntries[0] as string)
            : JSON.stringify(
                waveformEntries
                  .filter((entry): entry is string => typeof entry === 'string')
                  .map((entry) => Number(entry))
                  .filter((value) => Number.isFinite(value))
              );
        const waveformSampleCount = (() => {
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
        })();
        const durationSeconds =
          waveformSampleCount > 0
            ? Math.max(30, Math.min(1200, waveformSampleCount * 2))
            : 180;

        const title = getStringField(formData, 'title', `Untitled ${nextId}`);
        const genre = getStringField(formData, 'genre', 'Electronic');
        const description = getStringField(formData, 'description', '');
        const tags = getTagsField(formData);
        const isPrivate = getBooleanField(formData, 'isPrivate');
        const artistName = getStringField(
          formData,
          'artist',
          sessionArtist?.username ?? 'mockartist'
        );
        const artistId = sessionArtist?.id ?? 7;

        const finalizeUpload = async () => {
          const coverImageEntry = formData.get('coverImage');
          const coverImageDataUrl =
            coverImageEntry instanceof File
              ? await readFileAsDataUrl(coverImageEntry)
              : undefined;

          const uploaded: MockTrackRecord = {
            id: nextId,
            title,
            artist: {
              id: artistId,
              username: artistName,
            },
            trackUrl: buildTrackUrl(nextId),
            coverUrl: coverImageDataUrl ?? buildCoverUrl(nextId),
            coverImageDataUrl,
            waveformUrl: buildWaveformUrl(nextId),
            waveformData: waveformJson,
            genre,
            description,
            tags,
            releaseDate,
            isPrivate,
            durationSeconds,
            secretLink: isPrivate ? createSecretToken() : undefined,
          };

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
            trackUrl: uploaded.trackUrl,
            coverUrl: uploaded.coverUrl,
            durationSeconds: uploaded.durationSeconds,
          });
        };

        void finalizeUpload();
      }, 120);
    });
  }

  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    await delay();
    const track = this.getTrackById(trackId);
    return toMetadata(track);
  }

  async getUserTracks(userId: number): Promise<TrackMetaData[]> {
    await delay();

    const tracks = readTracks();
    const filteredTracks = tracks.filter((track) => track.artist.id === userId);

    return filteredTracks.map(toMetadata);
  }

  async getTrackVisibility(trackId: number): Promise<TrackVisibility> {
    await delay();
    const track = this.getTrackById(trackId);
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
    const updated: MockTrackRecord = {
      ...current,
      isPrivate: data.isPrivate,
      secretLink: data.isPrivate
        ? (current.secretLink ?? createSecretToken())
        : current.secretLink,
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
    const secretLink = current.secretLink ?? createSecretToken();

    tracks[index] = {
      ...current,
      secretLink,
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
    tracks[index] = {
      ...tracks[index],
      secretLink,
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
}
