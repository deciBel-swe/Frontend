'use client';

import { useState, FC } from 'react';
import { Send } from 'lucide-react';
import Button from './buttons/Button';
import Image from 'next/image';
interface CommentInputProps {
  user: {
    avatar: string;
    name?: string;
  };
  onPost?: (comment: string) => void;
}

const CommentInput: FC<CommentInputProps> = ({ user, onPost }) => {
  const [comment, setComment] = useState('');

  const handleSend = () => {
    if (!comment.trim()) return;
    if (onPost) onPost(comment);
    setComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-3 flex items-center w-full gap-2">
      {/* Avatar */}
      <Image
        src={user.avatar}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        width ={36}
        height={36}
        alt={user.name || 'User Avatar'}
      />

      {/* Input + Send */}
      <div className="flex w-full items-center gap-2">
          <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-10 px-3 text-sm rounded bg-interactive-default text-text-primary outline-none placeholder:text-text-muted border border-transparent focus:border-interactive-active"
        />

        <Button
          variant='secondary'
          onClick={handleSend}
        >
          <Send className="w-4 h-4 text-primary" />
        </Button>
      </div>
    </div>
  );
};

export default CommentInput;