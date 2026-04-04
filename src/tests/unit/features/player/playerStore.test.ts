import { usePlayerStore } from '@/features/player/store/playerStore';
import { PLAYER_INITIAL_STATE } from '@/features/player/store/playerStore.contract';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';

const TRACK_A: PlayerTrack = {
  id: 101,
  title: 'Track A',
  artistName: 'Artist A',
  trackUrl: 'https://decibel.test/tracks/a.mp3',
  access: 'PLAYABLE',
  durationSeconds: 120,
};

const TRACK_B: PlayerTrack = {
  id: 102,
  title: 'Track B',
  artistName: 'Artist B',
  trackUrl: 'https://decibel.test/tracks/b.mp3',
  access: 'PLAYABLE',
  durationSeconds: 180,
};

const TRACK_C: PlayerTrack = {
  id: 104,
  title: 'Track C',
  artistName: 'Artist C',
  trackUrl: 'https://decibel.test/tracks/d.mp3',
  access: 'PLAYABLE',
  durationSeconds: 240,
};

const TRACK_BLOCKED: PlayerTrack = {
  id: 103,
  title: 'Blocked Track',
  artistName: 'Artist C',
  trackUrl: 'https://decibel.test/tracks/c.mp3',
  access: 'BLOCKED',
  durationSeconds: 200,
};

const resetPlayerStore = () => {
  usePlayerStore.setState((state) => ({
    ...state,
    ...PLAYER_INITIAL_STATE,
    queueSource: undefined,
  }));
};

