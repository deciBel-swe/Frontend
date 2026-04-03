"use client";
import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  value: number;
  onChange: (v: number) => void;
}

export default function VolumeControl({ value, onChange }: VolumeControlProps) {
  const [hover, setHover] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const offsetY = rect.bottom - clientY;
    const newValue = Math.max(0, Math.min(1, offsetY / rect.height));
    onChange(newValue);
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
    /* This outer div is the "Hit Box". 
       Increasing the padding (pb-4) ensures the 'hover' state 
       stays active while moving the mouse from the button to the slider.
    */
    <div
      className="relative flex items-center group mx-5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Slider Menu */}
      <div
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2
          flex flex-col items-center pb-4 /* Invisible bridge to the icon */
          transition-all duration-200 origin-bottom
          ${hover ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <div className="bg-[#121212] border border-neutral-800 p-3 rounded-lg shadow-2xl flex flex-col items-center h-40 w-10 relative">
          {/* Custom Slider Track */}
          <div 
            ref={trackRef}
            onMouseDown={handleMouseDown}
            className="relative w-1 h-full bg-neutral-700 rounded-full cursor-pointer flex flex-col-reverse"
          >
            {/* Active Fill */}
            <div 
              className="bg-white rounded-full w-full" 
              style={{ height: `${value * 100}%` }}
            />
            
            {/* Thumb (Ring) */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#121212] border-2 border-white rounded-full shadow-md"
              style={{ bottom: `calc(${value * 100}% - 7px)` }}
            />
          </div>

          {/* Triangle Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#121212] border-r border-b border-neutral-800 rotate-45" />
        </div>
      </div>

      {/* Volume Icon Button */}
      <button className="hover:text-neutral-400 text-white cursor-pointer transition-colors duration-200">
        {value === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}