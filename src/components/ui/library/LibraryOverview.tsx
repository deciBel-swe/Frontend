'use client';

import PlaylistCard from '@/components/PlaylistCard';
import UserCard, { type UserCardData } from '@/components/ui/social/UserCard';
import LibrarySection from './LibrarySection';
import { FilterDropdown } from '@/components/nav/FilterDropdown';
import { useState } from 'react';

// ─── Mock data ────────────────────────────────────────────────────────────────

const recentlyPlayed = [
  { id: '1', title: 'mix',          artist: 'mockuser1', image: 'https://picsum.photos/seed/mix/400' },
  { id: '2', title: 'mockuser1', artist: '',             image: 'https://picsum.photos/seed/mockuser1/400' },
  { id: '3', title: 'mockuser1', artist: '',    image: 'https://picsum.photos/seed/mockuser1/400' },
  { id: '4', title: 'artist 1', artist: 'Artist station', image: 'https://picsum.photos/seed/artist1/400' },
  { id: '5', title: 'Buzzing Mexico', artist: 'New!',         image: 'https://picsum.photos/seed/buzzing-mexico/400' },
];

const likes = [
  { id: '1', title: 'The Beauty of Existence', artist: 'Muhammad Al Muqit', image: 'https://i1.sndcdn.com/artworks-000523960650-2nc5nm-t500x500.jpg' },
  { id: '2', title: 'A Flower',                artist: 'Double Vision',      image: 'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg' },
  { id: '3', title: 'Al-Aqsa',                 artist: 'Palestine',          image: 'https://i1.sndcdn.com/artworks-000034240364-u9zoa8-t500x500.jpg' },
];

const playlists = [
  { id: '1', title: 'Chill Vibes',    artist: 'user 1', image: 'https://picsum.photos/seed/chill-vibes/400' },
  { id: '2', title: 'Late Night Mix',     artist: 'user 1', image: 'https://picsum.photos/seed/late-night/400' },
  { id: '3', title: 'Morning Boost',  artist: 'user 2', image: 'https://picsum.photos/seed/morning-boost/400' },
];

const albums = [
  { id: '1', title: 'Ocean ',   artist: 'Artist 1', image: 'https://picsum.photos/seed/ocean/400' },
  { id: '2', title: 'Sour',         artist: 'Artist 1', image: 'https://picsum.photos/seed/sour/400' },
  { id: '3', title: 'Happier ', artist: 'Artist 2', image: 'https://picsum.photos/seed/happier-than-ever/400' },
];

const likedStations = [
  { id: '1', title: 'Indie Mix',     artist: '', image: 'https://picsum.photos/seed/indie-mix/400' },
  { id: '2', title: 'Pop Station',   artist: '', image: 'https://picsum.photos/seed/pop-station/400' },
  { id: '3', title: 'Lo-fi Beats',   artist: '', image: 'https://picsum.photos/seed/lo-fi-beats/400' },
  { id: '4', title: 'Hip-Hop Mix',   artist: '', image: 'https://picsum.photos/seed/hip-hop-mix/400' },
  { id: '5', title: 'Rock Classics', artist: '', image: 'https://picsum.photos/seed/rock-classics/400' },
  { id: '6', title: 'Jazz Lounge',   artist: '', image: 'https://picsum.photos/seed/jazz-lounge/400' },
  { id: '7', title: 'Jazz Lounge',   artist: '', image: 'https://picsum.photos/seed/jazz-lounge/400' },
];

const following: UserCardData[] = [
  { id: '1', username: 'user 1', avatarSrc: 'https://picsum.photos/seed/user1/400', followerCount: 1_200_000 },
  { id: '2', username: 'user 2', avatarSrc: 'https://picsum.photos/seed/user2/400', followerCount: 3_400_000, isVerified: true },
  { id: '3', username: 'user 3',     avatarSrc: 'https://picsum.photos/seed/user3/400', followerCount: 5_000_000, isVerified: true },
  { id: '4', username: 'user 4',  followerCount: 4_200_000, isVerified: true },
  { id: '5', username: 'artist 1',          followerCount: 6_100_000, isVerified: true },
  { id: '6', username: 'artist 2',       followerCount: 2_800_000 },
];

const PLAYLIST_FILTER_OPTIONS = [
  { label: 'All',     value: 'all'     },
  { label: 'Created', value: 'created' },
  { label: 'Liked',   value: 'liked'   },
];

// ─── Skeleton placeholder card ───────────────────────────────────────────────

function SquareSkeleton() {
 return (
    <div className="shrink-0 rounded-lg bg-surface-raised animate-pulse m-2 w-[6.5rem] h-[6.5rem] md:w-[8rem] md:h-[8rem] lg:w-[10rem] lg:h-[10rem]"/>
  );
}

// ─── LibraryOverview ─────────────────────────────────────────────────────────

/**
 * LibraryOverview — composes all horizontal-scroll sections shown on the
 * Library › Overview tab.
 *
 * Responsibilities:
 *  - Delegates section layout to LibrarySection.
 *  - Delegates card rendering to PlaylistCard / UserCard.
 *
 */
export default function LibraryOverview() {
 const [playlistFilter, setPlaylistFilter] = useState('all');
//  const userSlug = artist.toLowerCase().replace(/\s+/g, '');
//  const trackSlug = title.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="px-8 py-8">
      {/* Recently played */}
      <LibrarySection title="Recently played">
        {recentlyPlayed.map((item) => (
          <PlaylistCard key={item.id} title={item.title} coverUrl={item.image}/>
        ))}
        <SquareSkeleton/>
      </LibrarySection>

      {/* Likes */}
      <LibrarySection
        title="Likes"
        ctaLabel="Browse trending playlists"
        ctaHref="/discover"
      >
        {likes.map((item) => (
          <PlaylistCard key={item.id} title={item.title} coverUrl={item.image} username={item.artist}/>
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <SquareSkeleton key={`likes-skeleton-${i}`} />
        ))}
      </LibrarySection>

      {/* Playlists */}
      <LibrarySection
        title="Playlists"
         filterSlot={
          <FilterDropdown
            options={PLAYLIST_FILTER_OPTIONS}
            value={playlistFilter}
            onChange={setPlaylistFilter}
          />
        }
      >
        {playlists.map((item) => (
          <PlaylistCard key={item.id} title={item.title} coverUrl={item.image} username={item.artist} sets={true} />
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <SquareSkeleton key={`playlists-skeleton-${i}`} />
        ))}
      </LibrarySection>

      {/* Albums */}
      <LibrarySection
        title="Albums"
        ctaLabel="Browse trending playlists"
        ctaHref="/discover"
      >
        {albums.map((item) => (
          <PlaylistCard key={item.id} title={item.title} coverUrl={item.image}/>
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <SquareSkeleton key={`albums-skeleton-${i}`} />
        ))}
      </LibrarySection>

      {/* Liked stations */}
      <LibrarySection
        title="Liked stations"
        ctaLabel="Browse trending playlists"
        ctaHref="/discover"
      >
        {likedStations.map((item) => (
          <PlaylistCard key={item.id} title={item.title} coverUrl={item.image}/>
        ))}
      </LibrarySection>

      {/* Following */}
      <LibrarySection
        title="Following"
        ctaLabel="Browse trending playlists"
        ctaHref="/discover"
      >
        {following.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </LibrarySection>
    </div>
  );
}