import { apiRequest } from '@/hooks/useAPI';
import { RealUserService } from '@/services/api/userService';
import { API_CONTRACTS } from '@/types/apiContracts';

const MOCKED_PASSWORD_HASH = 'b'.repeat(64);

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('@/utils/sha256', () => ({
  sha256Hex: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedSha256Hex = jest.requireMock('@/utils/sha256')
  .sha256Hex as jest.MockedFunction<(value: string) => Promise<string>>;

describe('RealUserService', () => {
  let service: RealUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealUserService();
    mockedSha256Hex.mockResolvedValue(MOCKED_PASSWORD_HASH);
  });

  it('calls USERS_ME_RESET_PASSWORD with payload', async () => {
    mockedApiRequest.mockResolvedValue({ message: 'Password updated' });

    const response = await service.resetLoggedInPassword({
      newPassword: 'pass123',
    });

    expect(response).toEqual({ message: 'Password updated' });
    expect(mockedSha256Hex).toHaveBeenCalledWith('pass123');
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_RESET_PASSWORD,
      {
        payload: { newPassword: MOCKED_PASSWORD_HASH },
      }
    );
  });

  it('calls USERS_TRACKS with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getUserTracks(22, { page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_TRACKS(22),
      {
        params: { page: 0, size: 10 },
      }
    );
  });

  it('calls USERS_ME_PLAYLISTS with query params', async () => {
    mockedApiRequest.mockResolvedValue([{ id: 1, title: 'Focus Mix' }]);

    await service.getMePlaylists({ page: 0, size: 5 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_PLAYLISTS,
      {
        params: { page: 0, size: 5 },
      }
    );
  });

  it('calls USERS_PLAYLISTS with query params', async () => {
    mockedApiRequest.mockResolvedValue([{ id: 2, title: 'Public Set' }]);

    await service.getUserPlaylists(11, { page: 1, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_PLAYLISTS(11),
      {
        params: { page: 1, size: 10 },
      }
    );
  });

  it('calls USERS_ME_REPOSTS with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getMyReposts({ page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_REPOSTS,
      {
        params: { page: 0, size: 10 },
      }
    );
  });

  it('calls USERS_REPOSTS with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getUserReposts(11, { page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_REPOSTS(11),
      {
        params: { page: 0, size: 10 },
      }
    );
  });

  it('calls USERS_LIKED_PLAYLISTS with query params', async () => {
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
      API_CONTRACTS.USERS_LIKED_PLAYLISTS('mockartist'),
      {
        params: { page: 0, size: 5 },
      }
    );
  });

  it('calls USERS_FOLLOW', async () => {
    mockedApiRequest.mockResolvedValue({
      message: 'Now following',
      isFollowing: true,
    });

    await service.followUser(3);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_FOLLOW(3),
      {}
    );
  });

  it('calls USERS_WHO_LIKED_TRACK with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getUsersWhoLikedTrack(22, { page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_WHO_LIKED_TRACK(22),
      {
        params: { page: 0, size: 10 },
      }
    );
  });
});
