'use client';

import type { ReactNode } from 'react';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

/**
 * HorizontalScroll
 *
 * Wraps any horizontal row of cards with:
 *  - slim scrollbar (4px) hidden by default, appears on hover
 */
export default function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  return (
    <>
      <div className={`h-scroll ${className}`}>
        <div className="flex gap-4 min-w-max pb-6">
          {children}
        </div>
      </div>

      <style>{`
        .h-scroll {
          overflow-x: auto;
          overflow-y: visible;
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.2s ease;
          padding-bottom: 2px;
          margin-bottom: -2px;
        }
        .h-scroll:hover {
          scrollbar-color: var(--interactive-hover) transparent;
        }
        /* WebKit */
        .h-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .h-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .h-scroll::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 99px;
        }
        .h-scroll:hover::-webkit-scrollbar-thumb {
          background-color: var(--interactive-hover);
          transition: background-color 0.2s ease;
        }
      `}</style>
    </>
  );
}