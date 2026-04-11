"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useToggleArrow } from "@/components/notifications/useToggleArrow";

interface ArrowToggleButtonProps {
  label?: string; 
  initialOpen?: boolean;
}

export const ArrowToggleButton = ({
  label = "All notifications",
  initialOpen = false,
}: ArrowToggleButtonProps) => {
  const { open, toggle } = useToggleArrow(initialOpen);

  const menuItems = [
    "All notifications",
    "Likes",
    "Reposts",
    "Follows",
    "Comments",
  ];

  return (
    <div className="relative inline-block">
      {/* Button: Smaller size, mapped to your Decibel Design Tokens */}
      <button
        onClick={toggle}
        className="px-3 py-1.5 text-sm font-bold text-text-primary bg-surface-raised hover:bg-interactive-hover transition-all rounded-md flex items-center gap-2 cursor-pointer"
      >
        {label}
        {open ? (
          <ChevronUp size={16} strokeWidth={2.5} />
        ) : (
          <ChevronDown size={16} strokeWidth={2.5} />
        )}
      </button>

      {/* Dropdown: Uses animate-drop-in from your globals.css */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-40
            bg-surface-raised border border-border-default rounded-md shadow-lg
            text-sm z-20 overflow-hidden
            animate-drop-in
          "
        >
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="
                w-full text-left px-3 py-2 text-text-secondary hover:text-text-primary
                hover:bg-interactive-default transition-colors cursor-pointer
              "
              onClick={() => {
                console.log("Selected:", item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};