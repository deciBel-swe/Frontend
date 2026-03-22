import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ROUTES } from '@/constants/routes';
import SignInForm from '@/features/auth/components/Forms/SignInForm';

const mockLogin = jest.fn();
const mockHandleGoogleLogin = jest.fn();
const mockLoginWithGoogle = jest.fn();
const mockLogout = jest.fn();
let mockIsLoading = false;

jest.mock('@/features/auth', () => {
  const actual =
    jest.requireActual<typeof import('@/features/auth')>('@/features/auth');

  return {
    ...actual,
    useAuth: () => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: mockIsLoading,
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      logout: mockLogout,
      handleGoogleLogin: mockHandleGoogleLogin,
    }),
  };
});

const getEmailInput = (container: HTMLElement) => {
  const input = container.querySelector('input[name="email"]');
  if (!input) {
    throw new Error('Email input not found in SignInForm.');
  }

  return input as HTMLInputElement;
};

const getPasswordInput = (container: HTMLElement) => {
  const input = container.querySelector('input[type="password"]');
  if (!input) {
    throw new Error('Password input not found in SignInForm.');
  }

  return input as HTMLInputElement;
};

describe('SignInForm', () => {
  beforeEach(() => {
    mockIsLoading = false;
    mockLogin.mockReset().mockResolvedValue(undefined);
    mockHandleGoogleLogin.mockReset();
    mockLoginWithGoogle.mockReset();
    mockLogout.mockReset();
  });

  it('shows validation errors when submitted with empty fields', async () => {
    const user = userEvent.setup();

    render(<SignInForm />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText('Enter a valid email address.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Password is required.')
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits valid credentials', async () => {
    const user = userEvent.setup();
    const { container } = render(<SignInForm />);

    await user.type(getEmailInput(container), 'artist@decibel.test');
    await user.type(getPasswordInput(container), 'Password1');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        'artist@decibel.test',
        'Password1'
      );
    });
  });

  it('shows a generic credential error when login throws', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    const user = userEvent.setup();
    const { container } = render(<SignInForm />);

    await user.type(getEmailInput(container), 'artist@decibel.test');
    await user.type(getPasswordInput(container), 'Password1');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByText(
        'Sign in failed. Please check your credentials and try again.'
      )
    ).toBeInTheDocument();
  });

  it('wires google login button and auth links correctly', async () => {
    const user = userEvent.setup();

    render(<SignInForm />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    expect(mockHandleGoogleLogin).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('link', { name: /forgot your password\?/i })
    ).toHaveAttribute('href', ROUTES.RESETPASSWORD);
    expect(
      screen.getByRole('link', { name: /create an account/i })
    ).toHaveAttribute('href', ROUTES.REGISTER);
  });

  it('disables submit and google button while auth loading is true', () => {
    mockIsLoading = true;

    render(<SignInForm />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeDisabled();
  });
});
