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
});
