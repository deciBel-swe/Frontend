'use client';
import SearchResults from '@/features/search/SearchResults';
import { useSearchNavigation } from '@/features/search/hooks/useSearchNavigation';
import { mockTracks, mockPlaylists, mockPeople } from '@/features/search/mock/mockdata';

export default function EverythingPage() {
  const { query } = useSearchNavigation();

  return (
    <SearchResults
      tab="everything"
      query={query}
      tracks={mockTracks}
      playlists={mockPlaylists}
      people={mockPeople}
      totalTracks={mockTracks.length}
      totalPlaylists={mockPlaylists.length}
      totalPeople={mockPeople.length}
      isLoading={false}
    />
  );
}