"use client";

import PlayerControls from "./PlayerControls";
import Timeline from "./Timeline";
import VolumeControl from "./VolumeControl";
import SoundBadge from "./SoundBadge";
import PlaybackModes from "./PlaybackModes";
import SocialActions from "./SocialActions";

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
    <div className="sticky bottom-0 w-full bg-[#303030] border-t border-[#333] z-50">
      {queue.visible && (
        <div className="mx-auto max-w-[1240px] border-b border-[#3a3a3a] bg-[#262626] px-3 py-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-300">Queue ({queue.items.length})</p>
            <button
              type="button"
              onClick={onQueueToggle}
              className="text-xs font-bold text-neutral-300 transition-colors hover:text-white"
            >
              Close
            </button>
          </div>

          {queue.items.length === 0 ? (
            <p className="text-xs text-neutral-400">Queue is empty.</p>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {queue.items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded bg-[#2e2e2e] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onQueueSelect(item.id)}
                    className="flex-1 truncate text-left text-xs text-neutral-100 transition-colors hover:text-white"
                  >
                    {item.title}
                    {item.artist ? ` - ${item.artist}` : ""}
                  </button>

                  <button
                    type="button"
                    aria-label={`Remove ${item.title} from queue`}
                    onClick={() => onQueueRemove(item.id)}
                    className="px-1 text-xs font-bold text-neutral-300 transition-colors hover:text-white"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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