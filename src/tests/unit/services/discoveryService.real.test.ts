import { apiRequest } from '@/hooks/useAPI';
import { RealDiscoveryService } from '@/services/api/discoveryService';
import { API_CONTRACTS } from '@/types/apiContracts';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealDiscoveryService', () => {
  let service: RealDiscoveryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealDiscoveryService();
  });

  it('calls SEARCH with query params', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.search({ q: 'rock', type: 'ALL', page: 0, size: 20 });

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.SEARCH, {
      params: { q: 'rock', type: 'ALL', page: 0, size: 20 },
    });
  });

  it('calls TRENDING with params', async () => {
    mockedApiRequest.mockResolvedValue([]);

    await service.getTrending({ genre: 'Electronic', limit: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.TRENDING, {
      params: { genre: 'Electronic', limit: 10 },
    });
  });

  it('calls stations endpoints with pagination', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getGenreStation({ page: 0, size: 20 });
    await service.getArtistStation({ page: 0, size: 20 });
    await service.getLikesStation({ page: 0, size: 20 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.STATIONS_GENRE,
      { params: { page: 0, size: 20 } }
    );
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.STATIONS_ARTIST,
      { params: { page: 0, size: 20 } }
    );
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.STATIONS_LIKES,
      { params: { page: 0, size: 20 } }
    );
  });
});
