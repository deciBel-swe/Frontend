import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TrackCard from '@/components/TrackCard';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import { usePlayerStore } from '@/features/player/store/playerStore';

jest.mock('@/hooks/useCopyTrackLink', () => ({
  useCopyTrackLink: () => ({ handleCopy: jest.fn() }),
}));

jest.mock('@/hooks/useSecretLink', () => ({
  useSecretLink: () => ({ secretUrl: '' }),
}));

jest.mock('@/hooks/useTrackVisibility', () => ({
  useTrackVisibility: () => ({ visibility: { isPrivate: false } }),
}));

jest.mock('@/features/prof/components/ShareModal', () => ({
  ShareModal: () => null,
}));

jest.mock('@/features/tracks/components/EditTrackModal', () => () => null);
jest.mock('@/components/CompactTrackList', () => () => null);
jest.mock('@/components/TrackActions', () => () => <div data-testid="track-actions" />);
jest.mock('@/components/TimeAgo', () => () => <span>ago</span>);

jest.mock('@/components/comments/CommentInput', () => () => <div data-testid="comment-input" />);

jest.mock('@/components/WaveformTimedComments', () => ({
  __esModule: true,
  default: () => <div data-testid="timed-comments" />,
}));

jest.mock('@/components/waveform/Waveform', () => ({
  __esModule: true,
  default: ({ onWaveformClick }: { onWaveformClick?: (percent: number) => void }) => (
    <button type="button" onClick={() => onWaveformClick?.(0.5)}>
      Waveform
    </button>
  ),
}));

jest.mock('@/features/player/store/playerStore', () => ({
  usePlayerStore: jest.fn(),
}));

const mockUsePlayerStore = usePlayerStore as unknown as jest.Mock;

const PLAYABLE_TRACK: PlayerTrack = {
  id: 1,
  title: 'Playable',
  artistName: 'Artist',
  trackUrl: 'https://decibel.test/track.mp3',
  access: 'PLAYABLE',
  durationSeconds: 120,
};

const BLOCKED_TRACK: PlayerTrack = {
  ...PLAYABLE_TRACK,
  id: 2,
  access: 'BLOCKED',
};

const OTHER_PLAYABLE_TRACK: PlayerTrack = {
  ...PLAYABLE_TRACK,
  id: 99,
  title: 'Other Track',
  trackUrl: 'https://decibel.test/other-track.mp3',
};

const baseProps = {
  trackId: '1',
  user: {
    username: 'artist',
    displayName: 'Artist',
    avatar: 'https://decibel.test/avatar.jpg',
  },
  track: {
    id: 1,
    artist: 'artist',
    title: 'Playable',
    cover: 'https://decibel.test/cover.jpg',
    duration: '2:00',
  },
  waveform: [0.1, 0.2, 0.3],
};

