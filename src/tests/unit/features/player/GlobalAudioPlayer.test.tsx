import { act, render, waitFor } from '@testing-library/react';

import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import GlobalAudioPlayer from '@/features/player/components/GlobalAudioPlayer';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { PLAYER_INITIAL_STATE } from '@/features/player/store/playerStore.contract';
import {
  addToRecentlyPlayed,
  userCompletedTrack,
  userPlayedTrack,
} from '@/services/api/playbackTrackingService';

let latestPlayerBarProps: any;

jest.mock('@/components/player/PlayerBar', () => ({
  __esModule: true,
  default: (props: any) => {
    latestPlayerBarProps = props;
    return <div data-testid="mock-player-bar" />;
  },
}));

jest.mock('@/services/api/playbackTrackingService', () => ({
  addToRecentlyPlayed: jest.fn(),
  userCompletedTrack: jest.fn(),
  userPlayedTrack: jest.fn(),
}));

const mockUserPlayedTrack = userPlayedTrack as jest.MockedFunction<
  typeof userPlayedTrack
>;
const mockUserCompletedTrack = userCompletedTrack as jest.MockedFunction<
  typeof userCompletedTrack
>;
const mockAddToRecentlyPlayed = addToRecentlyPlayed as jest.MockedFunction<
  typeof addToRecentlyPlayed
>;

const PLAYABLE_A: PlayerTrack = {
  id: 501,
  title: 'Track A',
  artistName: 'Artist A',
  trackUrl: 'https://decibel.test/a.mp3',
  access: 'PLAYABLE',
  durationSeconds: 120,
  coverUrl: 'https://decibel.test/a.jpg',
};

const PLAYABLE_B: PlayerTrack = {
  id: 502,
  title: 'Track B',
  artistName: 'Artist B',
  trackUrl: 'https://decibel.test/b.mp3',
  access: 'PLAYABLE',
  durationSeconds: 180,
  coverUrl: 'https://decibel.test/b.jpg',
};

const BLOCKED_TRACK: PlayerTrack = {
  id: 503,
  title: 'Blocked',
  artistName: 'Blocked Artist',
  trackUrl: 'https://decibel.test/blocked.mp3',
  access: 'BLOCKED',
  durationSeconds: 90,
};

const resetPlayerStore = () => {
  usePlayerStore.setState((state) => ({
    ...state,
    ...PLAYER_INITIAL_STATE,
    queueSource: undefined,
  }));
};

const setAudioProp = (
  audio: HTMLAudioElement,
  key: string,
  value: unknown
) => {
  Object.defineProperty(audio, key, {
    configurable: true,
    writable: true,
    value,
  });
};

