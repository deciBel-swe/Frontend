'use client';

import { Send } from 'lucide-react';
import Button from '@/components/buttons/Button';

type CommentInputProps = {
  avatarUrl?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function CommentInput({
  avatarUrl,
  value,
  onChange,
  onSubmit,
  placeholder = 'Write a comment…',
  disabled = false,
}: CommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Your avatar"
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-interactive-default flex-shrink-0" />
      )}

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent border-0 border-b border-border-default focus:border-brand-primary outline-none text-sm text-text-primary placeholder:text-text-muted py-1.5 transition-colors"
      />

      {/* Submit */}
      <Button
        variant="ghost"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Post comment"
        className="text-text-muted hover:text-brand-primary disabled:opacity-30 p-1"
      >
        <Send size={16} />
      </Button>
    </div>
  );
}