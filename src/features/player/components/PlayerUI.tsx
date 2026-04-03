'use client';

/**
 * PlayerUI
 *
 * Minimal sticky-player presentation layer.
 *
 * Responsibilities:
 * - Render current track status and playback controls.
 * - Render seek and volume sliders bound to the global player.
 * - Render queue list with click-to-play and remove-from-queue controls.
 * - Render previous/next queue navigation actions.
 *
 * Notes:
 * - This component is intentionally lightweight and does not own side effects.
 * - All behavior is delegated through callbacks provided by GlobalAudioPlayer.
 */
import type { PlayerUiProps } from '@/features/player/components/playerComponent.contracts';

/**
 * Format helper for displaying seconds as m:ss in the UI.
 */
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${mins}:${secs}`;
};

export default function PlayerUI({
  queue,
  currentIndex,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPreviousTrack,
  onNextTrack,
  onQueueItemClick,
  onRemoveQueueItem,
  onTogglePlay,
  onSeek,
  onSetVolume,
}: PlayerUiProps) {
  return (
    <section aria-label="Global player" className="mt-3 rounded border border-border-default p-3">
      {/* Current active item summary. */}
      <p>
        <strong>Now Playing:</strong> {currentTrack ? `${currentTrack.title} - ${currentTrack.artistName}` : 'Nothing playing'}
      </p>

      {/* Transport controls for queue navigation and playback toggling. */}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onPreviousTrack}
          disabled={queue.length === 0 || currentIndex <= 0}
        >
          Previous
        </button>

        <button type="button" onClick={onTogglePlay} disabled={!currentTrack || currentTrack.access === 'BLOCKED'}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          type="button"
          onClick={onNextTrack}
          disabled={queue.length === 0 || currentIndex < 0 || currentIndex >= queue.length - 1}
        >
          Next
        </button>
      </div>

      {/* Seek slider bound to currentTime and duration. */}
      <div className="mt-2">
        <label>
          Progress ({formatTime(currentTime)} / {formatTime(duration)})
        </label>
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0)}
          step={0.1}
          value={Math.min(currentTime, Math.max(duration, 0))}
          onChange={(event) => onSeek(Number(event.target.value))}
          disabled={!currentTrack || duration <= 0 || currentTrack.access === 'BLOCKED'}
          className="block w-full"
        />
      </div>

      {/* Master volume control (0..1). */}
      <div className="mt-2">
        <label>Volume: {Math.round(volume * 100)}%</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => onSetVolume(Number(event.target.value))}
          className="block w-full"
        />
      </div>

      {/* Queue browser with play-on-click and remove actions. */}
      <div className="mt-3">
        <p>
          <strong>Queue</strong> ({queue.length})
        </p>

        {queue.length === 0 ? (
          <p className="text-sm text-text-muted">Queue is empty.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {queue.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className={`flex items-center gap-2 rounded border px-2 py-1 ${index === currentIndex ? 'border-border-brand' : 'border-border-default'}`}
              >
                <button
                  type="button"
                  onClick={() => onQueueItemClick(item)}
                  className="flex-1 text-left"
                >
                  {index + 1}. {item.title} - {item.artistName}
                  {item.access === 'BLOCKED' ? ' (blocked)' : ''}
                </button>

                <button
                  type="button"
                  aria-label={`Remove ${item.title} from queue`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveQueueItem(item.id);
                  }}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
