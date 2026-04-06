'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/buttons/Button';
import { useUpdatePlaylist } from '@/hooks/usePlaylists';

type EditPlaylistModalProps = {
  open: boolean;
  onClose: () => void;
  playlist: {
    id: number;
    title: string;
    isPrivate?: boolean;
  };
};

export default function EditPlaylistModal({
  open,
  onClose,
  playlist,
}: EditPlaylistModalProps) {
  const [title, setTitle] = useState(playlist.title);
  const [titleError, setTitleError] = useState('');
  const [isPrivate, setIsPrivate] = useState(playlist.isPrivate ?? false);
  const [saveError, setSaveError] = useState('');

  const { mutate: updatePlaylist, isPending: isSaving } = useUpdatePlaylist();

  useEffect(() => {
    if (!open) return;

    setTitle(playlist.title);
    setIsPrivate(playlist.isPrivate ?? false);
    setTitleError('');
    setSaveError('');
  }, [open, playlist]);

  const handleCloseRequest = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = () => {
    if (isSaving) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }

    setTitleError('');
    setSaveError('');

    updatePlaylist(
      {
        playlistId: playlist.id,
        data: {
          title: trimmedTitle,
          isPrivate,
          type: 'PLAYLIST', // Satisfies the schema requirement
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          setSaveError('Unable to save changes. Please try again.');
        },
      }
    );
  };

  if (!open) return null;

  return (
    <>
      {/* MODAL WRAPPER */}
      <div className="fixed inset-0 z-200 flex items-start justify-center">
        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
          onClick={handleCloseRequest}
        />

        {/* CONTAINER */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden mt-5">
          {/* CLOSE BUTTON */}
          <button
            onClick={handleCloseRequest}
            disabled={isSaving}
            className="fixed top-6 right-6 z-60 p-2 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            <X size={20} />
          </button>

          {/* HEADER */}
          <div className="px-5 py-4 border-b border-border-default font-semibold text-text-primary">
            Edit Playlist
          </div>

          {/* BODY */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-6 space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                placeholder="Name your playlist"
                className={`w-full px-3 py-2 bg-transparent border rounded-md focus:outline-none focus:ring-1 text-text-primary ${
                  titleError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-border-default focus:border-brand-primary focus:ring-brand-primary'
                }`}
              />
              {titleError && (
                <p className="text-red-500 text-xs mt-1">{titleError}</p>
              )}
            </div>

            {/* Privacy Field */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                Privacy
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="accent-brand-primary"
                  />
                  <span className="text-sm">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-text-primary">
                  <input
                    type="radio"
                    name="privacy"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="accent-brand-primary"
                  />
                  <span className="text-sm">Private</span>
                </label>
              </div>
              <p className="text-xs text-text-muted mt-2">
                {isPrivate
                  ? 'Only you can see this playlist.'
                  : 'Anyone can see and listen to this playlist.'}
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center px-5 py-4 border-t border-border-default">
            <span className="text-xs text-red-400">
              {saveError || (titleError ? '* Required fields' : '')}
            </span>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleCloseRequest}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
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
