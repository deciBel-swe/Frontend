'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AddToPlaylistModal, {
  type ActiveTab,
} from '@/components/playlist/AddToPlaylistModal';
import type { PlaylistItem } from '@/components/playlist/AddToPlaylistTab';
import { ShareModal } from '@/features/prof/components/ShareModal';
import EditTrackModal from '@/features/tracks/components/EditTrackModal';
import { playlistService } from '@/services';
import { usePlayerStore } from '@/features/player/store/playerStore';

type TrackCardModalsProps = {
  trackId: string;
  routeTrackId?: string;
  trackNumericId: number;
  isPrivate: boolean;
  track: {
    title: string;
    secretToken?: string;
    artist: {
      username: string;
      displayName?: string;
      avatar: string;
    };
    cover: string;
    duration: string;
    genre?: string;
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

  // ── Live playback state for the embed preview ─────────────────────────────
  const currentPlayerTrackId = usePlayerStore((s) => s.currentTrack?.id ?? null);
  const playerIsPlaying = usePlayerStore((s) => s.isPlaying);
  const playerCurrentTime = usePlayerStore((s) => s.currentTime);
  const playerDuration = usePlayerStore((s) => s.duration);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const pausePlayback = usePlayerStore((s) => s.pause);
  const seek = usePlayerStore((s) => s.seek);

  const isCurrentTrack = Number(currentPlayerTrackId) === Number(trackNumericId);
  const isPlaying = isCurrentTrack && playerIsPlaying;
  const currentTime = isCurrentTrack ? playerCurrentTime : 0;
  const durationSeconds = isCurrentTrack && playerDuration > 0 ? playerDuration : 0;

  const onPlayPause = useCallback(() => {
    if (isCurrentTrack && playerIsPlaying) {
      pausePlayback();
      return;
    }
    if (track.trackUrl) {
      playTrack({
        id: trackNumericId,
        title: track.title,
        artistName: artistDisplayName,
        trackUrl: track.trackUrl,
        access: 'PLAYABLE',
      });
    }
  }, [
    artistDisplayName,
    isCurrentTrack,
    pausePlayback,
    playTrack,
    playerIsPlaying,
    track.title,
    track.trackUrl,
    trackNumericId,
  ]);

  const onWaveformSeek = useCallback(
    (fraction: number) => {
      if (!track.trackUrl) return;
      if (!isCurrentTrack) {
        playTrack({
          id: trackNumericId,
          title: track.title,
          artistName: artistDisplayName,
          trackUrl: track.trackUrl,
          access: 'PLAYABLE',
        });
      }
      if (durationSeconds > 0) seek(fraction * durationSeconds);
    },
    [
      artistDisplayName,
      durationSeconds,
      isCurrentTrack,
      playTrack,
      seek,
      track.title,
      track.trackUrl,
      trackNumericId,
    ]
  );

  // ── Playlist modal state ──────────────────────────────────────────────────
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
          coverUrl: playlist.coverArtUrl ?? undefined,
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
        genre: track.genre || 'Other',
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
        existingToken={track.secretToken}
        track={{
          title: track.title,
          artist: artistDisplayName,
          coverUrl: track.cover,
          duration: track.duration,
          waveformData: track.waveformData,
          waveformUrl: track.waveformUrl,
          isPlaying,
          currentTime,
          durationSeconds,
          onPlayPause,
          onWaveformSeek,
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