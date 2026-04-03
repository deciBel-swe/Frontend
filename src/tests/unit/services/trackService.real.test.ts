import { config } from '@/config';
import { apiRequest } from '@/hooks/useAPI';
import { RealTrackService } from '@/services/api/trackService';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { PaginatedTracksResponse, TrackDetailsResponse } from '@/types/tracks';
import { upload } from '@testing-library/user-event/dist/cjs/utility/upload.js';
import { is } from 'zod/locales';

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
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealTrackService();
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [0.1, 0.5, 2, -1],
    } as Response);
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as { fetch?: unknown }).fetch;
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
      coverUrl: '/images/covers/42.jpg',
      waveformUrl: 'waveforms/42.json',
      userId: 7,
      username: 'alice',
      isLiked: false,
      isReposted: false,  
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      uploadDate: '',

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
      access: 'PLAYABLE',
      artist: {
        id: 7,
        username: 'alice',
      },
      trackUrl: `${config.api.appUrl}/tracks/42`,
      coverUrl: `${config.api.appUrl}/images/covers/42.jpg`,
      waveformUrl: `${config.api.appUrl}/waveforms/42.json`,
      waveformData: [0.1, 0.5, 1, 0],
      genre: 'Electronic',
      tags: ['night'],
      isLiked: false,
      isReposted: false,  
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      uploadDate: '',
      description: '',
      releaseDate: '',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${config.api.appUrl}/waveforms/42.json`
    );
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
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_TRACKS(10),
    );
    const onlyBob = await service.getUserTracks(11);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_TRACKS(11),
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(onlyAlice).toHaveLength(1);
    expect(onlyAlice[0].artist.id).toBe(10);
    expect(onlyBob).toHaveLength(1);
    expect(onlyBob[0].artist.id).toBe(11);
  });

  it('uses embedded waveformData when present without fetching waveformUrl', async () => {
    const payload: TrackDetailsResponse = {
      id: 77,
      title: 'Embedded Waveform',
      genre: 'Synthwave',
      tags: ['retro'],
      waveformData: '[0.25, 0.75]',
      coverUrl: '/images/default_song_image.png',
      coverImage: '/images/default_song_image.png',
      userId: 4,
      username: 'neo',
      description: '',
      isPrivate: false,
    };

    mockedApiRequest.mockResolvedValue(payload);

    const metadata = await service.getTrackMetadata(77);

    expect(metadata.waveformData).toEqual([0.25, 0.75]);
    expect(fetchMock).not.toHaveBeenCalled();
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

  it('fetches repost users via TRACK_REPOSTS and forwards pagination params', async () => {
    const response = {
      content: [
        {
          id: 2,
          username: 'listenertwo',
          avatarUrl: 'https://picsum.photos/seed/listener/400/400',
          isFollowing: true,
          tier: 'FREE',
        },
      ],
      isLast: true,
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.getRepostUsers(201, {
      page: 0,
      size: 10,
    });

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACK_REPOST_USERS(201),
      {
        params: {
          page: 0,
          size: 10,
        },
      }
    );
  });

  it('calls TRACK_UNLIKE and returns unlike response payload', async () => {
    const response = {
      isLiked: false,
      message: 'Track unliked successfully',
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.unlikeTrack(106);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACK_UNLIKE(106)
    );
  });

  it('calls TRACK_LIKE and returns like response payload', async () => {
    const response = {
      isLiked: true,
      message: 'Track liked successfully',
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.likeTrack(106);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACK_LIKE(106)
    );
  });

  it('calls TRACK_REPOST and returns repost response payload', async () => {
    const response = {
      isReposted: true,
      message: 'Track reposted successfully',
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.repostTrack(106);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACK_REPOST(106)
    );
  });

  it('calls TRACK_UNREPOST and returns unrepost response payload', async () => {
    const response = {
      isReposted: false,
      message: 'Track unreposted successfully',
    };

    mockedApiRequest.mockResolvedValue(response);

    const result = await service.unrepostTrack(106);

    expect(result).toEqual(response);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACK_UNREPOST(106)
    );
  });
});
