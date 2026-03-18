import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContinueButton from '@/features/auth/components/ContinueButton';
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton';

describe('auth buttons', () => {
  it('renders ContinueButton and triggers onClick', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<ContinueButton onClick={onClick}>Continue</ContinueButton>);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects ContinueButton disabled state', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <ContinueButton disabled onClick={onClick}>
        Continue
      </ContinueButton>
    );

    const button = screen.getByRole('button', { name: 'Continue' });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls GoogleLoginButton onClick when not loading', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<GoogleLoginButton onClick={onClick} />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables GoogleLoginButton while loading', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<GoogleLoginButton onClick={onClick} isLoading />);

    const button = screen.getByRole('button', { name: /continue with google/i });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
