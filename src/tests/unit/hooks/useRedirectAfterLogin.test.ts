/**
 * Tests for useRedirectAfterLogin Hook
 */

import { renderHook } from '@testing-library/react';

import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin';

// ============================================================================
// Mocks
// ============================================================================

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/features/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mutable state controlled per test
let mockAuthState: { isAuthenticated: boolean; isLoading: boolean };

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthState = { isAuthenticated: false, isLoading: false };
  window.history.replaceState({}, '', '/signin');
});

describe('useRedirectAfterLogin', () => {
  it('does not redirect when not authenticated', () => {
    mockAuthState = { isAuthenticated: false, isLoading: false };
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect on mount when already authenticated', () => {
    mockAuthState = { isAuthenticated: true, isLoading: false };
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects once when isAuthenticated becomes true', () => {
    mockAuthState = { isAuthenticated: false, isLoading: false };
    const { rerender } = renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).not.toHaveBeenCalled();

    mockAuthState = { isAuthenticated: true, isLoading: false };
    rerender();

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/discover');
  });

  it('redirects to redirect query value when auth becomes true', () => {
    mockAuthState = { isAuthenticated: false, isLoading: false };
    window.history.replaceState({}, '', '/signin?redirect=/upload');

    const { rerender } = renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).not.toHaveBeenCalled();

    mockAuthState = { isAuthenticated: true, isLoading: false };
    rerender();

    expect(mockReplace).toHaveBeenCalledWith('/upload');
  });
});
