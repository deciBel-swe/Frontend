import { buildPlaylistHref } from '@/utils/socialRoutes';

describe('buildPlaylistHref', () => {
  it('uses the owner username for playlist routes', () => {
    expect(
      buildPlaylistHref({
        id: 42,
        playlistSlug: 'late-night-set',
        owner: {
          username: 'dj-user',
          displayName: 'DJ User',
        },
      } as any)
    ).toBe('/dj-user/sets/late-night-set');
  });

  it('does not fall back to display name when username is missing', () => {
    expect(
      buildPlaylistHref({
        id: 42,
        playlistSlug: 'late-night-set',
        owner: {
          displayName: 'DJ User',
        },
      } as any)
    ).toBe('/feed');
  });
});
