import { config } from '@/config';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  ApiQueryParams,
  apiRequest,
} from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import { createRealtimeNotification } from '@/services/firebase/realtimeSocial';
import type {
  PaginatedTrackMetadataResponse,
  paginatedTrackResponse,
  SecretLink,
  TrackDetailsResponse,
  TrackMetaData,
  TrackResourceRefDTO,
  TrackUpdateResponse,
  TrackUploadStatusResponse,
  UploadTrackResponse,
  TrackVisibility,
  UpdateTrackVisibilityDto,
  likeResponse,
  paginationRepostUser,
  repostResponse,
} from '@/types/tracks';
import { trackUploadStatusResponseSchema } from '@/types/tracks';
import { buildTrackHref } from '@/utils/socialRoutes';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: PaginationParams | any
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
  if (params.trackSlug !== undefined) {
    query['track-slug'] = params.trackSlug;
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
  /** Upload a track via the interactive V2 endpoint and websocket progress stream. */
  uploadTrack(
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse>;

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

  /** Get paginated list of tracks liked by a specific user (GET /users/{username}/liked-tracks) */
  getUserLikedTracks(
    username: string,
    params?: PaginationParams
  ): Promise<paginatedTrackResponse>;

  /** Get paginated list of tracks reposted by the current user (GET /users/me/reposts) */
  getMyRepostedTracks(
    params?: PaginationParams
  ): Promise<paginatedTrackResponse>;
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

const TRACK_UPLOAD_SOCKET_PATH = '/api/ws';
const TRACK_UPLOAD_STATUS_TOPIC_PREFIX = '/topic/track-status';
const TRACK_UPLOAD_CONNECT_TIMEOUT_MS = 10_000;
const TRACK_UPLOAD_ACTIVITY_TIMEOUT_MS = 120_000;
const DEFAULT_TRACK_UPLOAD_ACCESS = 'PLAYABLE';

type TrackUploadStatusStream = {
  completed: Promise<UploadTrackResponse>;
  disconnect: () => Promise<void>;
};

type StompSubscriptionLike = {
  unsubscribe: () => void;
};

type StompFrameLike = {
  body: string;
  headers: Record<string, string | undefined>;
};

type WebSocketCloseEventLike = {
  reason?: string;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const createTrackUploadId = (): string => {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (typeof randomUuid === 'string' && randomUuid.trim().length > 0) {
    return randomUuid;
  }

  return `track-upload-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const ensureTrackUploadFields = (formData: FormData): string => {
  const currentUploadId = formData.get('uploadId');
  const uploadId =
    typeof currentUploadId === 'string' && currentUploadId.trim().length > 0
      ? currentUploadId.trim()
      : createTrackUploadId();

  formData.set('uploadId', uploadId);

  const currentAccess = formData.get('access');
  if (typeof currentAccess !== 'string' || currentAccess.trim().length === 0) {
    formData.set('access', DEFAULT_TRACK_UPLOAD_ACCESS);
  }

  return uploadId;
};

const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const normalizeSockJsBaseUrl = (value: string): string =>
  value
    .replace(/^wss:/i, 'https:')
    .replace(/^ws:/i, 'http:')
    .replace(/\/+$/, '');

const buildTrackUploadSocketUrl = (baseUrl: string): string => {
  if (baseUrl.endsWith(TRACK_UPLOAD_SOCKET_PATH)) {
    return baseUrl;
  }

  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}/ws`;
  }

  return `${baseUrl}${TRACK_UPLOAD_SOCKET_PATH}`;
};

const resolveTrackUploadSocketUrl = (): string => {
  const explicitWsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicitWsUrl) {
    return buildTrackUploadSocketUrl(normalizeSockJsBaseUrl(explicitWsUrl));
  }

  try {
    const origin = new URL(config.api.baseURL).origin;
    return buildTrackUploadSocketUrl(normalizeSockJsBaseUrl(origin));
  } catch {
    return TRACK_UPLOAD_SOCKET_PATH;
  }
};

const openTrackUploadStatusStream = async (
  uploadId: string,
  onProgress: (progress: number) => void
): Promise<TrackUploadStatusStream> => {
  if (typeof window === 'undefined') {
    throw new Error('Track uploads require a browser environment.');
  }

  const [{ Client }, sockJsModule] = await Promise.all([
    import('@stomp/stompjs').catch(() => ({
      Client: class {
        connectHeaders?: Record<string, string>;
        debug?: () => void;
        reconnectDelay?: number;
        webSocketFactory?: () => unknown;
        onConnect?: () => void;
        onStompError?: (_frame: StompFrameLike) => void;
        onWebSocketError?: () => void;
        onWebSocketClose?: (_event: WebSocketCloseEventLike) => void;

        constructor(config: Record<string, unknown>) {
          Object.assign(this, config);
        }

        subscribe(
          _destination: string,
          _callback: (_frame: StompFrameLike) => void
        ): StompSubscriptionLike {
          return {
            unsubscribe: () => undefined,
          };
        }

        activate(): void {
          throw new Error('STOMP client is unavailable.');
        }

        deactivate(): Promise<void> {
          return Promise.resolve();
        }
      },
    })),
    import('sockjs-client'),
  ]);

  const SockJS = (
    'default' in sockJsModule ? sockJsModule.default : sockJsModule
  ) as new (url: string) => unknown;

  const token = getStoredAccessToken();
  const socketUrl = resolveTrackUploadSocketUrl();

  return new Promise<TrackUploadStatusStream>((resolve, reject) => {
    let subscription: StompSubscriptionLike | null = null;
    let connectionSettled = false;
    let uploadSettled = false;
    let disconnecting = false;
    let activityTimeout: ReturnType<typeof setTimeout> | undefined;

    let resolveCompleted!: (value: UploadTrackResponse) => void;
    let rejectCompleted!: (reason?: unknown) => void;

    const clearActivityTimeout = () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
        activityTimeout = undefined;
      }
    };

    const client = new Client({
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => undefined,
      reconnectDelay: 0,
      webSocketFactory: () => new SockJS(socketUrl),
    });

    const disconnect = async (): Promise<void> => {
      if (disconnecting) {
        return;
      }

      disconnecting = true;
      clearActivityTimeout();
      subscription?.unsubscribe();
      await client.deactivate();
    };

    const completed = new Promise<UploadTrackResponse>(
      (resolveStream, rejectStream) => {
        resolveCompleted = resolveStream;
        rejectCompleted = rejectStream;
      }
    );

    const settleConnectionResolve = () => {
      if (connectionSettled) {
        return;
      }

      connectionSettled = true;
      clearTimeout(connectTimeout);
      resolve({ completed, disconnect });
    };

    const settleConnectionReject = (message: string) => {
      if (connectionSettled) {
        return;
      }

      connectionSettled = true;
      clearTimeout(connectTimeout);
      reject(new Error(message));
    };

    const rejectUpload = (message: string) => {
      if (!connectionSettled) {
        settleConnectionReject(message);
        void disconnect();
        return;
      }

      if (uploadSettled) {
        return;
      }

      uploadSettled = true;
      clearActivityTimeout();
      rejectCompleted(new Error(message));
      void disconnect();
    };

    const resetActivityTimeout = () => {
      clearActivityTimeout();
      activityTimeout = setTimeout(() => {
        rejectUpload('Track upload timed out while waiting for processing.');
      }, TRACK_UPLOAD_ACTIVITY_TIMEOUT_MS);
    };

    const handleStatusMessage = (status: TrackUploadStatusResponse) => {
      onProgress(status.progressPercentage);
      resetActivityTimeout();

      if (status.errorMessage) {
        rejectUpload(status.errorMessage);
        return;
      }

      if (status.trackState === 'FAILED') {
        rejectUpload('Track upload failed during processing.');
        return;
      }

      if (!status.trackResponse || uploadSettled) {
        return;
      }

      uploadSettled = true;
      clearActivityTimeout();
      resolveCompleted(status.trackResponse);
      void disconnect();
    };

    client.onConnect = () => {
      subscription = client.subscribe(
        `${TRACK_UPLOAD_STATUS_TOPIC_PREFIX}/${uploadId}`,
        (frame: StompFrameLike) => {
          try {
            const payload = JSON.parse(frame.body) as unknown;
            const status = trackUploadStatusResponseSchema.parse(payload);
            handleStatusMessage(status);
          } catch (error) {
            rejectUpload(
              getErrorMessage(
                error,
                'Received an invalid track upload status payload.'
              )
            );
          }
        }
      );

      onProgress(0);
      resetActivityTimeout();
      settleConnectionResolve();
    };

    client.onStompError = (frame: StompFrameLike) => {
      const message =
        frame.headers.message?.trim() ||
        'Track upload status connection failed.';
      rejectUpload(message);
    };

    client.onWebSocketError = () => {
      rejectUpload('Track upload status connection failed.');
    };

    client.onWebSocketClose = (event: WebSocketCloseEventLike) => {
      if (disconnecting || uploadSettled) {
        return;
      }

      const reason = event.reason?.trim();
      rejectUpload(
        reason && reason.length > 0
          ? reason
          : 'Track upload status connection closed unexpectedly.'
      );
    };

    const connectTimeout = setTimeout(() => {
      rejectUpload('Timed out connecting to track upload status.');
    }, TRACK_UPLOAD_CONNECT_TIMEOUT_MS);

    client.activate();
  });
};

