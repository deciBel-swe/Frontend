/**
 * mockDiscoverData.ts
 *
 * Drop-in mock data for testing the Discover UI.
 * Replace with real hook data when the service layer is ready.
 */

import type { DiscoverTrackItem, DiscoverPlaylistItem } from '@/features/discover/types/DiscoverTypes';
import type { PlayerTrack, QueueSource } from '@/features/player/contracts/playerContracts';
import type { TrackListItem } from '@/components/tracks/TrackList';

// ─── Shared queue sources ─────────────────────────────────────────────────────

const TRENDING_SOURCE: QueueSource = 'feed';
const LIKED_SOURCE:    QueueSource = 'likes';
const RECENT_SOURCE:   QueueSource = 'unknown';
const GENRE_SOURCE:    QueueSource = 'feed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_TRACK_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Deterministic fake waveform so every track looks slightly different */
function makeWaveform(id: number): number[] {
  return Array.from({ length: 100 }, (_, i) =>
    Math.round(Math.abs(Math.sin(i * 0.3 + id * 0.7)) * 100),
  );
}

function makeTrackListItem(
  id: number,
  title: string,
  artist: string,
  genre: string,
  coverSeed: number,
): TrackListItem {
  const username     = artist.toLowerCase().replace(/\s+/g, '-');
  const artistRecord = {
    username,
    displayName: artist,
    avatar: `https://picsum.photos/seed/${coverSeed + 100}/40/40`,
  };
  const coverUrl     = `https://picsum.photos/seed/${coverSeed}/200/200`;
  const durationSecs = 120 + (id * 13) % 180;

  return {
    trackId: String(id),
    user: {
      username,
      displayName: artist,
      avatar: artistRecord.avatar,
    },
    postedText: 'posted a track',
    track: {
      id,
      artist: artistRecord,
      title,
      cover: coverUrl,
      duration: formatDuration(durationSecs),
      durationSeconds: durationSecs,
      genre,
      isLiked: id % 3 === 0,
      likeCount: 100 + (id * 97) % 9000,
    },
    trackUrl: MOCK_TRACK_URL,
    access: 'PLAYABLE',
    waveform: makeWaveform(id),
  };
}

function makePlayerTrack(
  id: number,
  title: string,
  artist: string,
  coverSeed: number,
): PlayerTrack {
  return {
    id,
    title,
    artistName: artist,
    trackUrl: MOCK_TRACK_URL,
    access: 'PLAYABLE',
    durationSeconds: 120 + (id * 13) % 180,
    coverUrl: `https://picsum.photos/seed/${coverSeed}/200/200`,
    waveformData: makeWaveform(id),
  };
}

function makeDiscoverTrack(
  id: number,
  title: string,
  artist: string,
  genre: string,
  coverSeed: number,
  queueSource: QueueSource,
  siblingIds: number[],
): DiscoverTrackItem {
  return {
    item: makeTrackListItem(id, title, artist, genre, coverSeed),
    queueTracks: siblingIds.map((sid, i) =>
      makePlayerTrack(sid, `Track ${sid}`, artist, coverSeed + i),
    ),
    queueSource,
  };
}

// ─── 1. Trending Tracks ───────────────────────────────────────────────────────

