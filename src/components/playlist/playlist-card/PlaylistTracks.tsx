'use client';

import CompactTrackList, {
  type Track as CompactTrackListTrack,
} from '@/components/compact-tracks/CompactTrackList';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import { DEFAULT_RELATED_TRACKS } from './constants';

type TrackCardRelatedTracksProps = {
  showTrackList: boolean;
  tracks?: CompactTrackListTrack[];
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;
};

export default function TrackCardRelatedTracks({
  showTrackList,
  tracks,
  queueTracks,
  queueSource,
}: TrackCardRelatedTracksProps) {
  if (!showTrackList) {
    return null;
  }

  return (
    <CompactTrackList
      tracks={tracks ?? DEFAULT_RELATED_TRACKS}
      queueTracks={queueTracks}
      queueSource={queueSource}
    />
  );
}
