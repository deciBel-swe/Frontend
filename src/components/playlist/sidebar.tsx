'use client';

import React from 'react';
import Image from 'next/image';

export const Sidebar = () => {
  return (
    <aside className="w-[300px] flex flex-col gap-6 pt-2">
      {/* 1. GO MOBILE SECTION */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] uppercase font-bold text-text-secondary tracking-tight">
          Go Mobile
        </h3>
        <div className="flex flex-col gap-2">
          {/* App Store Badge */}
          <div className="relative w-[135px] h-[40px] cursor-pointer hover:opacity-80 transition-opacity">
            <Image 
              src="/app-store-badge.png" 
              alt="Download on App Store" 
              fill 
              className="object-contain"
            />
          </div>
          {/* Google Play Badge */}
          <div className="relative w-[135px] h-[40px] cursor-pointer hover:opacity-80 transition-opacity">
            <Image 
              src="/google-play-badge.png" 
              alt="Get it on Google Play" 
              fill 
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* 2. THE LEGAL LINKS (The "Nonsense" text) */}
      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-[11px] text-text-secondary leading-relaxed border-t border-border/30 pt-4">
        <a href="#" className="hover:text-text-primary">Legal</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Privacy</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Cookie Policy</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Cookie Manager</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Imprint</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Artist Resources</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Newsroom</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Charts</a>
        <span>-</span>
        <a href="#" className="hover:text-text-primary">Transparency Reports</a>
      </div>

      {/* 3. LANGUAGE SELECTOR */}
      <div className="text-[11px] text-text-secondary">
        Language: <button className="text-blue-500 hover:underline font-medium">English (US)</button>
      </div>
    </aside>
  );
};