'use client';
import SearchResults from '@/features/search/SearchResults';
import { useSearchNavigation } from '@/features/search/hooks/useSearchNavigation';
import { mockPlaylists } from '@/features/search/mock/mockdata';

export default function PlaylistsPage() {
  const { query } = useSearchNavigation();

  return (
    <SearchResults
      tab="playlists"
      query={query}
      playlists={mockPlaylists}
      totalPlaylists={mockPlaylists.length}
      isLoading={false}
    />
  );
}