'use client';

import { useState } from 'react';
import { Button } from '@/components/buttons/Button';

interface MessageInputProps {
  onSend: (text: string) => void;
  onAddTrackOrPlaylist: () => void;
}

export default function MessageInput({ onSend, onAddTrackOrPlaylist }: MessageInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 bg-bg-base">
      <div className="text-xs font-bold text-text-primary mb-2">
        Write your message and add tracks or playlists <span className="text-brand-primary">*</span>
      </div>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 text-sm border border-border-default rounded bg-interactive-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong resize-none"
      />
      <div className="flex justify-between items-center mt-3">
        <Button
          variant='secondary_inverse'
          type="button"
          size='sm'
          onClick={onAddTrackOrPlaylist}
          className="text-xs font-semibold border border-border-strong rounded px-3 py-1.5 text-text-primary hover:bg-interactive-default transition-colors duration-150 cursor-pointer"
        >
          Add track or playlist
        </Button>
        <Button
          variant='secondary'
          type="button"
          size='sm'
          onClick={handleSend}
          disabled={!text.trim()}
          className="text-xs font-bold bg-text-primary text-bg-base px-3 py-1.5 rounded hover:opacity-80 transition-opacity duration-150 cursor-pointer disabled:opacity-50 disabled:bg-text-muted disabled:cursor-not-allowed"
        >
          Send
        </Button>
      </div>
    </div>
  );
}