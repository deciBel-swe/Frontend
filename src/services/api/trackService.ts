import { config } from '@/config';
import { apiRequest } from '@/hooks/useAPI';
import type { UploadTrackResponse } from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  SecretLink,
  TrackDetailsResponse,
  TrackMetaData,
  TrackUpdateResponse,
  TrackVisibility,
  UpdateTrackVisibilityDto,
} from '@/types/tracks';

/**
 * Track service contract.
 *
 * Real and mock implementations must satisfy this interface.
 * It combines upload, viewing metadata, and privacy/secret-link operations.
 */
export interface TrackService {
  /** Upload a track with progress updates (POST /tracks/upload) */
  uploadTrack(
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse>;

  /** Read a track payload normalized for view/share UI (GET /tracks/:trackId) */
  getTrackMetadata(trackId: number): Promise<TrackMetaData>;

  /** Read current user tracks for lightweight listing/test UI (GET /users/me/tracks) */
  getUserTracks(userID: number): Promise<TrackMetaData[]>;

  /** Read all visible tracks for feed listing (GET /users/me/tracks) */
  getAllTracks(): Promise<TrackMetaData[]>;
  /** Update track metadata (PATCH /tracks/:trackId) */
  updateTrack(trackId: number, formData: FormData): Promise<TrackUpdateResponse>;

  /** Read only privacy state for a track (GET /tracks/:trackId) */
  getTrackVisibility(trackId: number): Promise<TrackVisibility>;

  /** Update privacy state (PATCH /tracks/:trackId) */
  updateTrackVisibility(
    trackId: number,
    data: UpdateTrackVisibilityDto
  ): Promise<TrackVisibility>;

  /** Get active token for private sharing (GET /tracks/:trackId/secret-token) */
  getSecretLink(trackId: string): Promise<SecretLink>;

  /** Rotate private sharing token (POST /tracks/:trackId/generate-token) */
  regenerateSecretLink(trackId: string): Promise<SecretLink>;
}

const DEFAULT_COVER_PATH = '/images/default-cover.jpg';
const DEFAULT_WAVEFORM_PATH = '/images/default-waveform.json';

const toAbsoluteUrl = (
  value: string | null | undefined,
  fallbackPath: string
): string => {
  const base = config.api.appUrl;
  if (!value || value.trim().length === 0) {
    return `${base}${fallbackPath}`;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `${base}${value.startsWith('/') ? value : `/${value}`}`;
};

const normalizeTrackMetadata = (
  trackId: number,
  payload: TrackDetailsResponse
): TrackMetaData => {
  const artistId = payload.artist?.id ?? payload.userId ?? 0;
  const artistUsername =
    payload.artist?.username ?? payload.username ?? 'unknown';

  return {
    id: payload.id,
    title: payload.title,
    artist: {
      id: artistId,
      username: artistUsername,
    },
    trackUrl: toAbsoluteUrl(payload.trackUrl, `/tracks/${trackId}`),
    coverUrl: toAbsoluteUrl(
      payload.coverUrl ?? payload.coverImage,
      DEFAULT_COVER_PATH
    ),
    waveformUrl: toAbsoluteUrl(payload.waveformUrl, DEFAULT_WAVEFORM_PATH),
    waveformData: [],
    genre: payload.genre,
    tags: payload.tags,
    description: payload.description ?? '',
    releaseDate: payload.releaseDate ?? '',
  };
};

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

const fetchWaveformData = async (waveformUrl: string): Promise<number[]> => {
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

const hydrateWaveformData = async (
  metadata: TrackMetaData,
  payload: TrackDetailsResponse
): Promise<TrackMetaData> => {
  const embeddedWaveform = parseWaveformPayload(payload.waveformData);
  if (embeddedWaveform.length > 0) {
    return {
      ...metadata,
      waveformData: embeddedWaveform,
    };
  }

  const downloadedWaveform = await fetchWaveformData(metadata.waveformUrl);

  return {
    ...metadata,
    waveformData: downloadedWaveform,
  };
};

export class RealTrackService implements TrackService {
  async uploadTrack(
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse> {
    return apiRequest(API_CONTRACTS.TRACKS_UPLOAD, {
      payload: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!event.total) {
          return;
        }

        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      },
    });
  }

  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    const payload = await apiRequest(API_CONTRACTS.TRACKS_BY_ID(trackId));
    const normalized = normalizeTrackMetadata(trackId, payload);
    return hydrateWaveformData(normalized, payload);
  }

  async getUserTracks(userId: number): Promise<TrackMetaData[]> {
    const payload = await apiRequest(API_CONTRACTS.USERS_ME_TRACKS);
    const tracks = await Promise.all(
      payload.content.map(async (track) => {
        const normalized = normalizeTrackMetadata(track.id, track);
        return hydrateWaveformData(normalized, track);
      })
    );
    return tracks.filter((track) => track.artist.id === userId);
  }

  async getAllTracks(): Promise<TrackMetaData[]> {
    const payload = await apiRequest(API_CONTRACTS.USERS_ME_TRACKS);
    return Promise.all(
      payload.content.map(async (track) => {
        const normalized = normalizeTrackMetadata(track.id, track);
        return hydrateWaveformData(normalized, track);
      })
    );
  }

  async updateTrack(
    trackId: number,
    formData: FormData
  ): Promise<TrackUpdateResponse> {
    return apiRequest(API_CONTRACTS.TRACKS_UPDATE(trackId), {
      payload: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getTrackVisibility(trackId: number): Promise<TrackVisibility> {
    const payload = await apiRequest(API_CONTRACTS.TRACKS_BY_ID(trackId));
    return { isPrivate: payload.isPrivate };
  }

  async updateTrackVisibility(
    trackId: number,
    data: UpdateTrackVisibilityDto
  ): Promise<TrackVisibility> {
    const payload = await apiRequest(
      API_CONTRACTS.TRACKS_UPDATE_VISIBILITY(trackId),
      {
        payload: data,
      }
    );

    return { isPrivate: payload.isPrivate };
  }

  async getSecretLink(trackId: string): Promise<SecretLink> {
    const payload = await apiRequest(
      API_CONTRACTS.TRACKS_SECRET_TOKEN(trackId)
    );
    return { secretLink: payload.secretToken };
  }

  async regenerateSecretLink(trackId: string): Promise<SecretLink> {
    const payload = await apiRequest(
      API_CONTRACTS.TRACKS_GENERATE_TOKEN(trackId)
    );
    return { secretLink: payload.secretToken };
  }
}
