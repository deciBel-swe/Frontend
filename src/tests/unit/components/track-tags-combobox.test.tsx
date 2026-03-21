import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import TrackTagsCombobox from '@/features/tracks/TrackUploadForm/FormFields/TrackTagsCombobox';

function TagsHarness({ initial = [] }: { initial?: string[] }) {
  const [tags, setTags] = useState<string[]>(initial);
  return <TrackTagsCombobox value={tags} onChange={setTags} />;
}

describe('TrackTagsCombobox', () => {
  it('shows suggestion dropdown only when input is focused', async () => {
    const user = userEvent.setup();

    render(<TagsHarness />);

    expect(
      screen.queryByRole('button', { name: '#ambient' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByPlaceholderText('Add tags'));

    expect(
      screen.getByRole('button', { name: '#ambient' })
    ).toBeInTheDocument();
  });

  it('adds the typed tag on Enter instead of auto-completing suggestion', async () => {
    const user = userEvent.setup();

    render(<TagsHarness />);

    const input = screen.getByPlaceholderText('Add tags');
    await user.click(input);
    await user.type(input, 'hou{enter}');

    expect(screen.getByText('#hou')).toBeInTheDocument();
  });

  it('removes a tag when clicking its remove button', async () => {
    const user = userEvent.setup();

    render(<TagsHarness initial={['ambient']} />);

    expect(screen.getByText('#ambient')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove ambient' }));

    expect(screen.queryByText('#ambient')).not.toBeInTheDocument();
  });
});