describe('GlobalAudioPlayer', () => {
  let playSpy: jest.SpyInstance;
  let pauseSpy: jest.SpyInstance;
  let loadSpy: jest.SpyInstance;
  let originalFastSeek: unknown;

  beforeEach(() => {
    jest.clearAllMocks();
    latestPlayerBarProps = null;
    resetPlayerStore();

    playSpy = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    pauseSpy = jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});
    loadSpy = jest
      .spyOn(HTMLMediaElement.prototype, 'load')
      .mockImplementation(() => {});

    originalFastSeek = (HTMLMediaElement.prototype as any).fastSeek;
    Object.defineProperty(HTMLMediaElement.prototype, 'fastSeek', {
      configurable: true,
      writable: true,
      value: jest.fn(function (this: HTMLMediaElement, time: number) {
        this.currentTime = time;
      }),
    });
  });

  afterEach(() => {
    playSpy.mockRestore();
    pauseSpy.mockRestore();
    loadSpy.mockRestore();

    if (originalFastSeek === undefined) {
      Reflect.deleteProperty(HTMLMediaElement.prototype as object, 'fastSeek');
      return;
    }

    Object.defineProperty(HTMLMediaElement.prototype, 'fastSeek', {
      configurable: true,
      writable: true,
      value: originalFastSeek,
    });
  });

  it('starts the first queued track when play is pressed without a current track', async () => {
    act(() => {
      usePlayerStore.setState({
        queue: [PLAYABLE_A, PLAYABLE_B],
        currentIndex: -1,
        currentTrack: null,
        isPlaying: false,
      });
    });

    render(<GlobalAudioPlayer />);

    act(() => {
      latestPlayerBarProps.onPlay();
    });

    await waitFor(() =>
      expect(usePlayerStore.getState().currentTrack?.id).toBe(PLAYABLE_A.id)
    );
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    await waitFor(() =>
      expect(mockUserPlayedTrack).toHaveBeenCalledWith(PLAYABLE_A.id)
    );

    act(() => {
      latestPlayerBarProps.onPause();
    });

    expect(usePlayerStore.getState().isPlaying).toBe(false);

    act(() => {
      latestPlayerBarProps.onPlay();
    });

    await waitFor(() => expect(playSpy).toHaveBeenCalledTimes(2));
    expect(mockUserPlayedTrack).toHaveBeenCalledTimes(1);
    expect(mockAddToRecentlyPlayed).toHaveBeenCalledTimes(1);
  });

  it('queues a pending seek until metadata is available', async () => {
    act(() => {
      usePlayerStore.setState({
        queue: [PLAYABLE_A],
        currentIndex: 0,
        currentTrack: PLAYABLE_A,
        isPlaying: false,
      });
    });

    render(<GlobalAudioPlayer />);

    const audio = document.querySelector('audio') as HTMLAudioElement;
    setAudioProp(audio, 'readyState', 0);
    setAudioProp(audio, 'duration', 120);
    setAudioProp(audio, 'currentTime', 0);

    act(() => {
      latestPlayerBarProps.onScrub(30);
    });

    expect(usePlayerStore.getState().currentTime).toBe(30);

    setAudioProp(audio, 'readyState', HTMLMediaElement.HAVE_METADATA);
    act(() => {
      audio.dispatchEvent(new Event('loadedmetadata'));
    });

    expect(audio.currentTime).toBe(30);
  });

  it('pauses on ended when auto advance is disabled', () => {
    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A, PLAYABLE_B], 0, 'feed');
      usePlayerStore.getState().playTrack(PLAYABLE_A);
    });

    render(<GlobalAudioPlayer autoAdvanceOnEnd={false} />);

    const audio = document.querySelector('audio') as HTMLAudioElement;
    act(() => {
      audio.dispatchEvent(new Event('ended'));
    });

    expect(usePlayerStore.getState().isPlaying).toBe(false);
    expect(usePlayerStore.getState().currentTrack?.id).toBe(PLAYABLE_A.id);
  });

  it('wraps to the first playable track when repeat mode is enabled', () => {
    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A, PLAYABLE_B], 1, 'feed');
      usePlayerStore.getState().playTrack(PLAYABLE_B);
    });

    render(<GlobalAudioPlayer />);

    act(() => {
      latestPlayerBarProps.onToggleRepeat();
    });

    act(() => {
      latestPlayerBarProps.onNext();
    });

    expect(usePlayerStore.getState().currentTrack?.id).toBe(PLAYABLE_A.id);
    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it('pauses when shuffle next has no playable tracks', () => {
    act(() => {
      usePlayerStore.setState({
        queue: [BLOCKED_TRACK],
        currentIndex: 0,
        currentTrack: BLOCKED_TRACK,
        isPlaying: true,
      });
    });

    render(<GlobalAudioPlayer />);

    act(() => {
      latestPlayerBarProps.onToggleShuffle();
      latestPlayerBarProps.onNext();
    });

    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('pauses the player if play() rejects', async () => {
    playSpy.mockRejectedValueOnce(new Error('autoplay blocked'));

    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A], 0, 'feed');
      usePlayerStore.getState().playTrack(PLAYABLE_A);
    });

    render(<GlobalAudioPlayer />);

    await waitFor(() => expect(usePlayerStore.getState().isPlaying).toBe(false));
  });

  it('marks track completion once when timeupdate crosses threshold', () => {
    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A], 0, 'feed');
      usePlayerStore.getState().playTrack(PLAYABLE_A);
      usePlayerStore.getState().pause();
    });

    render(<GlobalAudioPlayer />);

    const audio = document.querySelector('audio') as HTMLAudioElement;
    setAudioProp(audio, 'duration', 100);
    setAudioProp(audio, 'currentTime', 95);

    act(() => {
      audio.dispatchEvent(new Event('timeupdate'));
    });

    expect(usePlayerStore.getState().currentTime).toBe(95);
    expect(mockUserCompletedTrack).toHaveBeenCalledWith(PLAYABLE_A.id);

    setAudioProp(audio, 'currentTime', 99);
    act(() => {
      audio.dispatchEvent(new Event('timeupdate'));
    });

    expect(mockUserCompletedTrack).toHaveBeenCalledTimes(1);
  });

  it('reloads audio source only when track identity changes', async () => {
    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A], 0, 'feed');
      usePlayerStore.getState().playTrack(PLAYABLE_A);
    });

    render(<GlobalAudioPlayer />);

    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(1));

    act(() => {
      usePlayerStore.getState().playTrack(PLAYABLE_A);
    });

    expect(loadSpy).toHaveBeenCalledTimes(1);

    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A, PLAYABLE_B], 1, 'feed');
    });

    await waitFor(() => expect(loadSpy).toHaveBeenCalledTimes(2));
  });

  it('ignores scrub requests when there is no playable current track', () => {
    render(<GlobalAudioPlayer />);

    act(() => {
      latestPlayerBarProps.onScrub(40);
    });

    expect(usePlayerStore.getState().currentTime).toBe(0);

    act(() => {
      usePlayerStore.setState({
        currentTrack: BLOCKED_TRACK,
        queue: [BLOCKED_TRACK],
        currentIndex: 0,
      });
      latestPlayerBarProps.onScrub(50);
    });

    expect(usePlayerStore.getState().currentTime).toBe(0);
  });

  it('handles no-op play guards and missing queue selections', () => {
    render(<GlobalAudioPlayer />);

    act(() => {
      latestPlayerBarProps.onPlay();
      latestPlayerBarProps.onQueueSelect(999);
    });

    expect(usePlayerStore.getState().currentTrack).toBeNull();

    act(() => {
      usePlayerStore.setState({
        currentTrack: PLAYABLE_A,
        queue: [PLAYABLE_A],
        currentIndex: 0,
        isPlaying: true,
      });
      latestPlayerBarProps.onPlay();
    });

    expect(usePlayerStore.getState().currentTrack?.id).toBe(PLAYABLE_A.id);
  });

  it('falls back to currentTime assignment when fastSeek throws or is unavailable', () => {
    act(() => {
      usePlayerStore.setState({
        queue: [PLAYABLE_A],
        currentIndex: 0,
        currentTrack: PLAYABLE_A,
      });
    });

    render(<GlobalAudioPlayer />);

    const audio = document.querySelector('audio') as HTMLAudioElement;
    setAudioProp(audio, 'readyState', HTMLMediaElement.HAVE_METADATA);
    setAudioProp(audio, 'duration', 120);
    setAudioProp(audio, 'currentTime', 0);

    const fastSeekMock = (HTMLMediaElement.prototype as any)
      .fastSeek as jest.Mock;
    fastSeekMock.mockImplementationOnce(() => {
      throw new Error('seek failed');
    });

    act(() => {
      latestPlayerBarProps.onScrub(20);
    });

    expect(audio.currentTime).toBe(20);

    Reflect.deleteProperty(HTMLMediaElement.prototype as object, 'fastSeek');

    act(() => {
      latestPlayerBarProps.onScrub(40);
    });

    expect(audio.currentTime).toBe(40);
  });

  it('handles previous/next edge cases in shuffle and non-shuffle modes', () => {
    act(() => {
      usePlayerStore.setState({
        queue: [PLAYABLE_A],
        currentIndex: 0,
        currentTrack: PLAYABLE_A,
        isPlaying: true,
      });
    });

    render(<GlobalAudioPlayer />);

    act(() => {
      latestPlayerBarProps.onPrev();
    });

    expect(usePlayerStore.getState().currentTrack?.id).toBe(PLAYABLE_A.id);

    act(() => {
      latestPlayerBarProps.onToggleShuffle();
      latestPlayerBarProps.onPrev();
    });

    expect(usePlayerStore.getState().currentTrack?.id).toBe(PLAYABLE_A.id);
  });

  it('applies fallback PlayerBar labels and toggles queue panel visibility', () => {
    render(<GlobalAudioPlayer />);

    expect(latestPlayerBarProps.track).toBe('Nothing playing');
    expect(latestPlayerBarProps.artist).toBe('Unknown artist');
    expect(latestPlayerBarProps.artwork).toBe('/images/default_song_image.png');
    expect(latestPlayerBarProps.queue.visible).toBe(false);

    act(() => {
      latestPlayerBarProps.onQueueToggle();
    });

    expect(latestPlayerBarProps.queue.visible).toBe(true);
  });

  it('uses pause fallback when track is not playable and supports undefined play() return', async () => {
    playSpy.mockReturnValueOnce(undefined as any);

    act(() => {
      usePlayerStore.setState({
        currentTrack: {
          ...PLAYABLE_A,
          id: 610,
          trackUrl: '   ',
        },
        queue: [
          {
            ...PLAYABLE_A,
            id: 610,
            trackUrl: '   ',
          },
        ],
        currentIndex: 0,
        isPlaying: true,
      });
    });

    const { rerender } = render(<GlobalAudioPlayer />);

    expect(pauseSpy).toHaveBeenCalled();

    act(() => {
      usePlayerStore.getState().setQueue([PLAYABLE_A], 0, 'feed');
      usePlayerStore.getState().playTrack(PLAYABLE_A);
    });

    rerender(<GlobalAudioPlayer />);

    await waitFor(() => expect(playSpy).toHaveBeenCalled());
  });
});
