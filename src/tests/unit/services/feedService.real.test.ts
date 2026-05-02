import { apiRequest } from '@/hooks/useAPI';
import { RealFeedService } from '@/services/api/feedService';
import { API_CONTRACTS } from '@/types/apiContracts';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealFeedService', () => {
  let service: RealFeedService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealFeedService();
  });

  it('calls FEED contract with pagination params', async () => {
    const response = {
      content: [
        {
          id: 101,
          type: 'TRACK_POSTED',
          resource: {
            resourceType: 'TRACK',
            resourceId: 42,
            playlist: null,
            track: { id: 42 },
            user: null,
          },
          createdAt: '2025-04-08T14:30:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      isLast: true,
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getfeed({ page: 0, size: 10 });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.FEED, {
      params: { page: 0, size: 10 },
    });
  });

  it('calls FEED contract without params when none are provided', async () => {
    const response = {
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getfeed();

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.FEED, {
      params: undefined,
    });
  });
});
