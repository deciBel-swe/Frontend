'use client';

import { useParams } from 'next/navigation';
import PlaylistEngagementPage from '@/features/social/components/PlaylistEngagementPage';

export default function Page() {
  const { id } = useParams<{ username: string; id: string }>();

  return <PlaylistEngagementPage playlistId={id} type="reposts" />;
}
