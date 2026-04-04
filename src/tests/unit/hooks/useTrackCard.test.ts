import { act, renderHook, waitFor } from '@testing-library/react';

import { useTrackCard } from '@/hooks/useTrackCard';
import { commentService, trackService } from '@/services';

jest.mock('@/services', () => ({
  trackService: {
    getTrackMetadata: jest.fn(),
    likeTrack: jest.fn(),
    unlikeTrack: jest.fn(),
    repostTrack: jest.fn(),
    unrepostTrack: jest.fn(),
    deleteTrack: jest.fn(),
  },
  commentService: {
    getTrackComments: jest.fn(),
    addTrackComment: jest.fn(),
  },
}));

const mockTrackService = trackService as jest.Mocked<typeof trackService>;
const mockCommentService = commentService as jest.Mocked<typeof commentService>;

describe('useTrackCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockTrackService.getTrackMetadata.mockResolvedValue({
      likeCount: 3,
      repostCount: 2,
      isLiked: false,
      isReposted: false,
    } as any);

    mockCommentService.getTrackComments.mockResolvedValue({
      content: [
        {
          id: 1,
          body: 'First timed',
          timestampSeconds: 20,
          user: { username: 'u1', avatarUrl: '/u1.png' },
        },
        {
          id: 2,
          body: 'Not timed',
          user: { username: 'u2', avatarUrl: '/u2.png' },
        },
      ],
    } as any);
  });

  it('loads engagement values and timed comments', async () => {
    const { result } = renderHook(() => useTrackCard({ trackId: 42 }));

    await waitFor(() => expect(result.current.likeCount).toBe(3));

    expect(result.current.repostCount).toBe(2);
    expect(result.current.timedComments).toEqual([
      {
        id: '1',
        timestamp: 20,
        comment: 'First timed',
        user: { name: 'u1', avatar: '/u1.png' },
      },
    ]);
  });

  it('handles pending comment flow and submits a timed comment', async () => {
    mockCommentService.addTrackComment.mockResolvedValue({
      id: 10,
      body: 'new timed',
      timestampSeconds: 15,
      user: { username: 'me', avatarUrl: '/me.png' },
    } as any);

    const { result } = renderHook(() => useTrackCard({ trackId: 42 }));

    await waitFor(() => expect(result.current.likeCount).toBe(3));

    act(() => {
      result.current.selectTimestamp(15);
      result.current.setPendingText('new timed');
    });

    act(() => {
      result.current.onCommentInputFocus();
    });

    expect(result.current.pendingTimestamp).toBe(15);
    expect(result.current.showCommentInput).toBe(true);
    expect(result.current.waveformTimedCommentsVisible).toBe(true);

    await act(async () => {
      await result.current.submitTimedComment('   ');
    });

    expect(mockCommentService.addTrackComment).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.submitTimedComment('new timed');
    });

    expect(mockCommentService.addTrackComment).toHaveBeenCalledWith(42, {
      body: 'new timed',
      timestampSeconds: 15,
    });

    expect(result.current.pendingTimestamp).toBeNull();
    expect(result.current.showCommentInput).toBe(false);
    expect(result.current.timedComments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ comment: 'new timed' }),
      ])
    );
  });

  it('optimistically updates likes/reposts and rolls back failed updates', async () => {
    mockTrackService.likeTrack.mockResolvedValue({ isLiked: true } as any);
    mockTrackService.repostTrack.mockRejectedValue(new Error('repost fail'));

    const { result } = renderHook(() =>
      useTrackCard({
        trackId: 42,
        initialLikeCount: 1,
        initialRepostCount: 1,
        initialIsLiked: false,
        initialIsReposted: false,
      })
    );

    await waitFor(() => expect(result.current.likeCount).toBe(3));

    await act(async () => {
      await result.current.onLike();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(4);

    await act(async () => {
      await result.current.onRepost();
    });

    expect(result.current.isReposted).toBe(false);
    expect(result.current.repostCount).toBe(2);
  });

  it('deletes a track and emits the update event', async () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    mockTrackService.deleteTrack.mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useTrackCard({ trackId: 42 }));

    await waitFor(() => expect(result.current.likeCount).toBe(3));

    await act(async () => {
      await result.current.onDeleteTrack();
    });

    expect(mockTrackService.deleteTrack).toHaveBeenCalledWith(42);
    expect(result.current.isDeleted).toBe(true);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('resets state when loading engagement fails', async () => {
    mockTrackService.getTrackMetadata.mockRejectedValue(new Error('load fail'));

    const { result } = renderHook(() => useTrackCard({ trackId: 42 }));

    await waitFor(() => expect(result.current.likeCount).toBe(0));

    expect(result.current.timedComments).toEqual([]);
    expect(result.current.isLiked).toBe(false);
    expect(result.current.isReposted).toBe(false);
  });
});
