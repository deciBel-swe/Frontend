import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  CreatePlaylistRequest,
  AddPlaylistTrackRequest,
  PlaylistResponse,
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
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealPlaylistService implements PlaylistService {
  async createPlaylist(
    payload: CreatePlaylistRequest
  ): Promise<PlaylistResponse> {
    return apiRequest(API_CONTRACTS.PLAYLISTS_CREATE, { payload });
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
}
