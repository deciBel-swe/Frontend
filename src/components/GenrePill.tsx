import React from 'react'

type GenrePillProps = {
  genre: string;
};

export default function GenrePill({ genre }: GenrePillProps) {
  return (
    <button className="inline-flex scale-105 cursor-pointer items-center rounded-full bg-interactive-default px-2 py-1 text-xs leading-none text-text-primary transition-colors hover:bg-interactive-hover">
      <span className="mr-1 font-semibold">#</span>
      <span>{genre}</span>
    </button>
  );
}
