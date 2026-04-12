'use client';
import SearchPage from '@/features/search/SearchPage';
import { mockTracks, mockPlaylists, mockPeople } from '@/features/search/mock/mockdata';

export default function EverythingPage() {
  return (
    <SearchPage
      tab="everything"
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