describe('playerStore', () => {
  beforeEach(() => {
    resetPlayerStore();
  });

  it('does not play blocked tracks', () => {
    usePlayerStore.getState().playTrack(TRACK_BLOCKED);

    const state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
  });

  it('sets queue and navigates next/previous tracks', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');

    let state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(TRACK_A.id);
    expect(state.currentIndex).toBe(0);

    state.nextTrack();
    state = usePlayerStore.getState();

    expect(state.currentTrack?.id).toBe(TRACK_B.id);
    expect(state.currentIndex).toBe(1);

    state.previousTrack();
    state = usePlayerStore.getState();

    expect(state.currentTrack?.id).toBe(TRACK_A.id);
    expect(state.currentIndex).toBe(0);
  });

  it('pauses when moving past the end of queue', () => {
    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);

    expect(usePlayerStore.getState().isPlaying).toBe(true);

    usePlayerStore.getState().nextTrack();

    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('removes non-current item from queue', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');

    usePlayerStore.getState().removeFromQueue(TRACK_B.id);

    const state = usePlayerStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.queue[0].id).toBe(TRACK_A.id);
    expect(state.currentTrack?.id).toBe(TRACK_A.id);
    expect(state.currentIndex).toBe(0);
  });

  it('removes current item and promotes next item', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);

    usePlayerStore.getState().removeFromQueue(TRACK_A.id);

    const state = usePlayerStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.currentTrack?.id).toBe(TRACK_B.id);
    expect(state.currentIndex).toBe(0);
  });

  it('rejects duplicate track ids in addToQueue', () => {
    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');

    usePlayerStore.getState().addToQueue(TRACK_A);

    const state = usePlayerStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.queue[0].id).toBe(TRACK_A.id);
  });

  it('rejects duplicate track ids in addPlaylistToQueue', () => {
    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');

    usePlayerStore.getState().addPlaylistToQueue([TRACK_A, TRACK_B, TRACK_B, TRACK_C]);

    const state = usePlayerStore.getState();
    expect(state.queue.map((track) => track.id)).toEqual([TRACK_A.id, TRACK_B.id, TRACK_C.id]);
  });

  it('clears queue and resets playback selection', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 1, 'feed');
    usePlayerStore.getState().playTrack(TRACK_B);

    usePlayerStore.getState().clearQueue();

    const state = usePlayerStore.getState();
    expect(state.queue).toHaveLength(0);
    expect(state.currentTrack).toBeNull();
    expect(state.currentIndex).toBe(-1);
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.queueSource).toBeUndefined();
  });

  it('reorders queue and keeps current track aligned by index move', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B, TRACK_C], 1, 'feed');

    usePlayerStore.getState().reorderQueue(2, 0);

    const state = usePlayerStore.getState();
    expect(state.queue.map((track) => track.id)).toEqual([TRACK_C.id, TRACK_A.id, TRACK_B.id]);
    expect(state.currentTrack?.id).toBe(TRACK_B.id);
    expect(state.currentIndex).toBe(2);
  });

  it('marks blocked track when trying to play a track with missing url', () => {
    usePlayerStore.getState().playTrack({
      ...TRACK_A,
      id: 500,
      trackUrl: '   ',
    });

    const state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.blockedTrackId).toBe(500);
  });

  it('keeps current time and duration when replaying the same track', () => {
    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');
    usePlayerStore.getState().setCurrentTime(45);
    usePlayerStore.getState().setDuration(87);

    usePlayerStore.getState().playTrack(TRACK_A);

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(TRACK_A.id);
    expect(state.currentTime).toBe(45);
    expect(state.duration).toBe(87);
  });

  it('handles blocked togglePlay without changing playback state', () => {
    usePlayerStore.setState({
      currentTrack: TRACK_BLOCKED,
      isPlaying: false,
      blockedTrackId: null,
    });

    usePlayerStore.getState().togglePlay();

    const state = usePlayerStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.blockedTrackId).toBe(TRACK_BLOCKED.id);
  });

  it('sets initial queue selection when addToQueue starts from empty state', () => {
    usePlayerStore.getState().clearQueue();

    usePlayerStore.getState().addToQueue(TRACK_A);

    const state = usePlayerStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.currentTrack?.id).toBe(TRACK_A.id);
    expect(state.currentIndex).toBe(0);
  });

  it('preserves time state when setting an empty queue', () => {
    usePlayerStore.setState({ currentTime: 33, duration: 77 });

    usePlayerStore.getState().setQueue([], 5, 'feed');

    const state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.currentIndex).toBe(-1);
    expect(state.currentTime).toBe(33);
    expect(state.duration).toBe(77);
  });

  it('decrements currentIndex when removing a track before current one', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B, TRACK_C], 2, 'feed');

    usePlayerStore.getState().removeFromQueue(TRACK_A.id);

    const state = usePlayerStore.getState();
    expect(state.queue.map((track) => track.id)).toEqual([TRACK_B.id, TRACK_C.id]);
    expect(state.currentIndex).toBe(1);
    expect(state.currentTrack?.id).toBe(TRACK_C.id);
  });

  it('moves to blocked track and pauses on nextTrack when next item is blocked', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_BLOCKED], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);

    usePlayerStore.getState().nextTrack();

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(TRACK_BLOCKED.id);
    expect(state.currentIndex).toBe(1);
    expect(state.isPlaying).toBe(false);
  });

  it('moves to blocked track and pauses on previousTrack when previous item is blocked', () => {
    usePlayerStore.getState().setQueue([TRACK_BLOCKED, TRACK_A], 1, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);

    usePlayerStore.getState().previousTrack();

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(TRACK_BLOCKED.id);
    expect(state.currentIndex).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it('clamps seek/volume values and ignores tiny time deltas', () => {
    usePlayerStore.getState().seek(-10);
    usePlayerStore.getState().setVolume(3);

    let state = usePlayerStore.getState();
    expect(state.currentTime).toBe(0);
    expect(state.volume).toBe(1);

    usePlayerStore.getState().setCurrentTime(10);
    usePlayerStore.getState().setCurrentTime(10.005);
    usePlayerStore.getState().setDuration(20);
    usePlayerStore.getState().setDuration(20.004);

    state = usePlayerStore.getState();
    expect(state.currentTime).toBe(10);
    expect(state.duration).toBe(20);
  });

  it('ignores invalid reorder operations', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');
    const before = usePlayerStore.getState().queue.map((track) => track.id);

    usePlayerStore.getState().reorderQueue(0, 0);
    usePlayerStore.getState().reorderQueue(-1, 1);
    usePlayerStore.getState().reorderQueue(0, 9);

    const after = usePlayerStore.getState().queue.map((track) => track.id);
    expect(after).toEqual(before);
  });

  it('no-ops togglePlay and pause when no active playback exists', () => {
    usePlayerStore.getState().togglePlay();
    usePlayerStore.getState().pause();

    const state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
  });

  it('normalizes non-finite seek, current time, duration, and volume values', () => {
    usePlayerStore.getState().seek(Number.NaN);
    usePlayerStore.getState().setCurrentTime(Number.POSITIVE_INFINITY);
    usePlayerStore.getState().setDuration(Number.NaN);
    usePlayerStore.getState().setVolume(Number.NaN);

    const state = usePlayerStore.getState();
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.volume).toBe(1);
  });

  it('uses setQueue defaults and keeps prior queueSource when source is omitted', () => {
    usePlayerStore.getState().setQueue([TRACK_A], undefined, 'feed');

    usePlayerStore.getState().setQueue([
      {
        ...TRACK_B,
        id: 602,
        durationSeconds: undefined,
      },
    ]);

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(602);
    expect(state.currentIndex).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.queueSource).toBe('feed');
  });

  it('keeps queue unchanged when removing a non-existent track id', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');

    const before = usePlayerStore.getState().queue.map((track) => track.id);
    usePlayerStore.getState().removeFromQueue(999999);
    const after = usePlayerStore.getState().queue.map((track) => track.id);

    expect(after).toEqual(before);
  });

  it('pauses when current track is removed and next fallback is blocked', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_BLOCKED], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);

    usePlayerStore.getState().removeFromQueue(TRACK_A.id);

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(TRACK_BLOCKED.id);
    expect(state.currentIndex).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it('keeps state stable for addPlaylistToQueue when incoming list is fully duplicate', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');
    const before = usePlayerStore.getState().queue.map((track) => track.id);

    usePlayerStore.getState().addPlaylistToQueue([TRACK_A, TRACK_B]);

    const state = usePlayerStore.getState();
    expect(state.queue.map((track) => track.id)).toEqual(before);
    expect(state.currentTrack?.id).toBe(TRACK_A.id);
  });

  it('handles next/previous guards when queue bounds are exceeded', () => {
    usePlayerStore.getState().nextTrack();
    usePlayerStore.getState().previousTrack();

    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B], 0, 'feed');
    usePlayerStore.getState().previousTrack();

    const atStart = usePlayerStore.getState();
    expect(atStart.currentTrack?.id).toBe(TRACK_A.id);
    expect(atStart.currentIndex).toBe(0);

    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);
    usePlayerStore.getState().nextTrack();

    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('falls back when playing detached tracks and updates volume when value changes', () => {
    usePlayerStore.setState({
      queue: [TRACK_A],
      currentIndex: 0,
      currentTrack: TRACK_A,
      currentTime: 12,
      duration: 34,
      volume: 0.75,
    });

    usePlayerStore.getState().playTrack({
      ...TRACK_B,
      id: 701,
      durationSeconds: undefined,
    });
    usePlayerStore.getState().setVolume(0.2);

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(701);
    expect(state.currentIndex).toBe(0);
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.volume).toBe(0.2);
  });

  it('covers addToQueue and addPlaylistToQueue branches with negative index queue states', () => {
    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');
    usePlayerStore.getState().addToQueue(TRACK_B);

    let state = usePlayerStore.getState();
    expect(state.currentIndex).toBe(0);

    usePlayerStore.setState({
      queue: [TRACK_A],
      currentIndex: -1,
      currentTrack: null,
    });

    usePlayerStore.getState().addToQueue(TRACK_B);

    state = usePlayerStore.getState();
    expect(state.currentIndex).toBe(-1);
    expect(state.currentTrack).toBeNull();

    usePlayerStore.setState({
      queue: [],
      currentIndex: -1,
      currentTrack: null,
    });
    usePlayerStore.getState().addPlaylistToQueue([TRACK_A, TRACK_B]);

    state = usePlayerStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.currentTrack?.id).toBe(TRACK_A.id);
  });

  it('handles removeFromQueue for empty result and undefined-duration fallback tracks', () => {
    usePlayerStore.getState().setQueue([TRACK_A], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);

    usePlayerStore.getState().removeFromQueue(TRACK_A.id);

    let state = usePlayerStore.getState();
    expect(state.queue).toEqual([]);
    expect(state.currentTrack).toBeNull();
    expect(state.currentIndex).toBe(-1);

    const NO_DURATION_TRACK: PlayerTrack = {
      ...TRACK_B,
      id: 811,
      durationSeconds: undefined,
    };

    usePlayerStore.getState().setQueue([TRACK_A, NO_DURATION_TRACK], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);
    usePlayerStore.getState().removeFromQueue(TRACK_A.id);

    state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(811);
    expect(state.duration).toBe(0);
  });

  it('covers reorder branches for moved current index and invalid current index fallback', () => {
    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B, TRACK_C], 1, 'feed');
    usePlayerStore.getState().reorderQueue(1, 2);

    let state = usePlayerStore.getState();
    expect(state.currentIndex).toBe(2);
    expect(state.currentTrack?.id).toBe(TRACK_B.id);

    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B, TRACK_C], 1, 'feed');
    usePlayerStore.getState().reorderQueue(0, 2);

    state = usePlayerStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.currentTrack?.id).toBe(TRACK_B.id);

    usePlayerStore.getState().setQueue([TRACK_A, TRACK_B, TRACK_C], 2, 'feed');
    usePlayerStore.getState().reorderQueue(0, 1);

    state = usePlayerStore.getState();
    expect(state.currentIndex).toBe(2);

    usePlayerStore.setState({
      queue: [TRACK_A, TRACK_B],
      currentIndex: -1,
      currentTrack: null,
    });
    usePlayerStore.getState().reorderQueue(0, 1);

    state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.currentIndex).toBe(-1);
  });

  it('uses duration fallback when moving to next or previous tracks without duration values', () => {
    const NEXT_NO_DURATION: PlayerTrack = {
      ...TRACK_B,
      id: 900,
      durationSeconds: undefined,
    };

    usePlayerStore.getState().setQueue([TRACK_A, NEXT_NO_DURATION], 0, 'feed');
    usePlayerStore.getState().playTrack(TRACK_A);
    usePlayerStore.getState().nextTrack();

    let state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(900);
    expect(state.duration).toBe(0);

    const PREV_NO_DURATION: PlayerTrack = {
      ...TRACK_A,
      id: 901,
      durationSeconds: undefined,
    };

    usePlayerStore.getState().setQueue([PREV_NO_DURATION, TRACK_B], 1, 'feed');
    usePlayerStore.getState().playTrack(TRACK_B);
    usePlayerStore.getState().previousTrack();

    state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(901);
    expect(state.duration).toBe(0);
  });
});
