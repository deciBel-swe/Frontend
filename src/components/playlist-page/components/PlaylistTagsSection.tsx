'use client';

import React, { useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';

type PlaylistTagsSectionProps = {
  isPrivate?: boolean;
  tags?: string[];
  editable?: boolean;
};

export default function PlaylistTagsSection({
  isPrivate,
  tags = [],
  editable = true,
}: PlaylistTagsSectionProps) {
  const [tagInput, setTagInput] = useState('');
  const [localTags, setLocalTags] = useState<string[]>(tags);
  const [showTagInput, setShowTagInput] = useState(tags.length === 0);

  useEffect(() => {
    setLocalTags(tags);
    setShowTagInput(tags.length === 0);
  }, [tags]);

  function addTag() {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !localTags.includes(trimmed)) {
      setLocalTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
    setShowTagInput(false);
  }

  function removeTag(tag: string) {
    setLocalTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-3">
      {/* Privacy badge */}
      {isPrivate && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-surface-raised border border-border-default text-sm text-text-muted">
          <Lock size={13} className="shrink-0" />
          <span>This playlist is private.</span>
        </div>
      )}

      {/* Tags */}
      {localTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {localTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-interactive-default text-text-primary text-xs font-semibold hover:bg-interactive-hover transition-colors"
            >
              #{tag}
              {editable ? (
                <button
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="hover:text-brand-primary transition-colors"
                >
                  <X size={10} />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      )}

      {/* Tag input or add button */}
      {editable && showTagInput ? (
        <div className="space-y-2">
          <p className="text-sm font-bold text-text-primary">Here are some tags to get you started.</p>
          <p className="text-xs text-text-muted">
            Add tags to help people find your playlist when it&apos;s made public.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add a tag…"
              className="flex-1 text-sm px-3 py-1.5 rounded bg-surface-default text-text-primary border border-border-strong focus:outline-none focus:border-brand-primary placeholder:text-text-muted"
            />
            <button
              onClick={() => setShowTagInput(false)}
              className="text-sm text-text-muted px-3 py-1.5 rounded border border-border-strong hover:bg-surface-raised transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addTag}
              className="text-sm font-bold text-text-inverse bg-neutral-950 dark:bg-neutral-0 dark:text-neutral-950 px-4 py-1.5 rounded hover:opacity-80 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      ) : editable ? (
        <button
          onClick={() => setShowTagInput(true)}
          className="text-xs font-bold text-brand-primary hover:opacity-60 transition-opacity"
        >
          + Add tags
        </button>
      ) : null}
    </div>
  );
}