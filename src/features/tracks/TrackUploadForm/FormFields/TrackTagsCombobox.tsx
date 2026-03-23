'use client';

import { useMemo, useState } from 'react';
import { MAX_TAG_LENGTH, MAX_TAGS } from '@/types/uploadSchema';

const TAG_OPTIONS = [
  'ambient',
  'chill',
  'deep-house',
  'drum-and-bass',
  'electronic',
  'focus',
  'house',
  'indie',
  'lofi',
  'night-drive',
  'synthwave',
  'vocal',
];

interface TrackTagsComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const normalizeTag = (value: string): string =>
  value
    .trim()
    .replace(/^#/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export default function TrackTagsCombobox({
  value,
  onChange,
}: TrackTagsComboboxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeTag(query);
    const selected = new Set(value);

    return TAG_OPTIONS.filter((option) => {
      if (selected.has(option)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return option.includes(normalizedQuery);
    }).slice(0, 6);
  }, [query, value]);

  const addTag = (rawValue: string) => {
    if (value.length >= MAX_TAGS) {
      setQuery('');
      return;
    }

    const tag = normalizeTag(rawValue);
    if (!tag || value.includes(tag)) {
      setQuery('');
      return;
    }

    if (tag.length > MAX_TAG_LENGTH) {
      setQuery('');
      return;
    }

    onChange([...value, tag]);
    setQuery('');
  };

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-1">
        <label className="block text-[10px] font-extrabold text-text-primary">
          Tags
        </label>
        <div className="relative group">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-border-contrast text-[7px] text-text-primary cursor-pointer">
            ?
          </span>
          <div className="hidden group-hover:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 w-64 bg-bg-base border border-interactive-default rounded-lg shadow-lg p-4">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-default border-l border-t border-border-default rotate-45" />
            <p className="text-xs font-bold text-text-primary mb-1">Tags</p>
            <p className="text-[10px] text-text-primary font-semibold leading-snug">
              Add a few searchable tags to help listeners discover your track.
            </p>
          </div>
        </div>
      </div>
      <div className="group relative w-full">
        <div className="flex flex-wrap gap-2 py-2 border-b border-text-primary/15">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full border border-border-default px-2 py-0.5 text-[10px] text-text-primary"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== tag))}
                className="text-text-muted hover:text-text-secondary"
                aria-label={`Remove ${tag}`}
              >
                x
              </button>
            </span>
          ))}

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="min-w-30 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
            placeholder="Add tags"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag(query);
                return;
              }

              if (event.key === 'Backspace' && !query && value.length > 0) {
                onChange(value.slice(0, -1));
              }
            }}
          />
        </div>
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 group-hover:w-full group-focus-within:w-full" />

        {isFocused && suggestions.length > 0 ? (
          <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 border border-border-default rounded-md bg-bg-base max-h-40 overflow-auto shadow-lg">
            {suggestions.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-interactive-default"
                  onClick={() => addTag(option)}
                >
                  #{option}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-text-muted">
        Press Enter to add a tag.
        Max {MAX_TAGS} tags, {MAX_TAG_LENGTH} chars each. {value.length}/
        {MAX_TAGS} used.
      </p>
    </div>
  );
}
