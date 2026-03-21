'use client';

import { useId, useRef } from 'react';
import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField';
import FloatingSelectField from '@/features/auth/components/FormFields/FloatingSelectField';

interface UploadFormViewProps {
  audioFile: File
  isUploading: boolean
  uploadProgress: number
  onReset: () => void
  onSubmit: () => void
  artworkPreview: string | null
  onArtworkSelect: (file: File) => void
  onRemoveArtwork: () => void
  title: string
  titleError: string
  onTitleChange: (value: string) => void
  trackLinkPrefix: string
  trackLinkSuffix: string
  onTrackLinkSuffixChange: (value: string) => void
  artist: string
  onArtistChange: (value: string) => void
  genre: string
  onGenreChange: (value: string) => void
  tags: string[]
  onTagsChange: (value: string[]) => void
  privacy: 'public' | 'private'
  onPrivacyChange: (value: 'public' | 'private') => void
}

export default function UploadFormView({
  audioFile,
  isUploading,
  uploadProgress,
  onReset,
  onSubmit,
  artworkPreview,
  onArtworkSelect,
  onRemoveArtwork,
  title,
  titleError,
  onTitleChange,
  trackLinkPrefix,
  trackLinkSuffix,
  onTrackLinkSuffixChange,
  artist,
  onArtistChange,
  genre,
  onGenreChange,
  tags,
  onTagsChange,
  privacy,
  onPrivacyChange,
}: UploadFormViewProps) {
  const inputId = useId();
  const artworkInputRef = useRef<HTMLInputElement | null>(null);
  const handleRemoveArtwork = () => {
    onRemoveArtwork();
    if (artworkInputRef.current) {
      artworkInputRef.current.value = '';
    }
  };

  return (
    <section className="min-h-screen w-full pb-32">
      <div className="sticky top-0 w-full mb-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4">
          {isUploading ? (
            <div className="w-full">
              <div className="flex justify-between text-sm text-text-muted mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>

              <div className="w-full h-2 bg-surface-raised rounded">
                <div
                  className="h-full bg-brand-accent transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary font-medium">
                  {audioFile.name}
                </span>
              </div>

              <button
                onClick={onReset}
                className="text-sm text-text-muted hover:text-text-secondary transition"
              >
                Replace
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="w-full py-2">
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[380px_1fr]">
            {/* Artwork */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-full max-w-65 sm:max-w-sm md:max-w-none aspect-square border border-dashed border-border-default rounded-lg flex items-center justify-center hover:border-border-strong transition cursor-pointer overflow-hidden relative"
                onClick={() => artworkInputRef.current?.click()}
              >
                {artworkPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artworkPreview}
                    alt="Artwork preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-text-muted text-xs gap-2">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Outer frame */}
                      <rect
                        x="6"
                        y="6"
                        width="52"
                        height="52"
                        rx="6"
                        stroke="white"
                        strokeWidth="2"
                      />

                      {/* Sun */}
                      <circle cx="26" cy="18" r="3" fill="white" />

                      {/* Mountains */}
                      <path
                        d="M6 44 
                          L20 30 
                          L32 38 
                          L44 26 
                          L58 36"
                        stroke="white"
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onArtworkSelect(file);
                }}
              />
            </div>

            {/* Track form */}
            <div className="p-0 sm:p-4 max-w-xl">
              <form className="space-y-4 text-sm">
                <div>
                  <FloatingInputField
                    type="text"
                    label="Track Title*"
                    value={title}
                    onChange={onTitleChange}
                    error={titleError || undefined}
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Track Link
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-border-default bg-interactive-default px-3 py-2 text-text-primary">
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {trackLinkPrefix}/
                    </span>
                    <input
                      type="text"
                      value={trackLinkSuffix}
                      onChange={(event) => onTrackLinkSuffixChange(event.target.value)}
                      placeholder="your-track"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <FloatingInputField
                    type="text"
                    label="Main Artist"
                    value={artist}
                    onChange={onArtistChange}
                  />
                </div>

                <div>
                  <FloatingSelectField
                    label="Genre"
                    value={genre}
                    onChange={onGenreChange}
                    placeholder="Select genre"
                    options={[
                      { value: 'Electronic', label: 'Electronic' },
                      { value: 'Rock', label: 'Rock' },
                      { value: 'Hip-Hop', label: 'Hip-Hop' },
                      { value: 'Jazz', label: 'Jazz' },
                      { value: 'Classical', label: 'Classical' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 rounded-lg border border-border-default bg-interactive-default px-3 py-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 rounded-full bg-surface-default px-3 py-1 text-xs text-text-primary"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => onTagsChange(tags.filter((item) => item !== tag))}
                          className="text-text-muted hover:text-text-secondary"
                          aria-label={`Remove ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="min-w-30 flex-1 bg-transparent text-sm text-text-primary outline-none"
                      placeholder="Add tags"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          const value = event.currentTarget.value.trim().replace(/^#/, '')
                          if (value && !tags.includes(value)) {
                            onTagsChange([...tags, value])
                          }
                          event.currentTarget.value = ''
                        }
                        if (event.key === 'Backspace' && !event.currentTarget.value && tags.length > 0) {
                          onTagsChange(tags.slice(0, -1))
                        }
                      }}
                      onBlur={(event) => {
                        const value = event.currentTarget.value.trim().replace(/^#/, '')
                        if (value && !tags.includes(value)) {
                          onTagsChange([...tags, value])
                        }
                        event.currentTarget.value = ''
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">
                    Press space or Enter to add a tag.
                  </p>
                </div>
                <div className="mb-2">
                  <label className="block text-sm text-text-muted mb-1">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Tell listeners about your track..."
                    className="w-full bg-interactive-default border border-border-default rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-strong"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Track Privacy
                  </label>

                  <div className="flex gap-6 text-xs text-text-secondary">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        className="accent-white"
                        checked={privacy === 'public'}
                        onChange={() => onPrivacyChange('public')}
                      />
                      Public
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        className="accent-white"
                        checked={privacy === 'private'}
                        onChange={() => onPrivacyChange('private')}
                      />
                      Private
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full border-t border-border-default bg-bg-base">
        <div className="w-full max-w-7xl mx-auto flex justify-end px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={onSubmit}
            className="bg-status-success text-text-on-brand w-auto px-0 sm:px-20 py-2 rounded-full font-semibold hover:bg-status-success transition"
          >
            Upload
          </button>
        </div>
      </div>
    </section>
  );
}
