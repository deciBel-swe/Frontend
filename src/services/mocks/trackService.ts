import { config } from '@/config';
import type { TrackService } from '@/services/api/trackService';
import type { UploadTrackResponse } from '@/types';
import type {
  SecretLink,
  TrackMetaData,
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
  waveformUrl: string;
  genre: string;
  tags: string[];
  isPrivate: boolean;
  durationSeconds: number;
  secretLink?: string;
};

const MOCK_DELAY_MS = 220;
const TRACKS_STORAGE_KEY = 'decibel_mock_tracks_v2';

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const buildTrackUrl = (trackId: number): string =>
  `${config.api.appUrl}/tracks/${trackId}`;

const buildCoverUrl = (trackId: number): string =>
  `https://picsum.photos/seed/decibel-cover-${trackId}/640/640`;

const buildWaveformUrl = (trackId: number): string =>
  `${config.api.appUrl}/mock/waveforms/${trackId}.json`;

const createSecretToken = (): string =>
  Math.random().toString(36).slice(2, 10);

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
  coverUrl: track.coverUrl,
  waveformUrl: track.waveformUrl,
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
    waveformUrl: raw.waveformUrl ?? buildWaveformUrl(raw.id),
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
  if (!hasStorage()) {
    return inMemoryTracks.map(cloneTrack);
  }

  try {
    const raw = window.localStorage.getItem(TRACKS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        TRACKS_STORAGE_KEY,
        JSON.stringify(inMemoryTracks)
      );
      return inMemoryTracks.map(cloneTrack);
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid mock track storage shape');
    }

    const normalized = parsed
      .map(normalizeTrackRecord)
      .filter((track): track is MockTrackRecord => track !== null);

    if (normalized.length === 0) {
      throw new Error('Mock track storage was empty');
    }

    inMemoryTracks = normalized;
    return inMemoryTracks.map(cloneTrack);
  } catch {
    inMemoryTracks = createSeedTracks();
    window.localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(inMemoryTracks));
    return inMemoryTracks.map(cloneTrack);
  }
};

const writeTracks = (tracks: MockTrackRecord[]): void => {
  inMemoryTracks = tracks.map(cloneTrack);

  if (hasStorage()) {
    window.localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(inMemoryTracks));
  }
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

const getBooleanField = (formData: FormData, key: string): boolean => {
  const value = formData.get(key);
  return typeof value === 'string' && value.toLowerCase() === 'true';
};

const getTagsField = (formData: FormData): string[] => {
  const unique = new Set<string>();
  formData
    .getAll('tags')
    .flatMap((entry) => (typeof entry === 'string' ? entry.split(',') : []))
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .forEach((tag) => unique.add(tag));

  return [...unique];
};

export class MockTrackService implements TrackService {
  async uploadTrack(
    formData: FormData,
    token: string,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse> {
    if (!token.trim()) {
      throw new Error('Missing upload token');
    }

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

        const waveformSampleCount = formData.getAll('waveformData').length;
        const durationSeconds =
          waveformSampleCount > 0
            ? Math.max(30, Math.min(1200, waveformSampleCount * 2))
            : 180;

        const title = getStringField(formData, 'title', `Untitled ${nextId}`);
        const genre = getStringField(formData, 'genre', 'Electronic');
        const tags = getTagsField(formData);
        const isPrivate = getBooleanField(formData, 'isPrivate');
        const artistName = getStringField(formData, 'artist', 'mockartist');

        const uploaded: MockTrackRecord = {
          id: nextId,
          title,
          artist: {
            id: 7,
            username: artistName,
          },
          trackUrl: buildTrackUrl(nextId),
          coverUrl: buildCoverUrl(nextId),
          waveformUrl: buildWaveformUrl(nextId),
          genre,
          tags,
          isPrivate,
          durationSeconds,
          secretLink: isPrivate ? createSecretToken() : undefined,
        };

        const updated = [uploaded, ...tracks];
        writeTracks(updated);

        resolve({
          id: uploaded.id,
          title: uploaded.title,
          trackUrl: uploaded.trackUrl,
          coverUrl: uploaded.coverUrl,
          durationSeconds: uploaded.durationSeconds,
        });
      }, 120);
    });
  }

  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    await delay();
    const track = this.getTrackById(trackId);
    return toMetadata(track);
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
        ? current.secretLink ?? createSecretToken()
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