import React from 'react';
// Import your Sidebar and Hero here
import { PlaylistHero } from '@/components/playlist/PlaylistHero';
import { ActionToolbar } from '@/components/playlist/ActionToolbar';
import { Sidebar } from '@/components/playlist/sidebar';

export default function UserProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  // Note: You can fetch profileData here if you want it to be Server-Side,
  // or let the Sidebar handle its own internal fetching.
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* 1. FULL WIDTH HEADER (Hero) */}
      <PlaylistHero 
  title="Test-Playlist"
  creator={params.username}
  trackCount={3}
  duration="20:47"
  createdAt="1 day ago"
  artworkUrl="/default-artwork.png" 
/>

      {/* 2. FULL WIDTH ACTIONS BAR */}
      <ActionToolbar />

      {/* 3. CENTERED TWO-COLUMN CONTENT GRID */}
      <main className="w-full max-w-[1240px] mx-auto flex gap-10 p-6">
        
        {/* LEFT COLUMN (Where your TrackList page renders) */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* RIGHT COLUMN (Persistent Sidebar) */}
        <Sidebar />

        
      </main>
    </div>
  );
}