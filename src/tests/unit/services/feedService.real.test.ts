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
          title: 'Neon Skylines',
          artist: { id: 7, username: 'mockartist' },
          trackUrl: 'https://example.com/tracks/101',
          coverUrl: 'https://example.com/covers/101.jpg',
          waveformUrl: 'https://example.com/waveforms/101.json',
          genre: 'Electronic',
          tags: ['synthwave'],
          description: 'night drive',
          releaseDate: new Date('2025-10-25'),
          uploadDate: new Date('2025-10-25'),
          likeCount: 2,
          repostCount: 1,
          playCount: 50,
          isLiked: false,
          isReposted: false,
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
