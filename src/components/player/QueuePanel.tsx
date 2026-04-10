"use client";

import React, { useState, useEffect } from 'react';
import { X, GripVertical, Play, Pause } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import ScrollableArea from '@/components/scroll/ScrollableArea';

interface QueueItem {
  id: number;
  title: string;
  artist?: string;
  artwork?: string;
}

interface QueuePanelProps {
  items: QueueItem[];
  isPlaying: boolean;
  activeTrackId: number | null;
  onClose: () => void;
  onSelect: (trackId: number) => void;
  onRemove: (trackId: number) => void;
  onClear: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function QueuePanel({ 
  items, 
  isPlaying, 
  activeTrackId,
  onClose, 
  onSelect, 
  onRemove, 
  onClear,
  onReorder,
}: QueuePanelProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    activeTrackId ?? (items.length > 0 ? items[0].id : null)
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeTrackId !== null && items.some((item) => item.id === activeTrackId)) {
      setSelectedId(activeTrackId);
      return;
    }

    if (items.length === 0) {
      setSelectedId(null);
      return;
    }

    if (selectedId === null || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [activeTrackId, items, selectedId]);

  const handlePlayClick = (id: number) => {
    setSelectedId(id);
    onSelect(id);
  };

  const handleDragStart = (event: React.DragEvent<HTMLLIElement>, index: number) => {
    if (items.length < 2) {
      return;
    }

    setDragIndex(index);
    setDragOverIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (event: React.DragEvent<HTMLLIElement>, index: number) => {
    if (dragIndex === null) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();

    if (dragIndex !== null && dragIndex !== targetIndex) {
      onReorder(dragIndex, targetIndex);
    }

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="absolute bottom-full right-0 mb-4 w-95 bg-background border border-border-strong rounded-lg shadow-2xl overflow-hidden animate-drop-in flex flex-col z-50">
      
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
      <ScrollableArea maxHeight="420px" className="bg-surface-raised">
      <ul className="max-h-105 overflow-y-auto overflow-x-hidden custom-scrollbar bg-surface-raised">
        {items.length === 0 ? (
          <li className="p-10 text-center text-sm text-text-secondary italic">Your queue is empty</li>
        ) : (
          items.map((item, index) => {
            const isSelected = item.id === selectedId;
            const forcedHover = isSelected ? "opacity-100 flex" : "opacity-0 hidden group-hover:opacity-100 group-hover:flex";
            const forcedGrip = isSelected ? "opacity-40" : "opacity-0 group-hover:opacity-40";
            const forcedTime = isSelected ? "hidden" : "group-hover:hidden block";
            const isDragTarget = dragOverIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <li
                key={`${item.id}-${index}`}
                draggable={items.length > 1}
                onDragStart={(event) => handleDragStart(event, index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={(event) => handleDrop(event, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-3 py-2 transition-colors group ${
                  isSelected ? "bg-interactive-hover/20" : "hover:bg-interactive-hover/20"
                } ${
                  dragIndex === index ? "opacity-60" : "opacity-100"
                } ${
                  isDragTarget ? "ring-1 ring-brand-primary/60" : "ring-0"
                }`}
              >
                <div className="w-4 flex items-center justify-center text-text-secondary cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} className={`transition-opacity ${forcedGrip}`} />
                </div>

                <div className="relative w-10 h-10 rounded bg-muted shrink-0 overflow-hidden shadow-sm">
                  {item.artwork ? (
                    <Image
                      src={item.artwork}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}

                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePlayClick(item.id);
                    }}
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

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/artist/${item.artist}`}
                    className="block text-xs tracking-wider text-text-secondary font-extrabold hover:text-interactive-hover truncate leading-tight"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {item.artist}
                  </Link>
                  <Link
                    href={`/track/${item.id}`}
                    className={`block text-sm truncate font-extrabold leading-tight transition-colors ${
                      isSelected ? "font-extrabold text-primary" : "text-text-primary hover:text-interactive-hover"
                    }`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {item.title}
                  </Link>
                </div>

                <div className="flex items-center justify-end w-20 relative">
                  <span className={`text-[11px] text-text-secondary font-medium pr-2 ${forcedTime}`}>
                    4:32
                  </span>
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(item.id);
                  }}
                  className={`text-text-secondary hover:text-red-500 p-1 transition-opacity ${forcedHover}`}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })
        )}
      </ul>
          </ScrollableArea>
      {/* FOOTER */}
      <div className="p-4 bg-surface-raised border-t border-border-strong">
        {/* <div className="flex items-center justify-between mb-1">
          <span className="text-[15px] font-bold text-text-primary">Autoplay station</span>
          <div className="w-10 h-5 bg-brand-primary rounded-full relative cursor-pointer shadow-inner">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
        <p className="text-[12px] text-text-secondary leading-normal">
          Hear related tracks based on what&apos;s playing now.
        </p> */}
      </div>
    </div>
  );
}