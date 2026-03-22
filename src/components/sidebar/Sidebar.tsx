'use client';

import React from 'react';
import ListOfArtistCards from './ListOfArtistCards';
import ListOfTrackRows from './ListOfTrackRows'

type SidebarProps = {
  History_header: string
  Artist_header: string
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

export default function Sidebar({ artists, history, Artist_header, History_header }: SidebarProps) {
  return (
    <aside className="w-[340px] flex flex-col gap-6 sticky top-20 h-fit">
        {/* ================= ARTISTS ================= */}
      <ListOfArtistCards 
      headerUrl='/feed#'
      artists={artists}
      Artist_header={Artist_header}
      />
      {/* ================= HISTORY ================= */}
      <ListOfTrackRows 
      headerUrl='/you/history'
      history={history}
      History_header={History_header}
      />
    </aside>
  );
}
