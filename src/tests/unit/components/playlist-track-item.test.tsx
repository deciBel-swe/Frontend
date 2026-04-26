import { render, screen } from '@testing-library/react';
import PlaylistTrackItem from '@/components/playlist-page/components/PlaylistTrackItem';

jest.mock('@/components/tracks/actions/TrackActions', () => {
  return function MockTrackActions() {
    return <div data-testid="track-actions" />;
  };
});

jest.mock('@/components/sidebar/HoverPlayImage', () => ({
  HoverPlayImage: ({ alt }: { alt: string }) => <div data-testid="hover-play-image">{alt}</div>,
}));

describe('PlaylistTrackItem', () => {
  const baseProps = {
    index: 0,
    isPlaying: false,
    isActive: false,
    onPlay: jest.fn(),
  };

  it('builds artist and track links from username', () => {
    render(
      <PlaylistTrackItem
        {...baseProps}
        track={{
          id: 7,
          trackSlug: 'night-drive',
          artistUsername: 'artist.user',
          artist: 'Artist User',
          title: 'Night Drive',
        }}
      />
    );

    expect(screen.getByRole('link', { name: 'Artist User' })).toHaveAttribute(
      'href',
      '/artist.user'
    );
    expect(screen.getByRole('link', { name: 'Night Drive' })).toHaveAttribute(
      'href',
      '/artist.user/night-drive'
    );
  });

  it('does not derive links from display text when username is missing', () => {
    render(
      <PlaylistTrackItem
        {...baseProps}
        track={{
          id: 7,
          trackSlug: 'night-drive',
          artist: 'Artist Display Name',
          title: 'Night Drive',
        }}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Artist Display Name' })
    ).toHaveAttribute('href', '/people');
    expect(screen.getByRole('link', { name: 'Night Drive' })).toHaveAttribute(
      'href',
      '/feed'
    );
  });
});
