'use client';
import SearchResults from '@/features/search/SearchResults';
import { useSearchNavigation } from '@/features/search/hooks/useSearchNavigation';
import { mockTracks } from '@/features/search/mock/mockdata';

export default function TracksPage() {
  const { query } = useSearchNavigation();

  return (
    <SearchResults
      tab="tracks"
      query={query}
      tracks={mockTracks}
      totalTracks={mockTracks.length}
      isLoading={false}
    />
  );
}