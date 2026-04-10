'use client';

import CompactTrackList, {
  type Track as CompactTrackListTrack,
} from '@/components/compact-tracks/CompactTrackList';
import { DEFAULT_RELATED_TRACKS } from './constants';

type TrackCardRelatedTracksProps = {
  showTrackList: boolean;
  tracks?: CompactTrackListTrack[];
};

export default function TrackCardRelatedTracks({
  showTrackList,
  tracks,
}: TrackCardRelatedTracksProps) {
  if (!showTrackList) {
    return null;
  }

  return <CompactTrackList tracks={tracks ?? DEFAULT_RELATED_TRACKS} />;
}
