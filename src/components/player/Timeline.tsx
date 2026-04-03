"use client";
import { useRef } from "react";

interface TimelineProps {
  duration: number;
  currentTime: number;
  onScrub: (time: number) => void;
}

export default function Timeline({ duration, currentTime, onScrub }: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = (currentTime / duration) * 100 || 0;

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    // Calculate percentage based on horizontal position
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    onScrub(percentage * duration);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleMouseMove(e);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onMouseMove = (event: MouseEvent) => handleMouseMove(event as any);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-2xl group select-none">
      {/* Current Time */}
      <span className="text-xs font-bold text-white tabular-nums min-w-[22px]">
        {format(currentTime)}
      </span>

      {/* Progress Container */}
      <div 
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="relative flex-1 h-6 flex items-center cursor-pointer"
      >
        {/* Background Track (Gray) */}
        <div className="absolute w-full h-1 bg-neutral-500 rounded-full" />

        {/* Active Progress (Orange) */}
        <div 
          className="absolute h-1 bg-[#FF4500] rounded-full" 
          style={{ width: `${progress}%` }}
        />

        {/* Thumb (The Orange Ring) - Only visible on group hover */}
        <div 
          className="absolute w-3 h-3 bg-[#1a1a1a] border-2 border-[#FF4500] rounded-full shadow-lg transition-opacity duration-150 opacity-0 group-hover:opacity-100"
          style={{ 
            left: `${progress}%`,
            transform: 'translateX(-50%)' 
          }}
        />
      </div>

      {/* Duration */}
      <span className="text-xs font-bold text-white tabular-nums min-w-[22px] text-right">
        {format(duration)}
      </span>
    </div>
  );
}

function format(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}