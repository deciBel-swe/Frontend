import TrackPageView, { type TrackViewData } from '@/components/TrackPageView';

type PageParams = {
  params: Promise<{ username: string; trackSlug: string }>;
};

export default async function TrackPage({ params }: PageParams) {
  const { username, trackSlug } = await params;
  const WAVEFORM = JSON.stringify([
  0.2,0.5,0.8,0.6,0.4,0.9,0.7,0.3,0.5,0.8,0.6,0.4,0.7,0.9,0.5,0.3,0.6,0.8,
  0.4,0.7,0.5,0.9,0.6,0.3,0.8,0.5,0.4,0.7,0.6,0.9,0.3,0.5,0.8,0.6,0.4,0.7,
  0.9,0.5,0.3,0.6,0.8,0.4,0.7,0.5,0.9,0.6,0.3,0.8,0.5,0.4,0.7,0.6,0.9,0.3,
  0.5,0.8,0.6,0.4,0.7,0.9,0.5,0.3,0.6,0.8,0.4,0.7,0.5,0.9,0.6,0.3,0.8,0.5,
  0.4,0.7,0.6,0.9,0.3,0.5,0.8,0.6,
]);
  const track: TrackViewData = {
    id: 1,
    title: trackSlug.replace(/-/g, ' '),
    artistName: username,
    artistSlug: username,
    coverUrl: 'https://picsum.photos/seed/cover/400/400',
    timeAgo: '3 months ago',
    tags: ['electronic', 'chill'],
    waveformUrl: WAVEFORM,
    duration: '4:32',
    plays: 158000,
    likes: 28600,
    reposts: 104,
    description: '',
    comments: [
      {
        id: 1,
        authorName: 'Mohab Ahmed',
        authorSlug: 'mohabahmed',
        authorAvatar: 'https://picsum.photos/seed/fan1/64/64',
        body: 'This track is absolutely fire',
        timeAgo: '2 months ago',
        likes: 14,
        timestampInTrack: '1:23',
      },
    ],
    fans: [
      {
        id: 1,
        name: 'Mohab Ahmed',
        slug: 'mohabahmed',
        avatarUrl: 'https://picsum.photos/seed/fan1/64/64',
        plays: 590,
      },
    ],
  };

  return <TrackPageView track={track} />;
}