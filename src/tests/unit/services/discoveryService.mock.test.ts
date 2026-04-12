import { MockDiscoveryService } from '@/services/mocks/discoveryService';

describe('MockDiscoveryService', () => {
  let service: MockDiscoveryService;

  beforeEach(() => {
    service = new MockDiscoveryService();
  });

  it('returns paginated search results', async () => {
    const result = await service.search({
      q: 'mix',
      type: 'ALL',
      page: 0,
      size: 10,
    });

    expect(result.pageNumber).toBe(0);
    expect(result.content.length).toBeGreaterThanOrEqual(0);
  });

  it('returns trending tracks', async () => {
    const result = await service.getTrending({ limit: 5 });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].resourceType).toBe('TRACK');
  });

  it('returns station feeds', async () => {
    const genre = await service.getGenreStation({ page: 0, size: 5 });
    const artist = await service.getArtistStation({ page: 0, size: 5 });
    const likes = await service.getLikesStation({ page: 0, size: 5 });

    expect(genre.content.length).toBeGreaterThan(0);
    expect(artist.content.length).toBeGreaterThan(0);
    expect(likes.content.length).toBeGreaterThan(0);
  });
});