export class RealTrackService implements TrackService {
  async uploadTrack(
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<UploadTrackResponse> {
    const uploadId = ensureTrackUploadFields(formData);
    const statusStream = await openTrackUploadStatusStream(
      uploadId,
      onProgress
    );

    try {
      const uploadStart = await apiRequest(API_CONTRACTS.TRACKS_UPLOAD, {
        payload: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedTrack = await statusStream.completed;
      if (uploadStart.requestId !== uploadedTrack.id) {
        throw new Error('Track upload completed with an unexpected track id.');
      }

      return uploadedTrack;
    } catch (error) {
      await statusStream.disconnect();
      throw error;
    }
  }

  async resolveTrackSlug(trackSlug: string): Promise<TrackResourceRefDTO> {
    return apiRequest(API_CONTRACTS.TRACKS_RESOLVE(trackSlug), {
      params: { 'track-slug': trackSlug },
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
    const response = await apiRequest(API_CONTRACTS.TRACK_LIKE(trackId));

    if (response.isLiked) {
      void this.getTrackMetadata(trackId)
        .then(async (track) => {
          await createRealtimeNotification({
            type: 'LIKE',
            recipientId: track.artist.id,
            resource: {
              resourceType: 'TRACK',
              resourceId: track.id,
            },
            targetTitle: track.title,
            targetUrl: buildTrackHref(track),
          });
        })
        .catch(() => undefined);
    }

    return response;
  }

  async unlikeTrack(trackId: number): Promise<likeResponse> {
    return apiRequest(API_CONTRACTS.TRACK_UNLIKE(trackId));
  }

  async repostTrack(trackId: number): Promise<repostResponse> {
    const response = await apiRequest(API_CONTRACTS.TRACK_REPOST(trackId));

    if (response.isReposted) {
      void this.getTrackMetadata(trackId)
        .then(async (track) => {
          await createRealtimeNotification({
            type: 'REPOST',
            recipientId: track.artist.id,
            resource: {
              resourceType: 'TRACK',
              resourceId: track.id,
            },
            targetTitle: track.title,
            targetUrl: buildTrackHref(track),
          });
        })
        .catch(() => undefined);
    }

    return response;
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

  async getUserLikedTracks(
    username: string,
    params?: PaginationParams
  ): Promise<paginatedTrackResponse> {
    return apiRequest(API_CONTRACTS.USER_LIKED_TRACKS(username), {
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
