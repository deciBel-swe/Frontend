// sidebar/sidebarMockData.ts
/* eslint-disable */
export const testHistory = [
  {
    trackId: 1,
    image: "/track1.jpg",
    artist: "Akmal Emad",
    artistUsername: "akmal_emad",
    title: "Midnight Drive",
    stats: {
      plays: "1200",
      likes: "300",
      reposts: "45",
      comments: "12",
    },
    playback: {
      id: "p1",
      title: "Midnight Drive",
      artist: "Akmal Emad",
    } as any,
  },
  {
    trackId: 2,
    image: "/track2.jpg",
    artist: "Noha Music",
    artistUsername: "noha_music",
    title: "Ocean Breeze",
    stats: {
      plays: "980",
      likes: "210",
      reposts: "30",
      comments: "8",
    },
    playback: {
      id: "p2",
      title: "Ocean Breeze",
      artist: "Noha Music",
    } as any,
  },
  {
    trackId: 3,
    image: "/track3.jpg",
    artist: "Mido Beats",
    artistUsername: "mido_beats",
    title: "Neon Lights",
    stats: {
      plays: "540",
      likes: "120",
      reposts: "15",
      comments: "5",
    },
    playback: {
      id: "p3",
      title: "Neon Lights",
      artist: "Mido Beats",
    } as any,
  },
];

export const likeUsers = [
  {
    id: 1,
    username: "user_one",
    displayName: "User One",
    avatarUrl: "/images/default_song_image.png",
  },
];

export const repostUsers = [
  { id: 1, username: "user1", displayName: "User One", avatarUrl: "/images/default_song_image.png" },
  { id: 2, username: "user2", displayName: "User Two", avatarUrl: "/images/default_song_image.png" },
  { id: 3, username: "user3", displayName: "User Three", avatarUrl: "/images/default_song_image.png" },
  { id: 4, username: "user4", displayName: "User Four", avatarUrl: "/images/default_song_image.png" },
  { id: 5, username: "user5", displayName: "User Five", avatarUrl: "/images/default_song_image.png" },
  { id: 6, username: "user6", displayName: "User Six", avatarUrl: "/images/default_song_image.png" },
];