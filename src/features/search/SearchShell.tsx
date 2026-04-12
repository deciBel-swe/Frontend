'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import SearchSidebar, { type SearchTab } from '@/features/search/SearchSidebar';
import SearchResults from '@/features/search/SearchResults';
import type { TrackCardProps } from '@/components/tracks/track-card';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { UserCardData } from '@/features/social/components/UserCard';

const TAB_TO_PATH: Record<SearchTab, string> = {
  everything: '/search',
  tracks:     '/search/sounds',
  people:     '/search/people',
  albums:     '/search/albums',
  playlists:  '/search/sets',
};

const PATH_TO_TAB: Record<string, SearchTab> = {
  '/search':         'everything',
  '/search/sounds':  'tracks',
  '/search/people':  'people',
  '/search/albums':  'albums',
  '/search/sets':    'playlists',
};

interface SearchShellProps {
  tab?: SearchTab;
}

export default function SearchShell({ tab }: SearchShellProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const query      = searchParams.get('q') ?? '';
  const currentTab: SearchTab = tab ?? PATH_TO_TAB[pathname] ?? 'everything';

  const buildUrl = useCallback(
    (path: string, params: Record<string, string>) => {
      const qs = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v) qs.set(k, v);
        else qs.delete(k);
      });
      return `${path}?${qs.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (tab: SearchTab) => {
      router.push(buildUrl(TAB_TO_PATH[tab], {}));
    },
    [router, buildUrl],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      router.push(buildUrl(pathname, { [key]: value }));
    },
    [router, buildUrl, pathname],
  );

  const activeFilters: Record<string, string> = {
    genre:  searchParams.get('genre')  ?? '',
    date:   searchParams.get('date')   ?? '',
    length: searchParams.get('length') ?? '',
  };

  const tracks: TrackCardProps[]    = [
    {
      trackId: '1',
      track: { id: 1, title: 'Summer Vibes', artist: 'Artist One', cover: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', duration: '3:12', genre: 'Rap', plays: 63_400_000, comments: 6_486, likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
      user: { username: 'artistone', displayName: 'Artist One', avatar: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
      waveform: [],
      showHeader: true,
    },
    {
      trackId: '2',
      track: { id: 2, title: 'Rhythmic Beats', artist: 'Artist Two', cover: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', duration: '4:05', genre: 'Electronic', plays: 3_200_000, comments: 241, likeCount: 1_200, repostCount: 80, isLiked: false, isReposted: false },
      user: { username: 'artisttwo', displayName: 'Artist Two', avatar: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
      waveform: [],
      showHeader: true,
    },
  ];

  const playlists: PlaylistHorizontalProps[] = [
    {
      trackId: '201',
      track: { id: 201, title: 'Chill Mix', artist: 'artist1', cover: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', duration: '0:00', plays: 0, comments: 0, likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
      user: { username: 'user1', displayName: 'test user', avatar: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
      waveform: [],
      showHeader: true,
      relatedTracks: [
        { id: 1, title: 'Ocean Waves', artist: 'Artist Two', coverUrl: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', plays: '73.5M' },
        { id: 2, title: 'Melodic Tune', artist: 'Artist Four', coverUrl: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', plays: '2.3M' },
      ],
    },
  ];

  const people: UserCardData[] = [
    { id: 'u1', username: 'jordansmith', displayName: 'Jordan Smith', followerCount: 12_400, isVerified: true, isFollowing: false },
    { id: 'u2', username: 'samtaylor', displayName: 'Sam Taylor', followerCount: 3_800, isVerified: false, isFollowing: true },
    { id: 'u3', username: 'musicapp', displayName: 'Music App', followerCount: 980_000, isVerified: true, isFollowing: false },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3rem)] mt-12 bg-bg-base">
      <aside className="w-full lg:w-[220px] xl:w-[260px] shrink-0 pt-8 pb-8 lg:sticky lg:top-12 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <SearchSidebar
          currentTab={currentTab}
          query={query}
          onTabChange={handleTabChange}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </aside>

      <main className="flex-1 min-w-0 px-4 lg:px-8 pt-8 pb-16">
        {query ? (
          <SearchResults
            tab={currentTab}
            query={query}
            tracks={tracks}
            playlists={playlists}
            people={people}
          />
        ) : (
          <p className="text-sm text-text-muted pt-8">
            Start typing to search for tracks, playlists, or people.
          </p>
        )}
      </main>
    </div>
  );
}
