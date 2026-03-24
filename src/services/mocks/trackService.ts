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
import {
  getMockTracksStore,
  getMockUsersStore,
  persistMockSystemState,
  replaceMockTracksStore,
  resolveCurrentMockUserId,
  type MockTrackRecord,
} from './mockSystemStore';

const MOCK_DELAY_MS = 220;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const buildTrackUrl = (username: string, slug: string): string => {
  const base = config.urls.domainName.replace(/\/+$/, '');
  return `${base}/${username}/${slug}`;
};

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
  description: track.description ?? '',
  releaseDate: track.releaseDate,
});

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

        const sessionArtist = getSessionArtist();
        const title = getStringField(formData, 'title', `Untitled ${nextId}`);
        const trackLinkSuffix = getStringField(
          formData,
          'trackLinkSuffix',
          `track-${nextId}`
        );
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
            trackUrl: buildTrackUrl(artistName, trackLinkSuffix),
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
    const currentUserId = resolveCurrentMockUserId();
    const isOwner = currentUserId === userId;

    return readTracks()
      .filter((track) => track.artist.id === userId)
      .filter((track) => isOwner || !track.isPrivate)
      .map(toMetadata);
  }

  async getAllTracks(): Promise<TrackMetaData[]> {
    await delay();
    return readTracks()
    .filter((track) => !track.isPrivate)
    .map(toMetadata);
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
    const title = getOptionalStringField(formData, 'title');
    const genre = getOptionalStringField(formData, 'genre');
    const description = getOptionalStringField(formData, 'description', {
      allowEmpty: true,
    });
    const releaseDate = getOptionalStringField(formData, 'releaseDate');
    const trackLinkSuffix = getOptionalStringField(
      formData,
      'trackLinkSuffix'
    );
    const tags = getOptionalTagsField(formData);
    const artistName = getOptionalStringField(formData, 'artist');
    const isPrivate = getOptionalBooleanField(formData, 'isPrivate');
    const removeCover = getOptionalBooleanField(formData, 'removeCover');
    const coverImageEntry = formData.get('coverImage');
    const coverImageDataUrl =
      coverImageEntry instanceof File
        ? await readFileAsDataUrl(coverImageEntry)
        : undefined;

    const nextIsPrivate = isPrivate ?? current.isPrivate;
    const nextSecretLink = nextIsPrivate
      ? (current.secretLink ?? createSecretToken())
      : current.secretLink;

    const nextCoverUrl = removeCover
      ? buildCoverUrl(trackId)
      : coverImageDataUrl ?? current.coverUrl;
    const nextCoverImageDataUrl = removeCover
      ? undefined
      : coverImageDataUrl ?? current.coverImageDataUrl;

    const nextArtistName = artistName ?? current.artist.username;
    const nextTrackUrl = trackLinkSuffix
      ? buildTrackUrl(nextArtistName, trackLinkSuffix)
      : current.trackUrl;

    const updated: MockTrackRecord = {
      ...current,
      title: title ?? current.title,
      genre: genre ?? current.genre,
      tags: tags ?? current.tags,
      description: description !== undefined ? description : current.description,
      releaseDate: releaseDate ?? current.releaseDate,
      artist: artistName
        ? { ...current.artist, username: artistName }
        : current.artist,
      trackUrl: nextTrackUrl,
      isPrivate: nextIsPrivate,
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
      genre: updated.genre,
      description: updated.description ?? '',
      isPrivate: updated.isPrivate,
      tags: [...updated.tags],
      releaseDate: updated.releaseDate,
    };
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
