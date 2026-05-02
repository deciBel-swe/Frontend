"use client";
import TrackPageView from '@/components/track-page/TrackPageView';
import { useParams, useSearchParams } from 'next/navigation';
import { getSecretTokenFromQuery } from '@/utils/resourceIdentifierResolvers';

export default function TrackPage() {

  const { username, trackId } = useParams<{ username: string; trackId: string }>();
  const searchParams = useSearchParams();
  const secretToken = getSecretTokenFromQuery(searchParams);

  return (
    <TrackPageView
      username={username}
      trackId={trackId}
      secretToken={secretToken}
    />
  );
}