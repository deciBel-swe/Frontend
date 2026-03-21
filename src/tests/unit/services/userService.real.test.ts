import { apiRequest } from '@/hooks/useAPI';
import { RealUserService } from '@/services/api/userService';
import { API_CONTRACTS } from '@/types/apiContracts';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealUserService', () => {
  let service: RealUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealUserService();
  });

  it('calls USERS_ME_RESET_PASSWORD with payload', async () => {
    mockedApiRequest.mockResolvedValue({ message: 'Password updated' });

    const response = await service.resetLoggedInPassword({
      newPassword: 'pass123',
    });

    expect(response).toEqual({ message: 'Password updated' });
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_RESET_PASSWORD,
      {
        payload: { newPassword: 'pass123' },
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
});
