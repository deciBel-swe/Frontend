'use client';

import { useEffect, useState, type DragEvent } from 'react';
import { GripVertical, Trash2, X } from 'lucide-react';
import Button from '@/components/buttons/Button';
import ArtworkPreviewField from '@/features/tracks/TrackUploadForm/FormFields/ArtworkPreviewField';
import TrackDescriptionField from '@/features/tracks/TrackUploadForm/FormFields/TrackDescriptionField';
import { TrackPrivacy } from '@/features/tracks/TrackUploadForm/FormFields/TrackPrivacy';
import TrackTextField from '@/features/tracks/TrackUploadForm/FormFields/TrackTextField';
import type { TrackPrivacyValue } from '@/types/tracks';
import { validateImageFile } from '@/utils/fileValidation';

type EditablePlaylistTrack = {
  id: number;
  title: string;
  artist?: string;
  coverUrl?: string;
};

type EditPlaylistModalProps = {
  open: boolean;
  isSaving: boolean;
  isTrackMutationPending?: boolean;
  playlist: {
    title: string;
    description?: string;
    isPrivate?: boolean;
    coverArtUrl?: string;
  } | null;
  tracks?: EditablePlaylistTrack[];
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string;
    isPrivate: boolean;
    coverArt?: string;
  }) => Promise<void>;
  onReorderTracks?: (trackIds: number[]) => Promise<void>;
  onRemoveTrack?: (trackId: number) => Promise<void>;
};

type ModalTab = 'details' | 'tracks';

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read artwork file.'));
    reader.readAsDataURL(file);
  });

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export default function EditPlaylistModal({
  open,
  isSaving,
  isTrackMutationPending = false,
  playlist,
  tracks = [],
  onClose,
  onSave,
  onReorderTracks,
  onRemoveTrack,
}: EditPlaylistModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkRemoved, setArtworkRemoved] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [formError, setFormError] = useState('');

  const [editableTracks, setEditableTracks] = useState<EditablePlaylistTrack[]>([]);
  const [trackError, setTrackError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !playlist) {
      return;
    }

    setActiveTab('details');
    setTitle(playlist.title);
    setDescription(playlist.description ?? '');
    setPrivacy(playlist.isPrivate ? 'private' : 'public');
    setArtworkPreview(playlist.coverArtUrl ?? null);
    setArtworkFile(null);
    setArtworkRemoved(false);
    setTitleError('');
    setFormError('');
    setTrackError('');
    setEditableTracks(tracks);
    setDragIndex(null);
  }, [open, playlist, tracks]);

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

  const handleSubmitDetails = async () => {
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
    if (isSaving || isTrackMutationPending) {
      return;
    }

    onClose();
  };

  const handleTrackDragStart = (index: number) => {
    if (isTrackMutationPending || editableTracks.length < 2) {
      return;
    }

    setDragIndex(index);
  };

  const handleTrackDragOver = (
    event: DragEvent<HTMLLIElement>,
    index: number
  ) => {
    if (dragIndex === null || dragIndex === index) {
      return;
    }

    event.preventDefault();
  };

  const handleTrackDrop = (event: DragEvent<HTMLLIElement>, targetIndex: number) => {
    event.preventDefault();

    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    setEditableTracks((previous) => moveItem(previous, dragIndex, targetIndex));
    setDragIndex(null);
    setTrackError('');
  };

  const handleTrackDragEnd = () => {
    setDragIndex(null);
  };

  const handleSaveTrackOrder = async () => {
    if (!onReorderTracks || isTrackMutationPending) {
      return;
    }

    setTrackError('');

    try {
      await onReorderTracks(editableTracks.map((track) => track.id));
    } catch {
      setTrackError('Unable to save track order. Please try again.');
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    if (!onRemoveTrack || isTrackMutationPending) {
      return;
    }

    const previousTracks = editableTracks;
    setEditableTracks((items) => items.filter((track) => track.id !== trackId));
    setTrackError('');

    try {
      await onRemoveTrack(trackId);
    } catch {
      setEditableTracks(previousTracks);
      setTrackError('Unable to remove track. Please try again.');
    }
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

      <div className="relative mt-5 w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl dark:bg-black">
        <button
          onClick={handleCloseRequest}
          disabled={isSaving || isTrackMutationPending}
          className="fixed top-6 right-6 z-60 rounded-full bg-white/80 p-2 text-gray-700 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95 disabled:opacity-50 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20 dark:hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="border-b border-border-default px-5 py-4">
          <div className="text-sm font-semibold">Edit Playlist</div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'bg-surface-raised text-text-muted hover:text-text-primary'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'tracks'
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'bg-surface-raised text-text-muted hover:text-text-primary'
              }`}
              onClick={() => setActiveTab('tracks')}
            >
              Tracks
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-6">
          {activeTab === 'details' ? (
            <div className="w-full py-2">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[380px_1fr]">
                <ArtworkPreviewField
                  artworkPreview={artworkPreview}
                  onArtworkSelect={handleArtworkSelect}
                  onRemoveArtwork={handleArtworkRemove}
                />

                <div className="max-w-xl space-y-4 p-0 text-sm sm:p-4">
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

                  <TrackPrivacy value={privacy} onChange={setPrivacy} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Drag to reorder tracks and remove any track you no longer want in this playlist.
              </p>

              {editableTracks.length === 0 ? (
                <p className="rounded border border-border-default bg-surface-default px-4 py-3 text-sm text-text-muted">
                  This playlist has no tracks.
                </p>
              ) : (
                <ul className="space-y-2">
                  {editableTracks.map((track, index) => (
                    <li
                      key={`${track.id}-${index}`}
                      className={`flex items-center gap-3 rounded border border-border-default bg-surface-default px-3 py-2 ${
                        dragIndex === index ? 'opacity-70' : 'opacity-100'
                      }`}
                      draggable={!isTrackMutationPending && editableTracks.length > 1}
                      onDragStart={() => handleTrackDragStart(index)}
                      onDragOver={(event) => handleTrackDragOver(event, index)}
                      onDrop={(event) => handleTrackDrop(event, index)}
                      onDragEnd={handleTrackDragEnd}
                    >
                      <span className="text-text-muted">
                        <GripVertical size={14} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {track.title}
                        </p>
                        {track.artist ? (
                          <p className="truncate text-xs text-text-muted">{track.artist}</p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        className="rounded p-1 text-text-muted transition-colors hover:text-status-error disabled:opacity-50"
                        aria-label={`Remove ${track.title}`}
                        disabled={isTrackMutationPending || !onRemoveTrack}
                        onClick={() => {
                          void handleRemoveTrack(track.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border-default px-5 py-4">
          <span className="text-xs text-red-400">
            {activeTab === 'details'
              ? formError || '* Required fields'
              : trackError || (isTrackMutationPending ? 'Saving track changes...' : '')}
          </span>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleCloseRequest}
              disabled={isSaving || isTrackMutationPending}
            >
              {activeTab === 'details' ? 'Cancel' : 'Close'}
            </Button>

            {activeTab === 'details' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  void handleSubmitDetails();
                }}
                disabled={isSaving || isTrackMutationPending}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  void handleSaveTrackOrder();
                }}
                disabled={
                  isTrackMutationPending ||
                  editableTracks.length < 2 ||
                  !onReorderTracks
                }
              >
                {isTrackMutationPending ? 'Saving...' : 'Save order'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
