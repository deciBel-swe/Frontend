"use client";
import TrackPageView from '@/components/TrackPageView';
import { useParams } from 'next/navigation';

export default function TrackPage() {

  const { username, trackId } = useParams<{ username: string; trackId: string }>();
  return <TrackPageView username={username} trackId={trackId} />;
}