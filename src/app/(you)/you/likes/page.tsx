'use client';

import PlaylistCard from '@/components/PlaylistCard';
import TrackCard from '@/components/TrackCard';
import { SearchBar } from '@/components/nav/SearchBar';
import Button from '@/components/buttons/Button';
import { LayoutGrid, List } from 'lucide-react';
import { useMemo, useState } from 'react';

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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterText, setFilterText] = useState('');

  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return mockPlaylists;
    const normalized = filterText.toLowerCase();
    return mockPlaylists.filter((item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.artist.toLowerCase().includes(normalized)
    );
  }, [filterText]);

  return (
    <section className="px-8 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="hidden sm:block font-extrabold">
          Hear the tracks you’ve liked:
        </h2>

        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">View</span>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setView('grid')}
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-10 h-9 p-0"
            >
              <LayoutGrid size={16} />
            </Button>

            <Button
              onClick={() => setView('list')}
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-10 h-9 p-0"
            >
              <List size={16} />
            </Button>
          </div>

          <SearchBar
            onSearch={(value: string) => setFilterText(value)}
            placeholder='Filter'
          />
        </div>
      </div>

      {/* GRID */}
      <div
        className={`grid gap-8 ${
          view === 'grid' ? 'grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]' : 'grid-cols-1'
        }`}
      >
        {filteredItems.map((item) =>
          view === 'grid' ? (
            <PlaylistCard
              key={item.id}
              title={item.title}
              coverUrl={item.image}
            />
          ) : (
            <TrackCard
              key={item.id}
              trackId={String(item.id)}
              user={{ name: item.artist, avatar: item.image }}
              track={{
                id: item.id,
                artist: item.artist,
                title: item.title,
                cover: item.image,
                duration: '2:45',
                genre: 'Pop',
              }}
              waveform={[]}
              showEditButton={false}
              showComments={false}
            />
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