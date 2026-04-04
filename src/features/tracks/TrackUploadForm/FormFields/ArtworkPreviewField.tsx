'use client';

import { useId, useRef } from 'react';
import Image from 'next/image';

interface ArtworkPreviewFieldProps {
  artworkPreview: string | null;
  onArtworkSelect: (file: File) => void;
  onRemoveArtwork: () => void;
}

export default function ArtworkPreviewField({
  artworkPreview,
  onArtworkSelect,
  onRemoveArtwork,
}: ArtworkPreviewFieldProps) {
  const inputId = useId();
  const artworkInputRef = useRef<HTMLInputElement | null>(null);

  const handleRemoveArtwork = () => {
    onRemoveArtwork();
    if (artworkInputRef.current) {
      artworkInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-full max-w-65 sm:max-w-sm md:max-w-none aspect-square border border-dashed border-interactive-active rounded-md flex items-center justify-center hover:border-border-contrast transition cursor-pointer overflow-hidden relative"
        onClick={() => artworkInputRef.current?.click()}
      >
        {artworkPreview ? (
          <Image
            src={artworkPreview}
            alt="Artwork preview"
            className="w-full h-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center text-text-primary text-xs gap-2">
            <svg
              width="90"
              height="90"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="6"
                width="52"
                height="52"
                rx="6"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="26" cy="18" r="3" fill="currentColor" />
              <path
                d="M6 44 L20 30 L32 38 L44 26 L58 36"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span>Add new artwork</span>
          </div>
        )}
      </div>

      {artworkPreview && (
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => artworkInputRef.current?.click()}
            className="text-text-muted hover:text-text-secondary"
          >
            Replace
          </button>

          <button
            type="button"
            onClick={handleRemoveArtwork}
            className="text-status-error hover:text-status-error"
          >
            Remove
          </button>
        </div>
      )}

      <input
        ref={artworkInputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onArtworkSelect(file);
          }
        }}
      />
    </div>
  );
}
