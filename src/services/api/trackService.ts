import { config } from '@/config';
import { ApiQueryParams, apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  PaginatedTrackMetadataResponse,
  paginatedTrackResponse,
  SecretLink,
  TrackDetailsResponse,
  TrackMetaData,
  TrackResourceRefDTO,
  TrackUpdateResponse,
  UploadTrackAcceptedResponse,
  TrackVisibility,
  UpdateTrackVisibilityDto,
  likeResponse,
  paginationRepostUser,
  repostResponse,
} from '@/types/tracks';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  params?: PaginationParams
): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const query: ApiQueryParams = {};
  if (params.page !== undefined) {
    query.page = params.page;
  }
  if (params.size !== undefined) {
    query.size = params.size;
  }

  return Object.keys(query).length > 0 ? query : undefined;
};
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
  ): Promise<UploadTrackAcceptedResponse>;

  /** Resolve track slug to internal id (GET /tracks/resolve?trackSlug=...). */
  resolveTrackSlug(trackSlug: string): Promise<TrackResourceRefDTO>;

  /** Read a track payload normalized for view/share UI (GET /tracks/:trackId) */
  getTrackMetadata(trackId: number): Promise<TrackMetaData>;

  /** Read a private/public track payload using a secret token (GET /tracks/token/:token) */
  getTrackByToken(token: string): Promise<TrackMetaData>;

  /** Read current user tracks for lightweight listing/test UI (GET /users/me/tracks) */
  getUserTracks(userID: number): Promise<TrackMetaData[]>;

  /** Read current user tracks via /users/me/tracks */
  getMyTracks(params?: PaginationParams): Promise<TrackMetaData[]>;
  getMyTracksPage(
    params?: PaginationParams
  ): Promise<PaginatedTrackMetadataResponse>;

  /** Read all visible tracks for feed listing (GET /users/me/tracks) */
  getAllTracks(): Promise<TrackMetaData[]>;
  /** Update track metadata (PATCH /tracks/:trackId) */
  updateTrack(
    trackId: number,
    formData: FormData
  ): Promise<TrackUpdateResponse>;

  /** Delete a track (DELETE /tracks/:trackId) */
  deleteTrack(trackId: number): Promise<void>;

  /** Delete a track cover (DELETE /tracks/:trackId/cover) */
  deleteTrackCover(trackId: number): Promise<void>;

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

  getRepostUsers(
    trackId: number,
    params?: PaginationParams
  ): Promise<paginationRepostUser>;

  /** Like a track (POST /tracks/:trackId/like) */
  likeTrack(trackId: number): Promise<likeResponse>;

  /** Unlike a track (POST /tracks/:trackId/unlike) */
  unlikeTrack(trackId: number): Promise<likeResponse>;

  /** Repost a track (POST /tracks/:trackId/repost) */
  repostTrack(trackId: number): Promise<repostResponse>;

  /** Remove repost of a track (DELETE /tracks/:trackId/repost) */
  unrepostTrack(trackId: number): Promise<repostResponse>;

  /** Get paginated list of tracks liked by current user (GET /users/me/liked-tracks) */
  getMyLikedTracks(params?: PaginationParams): Promise<paginatedTrackResponse>;

  /** Get paginated list of tracks reposted by the current user (GET /users/me/reposts) */
  getMyRepostedTracks(params?: PaginationParams): Promise<paginatedTrackResponse>;
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
  return `${value.startsWith('/') ? value : `/${value}`}`;
};

