'use client';

import { useEffect, useState } from 'react';
import { Lock} from 'lucide-react';

type PlaylistTagsSectionProps = {
  isPrivate?: boolean;
  tags?: string[];
  editable?: boolean;
};

export default function PlaylistTagsSection({
  isPrivate,
  tags = [],
}: PlaylistTagsSectionProps) {
  const [localTags, setLocalTags] = useState<string[]>(tags);

  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

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
            </span>
          ))}
        </div>
      )}

    </div>
  );
}