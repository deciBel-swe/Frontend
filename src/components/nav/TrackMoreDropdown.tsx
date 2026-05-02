'use client';

import { useRef, useEffect } from 'react';
import { MoreHorizontal, ListPlus, ListMusic, Flag} from 'lucide-react';
import Button from '@/components/buttons/Button';
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu';

export type TrackMoreDropdownProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onAddToNextUp?: () => void;
  onAddToPlaylist?: () => void;
  onStation?: () => void;
  onReport?: () => void;
};

export default function TrackMoreDropdown({
  isOpen,
  onToggle,
  onClose,
  onAddToNextUp,
  onAddToPlaylist,
  onReport,
}: TrackMoreDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        onClick={onToggle}
        aria-label="More options"
        aria-expanded={isOpen}
        className="flex items-center justify-center px-2 py-1.5 rounded text-text-muted hover:text-text-primary"
      >
        <MoreHorizontal size={16} />
      </Button>

      {isOpen && (
        <DropdownMenu
            onClose={onClose}
            items={[
            onAddToNextUp && { label: 'Add to Next up', icon: <ListPlus size={16} />, onClick: onAddToNextUp },
            onAddToPlaylist && { label: 'Add to Playlist', icon: <ListMusic size={16} />, onClick: onAddToPlaylist },
            onReport && { label: 'Report', icon: <Flag size={13} />, onClick: onReport },
            ].filter(Boolean) as DropdownMenuItem[]}
        />
      )}
    </div>
  );
}
