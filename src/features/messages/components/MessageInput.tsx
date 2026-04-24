'use client';

import { useState } from 'react';
import { Button } from '@/components/buttons/Button';
import MessageListBeforeSend from '@/components/messages/MessageListBeforeSend';
import { useMessageLinkPreview } from '@/features/messages/hooks/useMessageLinkPreview';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const { previews } = useMessageLinkPreview(text);

  const removePreviewLink = (url: string) => {
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    setText((currentText) =>
      currentText
        .replace(new RegExp(`\\s*${escapedUrl}\\s*`, 'g'), ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    );
  };

  const handleSend = () => {
    if (!disabled && text.trim()) {
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
        Write your message. Paste a track or playlist link to share it inline.
      </div>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-border-default rounded bg-interactive-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong resize-none"
      />
      {previews.length > 0 ? (
        <div className="mt-3 max-h-[11rem] overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {previews.map((preview) => (
              <MessageListBeforeSend
                key={preview.source.resourceKey}
                type={preview.type}
                track={preview.type === 'track' ? preview.track : undefined}
                playlist={
                  preview.type === 'playlist' ? preview.playlist : undefined
                }
                onDelete={() => removePreviewLink(preview.source.url)}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-text-muted">
          Stations are not supported in messages.
        </span>
        <Button
          variant="secondary"
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="text-xs font-bold bg-text-primary text-bg-base px-3 py-1.5 rounded hover:opacity-80 transition-opacity duration-150 cursor-pointer disabled:opacity-50 disabled:bg-text-muted disabled:cursor-not-allowed"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
