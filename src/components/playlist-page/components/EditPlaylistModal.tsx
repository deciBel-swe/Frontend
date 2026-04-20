'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/buttons/Button';
import ArtworkPreviewField from '@/features/tracks/TrackUploadForm/FormFields/ArtworkPreviewField';
import TrackDescriptionField from '@/features/tracks/TrackUploadForm/FormFields/TrackDescriptionField';
import { TrackPrivacy } from '@/features/tracks/TrackUploadForm/FormFields/TrackPrivacy';
import TrackTextField from '@/features/tracks/TrackUploadForm/FormFields/TrackTextField';
import type { TrackPrivacyValue } from '@/types/tracks';
import { validateImageFile } from '@/utils/fileValidation';

type EditPlaylistModalProps = {
  open: boolean;
  isSaving: boolean;
  playlist: {
    title: string;
    description?: string;
    isPrivate?: boolean;
    coverArtUrl?: string;
  } | null;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string;
    isPrivate: boolean;
    coverArt?: string;
  }) => Promise<void>;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read artwork file.'));
    reader.readAsDataURL(file);
  });

export default function EditPlaylistModal({
  open,
  isSaving,
  playlist,
  onClose,
  onSave,
}: EditPlaylistModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkRemoved, setArtworkRemoved] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open || !playlist) {
      return;
    }

    setTitle(playlist.title);
    setDescription(playlist.description ?? '');
    setPrivacy(playlist.isPrivate ? 'private' : 'public');
    setArtworkPreview(playlist.coverArtUrl ?? null);
    setArtworkFile(null);
    setArtworkRemoved(false);
    setTitleError('');
    setFormError('');
  }, [open, playlist]);

  const handleArtworkSelect = async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        setFormError(validation.reason ?? 'Artwork must be a valid image file.');
        return;
      }

      setFormError('');
      setArtworkFile(file);
      setArtworkRemoved(false);

      const dataUrl = await readFileAsDataUrl(file);
      setArtworkPreview(dataUrl);
    } catch {
      setFormError('Unable to read artwork file. Please try another image.');
    }
  };

  const handleArtworkRemove = () => {
    setArtworkFile(null);
    setArtworkPreview(null);
    setArtworkRemoved(true);
    setFormError('');
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setTitleError('Title is required.');
      return;
    }

    setTitleError('');
    setFormError('');

    try {
      const payload: {
        title: string;
        description: string;
        isPrivate: boolean;
        coverArt?: string;
      } = {
        title: trimmedTitle,
        description: description.trim(),
        isPrivate: privacy === 'private',
      };

      if (artworkFile) {
        payload.coverArt = await readFileAsDataUrl(artworkFile);
      } else if (artworkRemoved) {
        payload.coverArt = '';
      } else if (playlist?.coverArtUrl) {
        payload.coverArt = playlist.coverArtUrl;
      }

      await onSave(payload);
    } catch {
      setFormError('Unable to save playlist details. Please try again.');
    }
  };

  const handleCloseRequest = () => {
    if (isSaving) {
      return;
    }

    onClose();
  };

  if (!open || !playlist) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-200 flex items-start justify-center">
      <div
        className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
        onClick={handleCloseRequest}
      />

      <div className="relative w-full max-w-5xl bg-white dark:bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden mt-5">
        <button
          onClick={handleCloseRequest}
          disabled={isSaving}
          className="fixed top-6 right-6 z-60 p-2 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="px-5 py-4 border-b border-border-default font-semibold">
          Edit Playlist
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-6">
          <div className="w-full py-2">
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[380px_1fr]">
              <ArtworkPreviewField
                artworkPreview={artworkPreview}
                onArtworkSelect={handleArtworkSelect}
                onRemoveArtwork={handleArtworkRemove}
              />

              <div className="p-0 sm:p-4 max-w-xl space-y-4 text-sm">
                <TrackTextField
                  label="Playlist Title"
                  value={title}
                  onChange={(value) => {
                    setTitle(value);
                    if (titleError && value.trim().length > 0) {
                      setTitleError('');
                    }
                  }}
                  error={titleError || undefined}
                  required
                  tooltipTitle="Playlist title"
                  tooltipText="Clear playlist titles help listeners quickly discover your set."
                />

                <TrackDescriptionField
                  value={description}
                  onChange={setDescription}
                />

                <TrackPrivacy
                  value={privacy}
                  onChange={setPrivacy}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-t border-border-default">
          <span className="text-xs text-red-400">
            {formError || '* Required fields'}
          </span>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCloseRequest} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