const normalizeTrackMetadata = (
  trackId: number,
  payload: TrackDetailsResponse
): TrackMetaData => {
  const artistId = payload.artist?.id ?? payload.userId ?? 0;
  const artistUsername =
    payload.artist?.username ?? payload.username ?? 'unknown';
  const resolvedDuration =
    payload.durationSeconds ?? payload.trackDurationSeconds;

  return {
    id: payload.id,
    title: payload.title,
    trackSlug: payload.trackSlug ?? payload.slug,
    artist: {
      id: artistId,
      username: artistUsername,
      displayName: payload.artist?.displayName,
      avatarUrl: payload.artist?.avatarUrl,
    },
    trackUrl: toAbsoluteUrl(payload.trackUrl, `/tracks/${trackId}`),
    trackPreviewUrl: toAbsoluteUrl(
      payload.trackPreviewUrl ?? payload.trackUrl,
      `/tracks/${trackId}`
    ),
    access: payload.access ?? 'PLAYABLE',
    isPrivate: payload.isPrivate,
    ...(resolvedDuration !== undefined && resolvedDuration !== null
      ? { durationSeconds: resolvedDuration }
      : {}),
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
    isLiked: payload.isLiked,
    isReposted: payload.isReposted,
    likeCount: payload.likeCount,
    repostCount: payload.repostCount,
    commentCount: payload.commentCount,
    playCount: payload.playCount,
    secretToken: payload.secretToken,
    uploadDate: payload.uploadDate ?? '',
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
  ): Promise<UploadTrackAcceptedResponse> {
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

  async resolveTrackSlug(trackSlug: string): Promise<TrackResourceRefDTO> {
    return apiRequest(API_CONTRACTS.TRACKS_RESOLVE, {
      params: { trackSlug },
    });
  }

  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    const payload = await apiRequest(API_CONTRACTS.TRACKS_BY_ID(trackId));
    const normalized = normalizeTrackMetadata(trackId, payload);
    return hydrateWaveformData(normalized, payload);
  }

  async getTrackByToken(token: string): Promise<TrackMetaData> {
    const payload = await apiRequest(API_CONTRACTS.TRACKS_BY_TOKEN(token));
    const normalized = normalizeTrackMetadata(payload.id, payload);
    return hydrateWaveformData(normalized, payload);
  }

  async getUserTracks(userId: number): Promise<TrackMetaData[]> {
    const payload = await apiRequest(API_CONTRACTS.USERS_TRACKS(userId));
    const tracks = await Promise.all(
      payload.content.map(async (track) => {
        const normalized = normalizeTrackMetadata(track.id, track);
        return hydrateWaveformData(normalized, track);
      })
    );
    return tracks.filter((track) => track.artist.id === userId);
  }

  async getMyTracks(params?: PaginationParams): Promise<TrackMetaData[]> {
    const payload = await this.getMyTracksPage(params);
    return payload.content;
  }

  async getMyTracksPage(
    params?: PaginationParams
  ): Promise<PaginatedTrackMetadataResponse> {
    const payload = await apiRequest(API_CONTRACTS.USERS_ME_TRACKS, {
      params: toQueryParams(params),
    });

    return {
      ...payload,
      content: await Promise.all(
        payload.content.map(async (track) => {
          const normalized = normalizeTrackMetadata(track.id, track);
          return hydrateWaveformData(normalized, track);
        })
      ),
    };
  }

  async getAllTracks(): Promise<TrackMetaData[]> {
    const payload = await apiRequest(API_CONTRACTS.USERS_TRACKS(1)); // todo this is temporary
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

  async deleteTrack(trackId: number): Promise<void> {
    await apiRequest(API_CONTRACTS.TRACKS_DELETE(trackId));
  }

  async deleteTrackCover(trackId: number): Promise<void> {
    await apiRequest(API_CONTRACTS.TRACKS_DELETE_COVER(trackId));
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

  async getRepostUsers(
    trackId: number,
    params?: PaginationParams
  ): Promise<paginationRepostUser> {
    return apiRequest(API_CONTRACTS.TRACK_REPOST_USERS(trackId), {
      params: toQueryParams(params),
    });
  }

  async likeTrack(trackId: number): Promise<likeResponse> {
    return apiRequest(API_CONTRACTS.TRACK_LIKE(trackId));
  }

  async unlikeTrack(trackId: number): Promise<likeResponse> {
    return apiRequest(API_CONTRACTS.TRACK_UNLIKE(trackId));
  }

  async repostTrack(trackId: number): Promise<repostResponse> {
    return apiRequest(API_CONTRACTS.TRACK_REPOST(trackId));
  }

  async unrepostTrack(trackId: number): Promise<repostResponse> {
    return apiRequest(API_CONTRACTS.TRACK_UNREPOST(trackId));
  }

  async getMyLikedTracks(
    params?: PaginationParams
  ): Promise<paginatedTrackResponse> {
    return apiRequest(API_CONTRACTS.ME_LIKED_TRACKS(), {
      params: toQueryParams(params),
    });
  }

  async getMyRepostedTracks(
    params?: PaginationParams
  ): Promise<paginatedTrackResponse> {
    return apiRequest(API_CONTRACTS.ME_REPOSTED_TRACKS(), {
      params: toQueryParams(params),
    });
  }
}
