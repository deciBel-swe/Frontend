import { act, renderHook, waitFor } from '@testing-library/react';

import { useTrackHeaderItem } from '@/hooks/useTrackHeaderItem';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { commentService, trackService } from '@/services';

jest.mock('@/services', () => ({
  trackService: {
    getTrackMetadata: jest.fn(),
    likeTrack: jest.fn(),
    unlikeTrack: jest.fn(),
    repostTrack: jest.fn(),
    unrepostTrack: jest.fn(),
  },
  commentService: {
    getTrackComments: jest.fn(),
    getCommentReplies: jest.fn(),
  },
}));

jest.mock('@/features/player/store/playerStore', () => ({
  usePlayerStore: jest.fn(),
}));

jest.mock('@/features/player/utils/playerTrackMappers', () => ({
  playerTrackMappers: {
    fromTrackMetaData: jest.fn(),
  },
}));

const mockUsePlayerStore = usePlayerStore as jest.Mock;
const mockTrackService = trackService as jest.Mocked<typeof trackService>;
const mockCommentService = commentService as jest.Mocked<typeof commentService>;
const mockPlayerTrackMappers = playerTrackMappers as jest.Mocked<
  typeof playerTrackMappers
>;

describe('useTrackHeaderItem', () => {
  const playTrack = jest.fn();
  const pause = jest.fn();
  const seek = jest.fn();

  const createPlayerState = () => ({
    playTrack,
    pause,
    seek,
    currentTrack: null as { id: number } | null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const buildMetadata = (overrides: Record<string, unknown> = {}) => ({
    id: 42,
    title: 'Header Track',
    artist: { username: 'artist-42' },
    coverUrl: '/cover.png',
    releaseDate: '2025-01-01T00:00:00.000Z',
    tags: ['ambient'],
    waveformData: [0.1, 0.3],
    durationSeconds: 120,
    playCount: 100,
    likeCount: 2,
    repostCount: 1,
    isLiked: false,
    isReposted: false,
    access: 'PLAYABLE',
    ...overrides,
  });

  const mappedPlayerTrack = {
    id: 42,
    title: 'Header Track',
    artistName: 'artist-42',
    trackUrl: 'https://track.mp3',
    access: 'PLAYABLE',
    durationSeconds: 120,
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();

    const playerState = createPlayerState();
    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector(playerState)
    );

    mockPlayerTrackMappers.fromTrackMetaData.mockReturnValue(
      mappedPlayerTrack as any
    );

    mockCommentService.getTrackComments.mockResolvedValue({
      content: [
        {
          id: 10,
          body: 'top-level',
          timestampSeconds: 12,
          user: { username: 'u1', avatarUrl: '/u1.png' },
        },
        {
          id: 11,
          body: 'no timestamp',
          user: { username: 'u2', avatarUrl: '/u2.png' },
        },
      ],
    } as any);

    mockCommentService.getCommentReplies
      .mockResolvedValueOnce({
        content: [
          {
            id: 20,
            body: 'reply with timestamp',
            timestampSeconds: 33,
            user: { username: 'u3', avatarUrl: '/u3.png' },
          },
          {
            id: 21,
            body: 'negative timestamp',
            timestampSeconds: -1,
            user: { username: 'u4', avatarUrl: '/u4.png' },
          },
        ],
      } as any)
      .mockResolvedValueOnce({ content: [] } as any);
  });

  it('returns reset state for invalid track ids', async () => {
    const { result } = renderHook(() =>
      useTrackHeaderItem({ username: 'artist', trackId: 'bad-id' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hero).toBeNull();
    expect(result.current.waveformComments).toEqual([]);
    expect(result.current.likeCount).toBe(0);
    expect(result.current.repostCount).toBe(0);
    expect(mockTrackService.getTrackMetadata).not.toHaveBeenCalled();
  });

  it('loads hero/player data and maps timed comments with filtering', async () => {
    mockTrackService.getTrackMetadata.mockResolvedValue(buildMetadata() as any);

    const { result } = renderHook(() =>
      useTrackHeaderItem({ username: 'fallback-user', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hero?.title).toBe('Header Track');
    expect(result.current.hero?.duration).toBe('2:00');
    expect(result.current.waveformComments).toEqual([
      {
        id: '10',
        timestamp: 12,
        comment: 'top-level',
        user: { name: 'u1', avatar: '/u1.png' },
      },
      {
        id: '20',
        timestamp: 33,
        comment: 'reply with timestamp',
        user: { name: 'u3', avatar: '/u3.png' },
      },
    ]);
    expect(result.current.likeCount).toBe(2);
    expect(result.current.repostCount).toBe(1);
    expect(mockPlayerTrackMappers.fromTrackMetaData).toHaveBeenCalled();
  });

  it('handles play/pause and waveform seek actions', async () => {
    const playingState = {
      ...createPlayerState(),
      currentTrack: { id: 42 },
      isPlaying: true,
      currentTime: 15,
      duration: 120,
    };

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector(playingState)
    );

    mockTrackService.getTrackMetadata.mockResolvedValue(buildMetadata() as any);

    const { result } = renderHook(() =>
      useTrackHeaderItem({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onPlayPause();
    });

    expect(pause).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onWaveformSeek(1.5);
    });

    expect(seek).toHaveBeenCalledWith(120);

    const pausedState = {
      ...createPlayerState(),
      currentTrack: { id: 42 },
      isPlaying: false,
      currentTime: 15,
      duration: 120,
    };

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector(pausedState)
    );

    const { result: pausedResult } = renderHook(() =>
      useTrackHeaderItem({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(pausedResult.current.isLoading).toBe(false));

    act(() => {
      pausedResult.current.onWaveformSeek(0.25);
    });

    expect(playTrack).toHaveBeenCalled();
    expect(seek).toHaveBeenLastCalledWith(30);
  });

  it('optimistically updates like/repost and rolls back on failure', async () => {
    mockTrackService.getTrackMetadata.mockResolvedValue(
      buildMetadata({ isLiked: false, isReposted: false, likeCount: 4, repostCount: 3 }) as any
    );

    mockTrackService.likeTrack.mockResolvedValue({ isLiked: true } as any);
    mockTrackService.repostTrack.mockRejectedValue(new Error('repost failed'));

    const { result } = renderHook(() =>
      useTrackHeaderItem({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.onLike();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(5);

    await act(async () => {
      await result.current.onRepost();
    });

    expect(result.current.isReposted).toBe(false);
    expect(result.current.repostCount).toBe(3);
  });

  it('marks hook as error when loading metadata fails', async () => {
    mockTrackService.getTrackMetadata.mockRejectedValue(new Error('load failed'));

    const { result } = renderHook(() =>
      useTrackHeaderItem({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.hero).toBeNull();
    expect(result.current.waveformComments).toEqual([]);
  });
});
