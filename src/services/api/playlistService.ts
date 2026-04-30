import { apiRequest } from '@/hooks/useAPI';
import { createRealtimeNotification } from '@/services/firebase/realtimeSocial';
import { API_CONTRACTS } from '@/types/apiContracts';
import { buildPlaylistHref } from '@/utils/socialRoutes';
import type {
  CreatePlaylistRequest,
  AddPlaylistTrackRequest,
  PaginatedPlaylistsResponse,
  PaginatedPlaylistTracksResponse,
  PlaylistEmbedResponse,
  PlaylistResponse,
  PlaylistLikeResponse,
  PlaylistRepostResponse,
  PlaylistResourceRef,
  PlaylistSecretLinkRegenerateResponse,
  PlaylistSecretLinkResponse,
  PlaylistUpdateResponse,
  ReorderPlaylistTracksRequest,
  UpdatePlaylistRequest,
} from '@/types/playlists';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  params?: PaginationParams
): { page?: number; size?: number } | undefined => {
  if (!params) {
    return undefined;
  }

  const query: { page?: number; size?: number } = {};
  if (params.page !== undefined) {
    query.page = params.page;
  }
  if (params.size !== undefined) {
    query.size = params.size;
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

const getPlaylistNotificationMeta = async (playlistId: number) => {
  const playlist = await apiRequest(API_CONTRACTS.PLAYLISTS_BY_ID(playlistId));
  const creatorId = playlist.owner?.id ?? 0;

  return {
    recipientId: creatorId,
    targetTitle: playlist.title,
    targetUrl: buildPlaylistHref(playlist),
  };
};

/**
 * Playlist service contract.
 *
 * Real and mock implementations must satisfy this interface.
 */
export interface PlaylistService {
  /** Create a playlist (POST /playlists). */
  createPlaylist(payload: CreatePlaylistRequest): Promise<PlaylistResponse>;

  /** Get a playlist with tracks (GET /playlists/:playlistId). */
  getPlaylist(playlistId: number): Promise<PlaylistResponse>;

  /** Get a user's public playlists (GET /users/{username}/playlists). */
  getUserPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse>;

  /** Get current user's playlists (GET /users/me/playlists). */
  getMePlaylists(params?: PaginationParams): Promise<PaginatedPlaylistsResponse>;

  /** Get playlists liked by username (GET /users/{username}/liked-playlists). */
  getUserLikedPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse>;

  /** Update a playlist (PATCH /playlists/:playlistId). */
  updatePlaylist(
    playlistId: number,
    payload: UpdatePlaylistRequest
  ): Promise<PlaylistUpdateResponse>;

  /** Delete a playlist (DELETE /playlists/:playlistId). */
  deletePlaylist(playlistId: number): Promise<void>;

  /** Add a track to a playlist (POST /playlists/:playlistId/tracks). */
  addTrackToPlaylist(
    playlistId: number,
    payload: AddPlaylistTrackRequest
  ): Promise<{ message: string }>;

  /** Remove a track from a playlist (DELETE /playlists/:playlistId/tracks/:trackId). */
  removeTrackFromPlaylist(
    playlistId: number,
    trackId: number
  ): Promise<void>;

  /** Reorder tracks in a playlist (PATCH /playlists/:playlistId/tracks/reorder). */
  reorderPlaylistTracks(
    playlistId: number,
    payload: ReorderPlaylistTracksRequest
  ): Promise<PlaylistUpdateResponse>;

  /** Get paginated tracks for a playlist (GET /playlists/:playlistId/tracks?page=&size=). */
  getPlaylistTracks(
    playlistId: number,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistTracksResponse>;

  /** Get embed HTML snippet for a playlist (GET /playlists/:playlistId/embed). */
  getPlaylistEmbed(playlistId: number): Promise<PlaylistEmbedResponse>;

  /** Get playlist secret link (GET /playlists/:playlistId/secret-link). */
  getPlaylistSecretLink(
    playlistId: number
  ): Promise<PlaylistSecretLinkResponse>;

  /** Regenerate playlist secret link (POST /playlists/:playlistId/secret-link/regenerate). */
  regeneratePlaylistSecretLink(
    playlistId: number
  ): Promise<PlaylistSecretLinkRegenerateResponse>;

  /** Get playlist via secret token (GET /playlists/token/:token). */
  getPlaylistByToken(token: string): Promise<PlaylistResponse>;

  /** Resolve playlist slug to internal id (GET /playlists/resolve?playlistSlug=...). */
  resolvePlaylistSlug(playlistSlug: string): Promise<PlaylistResourceRef>;

  /** Like a playlist (POST /tracks/:playlistId/like). */
  likePlaylist(playlistId: number): Promise<PlaylistLikeResponse>;

  /** Unlike a playlist (DELETE /tracks/:playlistId/like). */
  unlikePlaylist(playlistId: number): Promise<PlaylistLikeResponse>;

  /** Repost a playlist (POST /playlists/:playlistId/repost). */
  repostPlaylist(playlistId: number): Promise<PlaylistRepostResponse>;

  /** Remove repost for a playlist (DELETE /playlists/:playlistId/repost). */
  unrepostPlaylist(playlistId: number): Promise<PlaylistRepostResponse>;
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealPlaylistService implements PlaylistService {
  async createPlaylist(
    payload: CreatePlaylistRequest
  ): Promise<PlaylistResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_CREATE, { payload });
  }

  async getPlaylist(playlistId: number): Promise<PlaylistResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_BY_ID(playlistId));
  }

  async getUserPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_USER_PLAYLISTS(username), {
      params: toQueryParams(params),
    });
  }

  async getMePlaylists(
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_ME_PLAYLISTS, {
      params: toQueryParams(params),
    });
  }

  async getUserLikedPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_USER_LIKED_PLAYLISTS(username), {
      params: toQueryParams(params),
    });
  }

  async updatePlaylist(
    playlistId: number,
    payload: UpdatePlaylistRequest
  ): Promise<PlaylistUpdateResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_UPDATE(playlistId), { payload });
  }

  async deletePlaylist(playlistId: number): Promise<void> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_DELETE(playlistId));
  }

  async addTrackToPlaylist(
    playlistId: number,
    payload: AddPlaylistTrackRequest
  ): Promise<{ message: string }> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_ADD_TRACK(playlistId), {
      payload,
    });
  }

  async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number
  ): Promise<void> {
    return apiRequest(
      API_CONTRACTS.PLAYLISTS_REMOVE_TRACK(playlistId, trackId)
    );
  }

  async reorderPlaylistTracks(
    playlistId: number,
    payload: ReorderPlaylistTracksRequest
  ): Promise<PlaylistUpdateResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_REORDER_TRACKS(playlistId), {
      payload,
    });
  }

  async getPlaylistTracks(
    playlistId: number,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistTracksResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_TRACKS(playlistId), {
      params: toQueryParams(params),
    });
  }

  async getPlaylistEmbed(
    playlistId: number
  ): Promise<PlaylistEmbedResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_EMBED(playlistId));
  }

  async getPlaylistSecretLink(
    playlistId: number
  ): Promise<PlaylistSecretLinkResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_SECRET_LINK(playlistId));
  }

  async regeneratePlaylistSecretLink(
    playlistId: number
  ): Promise<PlaylistSecretLinkRegenerateResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_SECRET_LINK_REGENERATE(playlistId));
  }

  async getPlaylistByToken(token: string): Promise<PlaylistResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_BY_TOKEN(token));
  }

  async resolvePlaylistSlug(playlistSlug: string): Promise<PlaylistResourceRef> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_RESOLVE, {
      params: { playlistSlug },
    });
  }

  async likePlaylist(playlistId: number): Promise<PlaylistLikeResponse> {
    const response = await apiRequest(API_CONTRACTS.PLAYLISTS_LIKE(playlistId));

    if (response.isLiked) {
      void getPlaylistNotificationMeta(playlistId)
        .then(async ({ recipientId, targetTitle, targetUrl }) => {
          await createRealtimeNotification({
            type: 'LIKE',
            recipientId,
            resource: {
              resourceType: 'PLAYLIST',
              resourceId: playlistId,
            },
            targetTitle,
            targetUrl,
          });
        })
        .catch(() => undefined);
    }

    return response;
  }

  async unlikePlaylist(playlistId: number): Promise<PlaylistLikeResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_UNLIKE(playlistId));
  }

  async repostPlaylist(playlistId: number): Promise<PlaylistRepostResponse> {
    const response = await apiRequest(API_CONTRACTS.PLAYLISTS_REPOST(playlistId));

    if (response.isReposted) {
      void getPlaylistNotificationMeta(playlistId)
        .then(async ({ recipientId, targetTitle, targetUrl }) => {
          await createRealtimeNotification({
            type: 'REPOST',
            recipientId,
            resource: {
              resourceType: 'PLAYLIST',
              resourceId: playlistId,
            },
            targetTitle,
            targetUrl,
          });
        })
        .catch(() => undefined);
    }

    return response;
  }

  async unrepostPlaylist(playlistId: number): Promise<PlaylistRepostResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_UNREPOST(playlistId));
  }
}
