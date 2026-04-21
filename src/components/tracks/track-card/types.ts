'use client';

import type { Track as CompactTrackListTrack } from '@/components/compact-tracks/CompactTrackList';
import type { TrackCardPlaybackData } from '@/features/player/components/playerComponent.contracts';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';

export type TrackCardUser = {
  username: string;
  displayName?: string;
  avatar: string;
};

export type TrackCardTrack = {
  id: number;
  trackSlug?: string;
  playlistSlug?: string;
  artistUsername?: string;
  artist: string;
  title: string;
  cover: string;
  duration: string;
  waveformUrl?: string;
  plays?: number;
  comments?: number;
  createdAt?: string;
  genre?: string;
  isLiked?: boolean;
  isReposted?: boolean;
  likeCount?: number;
  repostCount?: number;
};

export type TrackCardProps = {
  trackId: string;
  isPrivate?: boolean;
  user: TrackCardUser;
  postedText?: string;
  showEditButton?: boolean;
  repostedBy?: {
    username: string;
    displayName?: string;
  };
  currentUserAvatar?: string;
  showTrackList?: boolean;
  showHeader?: boolean;
  track: TrackCardTrack;
  playback?: TrackCardPlaybackData;
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;
  showComments?: boolean;
  waveform: number[];
  relatedTracks?: CompactTrackListTrack[];
};