export const mockTrendingTracks: DiscoverTrackItem[] = [
  makeDiscoverTrack(1,  'Neon Pulse',        'Solar Drift',    'Electronic', 10, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(2,  'Coastal Highway',   'The Wayfarers',  'Indie Rock',  20, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(3,  'Midnight Protocol', 'AXYS',           'Techno',      30, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(4,  'Golden Hour',       'Amber Lane',     'Pop',         40, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(5,  'Deep Cavern',       'Subterraneans',  'Ambient',     50, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(6,  'Ultraviolet',       'Prism',          'Synthwave',   60, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(7,  'Fade to Static',    'The Residuals',  'Post-Rock',   70, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
  makeDiscoverTrack(8,  'Retrograde',        'Celeste Vega',   'R&B',         80, TRENDING_SOURCE, [1,2,3,4,5,6,7,8]),
];

// ─── 2. More of What You Liked ────────────────────────────────────────────────

export const mockLikedTracks: DiscoverTrackItem[] = [
  makeDiscoverTrack(11, 'Breathe Again',    'Luna Park',     'Pop',        110, LIKED_SOURCE, [11,12,13,14,15,16]),
  makeDiscoverTrack(12, 'Cassette Dreams',  'Haze Theory',   'Lo-Fi',      120, LIKED_SOURCE, [11,12,13,14,15,16]),
  makeDiscoverTrack(13, 'Phase Transition', 'Quanta',        'Electronic', 130, LIKED_SOURCE, [11,12,13,14,15,16]),
  makeDiscoverTrack(14, 'Sunken City',      'Coral Seraph',  'Ambient',    140, LIKED_SOURCE, [11,12,13,14,15,16]),
  makeDiscoverTrack(15, 'Dopamine Rush',    'Synk',          'Dance',      150, LIKED_SOURCE, [11,12,13,14,15,16]),
  makeDiscoverTrack(16, 'Worn Velvet',      'Mara Blue',     'Soul',       160, LIKED_SOURCE, [11,12,13,14,15,16]),
];

// ─── 3. Recently Played (mix of tracks + playlists) ──────────────────────────

export const mockRecentlyPlayedItems: (DiscoverTrackItem | DiscoverPlaylistItem)[] = [
  {
    id: 'pl-1',
    title: 'Late Night Drive',
    coverUrl: 'https://picsum.photos/seed/201/200/200',
    username: 'curator_rex',
    sets: false,
  } satisfies DiscoverPlaylistItem,
  {
    id: 'pl-2',
    title: 'Morning Ritual',
    coverUrl: 'https://picsum.photos/seed/202/200/200',
    username: 'audiosmith',
    sets: true,
  } satisfies DiscoverPlaylistItem,
  makeDiscoverTrack(21, 'Glass Bones',    'Hollow Echo',  'Indie',      210, RECENT_SOURCE, [21,22,23,24]),
  makeDiscoverTrack(22, 'Summer Static',  'Wavelet',      'Chillwave',  220, RECENT_SOURCE, [21,22,23,24]),
  {
    id: 'pl-3',
    title: 'Focus Mode',
    coverUrl: 'https://picsum.photos/seed/203/200/200',
    username: 'deepwork_fm',
    sets: false,
  } satisfies DiscoverPlaylistItem,
  makeDiscoverTrack(23, 'Iron Shore',     'Basalt Choir', 'Post-Rock',  230, RECENT_SOURCE, [21,22,23,24]),
  makeDiscoverTrack(24, 'Crystal Method', 'Refract',      'Electronic', 240, RECENT_SOURCE, [21,22,23,24]),
];

// ─── 4. More Based on Genre ───────────────────────────────────────────────────

export const mockGenreTracks: DiscoverTrackItem[] = [
  makeDiscoverTrack(31, 'Voltage Drop',    'Circuit Breaker', 'Techno',     310, GENRE_SOURCE, [31,32,33,34,35,36]),
  makeDiscoverTrack(32, 'Hypnagogic',      'Drift State',     'Ambient',    320, GENRE_SOURCE, [31,32,33,34,35,36]),
  makeDiscoverTrack(33, 'Cascade Failure', 'Glitch Lab',      'IDM',        330, GENRE_SOURCE, [31,32,33,34,35,36]),
  makeDiscoverTrack(34, 'Primal Signal',   'Rawform',         'Industrial', 340, GENRE_SOURCE, [31,32,33,34,35,36]),
  makeDiscoverTrack(35, 'Silk Thread',     'Mellow Arc',      'Lo-Fi',      350, GENRE_SOURCE, [31,32,33,34,35,36]),
  makeDiscoverTrack(36, 'Desert Bloom',    'Cactus Waves',    'Psych Rock', 360, GENRE_SOURCE, [31,32,33,34,35,36]),
];

// ─── 5. More Based on Trending ────────────────────────────────────────────────

export const mockMoreTrendingTracks: DiscoverTrackItem[] = [
  makeDiscoverTrack(41, 'Quantum Leap',   'Particle',      'Electronic', 410, TRENDING_SOURCE, [41,42,43,44,45,46]),
  makeDiscoverTrack(42, 'Harbour Lights', 'The Tides',     'Folk',       420, TRENDING_SOURCE, [41,42,43,44,45,46]),
  makeDiscoverTrack(43, 'Apex Predator',  'Savage Theory', 'Hip-Hop',    430, TRENDING_SOURCE, [41,42,43,44,45,46]),
  makeDiscoverTrack(44, 'Limerence',      'Soft Signal',   'Dream Pop',  440, TRENDING_SOURCE, [41,42,43,44,45,46]),
  makeDiscoverTrack(45, 'Rust & Chrome',  'Ironworks',     'Industrial', 450, TRENDING_SOURCE, [41,42,43,44,45,46]),
  makeDiscoverTrack(46, 'After Hours',    'Nightshade',    'R&B',        460, TRENDING_SOURCE, [41,42,43,44,45,46]),
];