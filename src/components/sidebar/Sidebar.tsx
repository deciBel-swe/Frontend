'use client';

import ListOfArtistCards from './ListOfArtistCards';
import ListOfTrackRows from './ListOfTrackRows'
import { useFeedSidebar } from '@/hooks/useFeedSidebar';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';

type SidebarProps = {
  History_header: string
  Artist_header: string
  artists?: {
    id?: number;
    name: string;
    followers: number;
    tracks: number;
    isFollowing?: boolean;
    imageUrl?: string;
    artistUrl?: string;
  }[];

  history?: {
    trackId?: string | number;
    image: string;
    artist: string;
    title: string;
    playback?: PlayerTrack;
    stats: {
      plays: string;
      likes: string;
      reposts: string;
      comments: string;
    };
  }[];
};

export default function Sidebar({ artists, history, Artist_header, History_header }: SidebarProps) {
  const {
    artists: hookArtists,
    history: hookHistory,
  } = useFeedSidebar();

  const resolvedArtists = artists ?? hookArtists;
  const resolvedHistory = history ?? hookHistory;

  return (
    <aside className="w-85 flex flex-col gap-6 sticky top-20 h-fit">
        {/* ================= ARTISTS ================= */}
      <ListOfArtistCards 
      headerUrl='/feed#'
      artists={resolvedArtists}
      Artist_header={Artist_header}
      />
      {/* ================= HISTORY ================= */}
      <ListOfTrackRows 
      headerUrl='/you/history'
      history={resolvedHistory}
      History_header={History_header}
      queueSource='feed'
      />
    </aside>
  );
}
