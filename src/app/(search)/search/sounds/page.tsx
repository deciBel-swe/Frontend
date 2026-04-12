'use client';
import SearchPage from '@/features/search/SearchPage';
import { mockTracks } from '@/features/search/mock/mockdata';

export default function TracksPage() {
  return (
    <SearchPage
      tab="tracks"
      tracks={mockTracks}
      totalTracks={mockTracks.length}
      isLoading={false}
    />
  );
}