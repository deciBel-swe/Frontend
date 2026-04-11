import React from "react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import Link from "next/link";
import { ArrowToggleButton } from "@/components/notifications/ArrowToggleButton";

export default function Page() {
  return (
    <div className="w-full max-w-6xl bg-bg-base text-text-primary flex justify-center">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl flex gap-6 px-6 py-6">
        
        {/* LEFT: Notifications */}
        <div className="flex-1 bg-surface-default rounded-xl p-4 border border-border-default">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/notifications" className="text-xl font-extrabold hover:text-interactive-hover">
              Notifications
            </Link>

            <ArrowToggleButton label="All notifications" />
          </div>

          <NotificationsList />
        </div>

        {/* RIGHT SIDEBAR (like image) */}
        <aside className="w-[280px] hidden lg:block space-y-4">
          
          <div className="bg-surface-default border border-border-default rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">
              Recent followers
            </h2>

            <p className="text-xs text-text-muted">
              Sidebar placeholder (can be expanded later)
            </p>
          </div>

        </aside>
      </div>
    </div>
  );
}