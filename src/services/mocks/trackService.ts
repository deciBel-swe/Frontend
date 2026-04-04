import { config } from '@/config';
import type { TrackService } from '@/services/api/trackService';
import type { UploadTrackResponse } from '@/types';
import type {
  paginationRepostUser,
  SecretLink,
  TrackMetaData,
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

const MOCK_DELAY_MS = 220;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const FALLBACK_AUDIO_TRACK_URL =
  'https://decibelblob.blob.core.windows.net/uploads/audio/b0a977d2-3903-49a4-8557-aae029c9f376_Taha.mp3';

const resolvePlayableTrackUrl = (
  formData: FormData,
  currentTrackUrl?: string
): string => {
  const providedTrackUrl = getOptionalStringField(formData, 'trackUrl');
  if (providedTrackUrl) {
    return providedTrackUrl;
  }

  return currentTrackUrl ?? FALLBACK_AUDIO_TRACK_URL;
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

const toMetadata = (track: MockTrackRecord): TrackMetaData => ({
  ...(function () {
    const currentUserId = resolveCurrentMockUserId();
    return {
      isLiked: track.likes.has(currentUserId),
      isReposted: track.reposters.has(currentUserId),
      likeCount: track.likes.size,
      repostCount: track.reposters.size,
      playCount: 0,
      uploadDate: track.releaseDate,
    };
  })(),
  id: track.id,
  title: track.title,
  artist: { ...track.artist },
  trackUrl: track.trackUrl,
  coverUrl: track.coverImageDataUrl ?? track.coverUrl,
  waveformUrl: track.waveformUrl,
  waveformData: parseWaveformPayload(track.waveformData),
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
            trackUrl: resolvePlayableTrackUrl(formData),
            coverUrl: coverImageDataUrl ?? buildCoverUrl(nextId),
            coverImageDataUrl,
            waveformUrl: buildWaveformUrl(nextId),
            waveformData: waveformJson.trim().length > 0 ? JSON.parse(waveformJson) : [],
            genre,
            description,
            tags,
            releaseDate,
            isPrivate,
            durationSeconds,
            secretLink: isPrivate ? createSecretToken() : undefined,
            likes: new Set(),
            reposters: new Set(),
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
            durationSeconds: uploaded.durationSeconds?? 0,
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

  async getMyTracks(): Promise<TrackMetaData[]> {
    await delay();
    const currentUserId = resolveCurrentMockUserId();

    return readTracks()
      .filter((track) => track.artist.id === currentUserId)
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
      : (coverImageDataUrl ?? current.coverUrl);
    const nextCoverImageDataUrl = removeCover
      ? undefined
      : (coverImageDataUrl ?? current.coverImageDataUrl);

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

  async deleteTrack(trackId: number): Promise<void> {
    await delay();

    const tracks = readTracks();
    const index = tracks.findIndex((track) => track.id === trackId);
    if (index < 0) {
      throw new Error('Track not found');
    }

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

  async getRepostUsers(
    trackId: number,
    params?: PaginationParams
  ): Promise<paginationRepostUser> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const usersStore = getMockUsersStore();
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
        getMockUsersStore()
          .find((item) => item.id === currentUserId)
          ?.likedTracks.push({
            id: trackId,
            title: track.title,
            genre: track.genre,
          });

        track.likes.add(currentUserId);
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
        const user = getMockUsersStore().find(
          (item) => item.id === currentUserId
        );
        if (user) {
          user.likedTracks = user.likedTracks.filter(
            (likedTrack) => likedTrack.id !== trackId
          );
        }
        track.likes.delete(currentUserId);
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
        track.reposters.add(currentUserId);
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
        track.reposters.delete(currentUserId);
        persistMockSystemState();
        resolve({
          isReposted: false,
          message: 'Track unreposted successfully',
        });
      }, 1000);
    });
  }

  async getMyLikedTracks(): Promise<paginatedTrackResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const tracksStore = getMockTracksStore();
        const likedTracks = tracksStore.filter((track) =>
          track.likes.has(currentUserId)
        );
        const content = likedTracks.map((track) => ({
          artist: { ...track.artist },
          coverUrl: track.coverImageDataUrl ?? track.coverUrl,
          description: track.description ?? '',
          genre: track.genre,
          id: track.id,
          isLiked: true,
          isReposted: track.reposters.has(currentUserId),
          likeCount: track.likes.size,
          playCount: 0, //since it is a mock, number won't matter that much
          releaseDate: new Date(track.releaseDate),
          repostCount: track.reposters.size,
          tags: [...track.tags],
          title: track.title,
          trackUrl: track.trackUrl,
          uploadDate: new Date(track.releaseDate),
          waveformUrl: track.waveformUrl,
        }));
        resolve({
          content,
          isLast: true,
          pageNumber: 0,
          pageSize: content.length,
          totalElements: content.length,
          totalPages: 1,
        });
      }, 1000);
    });
  }

  async getMyRepostedTracks(): Promise<paginatedTrackResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUserId = resolveCurrentMockUserId();
        const tracksStore = getMockTracksStore();
        const repostedTracks = tracksStore.filter((track) =>
          track.reposters.has(currentUserId)
        );
        const content = repostedTracks.map((track) => ({
          artist: { ...track.artist },
          coverUrl: track.coverImageDataUrl ?? track.coverUrl,
          description: track.description ?? '',
          genre: track.genre,
          id: track.id,
          isLiked: track.likes.has(currentUserId),
          isReposted: true,
          likeCount: track.likes.size,
          playCount: 0,
          releaseDate: new Date(track.releaseDate),
          repostCount: track.reposters.size,
          tags: [...track.tags],
          title: track.title,
          trackUrl: track.trackUrl,
          uploadDate: new Date(track.releaseDate),
          waveformUrl: track.waveformUrl,
        }));

        resolve({
          content,
          isLast: true,
          pageNumber: 0,
          pageSize: content.length,
          totalElements: content.length,
          totalPages: 1,
        });
      }, 1000);
    });
  }
}
