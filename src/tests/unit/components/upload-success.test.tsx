import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UploadSuccess from '@/features/tracks/TrackUploadForm/UploadSuccess';

jest.mock('@/components/waveform/Waveform', () => ({
  __esModule: true,
  default: () => <div data-testid="waveform" />,
}));

describe('UploadSuccess', () => {
  it('links View Track to uploadedTrackUrl', () => {
    render(
      <UploadSuccess
        uploadedTrackUrl="https://decibel.test/artist/my-track"
        generatedWaveform={[]}
        waveformHeight={120}
        onReset={jest.fn()}
      />
    );

    expect(screen.getByRole('link', { name: 'View Track' })).toHaveAttribute(
      'href',
      'https://decibel.test/artist/my-track'
    );
  });

  it('renders waveform only when waveform data exists', () => {
    const { rerender } = render(
      <UploadSuccess
        uploadedTrackUrl="https://decibel.test/artist/my-track"
        generatedWaveform={[]}
        waveformHeight={120}
        onReset={jest.fn()}
      />
    );

    expect(screen.queryByTestId('waveform')).not.toBeInTheDocument();

    rerender(
      <UploadSuccess
        uploadedTrackUrl="https://decibel.test/artist/my-track"
        generatedWaveform={[0.1, 0.5]}
        waveformHeight={120}
        onReset={jest.fn()}
      />
    );

    expect(screen.getByTestId('waveform')).toBeInTheDocument();
  });

  it('calls onReset when Upload Another Track is clicked', async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();

    render(
      <UploadSuccess
        uploadedTrackUrl="https://decibel.test/artist/my-track"
        generatedWaveform={[]}
        waveformHeight={120}
        onReset={onReset}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /upload another track/i })
    );

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
