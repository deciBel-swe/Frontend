import { paginatedPlaylistsResponseSchema } from '@/types/playlists';

describe('paginatedPlaylistsResponseSchema', () => {
  it('normalizes a single playlist response', () => {
    const parsed = paginatedPlaylistsResponseSchema.parse({
      id: 49,
      title: 'akmal',
      type: 'PLAYLIST',
      isLiked: false,
      description: '',
      isPrivate: false,
      coverArtUrl: null,
      playlistSlug: 'akmal-7',
      totalDurationSeconds: 0,
      trackCount: 0,
      owner: {
        id: 23,
        username: 'akmalemad05',
        displayName: 'akmal.emad05',
        avatarUrl: null,
        isFollowing: false,
        followerCount: 2,
        trackCount: 0,
      },
      genres: [],
      createdAt: '2026-04-29T21:52:07.278124',
      trackSummaryDto: [],
      firstTrackWaveformUrl: null,
    });

    expect(parsed.content).toHaveLength(1);
    expect(parsed.content[0]).toMatchObject({
      id: 49,
      title: 'akmal',
      playlistSlug: 'akmal-7',
      trackCount: 0,
    });
    expect(parsed.pageNumber).toBe(0);
    expect(parsed.pageSize).toBe(1);
    expect(parsed.totalElements).toBe(1);
    expect(parsed.totalPages).toBe(1);
    expect(parsed.isLast).toBe(true);
  });

  it('normalizes plain array playlist responses', () => {
    const parsed = paginatedPlaylistsResponseSchema.parse([
      {
        id: 42,
        title: 'Night Drive',
      },
    ]);

    expect(parsed).toEqual({
      content: [
        {
          id: 42,
          title: 'Night Drive',
          tracks: [],
          isLiked: false,
          isReposted: false,
        },
      ],
      pageNumber: 0,
      pageSize: 1,
      totalElements: 1,
      totalPages: 1,
      isLast: true,
    });
  });

  it('normalizes paginated playlist responses', () => {
    const parsed = paginatedPlaylistsResponseSchema.parse({
      content: [
        {
          id: 7,
          title: 'Focus Set',
        },
      ],
      number: 2,
      size: 10,
      totalElements: 21,
      totalPages: 3,
      last: false,
    });

    expect(parsed).toEqual({
      content: [
        {
          id: 7,
          title: 'Focus Set',
          tracks: [],
          isLiked: false,
          isReposted: false,
        },
      ],
      pageNumber: 2,
      pageSize: 10,
      totalElements: 21,
      totalPages: 3,
      isLast: false,
    });
  });
});
