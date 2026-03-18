import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@/components/buttons/Button';
import { IconButton } from '@/components/buttons/IconButton';
import { Toggle } from '@/components/buttons/Toggle';

describe('button components', () => {
  it('renders Button with the default button type', () => {
    render(<Button>Play</Button>);

    expect(screen.getByRole('button', { name: 'Play' })).toHaveAttribute(
      'type',
      'button'
    );
  });

  it('calls Button onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Upload</Button>);

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders IconButton as a link when href is provided', () => {
    render(
      <IconButton href="/notifications" aria-label="Notifications">
        <span>!</span>
      </IconButton>
    );

    expect(screen.getByRole('link', { name: 'Notifications' })).toHaveAttribute(
      'href',
      '/notifications'
    );
  });

  it('renders IconButton as a button and handles click when href is not provided', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <IconButton aria-label="Open menu" onClick={onClick}>
        <span>...</span>
      </IconButton>
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls Toggle onChange with the inverse checked value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Toggle
        label="Receive messages"
        checked={true}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('switch', { name: 'Receive messages' }));

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
