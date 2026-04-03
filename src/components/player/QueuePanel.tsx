"use client";

import React, { useState, useEffect } from 'react';
import { X, Heart, MoreHorizontal, GripVertical, Play, Pause } from "lucide-react";
import Link from 'next/link';

interface QueueItem {
  id: number;
  title: string;
  artist?: string;
  artwork?: string;
}

interface QueuePanelProps {
  items: QueueItem[];
  isPlaying: boolean;
  onClose: () => void;
  onSelect: (trackId: number) => void;
  onRemove: (trackId: number) => void;
  onClear: () => void;
}

export default function QueuePanel({ 
  items, 
  isPlaying, 
  onClose, 
  onSelect, 
  onRemove, 
  onClear 
}: QueuePanelProps) {
  // 1. DEFAULT LOGIC: Initialize selection to the first item's ID
  const [selectedId, setSelectedId] = useState<number | null>(
    items.length > 0 ? items[0].id : null
  );

  // Sync selection if the list changes and the current selection is gone
  useEffect(() => {
    if (items.length > 0 && !items.find(i => i.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const handlePlayClick = (id: number) => {
    setSelectedId(id); // Update the "Hovered = True" state to this song
    onSelect(id);      // Trigger the actual player
  };

  return (
    <div className="absolute bottom-full right-0 mb-4 w-[380px] bg-background border border-border-strong rounded-lg shadow-2xl overflow-hidden animate-drop-in flex flex-col z-50">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-strong bg-surface-raised">
        <h3 className="text-xl font-bold text-text-primary">
          Next up <span className="text-sm font-medium text-text-primary">({items.length})</span>
        </h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }} 
            className="text-xs font-extrabold text-text-primary hover:text-brand-primary transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-surface-raised hover:bg-interactive-hover text-text-primary transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* LIST */}
      <ul className="max-h-[420px] overflow-y-auto overflow-x-hidden custom-scrollbar bg-surface-raised">
        {items.length === 0 ? (
          <li className="p-10 text-center text-sm text-text-secondary italic">Your queue is empty</li>
        ) : (
          items.map((item) => {
// ... inside the items.map loop ...

const isSelected = item.id === selectedId;

// MIRRORED HOVER LOGIC
const forcedHover = isSelected ? "opacity-100 flex" : "opacity-0 hidden group-hover:opacity-100 group-hover:flex";
const forcedGrip = isSelected ? "opacity-40" : "opacity-0 group-hover:opacity-40";
const forcedTime = isSelected ? "hidden" : "group-hover:hidden block";

return (
  <li 
    key={item.id}
    className={`flex items-center gap-3 px-3 py-2 transition-colors group ${
      isSelected 
        ? "bg-interactive-hover/40" // Uses your theme's interaction color
        : "hover:bg-interactive-hover/20"
    }`}
  >
    {/* 1. GRIP ICON */}
    <div className="w-4 flex items-center justify-center text-text-secondary">
      <GripVertical size={16} className={`transition-opacity ${forcedGrip}`} />
    </div>

    {/* 2. ARTWORK & PLAY BUTTON */}
    <div className="relative w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden shadow-sm">
      {item.artwork ? (
        <img src={item.artwork} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted" />
      )}
      
      <div 
        onClick={(e) => { e.stopPropagation(); handlePlayClick(item.id); }}
        className={`absolute inset-0 items-center justify-center bg-black/40 cursor-pointer transition-opacity ${forcedHover}`}
      >
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
          {isSelected && isPlaying ? (
            <Pause size={14} fill="black" stroke="none" />
          ) : (
            <Play size={14} fill="black" stroke="none" className="ml-0.5" />
          )}
        </div>
      </div>
    </div>

    {/* 3. INFO AS LINKS - FIXED COLORS */}
    <div className="flex-1 min-w-0">
      <Link 
        href={`/artist/${item.artist}`} 
        className="block text-xs tracking-wider text-text-secondary font-extrabold hover:text-interactive-hover truncate leading-tight"
        onClick={(e) => e.stopPropagation()}
      >
        {item.artist}
      </Link>
      <Link 
        href={`/track/${item.id}`} 
        className={`block text-sm truncate font-extrabold leading-tight transition-colors ${
          isSelected 
            ? "font-extrabold text-primary" // Highlight the active track with your brand color
            : "text-text-primary hover:text-interactive-hover"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {item.title}
      </Link>
    </div>

    {/* 4. ACTIONS AREA */}
    <div className="flex items-center justify-end w-20 relative">
      <span className={`text-[11px] text-text-secondary font-medium pr-2 ${forcedTime}`}>
        4:32
      </span>
      
      <div className={`items-center gap-3 pr-1 ${forcedHover}`}>
        <Heart size={16} className="text-text-secondary hover:text-red-500 cursor-pointer transition-colors" />
        <MoreHorizontal size={16} className="text-text-secondary hover:text-text-primary cursor-pointer" />
      </div>
    </div>

    {/* REMOVE BUTTON */}
    <button 
      onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
      className={`text-text-secondary hover:text-red-500 p-1 transition-opacity ${forcedHover}`}
    >
      <X size={14} />
    </button>
  </li>
);
          })
        )}
      </ul>

      {/* FOOTER */}
      <div className="p-4 bg-surface-raised border-t border-border-strong">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[15px] font-bold text-text-primary">Autoplay station</span>
          <div className="w-10 h-5 bg-brand-primary rounded-full relative cursor-pointer shadow-inner">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
        <p className="text-[12px] text-text-secondary leading-normal">
          Hear related tracks based on what's playing now.
        </p>
      </div>
    </div>
  );
}