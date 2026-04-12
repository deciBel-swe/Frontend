'use client';
import SearchPage from '@/features/search/SearchPage';
import { mockPlaylists } from '@/features/search/mock/mockdata';

export default function AlbumsPage() {
  return (
    <SearchPage
      tab="albums"
      playlists={mockPlaylists}
      totalPlaylists={mockPlaylists.length}
      isLoading={false}
    />
  );
}