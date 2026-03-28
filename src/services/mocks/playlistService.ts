import type { PlaylistService } from '@/services/api/playlistService';
import type {
  CreatePlaylistRequest,
  AddPlaylistTrackRequest,
  PlaylistEmbedResponse,
  PlaylistResponse,
  PlaylistUpdateResponse,
  ReorderPlaylistTracksRequest,
  UpdatePlaylistRequest,
} from '@/types/playlists';
import {
  getMockTracksStore,
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

  async deletePlaylist(playlistId: number): Promise<void> {
    await delay();

    const users = getMockUsersStore();
    for (const user of users) {
      const index = user.playlists.findIndex(
        (playlist) => playlist.id === playlistId
      );
      if (index >= 0) {
        user.playlists.splice(index, 1);
        persistMockSystemState();
        return;
      }
    }

    throw new Error('Playlist not found');
  }

  async addTrackToPlaylist(
    playlistId: number,
    payload: AddPlaylistTrackRequest
  ): Promise<{ message: string }> {
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

    const existing = playlist.tracks.some(
      (track) => track.trackId === payload.trackId
    );
    if (existing) {
      return { message: 'Track already in playlist' };
    }

    const track = getMockTracksStore().find(
      (item) => item.id === payload.trackId
    );

    playlist.tracks.push({
      trackId: payload.trackId,
      title: track?.title ?? `Track ${payload.trackId}`,
      durationSeconds: track?.durationSeconds ?? 0,
      trackUrl: track?.trackUrl ?? `/tracks/${payload.trackId}`,
    });

    persistMockSystemState();
    return { message: 'Track added to playlist' };
  }

  async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number
  ): Promise<void> {
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

    const index = playlist.tracks.findIndex(
      (track) => track.trackId === trackId
    );
    if (index < 0) {
      throw new Error('Track not found in playlist');
    }

    playlist.tracks.splice(index, 1);
    persistMockSystemState();
  }

  async reorderPlaylistTracks(
    playlistId: number,
    payload: ReorderPlaylistTracksRequest
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

    const trackMap = new Map(
      playlist.tracks.map((track) => [track.trackId, track])
    );

    const ordered = payload.trackIds
      .map((trackId) => trackMap.get(trackId))
      .filter((track): track is NonNullable<typeof track> => Boolean(track));

    const remaining = playlist.tracks.filter(
      (track) => !payload.trackIds.includes(track.trackId)
    );

    playlist.tracks = [...ordered, ...remaining];
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

  async getPlaylistEmbed(
    playlistId: number
  ): Promise<PlaylistEmbedResponse> {
    await delay();

    const users = getMockUsersStore();
    const owner =
      users.find((user) =>
        user.playlists.some((playlist) => playlist.id === playlistId)
      ) ?? users[0];

    const playlist = owner?.playlists.find(
      (item) => item.id === playlistId
    );

    if (!playlist || !owner) {
      throw new Error('Playlist not found');
    }
  
    const embedCode =
      `<iframe src="/playlists/${playlistId}" ` +
      'width="100%" height="400" frameborder="0" allow="autoplay"></iframe>';

    return { embedCode };
  }
}
