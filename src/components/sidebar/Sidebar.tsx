'use client';

import React from 'react';
import TrackRow from '@/components/sidebar/TrackRow';
import SidebarArtistCard from '@/components/sidebar/SidebarArtistCard';
import { Link } from 'lucide-react';

type SidebarProps = {
  artists: {
    name: string;
    followers: number;
    tracks: number;
    imageUrl?: string;
    artistUrl?: string;
  }[];

  history: {
    image: string;
    artist: string;
    title: string;
    stats: {
      plays: string;
      likes: string;
      reposts: string;
      comments: string;
    };
  }[];
};

export default function Sidebar({ artists, history }: SidebarProps) {
  return (
    <aside className="w-[340px] flex flex-col gap-6 sticky top-20 h-fit">
      {/* ================= ARTISTS ================= */}
      <section>
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
          <h4 className="text-sm font-semibold text-gray-400">
            Artists you should follow
          </h4>

          <button className="text-xs text-gray-400 hover:text-white transition">
            Refresh list
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {artists.map((artist, i) => (
            <SidebarArtistCard key={i} {...artist} />
          ))}
        </div>
      </section>

      {/* ================= HISTORY ================= */}
      <section>
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
          <h4 className="text-sm font-semibold text-gray-400">
            Listening history
          </h4>

          <Link
            href="/you/history"
            className="text-xs text-gray-400 hover:text-white transition"
          >
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-3 mt-4 max-h-[420px] overflow-y-auto pr-1">
          {history.map((track, i) => (
            <TrackRow key={i} {...track} />
          ))}
        </div>
      </section>
    </aside>
  );
}
