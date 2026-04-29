import { render, screen } from '@testing-library/react';

import TrackList, { type TrackListItem } from '@/components/tracks/TrackList';

jest.mock('@/hooks/useUserTracks', () => ({
  useUserTracks: () => ({
    tracks: [],
    isLoading: false,
    isError: false,
    hasMore: false,
    isPaginating: false,
    sentinelRef: undefined,
  }),
}));

jest.mock('@/features/prof/context/ProfileOwnerContext', () => ({
  useProfileOwnerContext: () => undefined,
}));

jest.mock('@/components/pagination/InfiniteScrollPagination', () => () => null);

jest.mock('@/components/tracks/track-card/TrackCard', () => ({
  __esModule: true,
  default: ({ playback }: { playback?: { trackUrl?: string; access?: string } }) => (
    <div
      data-testid="track-card"
      data-track-url={playback?.trackUrl ?? ''}
      data-access={playback?.access ?? ''}
    />
  ),
}));

describe('TrackList preview playback mapping', () => {
  it('uses the preview url for preview-access tracks', () => {
    const tracks: TrackListItem[] = [
      {
        trackId: '42',
        user: {
          username: 'artist',
          displayName: 'Artist',
          avatar: '/artist.png',
        },
        track: {
          id: 42,
          artist: {
            username: 'artist',
            displayName: 'Artist',
            avatar: '/artist.png',
          },
          title: 'Preview Track',
          cover: '/cover.png',
          duration: '0:10',
          secretToken: '',
        },
        trackUrl: 'https://decibel.test/full.mp3',
        trackPreviewUrl: 'https://decibel.test/preview.mp3',
        access: 'PREVIEW',
        waveform: [],
      },
    ];

    render(<TrackList tracks={tracks} />);

    expect(screen.getByTestId('track-card')).toHaveAttribute(
      'data-track-url',
      'https://decibel.test/preview.mp3'
    );
    expect(screen.getByTestId('track-card')).toHaveAttribute(
      'data-access',
      'PREVIEW'
    );
  });
});
