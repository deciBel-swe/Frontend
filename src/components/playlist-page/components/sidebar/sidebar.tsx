'use client';

import React from 'react';
import { UserListSection } from './UserListSection';
import ListOfTrackRows from '@/components/sidebar/ListOfTrackRows'
import AvatarGroup from "@/components/playlist-page/components/sidebar/AvatarGroup";

// TODO:
// - [ ] Add real data and loading states
// - [ ] Control when action buttons appear (on hover, or always)
export const Sidebar = () => {
  const testHistory = [
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
      } as any, // remove "as any" when you match your PlayerTrack type properly
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
  return (
    <aside className="w-[300px] flex flex-col gap-6 pt-2 text-[12px]">

      {/* ───────── PLAYLISTS ───────── */}
        {/* TODO: control when each icon appear */}
      <ListOfTrackRows
        headerUrl="/you/history"
        History_header="Playlists from this user"
        queueSource="feed"
        history={testHistory}
      />


      {/* ───────── LIKES ───────── */}
      <UserListSection title="Like" countLabel="1">
  <AvatarGroup
    users={[
      {
        id: 1,
        username: "user_one",
        displayName: "User One",
        avatarUrl: "/images/default_song_image.png",
      },
    ]}
    size={40}
  />
      </UserListSection>

      {/* ───────── REPOSTS ───────── */}
      <UserListSection title="Repost" countLabel="1">
  <AvatarGroup
    users={[
      { id: 1, username: "user1", displayName: "User One", avatarUrl: "/images/default_song_image.png" },
      { id: 2, username: "user2", displayName: "User Two", avatarUrl: "/images/default_song_image.png" },
      { id: 3, username: "user3", displayName: "User Three", avatarUrl: "/images/default_song_image.png" },
      { id: 4, username: "user4", displayName: "User Four", avatarUrl: "/images/default_song_image.png" },
      { id: 5, username: "user5", displayName: "User Five", avatarUrl: "/images/default_song_image.png" },
      { id: 6, username: "user6", displayName: "User Six", avatarUrl: "/images/default_song_image.png" },
    ]}
    size={40}
  />
      </UserListSection>

      {/* ───────── LEGAL ───────── */}
      <div className="text-[11px] text-text-secondary leading-relaxed border-t border-border/30 pt-4 flex flex-wrap gap-x-1">
        <a href="#" className="hover:text-text-primary">Legal</a> ·
        <a href="#" className="hover:text-text-primary">Privacy</a> ·
        <a href="#" className="hover:text-text-primary">Cookie Policy</a> ·
        <a href="#" className="hover:text-text-primary">Cookie Manager</a> ·
        <a href="#" className="hover:text-text-primary">Imprint</a> ·
        <a href="#" className="hover:text-text-primary">Artist Resources</a> ·
        <a href="#" className="hover:text-text-primary">Newsroom</a> ·
        <a href="#" className="hover:text-text-primary">Charts</a> ·
        <a href="#" className="hover:text-text-primary">Transparency Reports</a>
      </div>

      {/* ───────── LANGUAGE ───────── */}
      <div className="text-[11px] text-text-secondary">
        Language:{' '}
        <button className="text-blue-500 hover:underline font-medium">
          English (US)
        </button>
      </div>

    </aside>
  );
};