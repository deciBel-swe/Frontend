import type { TrackCardProps } from '@/components/tracks/track-card';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { UserCardData } from '@/features/social/components/UserCard';

export const mockTracks: TrackCardProps[] = [
  {
    trackId: '1',
    track: { id: 1, title: 'Summer Vibes', artist: 'Artist One', cover: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', duration: '3:12', genre: 'Rap', plays: 63_400_000, comments: 6_486, likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
    user: { username: 'artistone', displayName: 'Artist One', avatar: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
    waveform: [],
    showHeader: true,
  },
  {
    trackId: '2',
    track: { id: 2, title: 'Rhythmic Beats', artist: 'Artist Two', cover: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', duration: '4:05', genre: 'Electronic', plays: 3_200_000, comments: 241, likeCount: 1_200, repostCount: 80, isLiked: false, isReposted: false },
    user: { username: 'artisttwo', displayName: 'Artist Two', avatar: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
    waveform: [],
    showHeader: true,
  },
];

export const mockPlaylists: PlaylistHorizontalProps[] = [
  {
    trackId: '201',
    track: { id: 201, title: 'Chill Mix', artist: 'artist1', cover: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', duration: '0:00', plays: 0, comments: 0, likeCount: 0, repostCount: 0, isLiked: false, isReposted: false },
    user: { username: 'user1', displayName: 'test user', avatar: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
    waveform: [],
    showHeader: true,
    relatedTracks: [
      { id: 1, title: 'Ocean Waves', artist: 'Artist Two', coverUrl: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', plays: '73.5M' },
      { id: 2, title: 'Melodic Tune', artist: 'Artist Four', coverUrl: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg', plays: '2.3M' },
    ],
  },
];

export const mockPeople: UserCardData[] = [
  { id: 'u1', username: 'jordansmith', displayName: 'Jordan Smith', followerCount: 12_400, isVerified: true, isFollowing: false },
  { id: 'u2', username: 'samtaylor', displayName: 'Sam Taylor', followerCount: 3_800, isVerified: false, isFollowing: true },
  { id: 'u3', username: 'musicapp', displayName: 'Music App', followerCount: 980_000, isVerified: true, isFollowing: false },
];