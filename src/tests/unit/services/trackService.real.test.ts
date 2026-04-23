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

  it('resolves track slugs via TRACKS_RESOLVE contract', async () => {
    mockedApiRequest.mockResolvedValue({
      resourceType: 'TRACK',
      resourceId: 77,
    });

    const resolved = await service.resolveTrackSlug('nocturne-77');

    expect(resolved).toEqual({
      resourceType: 'TRACK',
      resourceId: 77,
    });
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACKS_RESOLVE,
      {
        params: {
          trackSlug: 'nocturne-77',
        },
      }
    );
  });

  it('fetches track metadata by secret token via TRACKS_BY_TOKEN contract', async () => {
    const payload: TrackDetailsResponse = {
      id: 77,
      title: 'Token Track',
      slug: 'token-track-77',
      genre: 'Ambient',
      tags: ['secret'],
      trackUrl: '/tracks/77',
      coverUrl: '/covers/77.jpg',
      coverImage: '/covers/77.jpg',
      waveformUrl: '/waveforms/77.json',
      description: '',
      isPrivate: true,
    };

    mockedApiRequest.mockResolvedValue(payload);

    const metadata = await service.getTrackByToken('token-77');

    expect(metadata.id).toBe(77);
    expect(metadata.trackSlug).toBe('token-track-77');
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.TRACKS_BY_TOKEN('token-77')
    );
  });

  it('preserves absolute URLs and falls back to unknown artist fields with explicit duration', async () => {
    const payload: TrackDetailsResponse = {
      id: 55,
      title: 'Absolute URL Track',
      genre: 'Electronic',
      tags: [],
      trackUrl: 'https://cdn.decibel.test/tracks/55.mp3',
      coverUrl: 'http://cdn.decibel.test/covers/55.jpg',
      coverImage: 'http://cdn.decibel.test/covers/55.jpg',
      waveformUrl: 'https://cdn.decibel.test/waveforms/55.json',
      durationSeconds: 321,
      description: '',
      isPrivate: false,
    };

    mockedApiRequest.mockResolvedValue(payload);

    const metadata = await service.getTrackMetadata(55);

    expect(metadata.trackUrl).toBe('https://cdn.decibel.test/tracks/55.mp3');
    expect(metadata.coverUrl).toBe('http://cdn.decibel.test/covers/55.jpg');
    expect(metadata.waveformUrl).toBe('https://cdn.decibel.test/waveforms/55.json');
    expect(metadata.artist).toEqual({ id: 0, username: 'unknown' });
    expect(metadata.durationSeconds).toBe(321);
  });

  it('treats blank embedded waveform strings as empty and falls back to fetched waveform data', async () => {
    const payload: TrackDetailsResponse = {
      id: 56,
      title: 'Blank Embedded Waveform',
      genre: 'Ambient',
      tags: [],
      trackUrl: '/tracks/56',
      coverUrl: '/covers/56.jpg',
      coverImage: '/covers/56.jpg',
      waveformUrl: '/waveforms/56.json',
      waveformData: '   ',
      userId: 4,
      username: 'artist-4',
      description: '',
      isPrivate: false,
    };

    mockedApiRequest.mockResolvedValue(payload);

    const metadata = await service.getTrackMetadata(56);

    expect(fetchMock).toHaveBeenCalledWith(
      `/waveforms/56.json`
    );
    expect(metadata.waveformData).toEqual([0.1, 0.5, 1, 0]);
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

  it.skip('maps secret token responses into hook-consumable secretLink shape', async () => {
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

  it('falls back to empty waveform data when waveform fetch is unavailable', async () => {
    const payload: TrackDetailsResponse = {
      id: 120,
      title: 'No Waveform Runtime',
      genre: 'Ambient',
      tags: [],
      coverUrl: '/covers/120.jpg',
      coverImage: '/covers/120.jpg',
      waveformUrl: '/waveforms/120.json',
      userId: 12,
      username: 'artist-12',
      description: '',
      isPrivate: false,
    };

    mockedApiRequest.mockResolvedValue(payload);
    delete (globalThis as { fetch?: unknown }).fetch;

    const result = await service.getTrackMetadata(120);

    expect(result.waveformData).toEqual([]);
  });

  it('falls back to empty waveform data when waveform fetch is not ok', async () => {
    const payload: TrackDetailsResponse = {
      id: 121,
      title: 'Broken Waveform',
      genre: 'Ambient',
      tags: [],
      coverUrl: '/covers/121.jpg',
      coverImage: '/covers/121.jpg',
      waveformUrl: '/waveforms/121.json',
      userId: 12,
      username: 'artist-12',
      description: '',
      isPrivate: false,
    };

    mockedApiRequest.mockResolvedValue(payload);
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    const result = await service.getTrackMetadata(121);

    expect(fetchMock).toHaveBeenCalledWith(
      `/waveforms/121.json`
    );
    expect(result.waveformData).toEqual([]);
  });

  it('calls update and delete contracts for track mutation endpoints', async () => {
    const updateResponse = {
      id: 77,
      title: 'Updated',
      genre: 'House',
      tags: ['updated'],
      description: 'Updated description',
      releaseDate: '2026-01-01',
      isPrivate: false,
      coverUrl: 'https://decibel.test/covers/77.jpg',
    };

    mockedApiRequest
      .mockResolvedValueOnce(updateResponse)
      .mockResolvedValueOnce(undefined as void)
      .mockResolvedValueOnce(undefined as void);

    const formData = new FormData();
    formData.append('title', 'Updated');

    const updated = await service.updateTrack(77, formData);
    await service.deleteTrack(77);
    await service.deleteTrackCover(77);

    expect(updated).toEqual(updateResponse);

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      1,
      API_CONTRACTS.TRACKS_UPDATE(77),
      {
        payload: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ method: 'DELETE', url: '/tracks/77' })
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ method: 'DELETE', url: '/tracks/77/cover' })
    );
  });

  it('forwards pagination parameters for my-tracks and engagement lists', async () => {
    const emptyPaginatedTracks = {
      content: [],
      isLast: true,
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
    } as PaginatedTracksResponse;

    const paginated = {
      content: [],
      isLast: true,
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
    };

    mockedApiRequest
      .mockResolvedValueOnce(emptyPaginatedTracks)
      .mockResolvedValueOnce(emptyPaginatedTracks)
      .mockResolvedValueOnce(paginated)
      .mockResolvedValueOnce(paginated);

    await service.getMyTracks();
    await service.getMyTracks({ page: 2, size: 5 });
    await service.getMyLikedTracks({ page: 1, size: 7 });
    await service.getMyRepostedTracks({ page: 3, size: 9 });

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      1,
      API_CONTRACTS.USERS_ME_TRACKS,
      { params: undefined }
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      2,
      API_CONTRACTS.USERS_ME_TRACKS,
      {
        params: { page: 2, size: 5 },
      }
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      3,
      API_CONTRACTS.ME_LIKED_TRACKS(),
      {
        params: { page: 1, size: 7 },
      }
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      4,
      API_CONTRACTS.ME_REPOSTED_TRACKS(),
      {
        params: { page: 3, size: 9 },
      }
    );
  });

  it('normalizes empty query params and tolerates waveform fetch exceptions in list hydration', async () => {
    const listPayload = {
      content: [
        {
          id: 301,
          title: 'List Item',
          genre: 'House',
          tags: ['one'],
          artist: { id: 99, username: 'artist99' },
          trackUrl: '/tracks/301',
          waveformUrl: '/waveforms/301.json',
          coverUrl: '/covers/301.jpg',
          isLiked: false,
          isReposted: false,
          likeCount: 0,
          repostCount: 0,
          playCount: 0,
          description: '',
          isPrivate: false,
        },
      ],
    } as PaginatedTracksResponse;

    mockedApiRequest
      .mockResolvedValueOnce(listPayload)
      .mockResolvedValueOnce(listPayload);

    fetchMock.mockRejectedValue(new Error('network down'));

    const myTracks = await service.getMyTracks({});
    const allTracks = await service.getAllTracks();

    expect(myTracks).toHaveLength(1);
    expect(myTracks[0].waveformData).toEqual([]);
    expect(allTracks).toHaveLength(1);
    expect(allTracks[0].waveformData).toEqual([]);

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      1,
      API_CONTRACTS.USERS_ME_TRACKS,
      { params: undefined }
    );

    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      2,
      API_CONTRACTS.USERS_TRACKS(1)
    );
  });
});
