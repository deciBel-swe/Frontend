'use client';
import SearchPage from '@/features/search/SearchPage';
import { mockPlaylists } from '@/features/search/mock/mockdata';

export default function PlaylistsPage() {
  return (
    <SearchPage
      tab="playlists"
      playlists={mockPlaylists}
      totalPlaylists={mockPlaylists.length}
      isLoading={false}
    />
  );
}