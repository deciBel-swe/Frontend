'use client';

import type { TrackPrivacyValue } from '@/types/tracks';
import ArtworkPreviewField from '@/features/tracks/TrackUploadForm/FormFields/ArtworkPreviewField';
import TrackTextField from '@/features/tracks/TrackUploadForm/FormFields/TrackTextField';
import TrackLinkField from '@/features/tracks/TrackUploadForm/FormFields/TrackLinkField';
import TrackGenreField from '@/features/tracks/TrackUploadForm/FormFields/TrackGenreField';
import TrackTagsCombobox from '@/features/tracks/TrackUploadForm/FormFields/TrackTagsCombobox';
import TrackDescriptionField from '@/features/tracks/TrackUploadForm/FormFields/TrackDescriptionField';
import { TrackPrivacy } from '@/features/tracks/TrackUploadForm/FormFields/TrackPrivacy';

interface UploadFormProps {
  audioFile: File;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
  onReset: () => void;
  onSubmit: () => void;
  artworkPreview: string | null;
  onArtworkSelect: (file: File) => void;
  onRemoveArtwork: () => void;
  title: string;
  titleError: string;
  onTitleChange: (value: string) => void;
  trackLinkPrefix: string;
  trackLinkSuffix: string;
  trackLinkError?: string;
  onTrackLinkSuffixChange: (value: string) => void;
  artist: string;
  onArtistChange: (value: string) => void;
  genre: string;
  genreError?: string;
  onGenreChange: (value: string) => void;
  tags: string[];
  onTagsChange: (value: string[]) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  privacy: TrackPrivacyValue;
  onPrivacyChange: (value: TrackPrivacyValue) => void;
}

export default function UploadForm({
  audioFile,
  isUploading,
  uploadProgress,
  error,
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
  trackLinkError,
  onTrackLinkSuffixChange,
  artist,
  onArtistChange,
  genre,
  genreError,
  onGenreChange,
  tags,
  onTagsChange,
  description,
  onDescriptionChange,
  privacy,
  onPrivacyChange,
}: UploadFormProps) {
  return (
    <section className="min-h-screen w-full pb-32">
      <div className="sticky top-0 w-full mb-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4">
          {isUploading ? (
            <div className="flex gap-2 w-full justify-end">
              <span className="text-xs text-text-secondary font-medium">
                {audioFile.name}
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
                {audioFile.name}
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

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
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
                  <TrackLinkField
                    prefix={trackLinkPrefix}
                    suffix={trackLinkSuffix}
                    error={trackLinkError}
                    onChange={onTrackLinkSuffixChange}
                  />
                </div>

                <div>
                  <TrackTextField
                    label="Main Artist"
                    value={artist}
                    onChange={onArtistChange}
                    tooltipTitle="Main artist"
                    tooltipText="Put your name and any featured artists you want to give primary credit to here. These names will be displayed underneath your track title."
                  />
                </div>

                <div>
                  <TrackGenreField
                    value={genre}
                    error={genreError}
                    onChange={onGenreChange}
                  />
                </div>

                <div>
                  <TrackTagsCombobox value={tags} onChange={onTagsChange} />
                </div>
                <TrackDescriptionField
                  value={description}
                  onChange={onDescriptionChange}
                />
                <div>
                  <TrackPrivacy value={privacy} onChange={onPrivacyChange} />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full border-t border-border-default bg-bg-base">
        <div className="w-full mx-auto flex items-center justify-end px-4 sm:px-6 py-3">
          {error ? (
            <p className="text-xs text-status-error pr-4">{error}</p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onSubmit}
            className="bg-status-success/50 text-xs text-white font-extrabold w-auto px-0 sm:px-16 py-2.5 rounded-full hover:bg-status-success transition"
          >
            Upload
          </button>
        </div>
      </div>
    </section>
  );
}
