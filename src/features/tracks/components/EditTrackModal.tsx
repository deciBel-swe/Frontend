'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { trackService } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import type { TrackPrivacyValue } from '@/types/tracks';
import { uploadSchema } from '@/types/uploadSchema';
import { validateImageFile } from '@/utils/fileValidation';
import Button from '@/components/buttons/Button';
import UploadForm from '@/features/tracks/TrackUploadForm/UploadForm';

type EditTrackModalProps = {
  open: boolean;
  onClose: () => void;
  trackId: number;
  track: {
    title: string;
    artist: string;
    cover?: string;
  };
};

export default function EditTrackModal({
  open,
  onClose,
  trackId,
  track,
}: EditTrackModalProps) {
  const queryClient = useQueryClient();
  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState(track.title);
  const [titleError, setTitleError] = useState('');
  const [genre, setGenre] = useState('');
  const [genreError, setGenreError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [uploadDate, setUploadDate] = useState(todayIsoDate);
  const [uploadDateError, setUploadDateError] = useState('');
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');
  const [artworkPreview, setArtworkPreview] = useState<string | null>(
    track.cover ?? null
  );
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkRemoved, setArtworkRemoved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState('');

  useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const resetFormState = () => {
      setTitle('');
      setTitleError('');
      setGenre('');
      setGenreError('');
      setTags([]);
      setDescription('');
      setDescriptionTouched(false);
      setUploadDate(todayIsoDate);
      setUploadDateError('');
      setPrivacy('public');
      setArtworkPreview(null);
      setArtworkFile(null);
      setArtworkRemoved(false);
      setSaveError('');
    };

    const loadTrack = async () => {
      resetFormState();
      setIsLoadingMeta(true);
      setMetaError('');

      try {
        const [data, visibility] = await Promise.all([
          trackService.getTrackMetadata(trackId),
          trackService.getTrackVisibility(trackId),
        ]);
        if (isCancelled) return;

        setTitle(data.title);
        setGenre(data.genre ?? '');
        setTags(data.tags ?? []);
        setDescription(data.description ?? '');
        setUploadDate(data.uploadDate?.trim() || todayIsoDate);
        setPrivacy(visibility.isPrivate ? 'private' : 'public');
        setArtworkPreview(data.coverUrl ?? null);
        setArtworkRemoved(false);
      } catch (err) {
        console.error('Failed to load track metadata:', err);
        if (!isCancelled) {
          setMetaError('Unable to load track details. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMeta(false);
        }
      }
    };

    void loadTrack();

    return () => {
      isCancelled = true;
    };
  }, [open, trackId, todayIsoDate]);

  const handleArtwork = async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        alert(validation.reason ?? 'Artwork must be a valid image file.');
        return;
      }

      setArtworkFile(file);
      setArtworkRemoved(false);
      const reader = new FileReader();
      reader.onload = () => {
        setArtworkPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Artwork validation failed:', err);
      alert('Unable to read artwork file. Please try another image.');
    }
  };

  const removeArtwork = () => {
    setArtworkFile(null);
    setArtworkPreview(null);
    setArtworkRemoved(true);
  };

  const handleCloseRequest = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!Number.isFinite(trackId)) {
      setSaveError('Track is missing an id.');
      return;
    }

    const normalizedTags = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.toLowerCase());

    const validation = uploadSchema.safeParse({
      title,
      genre,
      tags: normalizedTags,
      description,
      uploadDate,
      privacy,
    });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setTitleError(fieldErrors.title?.[0] ?? '');
      setGenreError(fieldErrors.genre?.[0] ?? '');
      setUploadDateError(fieldErrors.uploadDate?.[0] ?? '');
      setSaveError('');
      return;
    }

    const trimmedTitle = validation.data.title;
    setSaveError('');
    setTitleError('');
    setGenreError('');
    setUploadDateError('');
    setIsSaving(true);

    try {
      const formData = new FormData();
      const shouldDeleteCover = !artworkFile && artworkRemoved;
      if (artworkFile) {
        formData.append('coverImage', artworkFile);
      }
      formData.append('title', trimmedTitle);

      const trimmedGenre = genre.trim();
      if (trimmedGenre.length > 0) {
        formData.append('genre', trimmedGenre);
      }

      if (normalizedTags.length >= 0) {
        formData.append('tags', JSON.stringify(normalizedTags));
      }

      if (descriptionTouched) {
        formData.append('description', description);
      }

      formData.append('uploadDate', uploadDate);
      formData.append('isPrivate', String(privacy === 'private'));

      const updatedTrack = await trackService.updateTrack(trackId, formData);
      if (!updatedTrack || updatedTrack.id !== trackId) {
        throw new Error('Track update did not complete successfully.');
      }

      if (shouldDeleteCover) {
        await trackService.deleteTrackCover(trackId);
      }

      await queryClient.invalidateQueries({
        queryKey: ['userTracks'],
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('track-updated', { detail: { trackId } })
        );
      }
      onClose();
    } catch (err) {
      console.error('Track update error:', err);
      setSaveError('Unable to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      

      {/* MODAL WRAPPER */}
      <div className="fixed inset-0 z-200 flex items-start justify-center">
        {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm" onClick={handleCloseRequest} />
        <div className="relative w-full max-w-5xl bg-white dark:bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden mt-5">

          {/* CLOSE BUTTON (like EditProfileModal style) */}
          <button
            onClick={handleCloseRequest}
            disabled={isSaving}
            className="fixed top-6 right-6 z-60 p-2 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md">
            <X size={20} />
          </button>

          {/* HEADER */}
          <div className="px-5 py-4 border-b border-border-default font-semibold">
            Edit Track
          </div>

          {/* BODY */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-6">
            {isLoadingMeta ? (
              <div className="py-12 text-sm text-text-secondary">Loading track details...</div>
            ) : (
              <UploadForm
                variant="modal"
                showHeader={false}
                showFooter={false}
                onSubmit={handleSave}
                artworkPreview={artworkPreview}
                onArtworkSelect={handleArtwork}
                onRemoveArtwork={removeArtwork}
                title={title}
                titleError={titleError}
                onTitleChange={(nextTitle) => {
                  setTitle(nextTitle);
                  if (titleError && nextTitle.trim().length > 0) {
                    setTitleError('');
                  }
                  if (saveError) {
                    setSaveError('');
                  }
                }}
                genre={genre}
                genreError={genreError}
                onGenreChange={(nextGenre) => {
                  setGenre(nextGenre);
                  if (genreError) {
                    setGenreError('');
                  }
                }}
                tags={tags}
                onTagsChange={setTags}
                description={description}
                onDescriptionChange={(v) => {
                  setDescriptionTouched(true);
                  setDescription(v);
                }}
                uploadDate={uploadDate}
                uploadDateError={uploadDateError}
                onUploadDateChange={(nextDate) => {
                  setUploadDate(nextDate);
                  if (uploadDateError) {
                    setUploadDateError('');
                  }
                }}
                uploadDateMax={todayIsoDate}
                showUploadDate
                privacy={privacy}
                onPrivacyChange={(nextPrivacy) => {
                  setPrivacy(nextPrivacy);
                }}
              />
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center px-5 py-4 border-t border-border-default">
            <span className="text-xs text-red-400">
              {saveError || metaError || '* Required fields'}
            </span>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleCloseRequest} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
