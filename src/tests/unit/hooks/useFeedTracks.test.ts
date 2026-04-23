import { renderHook, waitFor } from '@testing-library/react';
import { useFeedTracks } from '@/hooks/useFeedTracks';
import { feedService } from '@/services';

// Mock the backend service
jest.mock('@/services', () => ({
  feedService: { getfeed: jest.fn() },
}));

describe('useFeedTracks (Data Transformation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('decouples the artist avatar from the track cover art using the default fallback', async () => {
    // 1. Mock a feed item with a track that has cover art but no artist avatar.
    (feedService.getfeed as jest.Mock).mockResolvedValue({
      content: [
        {
          id: 1,
          type: 'TRACK_POSTED',
          createdAt: '2025-01-01T00:00:00.000Z',
          resource: {
            resourceType: 'TRACK',
            resourceId: 101,
            playlist: null,
            user: null,
            track: {
              id: 101,
              title: 'Test Track',
              artist: {
                username: 'mockartist',
                displayName: 'Mock Artist',
                avatarUrl: '',
              },
              coverUrl: 'https://real-track-cover.jpg',
              trackUrl: 'https://cdn.example.com/test-track.mp3',
              waveformData: [],
              waveformUrl: null,
              trackDurationSeconds: 60,
              playCount: 0,
              commentCount: 0,
              genre: 'electronic',
              access: 'PLAYABLE',
              isLiked: false,
              isReposted: false,
              likeCount: 0,
              repostCount: 0,
              uploadDate: '2025-01-01T00:00:00.000Z',
            },
          },
        },
      ],
    });

    const { result } = renderHook(() => useFeedTracks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const transformedTrack = result.current.feedItems.find(
      (item) => item.kind === 'track'
    );

    expect(transformedTrack).toBeDefined();
    if (!transformedTrack || transformedTrack.kind !== 'track') {
      throw new Error('Expected a mapped track feed item');
    }

    // 2. Assert the track cover remains intact
    expect(transformedTrack.card.track.cover).toBe('https://real-track-cover.jpg');

    // 3. Assert the Layer 3 fix: The user avatar is swapped to the default image!
    expect(transformedTrack.card.user.avatar).toBe(
      '/images/default_song_image.png'
    );
  });

  it('preserves repost actor avatar metadata for reposted track cards', async () => {
    (feedService.getfeed as jest.Mock).mockResolvedValue({
      content: [
        {
          id: 2,
          type: 'TRACK_REPOSTED',
          createdAt: '2025-01-02T00:00:00.000Z',
          repostedBy: {
            id: 7,
            username: 'reposter',
            displayName: 'Reposter',
            avatarUrl: 'https://cdn.example.com/reposter.jpg',
            isFollowing: false,
            followerCount: 0,
            trackCount: 0,
          },
          resource: {
            resourceType: 'TRACK',
            resourceId: 202,
            playlist: null,
            user: null,
            track: {
              id: 202,
              title: 'Reposted Track',
              artist: {
                username: 'artist',
                displayName: 'Artist',
                avatarUrl: 'https://cdn.example.com/artist.jpg',
              },
              coverUrl: 'https://cdn.example.com/cover.jpg',
              trackUrl: 'https://cdn.example.com/reposted-track.mp3',
              waveformData: [],
              waveformUrl: null,
              trackDurationSeconds: 60,
              playCount: 0,
              commentCount: 0,
              genre: 'house',
              access: 'PLAYABLE',
              isLiked: false,
              isReposted: true,
              likeCount: 0,
              repostCount: 0,
              uploadDate: '2025-01-02T00:00:00.000Z',
            },
          },
        },
      ],
    });

    const { result } = renderHook(() => useFeedTracks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const transformedTrack = result.current.feedItems.find(
      (item) => item.kind === 'track'
    );

    expect(transformedTrack).toBeDefined();
    if (!transformedTrack || transformedTrack.kind !== 'track') {
      throw new Error('Expected a mapped reposted track feed item');
    }

    expect(transformedTrack.card.repostedBy).toEqual({
      username: 'reposter',
      displayName: 'Reposter',
      avatar: 'https://cdn.example.com/reposter.jpg',
    });
  });
});
