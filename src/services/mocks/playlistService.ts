import type { PlaylistService } from '@/services/api/playlistService';
import type {
  CreatePlaylistRequest,
  PlaylistResponse,
  PlaylistUpdateResponse,
  UpdatePlaylistRequest,
} from '@/types/playlists';
import {
  getMockUsersStore,
  persistMockSystemState,
  resolveCurrentMockUserId,
} from './mockSystemStore';

const MOCK_DELAY_MS = 220;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getNextPlaylistId = (): number => {
  const users = getMockUsersStore();
  const allPlaylists = users.flatMap((user) => user.playlists);
  if (allPlaylists.length === 0) {
    return 1;
  }
  return Math.max(...allPlaylists.map((playlist) => playlist.id)) + 1;
};

export class MockPlaylistService implements PlaylistService {
  async createPlaylist(
    payload: CreatePlaylistRequest
  ): Promise<PlaylistResponse> {
    await delay();

    const currentUserId = resolveCurrentMockUserId();
    const users = getMockUsersStore();
    const owner =
      users.find((user) => user.id === currentUserId) ?? users[0];

    if (!owner) {
      throw new Error('No mock user available to own playlist');
    }

    const id = getNextPlaylistId();
    const title = payload.title.trim();
    const description = payload.description?.trim() || undefined;

    owner.playlists.unshift({
      id,
      title,
      description,
      type: payload.type,
      isPrivate: payload.isPrivate,
      CoverArt: payload.CoverArt,
      isLiked: false,
      owner: {
        id: owner.id,
        username: owner.username,
      },
      tracks: [],
    });
    persistMockSystemState();

    return {
      id,
      title,
      type: payload.type,
      isLiked: false,
      owner: { id: owner.id, username: owner.username },
      tracks: [],
    };
  }

  async updatePlaylist(
    playlistId: number,
    payload: UpdatePlaylistRequest
  ): Promise<PlaylistUpdateResponse> {
    await delay();

    const users = getMockUsersStore();
    const owner =
      users.find((user) =>
        user.playlists.some((playlist) => playlist.id === playlistId)
      ) ?? users[0];

    if (!owner) {
      throw new Error('No mock user available to own playlist');
    }

    const playlist = owner.playlists.find(
      (item) => item.id === playlistId
    );

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    playlist.title = payload.title.trim();
    playlist.description = payload.description?.trim() || undefined;
    playlist.type = payload.type;
    playlist.isPrivate = payload.isPrivate;
    playlist.CoverArt = payload.CoverArt;

    persistMockSystemState();

    return {
      id: playlist.id,
      title: playlist.title,
      type: playlist.type,
      isLiked: playlist.isLiked,
      owner: { id: owner.id, username: owner.username },
      tracks: playlist.tracks,
    };
  }
}
