'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/buttons/Button';
import MessageListBeforeSend from '@/components/messages/MessageListBeforeSend';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { useMessageLinkPreview } from '@/features/messages/hooks/useMessageLinkPreview';

interface NewMessageFormProps {
  onClose: () => void;
  onSend?: (to: string, message: string) => Promise<void> | void;
}

export default function NewMessageForm({
  onClose,
  onSend,
}: NewMessageFormProps) {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { users: suggestedUsers } = useSuggestedUsers({ size: 12 });
  const { previews } = useMessageLinkPreview(message);

  const removePreviewLink = (url: string) => {
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    setMessage((currentMessage) =>
      currentMessage
        .replace(new RegExp(`\\s*${escapedUrl}\\s*`, 'g'), ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    );
  };

  const suggestions = useMemo(
    () =>
      suggestedUsers
        .filter((user) => {
          const query = to.trim().toLowerCase();
          if (query.length === 0) {
            return false;
          }

          return (
            user.username.toLowerCase().includes(query) ||
            user.displayName?.toLowerCase().includes(query)
          );
        })
        .slice(0, 6),
    [suggestedUsers, to]
  );

  const handleSend = async () => {
    if (!to.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSend?.(to.trim().replace(/^@/, ''), message.trim());
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to send your message.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="text-base font-bold text-text-primary">
            New message
          </div>
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
              placeholder="Type a username"
              className="w-full px-3 py-2 text-sm border border-border-default rounded bg-bg-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong"
            />
            {suggestions.length > 0 && (
              <div className="rounded border border-border-default bg-bg-base">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => setTo(suggestion.username)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text-primary hover:bg-interactive-default"
                  >
                    <span>{suggestion.displayName || suggestion.username}</span>
                    <span className="text-xs text-text-muted">
                      @{suggestion.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">
              Message <span className="text-brand-primary">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Write your message. Paste a track or playlist link to share it."
              className="w-full px-3 py-2 text-sm border border-border-default rounded bg-bg-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-strong resize-none"
            />
            {previews.length > 0 ? (
              <div className="mt-2 max-h-[11rem] overflow-y-auto pr-1">
                <div className="flex flex-col gap-2">
                  {previews.map((preview) => (
                    <MessageListBeforeSend
                      key={preview.source.resourceKey}
                      type={preview.type}
                      track={
                        preview.type === 'track' ? preview.track : undefined
                      }
                      playlist={
                        preview.type === 'playlist'
                          ? preview.playlist
                          : undefined
                      }
                      onDelete={() => removePreviewLink(preview.source.url)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          {error && <p className="text-sm text-status-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-text-muted">
            Stations are not supported in messages.
          </span>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => void handleSend()}
            disabled={isSubmitting || !to.trim() || !message.trim()}
            className=" text-bg-base disabled:bg-text-muted disabled:opacity-40 "
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
