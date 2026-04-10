import { Playlist } from '@/features/playlist/components/PlaylistTrackItem';

export const mockWave = (length = 60) =>
  Array.from({ length }, () => Math.random() * 0.8 + 0.1);

export const MOCK_PLAYLIST: Playlist = {
 id: 1,
  title: 'Late Night Mix',
  type: 'PLAYLIST',
  isLiked: true,
  isPrivate: false,
  tags: ['Chill', 'Electronic', 'Podcast'],
  updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
  owner: {
    id: 1,
    username: 'decibel.user',
    avatarUrl: 'https://picsum.photos/seed/avatar1/200',
  },
  tracks: [
    {
      trackId: 1,
      title: 'Intro to Ambient Music',
      artist: 'The Sound Lab',
      coverUrl: 'https://picsum.photos/seed/music/400',
      durationSeconds: 312,
      plays: '1.4M',
      trackUrl: '#',
      available: true,
    },
    {
      trackId: 2,
      title: 'How Streaming Changed Everything',
      artist: 'Podcast',
      coverUrl: 'https://picsum.photos/seed/podcast1/400',
      durationSeconds: 2754,
      plays: '87K',
      trackUrl: '#',
      available: true,
    },
    {
      trackId: 3,
      title: 'Sunset Drive',
      artist: 'Nora Vance',
      coverUrl: 'https://picsum.photos/seed/sunset/400',
      durationSeconds: 245,
      plays: '3.2M',
      trackUrl: '#',
      available: true,
    },
    {
      trackId: 4,
      title: 'The Future of AI in Audio Production',
      artist: 'Waveform Weekly',
      coverUrl: 'https://picsum.photos/seed/aiwave/400',
      durationSeconds: 3120,
      plays: '210K',
      trackUrl: '#',
      available: true,
    },
  ],
};