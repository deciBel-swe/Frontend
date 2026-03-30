'use client';

import React from 'react';

type ScrollableAreaProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxHeight?: string;
};

export default function ScrollableArea({
  children,
  className = '',
  style = {},
  maxHeight = 'calc(10 * 2.5rem)',
}: ScrollableAreaProps) {
  return (
    <div
      className={
        'overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-400/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/60 ' +
        className
      }
      style={{ maxHeight, ...style }}
    >
      {children}
    </div>
  );
}
