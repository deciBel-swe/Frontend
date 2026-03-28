import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  CreatePlaylistRequest,
  AddPlaylistTrackRequest,
  PlaylistEmbedResponse,
  PlaylistResponse,
  PlaylistSecretLinkRegenerateResponse,
  PlaylistSecretLinkResponse,
  PlaylistUpdateResponse,
  ReorderPlaylistTracksRequest,
  UpdatePlaylistRequest,
} from '@/types/playlists';

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
}
