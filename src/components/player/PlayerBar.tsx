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
  items: { id: number; title: string; artist?: string }[];
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
    shuffleActive,
    repeatActive,
    onToggleShuffle,
    onToggleRepeat,
  } = props;

  return (
    /* The main bar background - stays 100% width */
    <div className="sticky bottom-0 w-full bg-neutral-600 border-t border-neutral-600 z-50">
      {queue.visible && (
<QueuePanel 
          items={queue.items} 
          isPlaying={isPlaying}
          onClose={onQueueToggle}
          onSelect={onQueueSelect} 
          onRemove={onQueueRemove}
          onClear={() => {
            // This is where you actually empty the items
            // e.g., props.onQueueClear() 
          }}
        />
      )}
      
      {/* The Content Div:
          - max-w-[1240px]: This makes the "content area" smaller.
          - mx-auto: Centers that smaller area.
          - flex items-center: Keeps everything vertically centered.
      */}
      <div className="max-w-[1240px] mx-auto flex items-center h-[52px] px-2">
        
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
        
        <div className="flex-1">
          <Timeline
            currentTime={currentTime}
            duration={duration}
            onScrub={onScrub}
          />
        </div>

        <VolumeControl value={volume} onChange={onVolumeChange} />

        <SoundBadge track={track} artist={artist} artwork={artwork} />
        
        <SocialActions queueVisible={queue.visible} onQueueToggle={onQueueToggle} />
      </div>

    </div>
  );
}