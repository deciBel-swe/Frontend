import { renderHook, waitFor } from '@testing-library/react';
import { useFeedTracks } from '@/hooks/useFeedTracks';
import { trackService } from '@/services';

// Mock the backend service
jest.mock('@/services', () => ({
  trackService: { getAllTracks: jest.fn() },
}));

describe('useFeedTracks (Data Transformation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('decouples the artist avatar from the track cover art using the default fallback', async () => {
    // 1. Mock the API returning a track where the cover art is explicitly set
    (trackService.getAllTracks as jest.Mock).mockResolvedValue([
      {
        id: 101,
        title: 'Test Track',
        artist: { username: 'mockartist' },
        coverUrl: 'https://real-track-cover.jpg',
        waveformData: [],
      },
    ]);

    const { result } = renderHook(() => useFeedTracks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const transformedTrack = result.current.feedTracks[0];

    // 2. Assert the track cover remains intact
    expect(transformedTrack.track.cover).toBe('https://real-track-cover.jpg');

    // 3. Assert the Layer 3 fix: The user avatar is swapped to the default image!
    expect(transformedTrack.user.avatar).toBe('/images/default_song_image.png');
  });
});
