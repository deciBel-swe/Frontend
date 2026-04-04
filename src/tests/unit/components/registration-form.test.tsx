import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RegisterationForm from '@/features/auth/components/Forms/RegisterationForm';

const mockRegisterLocal = jest.fn();
const mockResendVerification = jest.fn();
const mockGetRecaptchaToken = jest.fn();

jest.mock('@/hooks/UseReCaptcha', () => ({
  useReCaptcha: () => ({
    getRecaptchaToken: (...args: unknown[]) => mockGetRecaptchaToken(...args),
  }),
}));

jest.mock('@/services', () => ({
  authService: {
    registerLocal: (...args: unknown[]) => mockRegisterLocal(...args),
    resendVerification: (...args: unknown[]) => mockResendVerification(...args),
    requestEmailVerification: (...args: unknown[]) =>
      mockResendVerification(...args),
  },
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
    mockRegisterLocal
      .mockReset()
      .mockResolvedValue('User Generated successfully');
    mockResendVerification.mockReset().mockResolvedValue({ success: true });
    mockGetRecaptchaToken.mockReset().mockResolvedValue({
      success: true,
      token: 'test-captcha-token',
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
    expect(mockRegisterLocal).not.toHaveBeenCalled();
    expect(mockResendVerification).not.toHaveBeenCalled();
    expect(mockGetRecaptchaToken).not.toHaveBeenCalled();
  });

  it('shows recaptcha error when token generation fails', async () => {
    mockGetRecaptchaToken.mockResolvedValue({
      success: false,
      error: 'ReCaptcha is still loading. Please try again.',
    });

    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    await fillValidRegistrationForm(container, user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText('ReCaptcha is still loading. Please try again.')
    ).toBeInTheDocument();
    expect(mockRegisterLocal).not.toHaveBeenCalled();
  });

  it('shows service error when registration fails', async () => {
    mockRegisterLocal.mockRejectedValue(new Error('Registration failed'));

    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    await fillValidRegistrationForm(container, user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Registration failed')).toBeInTheDocument();
    expect(mockResendVerification).not.toHaveBeenCalled();
  });

  it('shows email confirmation overlay after successful submit', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    await fillValidRegistrationForm(container, user, 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Check your inbox!')).toBeInTheDocument();
    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
    expect(mockRegisterLocal).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        username: 'user',
        password: 'Password1',
        captchaToken: 'test-captcha-token',
      })
    );
    expect(mockGetRecaptchaToken).toHaveBeenCalledWith('register_local');
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

describe('Registration Date Validation', () => {
  it('rejects February 30th in a non-leap year', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    const monthSelect = container.querySelector(
      'select[name="month"]'
    ) as HTMLSelectElement;
    const daySelect = container.querySelector(
      'select[name="day"]'
    ) as HTMLSelectElement;
    const yearSelect = container.querySelector(
      'select[name="year"]'
    ) as HTMLSelectElement;

    await user.selectOptions(monthSelect, 'February');
    await user.selectOptions(daySelect, '30');
    await user.selectOptions(yearSelect, '2023');

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText('Invalid date. February only has 28 days.')
    ).toBeInTheDocument();
  });

  it('accepts February 29th in a leap year', async () => {
    const user = userEvent.setup();
    const { container } = render(<RegisterationForm />);

    await user.selectOptions(
      container.querySelector('select[name="month"]')!,
      'February'
    );
    await user.selectOptions(
      container.querySelector('select[name="day"]')!,
      '29'
    );
    await user.selectOptions(
      container.querySelector('select[name="year"]')!,
      '2024'
    ); // 2024 is a leap year

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Verify that the "Invalid date" error DOES NOT appear
    expect(screen.queryByText(/Invalid date/)).not.toBeInTheDocument();
  });
});
