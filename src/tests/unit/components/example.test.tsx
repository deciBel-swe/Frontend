/**
 * Example Component Tests
 *
 * Demonstrates testing React components with React Testing Library.
 * These are examples - adapt them to your actual components.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// Example Simple Component Tests
// ============================================================================

// Example component for testing
const Button = ({ onClick, children, disabled = false }: any) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

describe('Button Component', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Example Form Component Tests
// ============================================================================

const LoginForm = ({ onSubmit }: any) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" />

      <button type="submit">Login</button>
    </form>
  );
};

describe('LoginForm Component', () => {
  it('should render form fields', () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should submit form with user input', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});

// ============================================================================
// Example Counter Component with State
// ============================================================================

const Counter = ({ initialCount = 0 }: { initialCount?: number }) => {
  const [count, setCount] = React.useState(initialCount);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

// Add React import for the Counter component
import React from 'react';

describe('Counter Component', () => {
  it('should display initial count', () => {
    render(<Counter initialCount={5} />);

    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  it('should increment count', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: /increment/i }));

    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('should decrement count', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);

    await user.click(screen.getByRole('button', { name: /decrement/i }));

    expect(screen.getByText('Count: 4')).toBeInTheDocument();
  });

  it('should reset count to zero', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={10} />);

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('should handle multiple interactions', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: /increment/i }));
    await user.click(screen.getByRole('button', { name: /increment/i }));
    await user.click(screen.getByRole('button', { name: /decrement/i }));

    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});

// ============================================================================
// Example Async Component Tests
// ============================================================================

const AsyncDataComponent = () => {
  const [data, setData] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setData('Fetched Data');
    setLoading(false);
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {loading && <p>Loading...</p>}
      {data && <p>Data: {data}</p>}
    </div>
  );
};

describe('AsyncDataComponent', () => {
  it('should show loading state', async () => {
    const user = userEvent.setup();
    render(<AsyncDataComponent />);

    await user.click(screen.getByRole('button', { name: /fetch data/i }));

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display data after loading', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    render(<AsyncDataComponent />);

    await user.click(screen.getByRole('button', { name: /fetch data/i }));

    // Fast-forward time wrapped in act
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Let promises flush
    });

    expect(screen.getByText('Data: Fetched Data')).toBeInTheDocument();

    jest.useRealTimers();
  });
});

// ============================================================================
// Testing with Queries
// ============================================================================

describe('Query Examples', () => {
  const ExampleComponent = () => (
    <div>
      <h1>Welcome</h1>
      <p data-testid="description">This is a description</p>
      <img src="logo.png" alt="Logo" />
      <input placeholder="Enter text" />
    </div>
  );

  it('should use different query methods', () => {
    render(<ExampleComponent />);

    // By role (preferred)
    expect(
      screen.getByRole('heading', { name: /welcome/i })
    ).toBeInTheDocument();

    // By test ID
    expect(screen.getByTestId('description')).toBeInTheDocument();

    // By alt text (for images)
    expect(screen.getByAltText('Logo')).toBeInTheDocument();

    // By placeholder
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });
});
