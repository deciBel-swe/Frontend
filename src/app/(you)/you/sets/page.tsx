'use client';

import PlaylistCard from '@/components/PlaylistCard';
import { SearchBar } from '@/components/nav/SearchBar';
import Button from '@/components/buttons/Button';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu } from '@/components/nav/DropdownMenu';

import { useMePlaylists } from '@/hooks/usePlaylists';
import type { PlaylistResponse } from '@/types/playlists';
type UIPlaylist = PlaylistResponse & {
  cover?: string;
  coverUrl?: string;
};

export default function Page() {
  const [selectedView, setSelectedView] = useState<'All' | 'Created' | 'Liked'>(
    'All'
  );
  const [filterText, setFilterText] = useState('');

  // Fetch real playlists from the backend
  const { data: playlists, isLoading } = useMePlaylists();

  const filteredItems = useMemo(() => {
    if (!playlists) return [];

    const items = playlists as UIPlaylist[];

    if (!filterText.trim()) return items;

    const normalized = filterText.toLowerCase();
    return items.filter(
      (item: PlaylistResponse) =>
        item.title?.toLowerCase().includes(normalized) ||
        item.owner?.username?.toLowerCase().includes(normalized)
    );
  }, [playlists, filterText]);

  // ─── VIEW MENU DROPDOWN ──────────────────────────────
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement | null>(null);

  const toggleViewMenu = () => setViewMenuOpen((prev) => !prev);
  const closeViewMenu = () => setViewMenuOpen(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(event.target as Node)
      ) {
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
                {selectedView} {/* Shows the label dynamically */}
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

      {/* CONTENT AREA */}
      {isLoading ? (
        <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`loading-${i}`}
              className="w-full aspect-square rounded-lg bg-surface-raised animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {filteredItems.length > 0 ? (
            // Remove the explicit type here too!
            filteredItems.map((item) => (
              <PlaylistCard
                key={item.id}
                title={item.title}
                coverUrl={
                  item.cover ||
                  item.coverUrl ||
                  '/images/default_song_image.png'
                }
              />
            ))
          ) : (
            <p className="text-text-muted col-span-full">No playlists found.</p>
          )}

          {/* EMPTY PLACEHOLDERS */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-full aspect-square rounded-lg bg-transparent"
            />
          ))}
        </div>
      )}
    </section>
  );
}
