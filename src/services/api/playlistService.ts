import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  CreatePlaylistRequest,
  PlaylistResponse,
  PlaylistUpdateResponse,
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
}
