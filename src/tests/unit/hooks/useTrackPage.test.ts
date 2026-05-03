import { act, renderHook, waitFor } from '@testing-library/react';

import { useAuth } from '@/features/auth';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { useTrackPage } from '@/hooks/useTrackPage';
import { commentService, trackService } from '@/services';

jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
}));

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
    addTrackComment: jest.fn(),
    replyToComment: jest.fn(),
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

const mockUseAuth = useAuth as jest.Mock;
const mockUsePlayerStore = usePlayerStore as unknown as jest.Mock;
const mockTrackService = trackService as jest.Mocked<typeof trackService>;
const mockCommentService = commentService as jest.Mocked<typeof commentService>;
const mockTrackMappers = playerTrackMappers as jest.Mocked<typeof playerTrackMappers>;

describe('useTrackPage', () => {
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
    title: 'Track Page Title',
    artist: { username: 'artist-42' },
    coverUrl: '/cover.png',
    releaseDate: '2025-01-01T00:00:00.000Z',
    tags: ['bass', 'electronic'],
    waveformData: [0.1, 0.4, 0.7],
    durationSeconds: 180,
    playCount: 500,
    description: 'A test track description',
    likeCount: 12,
    repostCount: 3,
    isLiked: false,
    isReposted: false,
    access: 'PLAYABLE',
    ...overrides,
  });

  const mappedPlayerTrack = {
    id: 42,
    title: 'Track Page Title',
    artistName: 'artist-42',
    trackUrl: 'https://track.mp3',
    access: 'PLAYABLE',
    durationSeconds: 180,
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 7, username: 'current-user', avatarUrl: '/me.png' },
    });

    const playerState = createPlayerState();
    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector(playerState)
    );

    mockTrackMappers.fromTrackMetaData.mockReturnValue(mappedPlayerTrack as any);

    mockCommentService.getTrackComments.mockResolvedValue({
      content: [
        {
          id: 100,
          body: 'Top-level comment',
          timestampSeconds: 25,
          createdAt: '2025-01-01T00:00:00.000Z',
          user: { username: 'commenter-1', avatarUrl: '/u1.png' },
        },
        {
          id: 101,
          body: 'No timestamp comment',
          createdAt: '2025-01-01T00:00:00.000Z',
          user: { username: 'commenter-2', avatarUrl: '/u2.png' },
        },
      ],
    } as any);

    mockCommentService.getCommentReplies.mockResolvedValue({
      content: [
        {
          id: 200,
          body: 'Reply body',
          timestampSeconds: 40,
          createdAt: '2025-01-01T00:00:00.000Z',
          user: { username: 'replier', avatarUrl: '/r.png' },
        },
      ],
    } as any);
  });

  it.skip('sets error state for invalid track ids', async () => {
    const { result } = renderHook(() =>
      useTrackPage({ username: 'artist', trackId: 'bad-id' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.errorMessage).toBe('Invalid track id');
    expect(result.current.track).toBeNull();
    expect(result.current.comments).toEqual([]);
    expect(mockTrackService.getTrackMetadata).not.toHaveBeenCalled();
  });

  it('loads and maps track, comments, replies, and waveform comments', async () => {
    mockTrackService.getTrackMetadata.mockResolvedValue(buildMetadata() as any);

    const { result } = renderHook(() =>
      useTrackPage({ username: 'fallback-artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.track?.title).toBe('Track Page Title');
    expect(result.current.track?.duration).toBe('3:00');
    expect(result.current.track?.description).toBe('A test track description');
    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].replies).toHaveLength(1);
    expect(result.current.waveformComments).toEqual([
      {
        id: '100',
        timestamp: 25,
        comment: 'Top-level comment',
        user: { name: 'commenter-1', avatar: '/u1.png' },
      },
      {
        id: '200',
        timestamp: 40,
        comment: 'Reply body',
        user: { name: 'replier', avatar: '/r.png' },
      },
    ]);
    expect(result.current.currentUserAvatar).toBe('/me.png');
    expect(result.current.isError).toBe(false);
  });

  it('handles play/pause and waveform seek interactions', async () => {
    const playerState = {
      ...createPlayerState(),
      currentTrack: { id: 42 },
      isPlaying: true,
      currentTime: 10,
      duration: 180,
    };

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector(playerState)
    );

    mockTrackService.getTrackMetadata.mockResolvedValue(buildMetadata() as any);

    const { result } = renderHook(() =>
      useTrackPage({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onPlayPause();
    });

    expect(pause).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onWaveformSeek(1.2);
    });

    expect(seek).toHaveBeenCalledWith(180);

    const pausedState = {
      ...createPlayerState(),
      currentTrack: { id: 42 },
      isPlaying: false,
      currentTime: 10,
      duration: 180,
    };

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector(pausedState)
    );

    const { result: pausedResult } = renderHook(() =>
      useTrackPage({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(pausedResult.current.isLoading).toBe(false));

    act(() => {
      pausedResult.current.onWaveformSeek(0.5);
    });

    expect(playTrack).toHaveBeenCalled();
    expect(seek).toHaveBeenLastCalledWith(90);
  });

  it('optimistically updates likes/reposts and rolls back failed reposts', async () => {
    mockTrackService.getTrackMetadata.mockResolvedValue(
      buildMetadata({ likeCount: 5, repostCount: 2, isLiked: false, isReposted: false }) as any
    );

    mockTrackService.likeTrack.mockResolvedValue({ isLiked: true } as any);
    mockTrackService.repostTrack.mockRejectedValue(new Error('repost failed'));

    const { result } = renderHook(() =>
      useTrackPage({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.onLike();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(6);

    await act(async () => {
      await result.current.onRepost();
    });

    expect(result.current.isReposted).toBe(false);
    expect(result.current.repostCount).toBe(2);
  });

  it('submits comments and replies and updates local state', async () => {
    mockTrackService.getTrackMetadata.mockResolvedValue(buildMetadata() as any);

    mockCommentService.addTrackComment.mockResolvedValue({
      id: 300,
      body: 'new comment',
      timestampSeconds: 12,
      createdAt: '2025-01-01T00:00:00.000Z',
      user: { username: 'new-user', avatarUrl: '/new.png' },
    } as any);

    mockCommentService.replyToComment.mockResolvedValue({
      id: 301,
      body: 'new reply',
      timestampSeconds: 13,
      createdAt: '2025-01-01T00:00:00.000Z',
      user: { username: 'reply-user', avatarUrl: '/reply.png' },
    } as any);

    const { result } = renderHook(() =>
      useTrackPage({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.onCommentSubmit('   ');
    });

    expect(mockCommentService.addTrackComment).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onCommentSubmit('new comment');
    });

    expect(mockCommentService.addTrackComment).toHaveBeenCalledWith(42, {
      body: 'new comment',
      timestampSeconds: 0,
    });

    await act(async () => {
      await result.current.onReplySubmit('bad', 'new reply');
    });

    expect(mockCommentService.replyToComment).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onReplySubmit(100, 'new reply');
    });

    expect(mockCommentService.replyToComment).toHaveBeenCalledWith(100, {
      body: 'new reply',
      timestampSeconds: 0,
    });

    expect(
      result.current.comments.find((comment) => comment.id === 100)?.replies
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ body: 'new reply' }),
      ])
    );
  });

  it('resets state when loading fails', async () => {
    mockTrackService.getTrackMetadata.mockRejectedValue(new Error('load failed'));

    const { result } = renderHook(() =>
      useTrackPage({ username: 'artist', trackId: '42' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.track).toBeNull();
    expect(result.current.comments).toEqual([]);
    expect(result.current.waveformComments).toEqual([]);
    expect(result.current.likeCount).toBe(0);
    expect(result.current.repostCount).toBe(0);
  });
});
