# Testing Guide

> Comprehensive guide to writing and running tests with Jest and React Testing Library

## Table of Contents

1. [Test Structure](#test-structure)
2. [Running Tests](#running-tests)
3. [Testing Patterns](#testing-patterns)
4. [Testing React Components](#testing-react-components)
5. [Testing Hooks](#testing-hooks)
6. [Testing Services & APIs](#testing-services--apis)
7. [Best Practices](#best-practices)
8. [Common Matchers](#common-matchers)

---

## Test Structure

### Directory Organization

```
src/tests/
├── unit/
│   ├── components/       # Component tests
│   ├── hooks/           # Hook tests
│   ├── services/        # Service/API tests
│   └── utils/           # Utility function tests
```

### Test File Naming

```
✅ CORRECT
Button.test.tsx
authService.test.ts
useAuth.test.ts

❌ INCORRECT
Button.spec.tsx
test-Button.tsx
```

---

## Running Tests

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

---

## Testing Patterns

### Basic Test Structure

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    // Arrange
    const input = 'value';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Setup and Teardown

```typescript
describe('Timer Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should advance time', () => {
    const callback = jest.fn();
    setTimeout(callback, 1000);
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalled();
  });
});
```

---

## Testing React Components

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

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
});
```

### User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle user interaction', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  await user.click(screen.getByRole('button'));
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### Form Testing

```typescript
it('should submit form with user input', async () => {
  const handleSubmit = jest.fn();
  const user = userEvent.setup();
  
  render(<LoginForm onSubmit={handleSubmit} />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /login/i }));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Query Methods

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i });

// By text
screen.getByText('Welcome');

// By label
screen.getByLabelText('Email');

// By placeholder
screen.getByPlaceholderText('Enter email');

// By test ID
screen.getByTestId('submit-button');

// By alt text (images)
screen.getByAltText('Logo');
```

---

## Testing Hooks

### Basic Hook Test

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });
});
```

---

## Testing Services & APIs

### Mocking Fetch

```typescript
describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    } as Response);

    const user = await userService.getUser(1);

    expect(user).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('should throw error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    } as Response);

    await expect(userService.getUser(1)).rejects.toThrow('Failed to fetch user');
  });
});
```

### Mock Functions

```typescript
it('should create a mock function', () => {
  const mockFn = jest.fn();
  
  mockFn('hello');
  mockFn('world');

  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(mockFn).toHaveBeenCalledWith('hello');
  expect(mockFn).toHaveBeenLastCalledWith('world');
});

it('should mock return values', () => {
  const mockFn = jest.fn()
    .mockReturnValueOnce('first')
    .mockReturnValueOnce('second')
    .mockReturnValue('default');

  expect(mockFn()).toBe('first');
  expect(mockFn()).toBe('second');
  expect(mockFn()).toBe('default');
});
```

### Spy Functions

```typescript
it('should spy on object methods', () => {
  const calculator = {
    add: (a: number, b: number) => a + b,
  };

  const addSpy = jest.spyOn(calculator, 'add');

  const result = calculator.add(2, 3);

  expect(result).toBe(5);
  expect(addSpy).toHaveBeenCalledWith(2, 3);

  addSpy.mockRestore();
});
```

---

## Best Practices

### 1. Write Descriptive Test Names

```typescript
// ✅ CORRECT
it('should display error message when upload fails', () => {});
it('should redirect to login page when user is not authenticated', () => {});

// ❌ INCORRECT
it('test upload', () => {});
it('works correctly', () => {});
```

### 2. Follow AAA Pattern

```typescript
it('should add two numbers', () => {
  // Arrange
  const a = 2;
  const b = 3;
  
  // Act
  const result = add(a, b);
  
  // Assert
  expect(result).toBe(5);
});
```

### 3. Test One Thing Per Test

```typescript
// ✅ CORRECT - Each test has a single responsibility
it('should increment counter', () => {
  const counter = new Counter();
  counter.increment();
  expect(counter.value).toBe(1);
});

it('should decrement counter', () => {
  const counter = new Counter();
  counter.decrement();
  expect(counter.value).toBe(-1);
});

// ❌ INCORRECT - Testing multiple things
it('should increment and decrement counter', () => {
  const counter = new Counter();
  counter.increment();
  expect(counter.value).toBe(1);
  counter.decrement();
  expect(counter.value).toBe(0);
});
```

### 4. Mock External Dependencies

```typescript
// ✅ CORRECT - Mock API calls in unit tests
jest.mock('@/services/api/authService', () => ({
  login: jest.fn(),
}));

it('should call login service', async () => {
  const mockLogin = jest.fn().mockResolvedValue({ token: '123' });
  authService.login = mockLogin;
  
  await loginUser({ email: 'test@example.com', password: 'pass' });
  
  expect(mockLogin).toHaveBeenCalled();
});
```

### 5. Use Proper Matchers

```typescript
// ✅ CORRECT - Use specific matchers
expect(value).toBe(4);              // For primitives
expect(obj).toEqual({ a: 1 });      // For objects/arrays
expect(str).toContain('substring'); // For partial matches
expect(arr).toHaveLength(3);        // For array length

// ❌ INCORRECT - Too generic
expect(value == 4).toBe(true);
expect(JSON.stringify(obj)).toBe(JSON.stringify({ a: 1 }));
```

### 6. Test Edge Cases

```typescript
describe('divide function', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle decimal results', () => {
    expect(divide(10, 3)).toBeCloseTo(3.33, 2);
  });
});
```

---

## Common Matchers

### Equality

```typescript
expect(value).toBe(4);              // Strict equality (===)
expect(obj).toEqual({ a: 1 });      // Deep equality
```

### Truthiness

```typescript
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
```

### Numbers

```typescript
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);
expect(0.1 + 0.2).toBeCloseTo(0.3);
```

### Strings

```typescript
expect(str).toContain('substring');
expect(str).toMatch(/pattern/);
```

### Arrays

```typescript
expect(arr).toContain('item');
expect(arr).toHaveLength(3);
expect(arr).toEqual(expect.arrayContaining(['a', 'b']));
```

### Objects

```typescript
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ a: 1 });
```

### Functions

```typescript
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenLastCalledWith(arg);
```

### Exceptions

```typescript
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
expect(() => fn()).toThrow(TypeError);
```

### DOM (with @testing-library/jest-dom)

```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('btn');
expect(element).toHaveAttribute('href', '/link');
```

---

## Async Testing

### Promises

```typescript
it('should handle async operations', async () => {
  const result = await fetchData();
  expect(result).toEqual(expectedData);
});

it('should use resolves matcher', async () => {
  await expect(fetchData()).resolves.toEqual(expectedData);
});

it('should use rejects matcher', async () => {
  await expect(fetchError()).rejects.toThrow('Failed');
});
```

### Timers

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('should test setTimeout', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);
  
  jest.advanceTimersByTime(1000);
  
  expect(callback).toHaveBeenCalled();
});
```

---

## Tips

- **Use `screen.debug()`** to see the current DOM state
- **Prefer queries by role** over test IDs when possible
- **Use `userEvent` over `fireEvent`** for more realistic interactions
- **Wrap timer advances in `act()`** when testing hooks
- **Remove `.only` and `.skip`** before committing
- **Check test coverage** to find untested code

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
