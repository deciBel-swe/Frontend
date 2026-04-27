import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UploadForm from '@/features/tracks/TrackUploadForm/UploadForm';

jest.mock('@/features/tracks/TrackUploadForm/FormFields/TrackPrivacy', () => ({
  TrackPrivacy: () => <div data-testid="track-privacy" />,
}));

const baseProps = {
  audioFile: new File(['audio'], 'test-track.mp3', { type: 'audio/mpeg' }),
  isUploading: false,
  uploadProgress: 0,
  onReset: jest.fn(),
  onSubmit: jest.fn(),
  artworkPreview: null,
  onArtworkSelect: jest.fn(),
  onRemoveArtwork: jest.fn(),
  title: 'Test Track',
  titleError: '',
  onTitleChange: jest.fn(),
  trackLinkPrefix: 'https://decibel.test/artist',
  trackLinkSuffix: 'test-track',
  trackLinkError: '',
  onTrackLinkSuffixChange: jest.fn(),
  artist: 'artist',
  onArtistChange: jest.fn(),
  genre: '',
  genreError: '',
  onGenreChange: jest.fn(),
  tags: [],
  onTagsChange: jest.fn(),
  description: '',
  onDescriptionChange: jest.fn(),
  privacy: 'public' as const,
  onPrivacyChange: jest.fn(),
};

describe('UploadForm', () => {
  it('calls onReset when Replace track is clicked', async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();

    render(<UploadForm {...baseProps} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: /replace track/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Upload is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<UploadForm {...baseProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows uploading state with progress percentage', () => {
    render(<UploadForm {...baseProps} isUploading uploadProgress={47} />);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('47%')).toBeInTheDocument();
  });

  it('renders bottom error message when provided', () => {
    render(<UploadForm {...baseProps} error="Unable to parse audio" />);

    expect(screen.getByText('Unable to parse audio')).toBeInTheDocument();
  });

  it('hides header controls when reset callback is missing', () => {
    render(<UploadForm {...baseProps} onReset={undefined} />);

    expect(
      screen.queryByRole('button', { name: /replace track/i })
    ).not.toBeInTheDocument();
  });

  it('does not call submit when submit button is disabled', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <UploadForm {...baseProps} onSubmit={onSubmit} submitDisabled={true} />
    );

    const submitButton = screen.getByRole('button', { name: 'Upload' });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hides footer actions when showFooter is false', () => {
    render(<UploadForm {...baseProps} showFooter={false} />);

    expect(
      screen.queryByRole('button', { name: 'Upload' })
    ).not.toBeInTheDocument();
  });

  it('renders release date field only when enabled with a change handler', () => {
    const { rerender } = render(
      <UploadForm
        {...baseProps}
        showUploadDate
        uploadDate="2026-04-04"
        onUploadDateChange={jest.fn()}
      />
    );

    expect(screen.getByText(/upload date/i)).toBeInTheDocument();

    rerender(
      <UploadForm {...baseProps} showUploadDate uploadDate="2026-04-04" />
    );

    expect(screen.queryByText(/release date/i)).not.toBeInTheDocument();
  });

  it('renders custom submit labels', () => {
    render(<UploadForm {...baseProps} submitLabel="Publish now" />);

    expect(screen.getByRole('button', { name: 'Publish now' })).toBeInTheDocument();
  });
});
