import React from "react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import Link from "next/link";
import { ArrowToggleButton } from "@/components/notifications/ArrowToggleButton";
import { SidebarUserCardContainer } from "@/components/notifications/SidebarUserCardContainer";

export default function Page() {
  return (
    <div className="w-full max-w-6xl bg-bg-base text-text-primary flex justify-center">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl flex gap-6 px-6 py-6">
        
        {/* LEFT: Notifications */}
        <div className="flex-1 bg-surface-default rounded-xl p-4 border border-border-default">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/notifications" className="text-2xl font-extrabold hover:text-interactive-hover">
              Notifications
            </Link>

            <ArrowToggleButton label="All notifications" />
          </div>

          <NotificationsList />
        </div>

        {/* RIGHT SIDEBAR (like image) */}
        <aside className="w-[300px] hidden lg:block space-y-4 mt-4">
          

          <div className="w-full flex flex-row"> 
            <Link href="#" className="text-sm font-bold text-text-primary hover:text-interactive-hover">
              Recent followers
            </Link>
            <Link href="#" className="ml-auto text-xs font-medium text-secondary hover:text-interactive-hover">
              View all
            </Link>
          </div>
          <SidebarUserCardContainer
  username="akmal"
  avatarUrl="/images/default_song_image.png"
  followersCount={120}
  statsCount={45}
/>

        </aside>
      </div>
    </div>
  );
}