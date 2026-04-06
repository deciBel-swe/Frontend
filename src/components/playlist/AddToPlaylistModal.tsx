'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Lock, Music } from 'lucide-react';

import Button from '@/components/buttons/Button';
import { TrackTextField, TrackPrivacy } from '@/components/FormFields';
import {
  useMePlaylists,
  useAddTrackToPlaylist,
  useCreatePlaylist,
} from '@/hooks/usePlaylists';
import type { TrackPrivacyValue } from '@/types/tracks';

// Define a local safe type for the UI to bypass strict Zod schema errors
type UIPlaylist = {
  id: number;
  title: string;
  isPrivate?: boolean;
  tracks?: Array<{ coverUrl?: string }>;
};

interface AddToPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  trackId: number;
  track: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
}

type Tab = 'add' | 'create';

export default function AddToPlaylistModal({
  open,
  onClose,
  trackId,
  track,
}: AddToPlaylistModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('add');

  // Tab 1 State (Add to Existing)
  const [filterText, setFilterText] = useState('');
  const { data: playlists, isLoading: isLoadingPlaylists } = useMePlaylists();
  const { mutate: addTrack, isPending: isAddingTrack } =
    useAddTrackToPlaylist();
  const [addedPlaylists, setAddedPlaylists] = useState<Set<number>>(new Set());

  // Tab 2 State (Create New)
  const [newTitle, setNewTitle] = useState('');
  const [newPrivacy, setNewPrivacy] = useState<TrackPrivacyValue>('public');
  const { mutate: createPlaylist, isPending: isCreating } = useCreatePlaylist();

  const filteredPlaylists = useMemo(() => {
    if (!playlists) return [];
    if (!filterText.trim()) return playlists;
    const normalized = filterText.toLowerCase();
    return playlists.filter((p) => p.title.toLowerCase().includes(normalized));
  }, [playlists, filterText]);

  if (!open) return null;

  // --- Handlers ---

  const handleAddToExisting = (playlistId: number) => {
    if (addedPlaylists.has(playlistId)) return; // Prevent double adding

    addTrack(
      { playlistId, trackId },
      {
        onSuccess: () => {
          setAddedPlaylists((prev) => new Set(prev).add(playlistId));
        },
        onError: () => {
          alert('Failed to add track to playlist.');
        },
      }
    );
  };

  const handleCreateAndAdd = () => {
    if (!newTitle.trim()) return;

    createPlaylist(
      {
        title: newTitle,
        type: 'PLAYLIST',
        isPrivate: newPrivacy === 'private',
      },
      {
        onSuccess: (newPlaylist) => {
          // Immediately add the track to the newly created playlist
          addTrack(
            { playlistId: newPlaylist.id, trackId },
            {
              onSuccess: () => {
                onClose();
              },
            }
          );
        },
        onError: () => {
          alert('Failed to create playlist.');
        },
      }
    );
  };

  const handleClose = () => {
    if (isCreating || isAddingTrack) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-surface-default border border-border-default rounded-lg shadow-2xl overflow-hidden animate-drop-in flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Tabs Header */}
        <div className="flex px-6 pt-4 border-b border-border-default">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 mr-6 text-[15px] font-bold transition-colors relative ${
              activeTab === 'add'
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Add to playlist
            {activeTab === 'add' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-[15px] font-bold transition-colors relative ${
              activeTab === 'create'
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Create a playlist
            {activeTab === 'create' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'add' && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Filter playlists"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full px-3 py-2 bg-bg-subtle border border-border-default rounded text-sm text-text-primary outline-none focus:border-border-brand transition-colors"
              />

              <div className="flex flex-col gap-2 mt-2">
                {isLoadingPlaylists ? (
                  <p className="text-sm text-text-muted text-center py-4">
                    Loading playlists...
                  </p>
                ) : filteredPlaylists.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">
                    No playlists found.
                  </p>
                ) : (
                  filteredPlaylists.map((item) => {
                    // Safe explicit cast to circumvent Zod schema inference limitations
                    const playlist = item as unknown as UIPlaylist;
                    const isAdded = addedPlaylists.has(playlist.id);
                    const trackCount = playlist.tracks?.length || 0;
                    const firstTrackCover = playlist.tracks?.[0]?.coverUrl;

                    return (
                      <div
                        key={playlist.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-surface-raised transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 bg-interactive-default rounded shrink-0 flex items-center justify-center overflow-hidden">
                            {firstTrackCover ? (
                              <Image
                                src={firstTrackCover}
                                alt={playlist.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Music size={16} className="text-text-muted" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-text-primary truncate">
                              {playlist.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                              <span>{trackCount} tracks</span>
                              {playlist.isPrivate && (
                                <span className="flex items-center gap-0.5 px-1 bg-surface-raised rounded text-[10px] uppercase font-bold tracking-wider">
                                  <Lock size={10} /> Private
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isAdded ? 'ghost' : 'secondary'}
                          disabled={isAdded || isAddingTrack}
                          onClick={() => handleAddToExisting(playlist.id)}
                          className={
                            isAdded ? 'text-brand-primary cursor-default' : ''
                          }
                        >
                          {isAdded ? 'Added' : 'Add to Playlist'}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="flex flex-col gap-6">
              <TrackTextField
                label="Playlist title"
                value={newTitle}
                onChange={setNewTitle}
                required
              />

              <div className="flex items-center justify-between">
                <TrackPrivacy value={newPrivacy} onChange={setNewPrivacy} />
                <Button
                  size="md"
                  variant="secondary"
                  onClick={handleCreateAndAdd}
                  disabled={!newTitle.trim() || isCreating || isAddingTrack}
                >
                  {isCreating || isAddingTrack ? 'Saving...' : 'Save'}
                </Button>
              </div>

              {/* Selected Track Preview */}
              <div className="mt-4 border-t border-border-default pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-interactive-default rounded flex items-center justify-center shrink-0 overflow-hidden">
                      {track.coverUrl ? (
                        <Image
                          src={track.coverUrl}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Music size={16} className="text-text-muted" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 text-sm">
                      <span className="font-bold text-text-primary truncate">
                        {track.title}
                      </span>
                      <span className="text-text-muted truncate">
                        {track.artist}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 text-text-muted hover:text-status-error transition-colors"
                    title="Cancel adding track"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
