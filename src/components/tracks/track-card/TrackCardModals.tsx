'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AddToPlaylistModal, {
  type ActiveTab,
} from '@/components/playlist/AddToPlaylistModal';
import type { PlaylistItem } from '@/components/playlist/AddToPlaylistTab';
import { ShareModal } from '@/features/prof/components/ShareModal';
import EditTrackModal from '@/features/tracks/components/EditTrackModal';
import { playlistService } from '@/services';

type TrackCardModalsProps = {
  trackId: string;
  routeTrackId?: string;
  trackNumericId: number;
  isPrivate: boolean;
  track: {
    title: string;
    artist: {
      username: string;
      displayName?: string;
      avatar: string;
    };
    cover: string;
    duration: string;
  };
  editOpen: boolean;
  isShareOpen: boolean;
  isPlaylistModalOpen: boolean;
  activeTab: ActiveTab;
  setEditOpen: (value: boolean) => void;
  setIsShareOpen: (value: boolean) => void;
  setIsPlaylistModalOpen: (value: boolean) => void;
  setActiveTab: (value: ActiveTab) => void;
};

export default function TrackCardModals({
  trackId,
  routeTrackId,
  trackNumericId,
  isPrivate,
  track,
  editOpen,
  isShareOpen,
  isPlaylistModalOpen,
  activeTab,
  setEditOpen,
  setIsShareOpen,
  setIsPlaylistModalOpen,
  setActiveTab,
}: TrackCardModalsProps) {
  const artistDisplayName =
    track.artist.displayName?.trim() || track.artist.username;

  const [filterValue, setFilterValue] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);

  const loadPlaylists = useCallback(async () => {
    try {
      const response = await playlistService.getMePlaylists({
        page: 0,
        size: 100,
      });

      const hydrated = response.content.map((playlist) => {
        return {
          id: String(playlist.id),
          title: playlist.title,
          trackCount: playlist.trackCount ?? playlist.tracks?.length ?? 0,
          isPrivate: playlist.isPrivate,
          coverUrl: playlist.coverArtUrl,
        } satisfies PlaylistItem;
      });

      setPlaylists(hydrated);
    } catch {
      setPlaylists([]);
    }
  }, []);

  useEffect(() => {
    if (!isPlaylistModalOpen) {
      return;
    }

    void loadPlaylists();
  }, [isPlaylistModalOpen, loadPlaylists]);

  const filteredPlaylists = useMemo(() => {
    const query = filterValue.trim().toLowerCase();
    if (!query) {
      return playlists;
    }

    return playlists.filter((playlist) =>
      playlist.title.toLowerCase().includes(query)
    );
  }, [filterValue, playlists]);

  const closePlaylistModal = useCallback(() => {
    setIsPlaylistModalOpen(false);
    setActiveTab('add');
    setFilterValue('');
    setPlaylistTitle('');
    setPrivacy('public');
  }, [setActiveTab, setIsPlaylistModalOpen]);

  const handleAddToPlaylist = useCallback(
    async (playlistId: string) => {
      const parsedPlaylistId = Number(playlistId);
      if (!Number.isFinite(parsedPlaylistId)) {
        return;
      }

      try {
        await playlistService.addTrackToPlaylist(parsedPlaylistId, {
          trackId: trackNumericId,
        });
        closePlaylistModal();
      } catch {
        // Keep modal open so users can try another playlist.
      }
    },
    [closePlaylistModal, trackNumericId]
  );

  const handleCreatePlaylist = useCallback(async () => {
    const title = playlistTitle.trim();
    if (!title) {
      return;
    }

    try {
      const created = await playlistService.createPlaylist({
        title,
        description: '',
        type: 'PLAYLIST',
        isPrivate: privacy === 'private',
        CoverArt: track.cover,
      });

      await playlistService.addTrackToPlaylist(created.id, {
        trackId: trackNumericId,
      });

      closePlaylistModal();
      await loadPlaylists();
    } catch {
      // Keep modal open so users can adjust and retry.
    }
  }, [
    closePlaylistModal,
    loadPlaylists,
    playlistTitle,
    privacy,
    track.cover,
    trackNumericId,
  ]);

  return (
    <>
      <ShareModal
        variant="track"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trackId={trackId}
        sharePathId={routeTrackId}
        shareUsername={track.artist.username}
        isPrivate={isPrivate}
        track={{
          title: track.title,
          artist: artistDisplayName,
          coverUrl: track.cover,
          duration: track.duration,
        }}
      />

      <EditTrackModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trackId={trackNumericId}
        track={{ title: track.title, artist: artistDisplayName, cover: track.cover }}
      />

      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={closePlaylistModal}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        addTabProps={{
          playlists: filteredPlaylists,
          filterValue,
          onFilterChange: setFilterValue,
          onAddToPlaylist: (playlistId) => {
            void handleAddToPlaylist(playlistId);
          },
        }}
        createTabProps={{
          playlistTitle,
          onPlaylistTitleChange: setPlaylistTitle,
          privacy,
          onPrivacyChange: setPrivacy,
          onSave: () => {
            void handleCreatePlaylist();
          },
          currentTrack: {
            title: track.title,
            artist: artistDisplayName,
            coverUrl: track.cover,
          },
        }}
      />
    </>
  );
}
