"use client";

import PlayerControls from "./PlayerControls";
import Timeline from "./Timeline";
import VolumeControl from "./VolumeControl";
import SoundBadge from "./SoundBadge";
import PlaybackModes from "./PlaybackModes";
import SocialActions from "./SocialActions";
import QueuePanel from "./QueuePanel";

interface QueueInfo {
  visible: boolean;
  items: { id: number; title: string; artist?: string; artwork?: string }[];
  activeTrackId?: number;
}

interface PlayerBarProps {
  track: string;
  artist: string;
  artwork: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onScrub: (time: number) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  queue: QueueInfo;
  onQueueToggle: () => void;
  onQueueSelect: (trackId: number) => void;
  onQueueRemove: (trackId: number) => void;
  onQueueClear: () => void;
  onQueueReorder: (fromIndex: number, toIndex: number) => void;
  shuffleActive: boolean;
  repeatActive: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export default function PlayerBar(props: PlayerBarProps) {
  const {
    track,
    artist,
    artwork,
    duration,
    currentTime,
    isPlaying,
    onPlay,
    onPause,
    onNext,
    onPrev,
    onScrub,
    volume,
    onVolumeChange,
    queue,
    onQueueToggle,
    onQueueSelect,
    onQueueRemove,
    onQueueClear,
    onQueueReorder,
    shuffleActive,
    repeatActive,
    onToggleShuffle,
    onToggleRepeat,
  } = props;

  return (
    /* The main bar background - stays 100% width */
    <div className="fixed bottom-0 w-full bg-surface-raised border-t border-border-strong z-50">
     
      {/* The Content Div:
          - max-w-[1240px]: This makes the "content area" smaller.
          - mx-auto: Centers that smaller area.
          - flex items-center: Keeps everything vertically centered.
      */}
      <div className="w-full max-w-[1100px] mx-auto flex items-center h-13 px-4">
         <div className="flex items-center shrink-0">
          <PlayerControls
            isPlaying={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
            onNext={onNext}
            onPrev={onPrev}
          />

          <PlaybackModes
            shuffleActive={shuffleActive}
            repeatActive={repeatActive}
            onToggleShuffle={onToggleShuffle}
            onToggleRepeat={onToggleRepeat}
          />
        </div>
        
        <div className="flex-1 min-w-0 px-3">
          <Timeline
            currentTime={currentTime}
            duration={duration}
            onScrub={onScrub}
          />
        </div>
        <div className="flex items-center shrink-0 relative">
          {queue.visible && (
            <QueuePanel 
              items={queue.items} 
              isPlaying={isPlaying}
              activeTrackId={queue.activeTrackId ?? null}
              onClose={onQueueToggle}
              onSelect={onQueueSelect} 
              onRemove={onQueueRemove}
              onClear={onQueueClear}
              onReorder={onQueueReorder}
            />
         )}
          <div className="hidden md:block">
            <VolumeControl value={volume} onChange={onVolumeChange} />
          </div>

          <SoundBadge track={track} artist={artist} artwork={artwork} />
          <div className="hidden sm:block">
            <SocialActions queueVisible={queue.visible} onQueueToggle={onQueueToggle} />
          </div>
        </div>
      </div>

    </div>
  );
}