'use client';

import Button from '@/components/buttons/Button';

import Image from 'next/image';

export type SuggestedTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
};

export type CurrentTrack = {
  title: string;
  artist: string;
  coverUrl?: string;
};

export type CreatePlaylistTabProps = {
  playlistTitle: string;
  onPlaylistTitleChange: (value: string) => void;
  privacy: 'public' | 'private';
  onPrivacyChange: (value: 'public' | 'private') => void;
  onSave: () => void;
  currentTrack?: CurrentTrack;
  suggestedTracks?: SuggestedTrack[];
  onAddSuggested?: (trackId: string) => void;
};

export default function CreatePlaylistTab({
  playlistTitle,
  onPlaylistTitleChange,
  privacy,
  onPrivacyChange,
  onSave,
  currentTrack,
  suggestedTracks = [],
  onAddSuggested,
}: CreatePlaylistTabProps) {
  return (
    <div className="p-5 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-primary">
          Playlist title <span className="text-status-error">*</span>
        </label>
        <input
          type="text"
          value={playlistTitle}
          onChange={(e) => onPlaylistTitleChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded bg-bg-elevated border border-interactive-default text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-semibold text-text-primary">Privacy:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="playlist-privacy"
              value="public"
              checked={privacy === 'public'}
              onChange={() => onPrivacyChange('public')}
              className="accent-text-primary"
            />
            <span className="text-[13px] text-text-primary">Public</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="playlist-privacy"
              value="private"
              checked={privacy === 'private'}
              onChange={() => onPrivacyChange('private')}
              className="accent-text-primary"
            />
            <span className="text-[13px] text-text-primary">Private</span>
          </label>
        </div>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!playlistTitle.trim()}
          className="px-5 py-2 text-[13px]"
        >
          Save
        </Button>
      </div>

      {currentTrack && (
        <div className="flex items-center gap-3 p-3 rounded bg-bg-elevated border border-interactive-default/30">
          {currentTrack.coverUrl && (
            <div className="w-10 h-10 rounded overflow-hidden shrink-0">
              <Image 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          <p className="text-[13px] text-text-muted truncate flex-1">
            <span className="font-semibold">{currentTrack.artist}</span>
            {' · '}{currentTrack.title}
          </p>
        </div>
      )}

      {suggestedTracks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-text-primary">
            Looking for more tracks? Add some from your likes.
          </p>
          <div className="flex flex-col gap-1">
            {suggestedTracks.map((track) => (
              <SuggestedTrackRow
                key={track.id}
                track={track}
                onAdd={() => onAddSuggested?.(track.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestedTrackRow({ track, onAdd }: { track: SuggestedTrack; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-interactive-default/10 transition-colors">
      <div className="w-10 h-10 rounded overflow-hidden bg-bg-elevated shrink-0">
        {track.coverUrl
          ? <Image 
              src={track.coverUrl} 
              alt={track.title} 
              width={40} 
              height={40} 
              className="w-full h-full object-cover" 
            />
          : <div className="w-full h-full bg-interactive-default/20" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-text-muted truncate">{track.artist}</p>
        <p className="text-[13px] font-semibold text-text-primary truncate">{track.title}</p>
      </div>
      <Button variant="secondary_inverse" onClick={onAdd} className="shrink-0 text-[12px] px-3 py-1.5">
        Add to playlist
      </Button>
    </div>
  );
}