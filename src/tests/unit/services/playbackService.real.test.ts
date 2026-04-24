import { apiRequest } from '@/hooks/useAPI';
import { RealPlaybackService } from '@/services/api/playbackService';
import { API_CONTRACTS } from '@/types/apiContracts';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealPlaybackService', () => {
  let service: RealPlaybackService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealPlaybackService();
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'jest-agent' },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { innerWidth: 1400 },
      configurable: true,
      writable: true,
    });
  });

  it('calls USERS_ME_HISTORY for listening history', async () => {
    mockedApiRequest.mockResolvedValue({
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isLast: true,
    });

    await service.getListeningHistory({ page: 0, size: 10 });

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.USERS_ME_HISTORY, {
      params: {
        page: 0,
        size: 10,
      },
    });
  });

  it('calls TRACK_PLAY with trackId and provided deviceInfo', async () => {
    mockedApiRequest.mockResolvedValue({ message: 'Track play recorded successfully' });

    await service.playTrack(99, {
      deviceType: 'WEB',
      fingerPrint: 'fp-WEB',
      deviceName: 'iphone',
    });

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.TRACK_PLAY(99), {
      payload: {
        trackId: 99,
        deviceInfo: {
          deviceType: 'WEB',
          fingerPrint: 'fp-WEB',
          deviceName: 'iphone',
        },
      },
    });
  });

  it('calls TRACK_COMPLETE with trackId and deviceInfo payload', async () => {
    mockedApiRequest.mockResolvedValue({
      message: 'Track completion recorded successfully',
    });

    await service.completeTrack(7);

    expect(mockedApiRequest).toHaveBeenCalledWith(API_CONTRACTS.TRACK_COMPLETE(7), {
      payload: {
        trackId: 7,
        deviceInfo: expect.objectContaining({
          deviceType: 'WEB',
          fingerPrint: 'jest-agent',
          deviceName: 'jest-agent',
        }),
      },
    });
  });
});
