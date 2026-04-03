"use client";
import { useState } from "react";
import { Heart, UserPlus, ListMusic } from "lucide-react";

export default function FilledSocialActions() {
  const [isLiked, setIsLiked] = useState(true); // Default to liked for demonstration

  return (
    <div className="flex items-center gap-6 p-4 select-none">
      
      {/* Filled Like Button */}
      <div className="relative group flex justify-center">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`transition-colors duration-200 active:scale-95 ${
            isLiked ? "text-orange-500 hover:text-orange-400" : "hover:text-neutral-400 text-white cursor-pointer"
          }`}
        >
          {/* fill="currentColor" makes it solid/filled */}
          <Heart size={15} strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>

      {/* Solid UserPlus Button */}
      <div className="relative group flex justify-center">
        <button className="text-white hover:text-orange-500 transition-colors duration-200 active:scale-95">
          {/* Using strokeWidth and fill to approximate the solid look */}
          <UserPlus size={15} strokeWidth={3} fill="currentColor" className="hover:text-neutral-400 text-white cursor-pointer" />
        </button>
      </div>

      {/* Solid ListMusic Button */}
      <div className="relative group flex justify-center">
        <button className="text-white hover:text-orange-500 transition-colors duration-200 active:scale-95">
          {/* Using strokeWidth and fill to approximate the solid look */}
          <ListMusic size={15} strokeWidth={3} fill="currentColor" className="hover:text-neutral-400 text-white cursor-pointer" />
        </button>
      </div>

    </div>
  );
}