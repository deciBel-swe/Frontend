import { apiRequest } from '@/hooks/useAPI';
import { RealPlaylistService } from '@/services/api/playlistService';
import { createRealtimeNotification } from '@/services/firebase/realtimeSocial';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  AddPlaylistTrackRequest,
  CreatePlaylistRequest,
  ReorderPlaylistTracksRequest,
  UpdatePlaylistRequest,
} from '@/types/playlists';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('@/services/firebase/realtimeSocial', () => ({
  createRealtimeNotification: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockCreateRealtimeNotification = createRealtimeNotification as jest.MockedFunction<typeof createRealtimeNotification>;

describe('RealPlaylistService', () => {
  let service: RealPlaylistService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealPlaylistService();
  });

  it('creates a playlist via PLAYLISTS_CREATE contract', async () => {
    const payload: CreatePlaylistRequest = {
      title: 'Road Trip',
      description: 'Long drive energy',
      type: 'PLAYLIST',
      isPrivate: false,
      CoverArt: 'https://example.com/cover.jpg',
      genre: 'Electronic',
    };

    const response = {
      id: 123,
      title: 'Road Trip',
      type: 'PLAYLIST',
      isLiked: false,
      owner: { id: 7, username: 'mockartist' },
      tracks: [],
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.createPlaylist(payload);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_CREATE,
      expect.objectContaining({
        payload: expect.any(FormData),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  });

  it('updates a playlist via PLAYLISTS_UPDATE contract', async () => {
    const payload: UpdatePlaylistRequest = {
      title: 'Updated Title',
      description: 'Updated description',
      type: 'ALBUM',
      isPrivate: true,
      CoverArt: '',
    };

    mockedApiRequest.mockResolvedValue({
      id: 88,
      title: 'Updated Title',
      type: 'ALBUM',
      isLiked: false,
      owner: { id: 7, username: 'mockartist' },
      tracks: [],
    });

    await service.updatePlaylist(88, payload);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PATCH', url: '/playlists/88' }),
      expect.objectContaining({
        payload: expect.any(FormData),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  });

  it('deletes a playlist via PLAYLISTS_DELETE contract', async () => {
    mockedApiRequest.mockResolvedValue(undefined);

    await service.deletePlaylist(91);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: '/playlists/91' })
    );
  });

  it('regenerates secret link via PLAYLISTS_SECRET_LINK_REGENERATE contract', async () => {
    mockedApiRequest.mockResolvedValue({
      secretToken: 'abc',
      secretUrl: '/playlists/token/abc',
      expiresAt: '2026-01-01T00:00:00.000Z',
    });

    await service.regeneratePlaylistSecretLink(55);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_SECRET_LINK_REGENERATE(55)
    );
  });

  it('fetches playlist by token via PLAYLISTS_BY_TOKEN contract', async () => {
    mockedApiRequest.mockResolvedValue({
      id: 9,
      title: 'Secret Playlist',
      type: 'PLAYLIST',
      isLiked: false,
      owner: { id: 1, username: 'mockuser' },
      tracks: [],
    });

    await service.getPlaylistByToken('token-123');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_BY_TOKEN('token-123')
    );
  });

  it('calls PLAYLISTS_ME_PLAYLISTS with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 5,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getMePlaylists({ page: 0, size: 5 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_ME_PLAYLISTS,
      {
        params: { page: 0, size: 5 },
      }
    );
  });

  it('calls PLAYLISTS_USER_PLAYLISTS with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getUserPlaylists('mockartist', { page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_USER_PLAYLISTS('mockartist'),
      {
        params: { page: 0, size: 10 },
      }
    );
  });

  it('calls PLAYLISTS_USER_LIKED_PLAYLISTS with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 5,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getUserLikedPlaylists('mockartist', { page: 0, size: 5 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_USER_LIKED_PLAYLISTS('mockartist'),
      {
        params: { page: 0, size: 5 },
      }
    );
  });

  it('fetches playlist secret link via PLAYLISTS_SECRET_LINK contract', async () => {
    mockedApiRequest.mockResolvedValue({ secretToken: 'secret-xyz' });

    await service.getPlaylistSecretLink(42);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_SECRET_LINK(42)
    );
  });

  it('fetches paginated playlist tracks via PLAYLISTS_TRACKS contract', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    });

    await service.getPlaylistTracks(42, { page: 1, size: 5 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_TRACKS(42),
      {
        params: {
          page: 1,
          size: 5,
        },
      }
    );
  });

  it('resolves playlist slug via PLAYLISTS_RESOLVE contract', async () => {
    mockedApiRequest.mockResolvedValue({
      type: 'PLAYLIST',
      id: 11,
    });

    await service.resolvePlaylistSlug('late-night-set-11');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_RESOLVE,
      {
        params: {
          playlistSlug: 'late-night-set-11',
        },
      }
    );
  });

  it('reorders playlist tracks via PLAYLISTS_REORDER_TRACKS contract', async () => {
    const payload: ReorderPlaylistTracksRequest = { trackIds: [10, 11, 12] };

    mockedApiRequest.mockResolvedValue({
      id: 77,
      title: 'Reordered',
      type: 'PLAYLIST',
      isLiked: false,
      owner: { id: 2, username: 'listenertwo' },
      tracks: [],
    });

    await service.reorderPlaylistTracks(77, payload);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_REORDER_TRACKS(77),
      { payload }
    );
  });

  it('adds and removes tracks via playlist track contracts', async () => {
    const payload: AddPlaylistTrackRequest = { trackId: 101 };

    mockedApiRequest.mockResolvedValue({ message: 'Track added to playlist' });
    await service.addTrackToPlaylist(5, payload);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: '/playlists/5/tracks' }),
      {
        payload,
        params: { trackId: 101 },
      }
    );

    mockedApiRequest.mockResolvedValue(undefined);
    await service.removeTrackFromPlaylist(5, 101);

    expect(mockedApiRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/playlists/5/tracks/101',
      })
    );
  });

  it('likes and unlikes via PLAYLISTS_LIKE contracts', async () => {
    mockedApiRequest.mockImplementation(async (contract) => {
      if (contract.url.includes('/like') && contract.method === 'POST') {
        return { message: 'Liked', isLiked: true };
      }
      if (contract.url.includes('/like') && contract.method === 'DELETE') {
        return { message: 'Unliked', isLiked: false };
      }
      return {
        id: 13,
        title: 'Playlist 13',
        owner: { id: 99, username: 'owner' },
      };
    });

    await service.likePlaylist(13);

    // wait for background promise to resolve
    await new Promise(process.nextTick);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_LIKE(13)
    );
    expect(mockCreateRealtimeNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIKE',
        recipientId: 99,
        targetTitle: 'Playlist 13',
        resource: { resourceType: 'PLAYLIST', resourceId: 13 },
      })
    );

    await service.unlikePlaylist(13);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_UNLIKE(13)
    );
  });

  it('reposts and unreposts via PLAYLISTS_REPOST contracts', async () => {
    mockedApiRequest.mockImplementation(async (contract) => {
      if (contract.url.includes('/repost') && contract.method === 'POST') {
        return { message: 'Reposted', isReposted: true };
      }
      if (contract.url.includes('/repost') && contract.method === 'DELETE') {
        return { message: 'Unreposted', isReposted: false };
      }
      return {
        id: 13,
        title: 'Playlist 13',
        owner: { id: 99, username: 'owner' },
      };
    });

    await service.repostPlaylist(13);

    // wait for background promise to resolve
    await new Promise(process.nextTick);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_REPOST(13)
    );
    expect(mockCreateRealtimeNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'REPOST',
        recipientId: 99,
        targetTitle: 'Playlist 13',
        resource: { resourceType: 'PLAYLIST', resourceId: 13 },
      })
    );

    await service.unrepostPlaylist(13);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_UNREPOST(13)
    );
  });

  it('gets embed code via PLAYLISTS_EMBED contract', async () => {
    mockedApiRequest.mockResolvedValue({
      embedCode: '<iframe />',
    });

    await service.getPlaylistEmbed(101);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_EMBED(101)
    );
  });
});