describe('TrackCard playback integration', () => {
  const mockSetQueue = jest.fn();
  const mockPlayTrack = jest.fn();
  const mockPause = jest.fn();
  const mockSeek = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        queue: [],
        currentTrack: null,
        isPlaying: false,
        duration: 0,
        setQueue: mockSetQueue,
        playTrack: mockPlayTrack,
        pause: mockPause,
        seek: mockSeek,
      })
    );
  });

  it('disables play button and blocks actions when playback is blocked', async () => {
    const user = userEvent.setup();

    render(
      <TrackCard
        {...baseProps}
        playback={BLOCKED_TRACK}
        queueTracks={[BLOCKED_TRACK]}
        queueSource="feed"
      />
    );

    const playButton = screen.getByRole('button', { name: 'Playback blocked' });
    expect(playButton).toBeDisabled();

    await user.click(playButton);

    expect(mockPlayTrack).not.toHaveBeenCalled();
    expect(mockSetQueue).not.toHaveBeenCalled();
  });

  it('sets queue and plays when playable track is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TrackCard
        {...baseProps}
        playback={PLAYABLE_TRACK}
        queueTracks={[PLAYABLE_TRACK]}
        queueSource="feed"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Play track' }));

    expect(mockSetQueue).toHaveBeenCalledWith([PLAYABLE_TRACK], 0, 'feed');
    expect(mockPlayTrack).toHaveBeenCalledWith(PLAYABLE_TRACK);
  });

  it('shows pause action and pauses when current track is already playing', async () => {
    const user = userEvent.setup();

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        queue: [PLAYABLE_TRACK],
        currentTrack: PLAYABLE_TRACK,
        isPlaying: true,
        duration: 120,
        setQueue: mockSetQueue,
        playTrack: mockPlayTrack,
        pause: mockPause,
        seek: mockSeek,
      })
    );

    render(
      <TrackCard
        {...baseProps}
        playback={PLAYABLE_TRACK}
        queueTracks={[PLAYABLE_TRACK]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Pause track' }));

    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(mockPlayTrack).not.toHaveBeenCalled();
  });

  it('seeks from waveform interaction for playable tracks', async () => {
    const user = userEvent.setup();

    render(
      <TrackCard
        {...baseProps}
        playback={PLAYABLE_TRACK}
        queueTracks={[PLAYABLE_TRACK]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Waveform' }));

    expect(mockPlayTrack).toHaveBeenCalled();
    expect(mockSeek).toHaveBeenCalledWith(60);
  });

  it('auto-plays current track when seeking while paused', async () => {
    const user = userEvent.setup();

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        queue: [PLAYABLE_TRACK],
        currentTrack: PLAYABLE_TRACK,
        isPlaying: false,
        duration: 120,
        setQueue: mockSetQueue,
        playTrack: mockPlayTrack,
        pause: mockPause,
        seek: mockSeek,
      })
    );

    render(
      <TrackCard
        {...baseProps}
        playback={PLAYABLE_TRACK}
        queueTracks={[PLAYABLE_TRACK]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Waveform' }));

    expect(mockPlayTrack).toHaveBeenCalledWith(PLAYABLE_TRACK);
    expect(mockSeek).toHaveBeenCalledWith(60);
  });

  it('switches to another track and seeks when waveform is clicked', async () => {
    const user = userEvent.setup();

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        queue: [OTHER_PLAYABLE_TRACK, PLAYABLE_TRACK],
        currentTrack: OTHER_PLAYABLE_TRACK,
        isPlaying: true,
        duration: 180,
        setQueue: mockSetQueue,
        playTrack: mockPlayTrack,
        pause: mockPause,
        seek: mockSeek,
      })
    );

    render(
      <TrackCard
        {...baseProps}
        playback={PLAYABLE_TRACK}
        queueTracks={[OTHER_PLAYABLE_TRACK, PLAYABLE_TRACK]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Waveform' }));

    expect(mockPlayTrack).toHaveBeenCalledWith(PLAYABLE_TRACK);
    expect(mockSeek).toHaveBeenCalledWith(60);
  });

  it('starts playback even when seek duration is unknown', async () => {
    const user = userEvent.setup();

    render(
      <TrackCard
        {...baseProps}
        track={{
          ...baseProps.track,
          duration: '',
        }}
        playback={{
          ...PLAYABLE_TRACK,
          durationSeconds: undefined,
        }}
        queueTracks={[PLAYABLE_TRACK]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Waveform' }));

    expect(mockPlayTrack).toHaveBeenCalledWith({
      ...PLAYABLE_TRACK,
      durationSeconds: undefined,
    });
    expect(mockSeek).not.toHaveBeenCalled();
  });

  it('uses global player duration fallback when card duration is missing', async () => {
    const user = userEvent.setup();

    mockUsePlayerStore.mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        queue: [PLAYABLE_TRACK],
        currentTrack: PLAYABLE_TRACK,
        isPlaying: true,
        duration: 200,
        setQueue: mockSetQueue,
        playTrack: mockPlayTrack,
        pause: mockPause,
        seek: mockSeek,
      })
    );

    render(
      <TrackCard
        {...baseProps}
        track={{
          ...baseProps.track,
          duration: '',
        }}
        playback={{
          ...PLAYABLE_TRACK,
          durationSeconds: undefined,
        }}
        queueTracks={[PLAYABLE_TRACK]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Waveform' }));

    expect(mockSeek).toHaveBeenCalledWith(100);
  });
});
