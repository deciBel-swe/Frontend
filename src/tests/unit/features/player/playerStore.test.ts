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
});
