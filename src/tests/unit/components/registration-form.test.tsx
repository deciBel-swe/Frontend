import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RegisterationForm from '@/features/auth/components/Forms/RegisterationForm';

const mockVerifyReCaptcha = jest.fn();

jest.mock('@/hooks/UseReCaptcha', () => ({
  useReCaptcha: () => ({
    verifyReCaptcha: mockVerifyReCaptcha,
  }),
}));

const getRequiredInput = (container: HTMLElement, selector: string) => {
  const input = container.querySelector(selector);
  if (!input) {
    throw new Error(`Required field not found for selector: ${selector}`);
  }

  return input as HTMLInputElement;
};

const getRequiredSelect = (container: HTMLElement, selector: string) => {
  const select = container.querySelector(selector);
  if (!select) {
    throw new Error(`Required select not found for selector: ${selector}`);
  }

  return select as HTMLSelectElement;
};

const fillValidRegistrationForm = async (
  container: HTMLElement,
  user: ReturnType<typeof userEvent.setup>,
  email = 'listener@decibel.test'
) => {
  const emailInput = getRequiredInput(container, 'input[name="email"]');
  const displayNameInput = getRequiredInput(
    container,
    'input[name="displayName"]'
  );
  const passwordInputs = container.querySelectorAll('input[type="password"]');

  if (passwordInputs.length < 2) {
    throw new Error('Expected both password fields in registration form.');
  }

  await user.type(emailInput, email);
  await waitFor(() => {
    expect(displayNameInput).toHaveValue(email.split('@')[0]);
  });

  await user.type(passwordInputs[0] as HTMLInputElement, 'Password1');
  await user.type(passwordInputs[1] as HTMLInputElement, 'Password1');
  await user.selectOptions(
    getRequiredSelect(container, 'select[name="month"]'),
    'January'
  );
  await user.selectOptions(
    getRequiredSelect(container, 'select[name="day"]'),
    '1'
  );
  await user.selectOptions(
    getRequiredSelect(container, 'select[name="year"]'),
    '2000'
  );
  await user.selectOptions(
    getRequiredSelect(container, 'select[name="gender"]'),
    'female'
  );
};

describe('RegisterationForm', () => {
  beforeEach(() => {
    mockVerifyReCaptcha.mockReset().mockResolvedValue({
      success: true,
      score: 0.92,
    });
  });

  it('shows schema validation errors on empty submit', async () => {
    const user = userEvent.setup();

    render(<RegisterationForm />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText('Enter a valid email address.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Password must be at least 6 characters long.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Confirm password is required.')
    ).toBeInTheDocument();
    expect(await screen.findByText('Month is required.')).toBeInTheDocument();
    expect(await screen.findByText('Gender is required.')).toBeInTheDocument();
    expect(mockVerifyReCaptcha).not.toHaveBeenCalled();
  });

  it('shows verification error when recaptcha verification fails', async () => {
    mockVerifyReCaptcha.mockResolvedValue({
      success: false,
      score: 0.12,
      error: 'Verification failed',
    });

    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    await fillValidRegistrationForm(container, user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Verification failed')).toBeInTheDocument();
    expect(mockVerifyReCaptcha).toHaveBeenCalledWith('submit_form');
  });

  it('shows email confirmation overlay after successful submit', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    await fillValidRegistrationForm(container, user, 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Check your inbox!')).toBeInTheDocument();
    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
  });

  it('keeps auto-suggested display name in sync with email changes until user edits it', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    const emailInput = getRequiredInput(container, 'input[name="email"]');
    const displayNameInput = getRequiredInput(
      container,
      'input[name="displayName"]'
    );

    await user.type(emailInput, 'first@decibel.test');
    await waitFor(() => {
      expect(displayNameInput).toHaveValue('first');
    });

    await user.clear(emailInput);
    await user.type(emailInput, 'second@decibel.test');

    await waitFor(() => {
      expect(displayNameInput).toHaveValue('second');
    });
  });

  it('stops auto-suggestion after user manually edits display name', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    const emailInput = getRequiredInput(container, 'input[name="email"]');
    const displayNameInput = getRequiredInput(
      container,
      'input[name="displayName"]'
    );

    await user.type(emailInput, 'first@decibel.test');
    await waitFor(() => {
      expect(displayNameInput).toHaveValue('first');
    });

    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'custom-handle');
    await user.clear(emailInput);
    await user.type(emailInput, 'second@decibel.test');

    expect(displayNameInput).toHaveValue('custom-handle');
  });
});
