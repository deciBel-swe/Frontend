'use client';

import type { TrackCardProps } from '@/components/tracks/track-card';

export type PlaylistHorizontalProps = Omit<TrackCardProps, 'showTrackList'> & {
	onEdit?: () => void;
};
