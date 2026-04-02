import { config } from '@/config';
import { apiRequest } from '@/hooks/useAPI';
import { RealTrackService } from '@/services/api/trackService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { PaginatedTracksResponse, TrackDetailsResponse } from '@/types/tracks';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

type UploadProgressEvent = {
  loaded: number;
  total?: number;
};

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealTrackService', () => {
  let service: RealTrackService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealTrackService();
  });

  it('uploads via TRACKS_UPLOAD contract and reports upload progress', async () => {
    const response = {
      id: 999,
      title: 'Uploaded Track',
      trackUrl: 'https://example.com/tracks/999',
      coverUrl: 'https://example.com/covers/999.jpg',
      durationSeconds: 123,
    };

    mockedApiRequest.mockResolvedValue(response);

    const formData = new FormData();
    formData.append('title', 'Uploaded Track');

    const onProgress = jest.fn();
    const result = await service.uploadTrack(formData, onProgress);

    expect(result).toEqual(response);

    const [contract, requestOptions] = mockedApiRequest.mock.calls[0] as [
      unknown,
      {
        payload?: FormData;
        headers?: Record<string, string>;
        onUploadProgress?: (event: UploadProgressEvent) => void;
      },
    ];

    expect(contract).toBe(API_CONTRACTS.TRACKS_UPLOAD);
    expect(requestOptions.payload).toBe(formData);
    expect(requestOptions.headers).toEqual({
      'Content-Type': 'multipart/form-data',
    });

    requestOptions.onUploadProgress?.({ loaded: 30 });
    expect(onProgress).not.toHaveBeenCalled();

    requestOptions.onUploadProgress?.({ loaded: 50, total: 200 });
    expect(onProgress).toHaveBeenCalledWith(25);
  });

  it('normalizes metadata URLs and fallback artist fields', async () => {
    const payload: TrackDetailsResponse = {
      id: 42,
      title: 'Neon Pulse',
      genre: 'Electronic',
      tags: ['night'],
      coverImage: '/images/covers/42.jpg',
      waveformUrl: 'waveforms/42.json',
      userId: 7,
      username: 'alice',
      description: '',
      isPrivate: false,
    };

    mockedApiRequest.mockResolvedValue(payload);

    const metadata = await service.getTrackMetadata(42);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: '/tracks/42' })
    );

    expect(metadata).toEqual({
      id: 42,
      title: 'Neon Pulse',
      artist: {
        id: 7,
        username: 'alice',
      },
      trackUrl: `${config.api.appUrl}/tracks/42`,
      coverUrl: `${config.api.appUrl}/images/covers/42.jpg`,
      waveformUrl: `${config.api.appUrl}/waveforms/42.json`,
      genre: 'Electronic',
      tags: ['night'],
      description: '',
      releaseDate: '',
    });
  });

  it('returns and filters user tracks by user id', async () => {
    mockedApiRequest.mockResolvedValue(
      {
        "content":[
          {
            id: 1,
            title: 'Alice Track',
            genre: 'House',
            tags: ['dance'],
            artist: { id: 10, username: 'alice' },
          },
          {
            id: 2,
            title: 'Bob Track',
            genre: 'Lo-Fi',
            tags: ['chill'],
            artist: { id: 11, username: 'bob' },
          },
      ]
  } as PaginatedTracksResponse);

    const onlyAlice = await service.getUserTracks(10);
    const onlyBob = await service.getUserTracks(11);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_TRACKS
    );
    expect(onlyAlice).toHaveLength(1);
    expect(onlyAlice[0].artist.id).toBe(10);
    expect(onlyBob).toHaveLength(1);
    expect(onlyBob[0].artist.id).toBe(11);
  });

  it('maps visibility operations to the expected API contracts', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ isPrivate: false })
      .mockResolvedValueOnce({ isPrivate: true });

    const visibility = await service.getTrackVisibility(88);
    const updated = await service.updateTrackVisibility(88, {
      isPrivate: true,
    });

    expect(visibility).toEqual({ isPrivate: false });
    expect(updated).toEqual({ isPrivate: true });

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ method: 'GET', url: '/tracks/88' })
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ method: 'PATCH', url: '/tracks/88' }),
      { payload: { isPrivate: true } }
    );
  });

  it('maps secret token responses into hook-consumable secretLink shape', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ secretToken: 'token-one' })
      .mockResolvedValueOnce({ secretToken: 'token-two' });

    const current = await service.getSecretLink('12');
    const rotated = await service.regenerateSecretLink('12');

    expect(current).toEqual({ secretLink: 'token-one' });
    expect(rotated).toEqual({ secretLink: 'token-two' });

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ method: 'GET', url: '/tracks/12/secret-token' })
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'POST',
        url: '/tracks/12/generate-token',
      })
    );
  });
});
