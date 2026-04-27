'use client';

import type { TrackPrivacyValue } from '@/types/tracks';
import ArtworkPreviewField from '@/features/tracks/TrackUploadForm/FormFields/ArtworkPreviewField';
import TrackTextField from '@/features/tracks/TrackUploadForm/FormFields/TrackTextField';
import TrackGenreField from '@/features/tracks/TrackUploadForm/FormFields/TrackGenreField';
import TrackTagsCombobox from '@/features/tracks/TrackUploadForm/FormFields/TrackTagsCombobox';
import TrackDescriptionField from '@/features/tracks/TrackUploadForm/FormFields/TrackDescriptionField';
import TrackUploadDateField from '@/features/tracks/TrackUploadForm/FormFields/TrackReleaseDateField';
import { TrackPrivacy } from '@/features/tracks/TrackUploadForm/FormFields/TrackPrivacy';

interface UploadFormProps {
  audioFile?: File;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  onReset?: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  variant?: 'page' | 'modal';
  showHeader?: boolean;
  showFooter?: boolean;
  artworkPreview: string | null;
  onArtworkSelect: (file: File) => void;
  onRemoveArtwork: () => void;
  title: string;
  titleError: string;
  onTitleChange: (value: string) => void;
  genre: string;
  genreError?: string;
  onGenreChange: (value: string) => void;
  tags: string[];
  onTagsChange: (value: string[]) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  uploadDate?: string;
  uploadDateError?: string;
  onUploadDateChange?: (value: string) => void;
  uploadDateMax?: string;
  showUploadDate?: boolean;
  privacy: TrackPrivacyValue;
  onPrivacyChange: (value: TrackPrivacyValue) => void;
}

export default function UploadForm({
  audioFile,
  isUploading = false,
  uploadProgress = 0,
  error,
  onReset,
  onSubmit,
  submitLabel = 'Upload',
  submitDisabled,
  variant = 'page',
  showHeader = true,
  showFooter = true,
  artworkPreview,
  onArtworkSelect,
  onRemoveArtwork,
  title,
  titleError,
  onTitleChange,
  genre,
  genreError,
  onGenreChange,
  tags,
  onTagsChange,
  description,
  onDescriptionChange,
  uploadDate = '',
  uploadDateError,
  onUploadDateChange,
  uploadDateMax,
  showUploadDate = false,
  privacy,
  onPrivacyChange,
}: UploadFormProps) {
  const isModal = variant === 'modal';
  const shouldShowHeader = showHeader && Boolean(audioFile) && Boolean(onReset);
  const isSubmitDisabled = submitDisabled ?? isUploading;

  return (
    <section className={isModal ? 'w-full' : 'min-h-screen w-full pb-32'}>
      {shouldShowHeader ? (
        <div className={isModal ? 'w-full mb-6' : 'sticky top-0 w-full mb-8'}>
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4">
            {isUploading ? (
              <div className="flex gap-2 w-full justify-end">
                <span className="text-xs text-text-secondary font-medium">
                  {audioFile?.name}
                </span>
                <div className="flex justify-between text-xs text-status-success mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="w-fit min-w-50 h-1.5 mt-1.5 bg-surface-raised rounded">
                  <div
                    className="h-full bg-status-success transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <button
                  onClick={onReset}
                  className="text-xs text-text-primary font-bold transition hover:underline"
                >
                  Replace track
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full justify-end">
                <span className="text-xs text-text-secondary font-medium">
                  {audioFile?.name}
                </span>
                <button
                  onClick={onReset}
                  className="text-xs text-text-primary font-bold transition hover:underline"
                >
                  Replace track
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div
        className={
          isModal
            ? 'w-full'
            : 'w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'
        }
      >
        <div className="w-full py-2">
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[380px_1fr]">
            <ArtworkPreviewField
              artworkPreview={artworkPreview}
              onArtworkSelect={onArtworkSelect}
              onRemoveArtwork={onRemoveArtwork}
            />

            {/* Track form */}
            <div className="p-0 sm:p-4 max-w-xl">
              <form className="space-y-4 text-sm">
                <div>
                  <TrackTextField
                    label="Track Title"
                    value={title}
                    onChange={onTitleChange}
                    error={titleError || undefined}
                    required
                    tooltipTitle="Track title"
                    tooltipText="Clear track titles help your fans know what they are listening to."
                  />
                </div>

                <div>
                  {/* URL and Main Artist fields intentionally removed */}
                </div>

                <div>
                  <TrackGenreField
                    value={genre}
                    error={genreError}
                    onChange={onGenreChange}
                    required
                  />
                </div>

                <div>
                  <TrackTagsCombobox value={tags} onChange={onTagsChange} />
                </div>
                <TrackDescriptionField
                  value={description}
                  onChange={onDescriptionChange}
                />
                {showUploadDate && onUploadDateChange ? (
                  <TrackUploadDateField
                    value={uploadDate}
                    onChange={onUploadDateChange}
                    error={uploadDateError}
                    maxDate={uploadDateMax}
                  />
                ) : null}
                <div>
                  <TrackPrivacy value={privacy} onChange={onPrivacyChange} />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showFooter ? (
        <div
          className={
            isModal
              ? 'w-full border-t border-border-default bg-bg-base'
              : 'fixed bottom-12 left-0 w-full border-t border-border-default bg-bg-base'
          }
        >
          <div className="w-full mx-auto flex items-center justify-end px-4 sm:px-6 py-3">
            {error ? (
              <p className="text-xs text-status-error pr-4">{error}</p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className="bg-status-success/50 text-xs text-white font-extrabold w-auto px-0 sm:px-16 py-2.5 rounded-full hover:bg-status-success transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
