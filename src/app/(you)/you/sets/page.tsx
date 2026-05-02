'use client';

import PlaylistCard from '@/components/playlist/MinimalPlaylistCard';
import { SearchBar } from '@/components/nav/SearchBar';
import Button from '@/components/buttons/Button';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu } from '@/components/nav/DropdownMenu';
import { useUserPlaylistsPage } from '@/hooks/useUserPlaylistsPage';
import { useAuth } from '@/features/auth';

export default function Page() {
  const [selectedView, setSelectedView] = useState<'All' | 'Created' | 'Liked'>('All');
  const [filterText, setFilterText] = useState('');

  // Get current user from auth
  const { user } = useAuth();
  const username = user?.username ?? '';

  // Fetch playlists for current user
  const { cards: playlists, isLoading, isError } = useUserPlaylistsPage({
    username,
    page: 0,
    size: 24,
    infinite: false,
  });

  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return playlists;
    const normalized = filterText.toLowerCase();
    return playlists.filter((item) =>
      item.track?.title?.toLowerCase().includes(normalized)
    );
  }, [filterText, playlists]);

  // ─── VIEW MENU DROPDOWN ──────────────────────────────
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement | null>(null);

  const toggleViewMenu = () => setViewMenuOpen((prev) => !prev);
  const closeViewMenu = () => setViewMenuOpen(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        closeViewMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="px-8 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="hidden sm:block font-extrabold">
          Hear your own playlists and the playlists you’ve liked:
        </h2>

        <div className="flex items-center gap-4">
          <SearchBar
            onSearch={(value: string) => setFilterText(value)}
            placeholder="Filter"
          />

          <div className="flex items-center gap-2">
            <div className="relative" ref={viewMenuRef}>
<Button
  onClick={toggleViewMenu}
  variant="ghost"
  size="sm"
  className="flex items-center gap-2 h-9"
>
  {selectedView}  {/* Shows the label dynamically */}
  <ChevronDown
    size={14}
    className={`transition-transform duration-200 ${
      viewMenuOpen ? 'rotate-180' : 'rotate-0'
    }`}
  />
</Button>

{viewMenuOpen && (
  <DropdownMenu
    items={[
      {
        label: 'All',
        href: '#',
        onClick: () => {
          setSelectedView('All');
          closeViewMenu();
        },
      },
      {
        label: 'Created',
        href: '#',
        onClick: () => {
          setSelectedView('Created');
          closeViewMenu();
        },
      },
      {
        label: 'Liked',
        href: '#',
        onClick: () => {
          setSelectedView('Liked');
          closeViewMenu();
        },
      },
    ]}
    onClose={closeViewMenu}
  />
)}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {isLoading && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`loading-${i}`}
                className="w-full aspect-square rounded-lg bg-surface-dark/70 animate-pulse"
              />
            ))}
          </>
        )}

        {!isLoading && isError && (
          <div className="col-span-full text-center text-text-muted py-8">
            Failed to load playlists. Please try again later.
          </div>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="col-span-full text-center text-text-muted py-8">
            No playlists found.
          </div>
        )}

        {!isLoading && !isError && filteredItems.map((item) =>
          item.track ? (
            <PlaylistCard 
              key={item.trackId} 
              title={item.track.title} 
              coverUrl={item.track.cover}
              username={item.user?.username}
            />
          ) : null
        )}

        {/* EMPTY PLACEHOLDERS */}
        {!isLoading && filteredItems.length > 0 && Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-full aspect-square rounded-lg bg-surface-dark/70"
          />
        ))}
      </div>
    </section>
  );
}