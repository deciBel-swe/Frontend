'use client';

import { useEffect, useRef } from 'react';
import { MAX_DESCRIPTION_LENGTH } from '@/types/uploadSchema';

interface TrackDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TrackDescriptionField({
  value,
  onChange,
}: TrackDescriptionFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  return (
    <div>
      <label className="block text-[10px] font-extrabold text-text-primary mb-1">
        Description
      </label>
      <div className="group relative w-full">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Tracks with descriptions tend to get more plays and engangements."
          value={value}
          onChange={(event) =>
            onChange(event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))
          }
          className="w-full resize-none overflow-hidden bg-transparent py-2 text-xs text-text-primary border-b border-text-primary/15 outline-none placeholder:text-text-muted"
        />
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 group-hover:w-full group-focus-within:w-full" />
      </div>
      <p className="mt-1 text-[11px] text-text-muted">
        Max {MAX_DESCRIPTION_LENGTH} characters. {value.length}/
        {MAX_DESCRIPTION_LENGTH}
      </p>
    </div>
  );
}
