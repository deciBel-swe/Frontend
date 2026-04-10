'use client';

import PlaylistCard from '@/components/playlist/MinimalPlaylistCard';
import { SearchBar } from '@/components/nav/SearchBar';
import Button from '@/components/buttons/Button';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu } from '@/components/nav/DropdownMenu';

const mockPlaylists = [
  {
    id: 1,
    title: 'The Beauty of Existence',
    artist: 'Muhammad Al Muqit',
    image: 'https://i1.sndcdn.com/artworks-000523960650-2nc5nm-t500x500.jpg',
  },
  {
    id: 2,
    title: 'A Flower',
    artist: 'Double Vision',
    image: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg',
  },
  {
    id: 3,
    title: 'Al-Aqsa',
    artist: 'Palestine',
    image: 'https://i1.sndcdn.com/artworks-000034240364-u9zoa8-t500x500.jpg',
  },
];

export default function Page() {
  const [selectedView, setSelectedView] = useState<'All' | 'Created' | 'Liked'>('All');
  const [filterText, setFilterText] = useState('');

  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return mockPlaylists;
    const normalized = filterText.toLowerCase();
    return mockPlaylists.filter((item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.artist.toLowerCase().includes(normalized)
    );
  }, [filterText]);

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
        {filteredItems.map((item) =>
           (
            <PlaylistCard key={item.id} title={item.title} coverUrl={item.image} />
          ) 
        )}

        {/* EMPTY PLACEHOLDERS */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-full aspect-square rounded-lg bg-surface-dark/70"
          />
        ))}
      </div>
    </section>
  );
}