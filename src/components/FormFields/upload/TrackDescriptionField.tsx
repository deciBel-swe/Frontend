'use client';

import { useEffect, useRef } from 'react';

interface AutoResizeTextareaFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AutoResizeTextareaField({
  label = 'Description',
  value,
  onChange,
  placeholder = 'Write a short description.',
}: AutoResizeTextareaFieldProps) {
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
        {label}
      </label>
      <div className="group relative w-full">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-none overflow-hidden bg-transparent py-2 text-xs text-text-primary border-b border-text-primary/15 outline-none placeholder:text-text-muted"
        />
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 group-hover:w-full group-focus-within:w-full" />
      </div>
    </div>
  );
}

export const TrackDescriptionField = AutoResizeTextareaField;
