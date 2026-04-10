'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Repeat } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-[300px] flex flex-col gap-6 pt-2 text-[12px]">
      {/* TODO: make the links */}
      {/* ───────── PLAYLISTS FROM USER ───────── */}
      {/* TODO: make a new component */}
      <div className="flex flex-col gap-3">

        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-text-secondary">
            Playlists from this user
          </h3>
          <Link href="#" className="text-text-secondary hover:text-text-primary text-[11px]">
            View all
          </Link>
        </div>

        {/* playlist item */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded overflow-hidden">
            <Image
              src="/placeholder.jpg"
              alt="playlist"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-text-primary font-semibold">Akmal emad</span>
            <span className="text-text-secondary text-[11px]">
              Related tracks: Aqua Mania
            </span>

            <div className="flex items-center gap-3 mt-1 text-text-secondary">
              <span className="flex items-center gap-1">
                <Heart size={12} /> 1
              </span>
              <span className="flex items-center gap-1">
                <Repeat size={12} /> 1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── LIKES ───────── */}
      {/* TODO: make these dynamic in a separate component and link to the user profiles who liked the playlist */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-text-secondary">
            1 Like
          </h3>
          <Link href="#" className="text-text-secondary hover:text-text-primary text-[11px]">
            View all
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-700" />
        </div>
      </div>

      {/* ───────── REPOSTS ───────── */}
      {/* TODO: use the same component as likes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-text-secondary">
            1 Repost
          </h3>
          <Link href="#" className="text-text-secondary hover:text-text-primary text-[11px]">
            View all
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-700" />
        </div>
      </div>

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
        Language: <button className="text-blue-500 hover:underline font-medium">English (US)</button>
      </div>
    </aside>
  );
};