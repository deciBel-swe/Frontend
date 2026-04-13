'use client';

import React from 'react';
import { UserListSection } from './UserListSection';
import ListOfTrackRows from '@/components/sidebar/ListOfTrackRows'
import AvatarGroup from "@/components/playlist-page/components/sidebar/AvatarGroup";
import { testHistory, likeUsers, repostUsers } from '@/components/playlist-page/components/sidebar/sidebarMockData';

// TODO:
// - [ ] Add real data and loading states
// - [ ] Control when action buttons appear (on hover, or always)
export const Sidebar = () => {
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
<AvatarGroup users={likeUsers} size={40} />

      </UserListSection>

      {/* ───────── REPOSTS ───────── */}
      <UserListSection title="Repost" countLabel="1">
<AvatarGroup users={repostUsers} size={40} />
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