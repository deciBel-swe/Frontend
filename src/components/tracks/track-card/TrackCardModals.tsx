'use client';

import AddToPlaylistModal, {
  type ActiveTab,
} from '@/components/playlist/AddToPlaylistModal';
import { ShareModal } from '@/features/prof/components/ShareModal';
import EditTrackModal from '@/features/tracks/components/EditTrackModal';

type TrackCardModalsProps = {
  trackId: string;
  trackNumericId: number;
  isPrivate: boolean;
  track: {
    title: string;
    artist: string;
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
  return (
    <>
      <ShareModal
        variant="track"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trackId={trackId}
        isPrivate={isPrivate}
        track={{
          title: track.title,
          artist: track.artist,
          coverUrl: track.cover,
          duration: track.duration,
        }}
      />

      <EditTrackModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trackId={trackNumericId}
        track={{ title: track.title, artist: track.artist, cover: track.cover }}
      />

      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setActiveTab('add');
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        addTabProps={{
          playlists: [],
          filterValue: '',
          onFilterChange: () => {},
          onAddToPlaylist: () => {},
        }}
        createTabProps={{
          playlistTitle: '',
          onPlaylistTitleChange: () => {},
          privacy: 'public',
          onPrivacyChange: () => {},
          onSave: () => {},
          currentTrack: {
            title: track.title,
            artist: track.artist,
            coverUrl: track.cover,
          },
        }}
      />
    </>
  );
}
