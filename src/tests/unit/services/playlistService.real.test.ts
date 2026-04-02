import { apiRequest } from '@/hooks/useAPI';
import { RealPlaylistService } from '@/services/api/playlistService';
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

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

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
      { payload }
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
      API_CONTRACTS.PLAYLISTS_UPDATE(88),
      { payload }
    );
  });

  it('deletes a playlist via PLAYLISTS_DELETE contract', async () => {
    mockedApiRequest.mockResolvedValue(undefined);

    await service.deletePlaylist(91);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_DELETE(91)
    );
  });

  it('regenerates secret link via PLAYLISTS_SECRET_LINK_REGENERATE contract', async () => {
    mockedApiRequest.mockResolvedValue({
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

  it('fetches playlist secret link via PLAYLISTS_SECRET_LINK contract', async () => {
    mockedApiRequest.mockResolvedValue({ SecretLink: 'secret-xyz' });

    await service.getPlaylistSecretLink(42);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_SECRET_LINK(42)
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
      API_CONTRACTS.PLAYLISTS_ADD_TRACK(5),
      { payload }
    );

    mockedApiRequest.mockResolvedValue(undefined);
    await service.removeTrackFromPlaylist(5, 101);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_REMOVE_TRACK(5, 101)
    );
  });

  it('likes and unlikes via PLAYLISTS_LIKE contracts', async () => {
    mockedApiRequest.mockResolvedValue({ message: 'Liked', isLiked: true });
    await service.likePlaylist(13);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_LIKE(13)
    );

    mockedApiRequest.mockResolvedValue({ message: 'Unliked', isLiked: false });
    await service.unlikePlaylist(13);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.PLAYLISTS_UNLIKE(13)
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
