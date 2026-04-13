import type { TrackListItem } from '@/components/tracks/TrackList';
import type { PlayerTrack, QueueSource } from '@/features/player/contracts/playerContracts';

// ─── Shared types ─────────────────────────────────────────────────────────────

// ─── Playlist shape (mirrors MinimalPlaylistCard props) ──────────────────────
export type DiscoverPlaylistItem = {
  id: string | number;
  title: string;
  coverUrl: string;
  username?: string;
  sets?: boolean;
};
//Wrapper type that pairs a TrackListItem with its queue context 
export type DiscoverTrackItem = {
  item: TrackListItem;
  queueTracks: PlayerTrack[];
  queueSource?: QueueSource;
};
