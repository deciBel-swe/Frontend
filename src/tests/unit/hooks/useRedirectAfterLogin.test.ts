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
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/features/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mutable state controlled per test
let mockAuthState: { isAuthenticated: boolean; isLoading: boolean };
let mockSearchParams: { get: jest.Mock };

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = { get: jest.fn().mockReturnValue(null) };
  mockAuthState = { isAuthenticated: false, isLoading: false };
});

describe('useRedirectAfterLogin', () => {
  it('does not redirect while loading', () => {
    mockAuthState = { isAuthenticated: false, isLoading: true };
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when not authenticated', () => {
    mockAuthState = { isAuthenticated: false, isLoading: false };
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to /discover when authenticated and no redirect param', () => {
    mockAuthState = { isAuthenticated: true, isLoading: false };
    mockSearchParams.get.mockReturnValue(null);
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).toHaveBeenCalledWith('/discover');
  });

  it('redirects to the redirect param value when present', () => {
    mockAuthState = { isAuthenticated: true, isLoading: false };
    mockSearchParams.get.mockReturnValue('/upload');
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).toHaveBeenCalledWith('/upload');
  });

  it('preserves redirect query target including nested path/query', () => {
    mockAuthState = { isAuthenticated: true, isLoading: false };
    mockSearchParams.get.mockReturnValue('/feed?tab=following');
    renderHook(() => useRedirectAfterLogin());
    expect(mockReplace).toHaveBeenCalledWith('/feed?tab=following');
  });

  it('does not redirect when still loading even if authenticated', () => {
    mockAuthState = { isAuthenticated: true, isLoading: true };
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
});
