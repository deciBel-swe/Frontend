'use client';

import Button from '@/components/buttons/Button';
import Image from 'next/image';

export type PlaylistItem = {
  id: string;
  title: string;
  trackCount: number;
  isPrivate?: boolean;
  coverUrl?: string;
};

export type AddToPlaylistTabProps = {
  playlists: PlaylistItem[];
  filterValue: string;
  onFilterChange: (value: string) => void;
  onAddToPlaylist: (playlistId: string) => void;
};

export default function AddToPlaylistTab({
  playlists,
  filterValue,
  onFilterChange,
  onAddToPlaylist,
}: AddToPlaylistTabProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <input
        type="text"
        placeholder="Filter playlists"
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        className="w-full px-3 py-2 rounded bg-bg-elevated border border-interactive-default text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
      />

      <div className="flex flex-col gap-1">
        {playlists.length === 0 ? (
          <p className="text-text-muted text-[13px] py-4 text-center">No playlists found.</p>
        ) : (
          playlists.map((pl) => (
            <PlaylistRow key={pl.id} playlist={pl} onAdd={() => onAddToPlaylist(pl.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function PlaylistRow({ playlist, onAdd }: { playlist: PlaylistItem; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2 rounded hover:bg-interactive-default/10 transition-colors">
      <div className="w-12 h-12 rounded overflow-hidden bg-bg-elevated shrink-0">
        {playlist.coverUrl
          ? <Image 
              src={playlist.coverUrl} 
              alt={playlist.title} 
              width={48} 
              height={48} 
              className="w-full h-full object-cover" 
            />
          : <div className="w-full h-full bg-interactive-default/20" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary truncate">{playlist.title}</p>
        <p className="text-[12px] text-text-muted">{playlist.trackCount}</p>
      </div>
      {playlist.isPrivate && (
        <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wide shrink-0">
          Private
        </span>
      )}
      <Button variant="secondary_inverse" onClick={onAdd} className="shrink-0 text-[12px] px-3 py-1.5">
        Add to Playlist
      </Button>
    </div>
  );
}