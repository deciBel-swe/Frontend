'use client';

import { useState } from 'react';
import { Button } from '@/components/buttons/Button';

interface NewMessageFormProps {
  onClose: () => void;
  onSend?: (to: string, message: string) => void;
}

export default function NewMessageForm({ onClose, onSend }: NewMessageFormProps) {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!to.trim() || !message.trim()) return;
    onSend?.(to, message);
    onClose();
  };

  return (
    // Faux viewport wrapper (avoids fixed positioning issues)
    <div
      className="fixed inset-0 z-500 flex items-start justify-center bg-surface-overlay pt-16"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-default rounded-lg w-full max-w-xl mx-4 shadow-xl border border-border-strong">
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-4 ">
          <div className="text-base font-bold text-text-primary">New message</div>
          
        </div>

        {/* Form body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* To field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">
              To <span className="text-brand-primary">*</span>
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border-default rounded bg-bg-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong"
            />
          </div>

          {/* Message textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">
              Write your message and add tracks or playlists <span className="text-brand-primary">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 text-sm border border-border-default rounded bg-bg-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3">
          <Button variant="secondary_inverse" size="sm" type="button">
            Add track or playlist
          </Button>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleSend}
            disabled={!to.trim() || !message.trim()}
            className=" text-bg-base disabled:bg-text-muted disabled:opacity-40 "
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}