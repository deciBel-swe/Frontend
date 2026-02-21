/**
 * Tests for useDebounce Hook
 * 
 * Testing custom React hooks with React Testing Library.
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });

    // Value should still be the initial value before delay
    expect(result.current).toBe('initial');

    // Fast-forward time by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'value1', delay: 500 },
      }
    );

    // Make multiple rapid changes
    rerender({ value: 'value2', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    rerender({ value: 'value3', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(250);
    });
    
    // Value should still be initial because timer keeps resetting
    expect(result.current).toBe('value1');

    // Now wait the full delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should have the last value
    expect(result.current).toBe('value3');
  });

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value), // No delay specified
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });
    
    // Advance by less than default delay
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    // Advance to complete default delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should work with different data types', () => {
    // Test with numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 0 },
      }
    );

    numberRerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(numberResult.current).toBe(42);

    // Test with objects
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: { name: 'John' } },
      }
    );

    const newValue = { name: 'Jane' };
    objectRerender({ value: newValue });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(objectResult.current).toEqual(newValue);

    // Test with arrays
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: [1, 2, 3] },
      }
    );

    const newArray = [4, 5, 6];
    arrayRerender({ value: newArray });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(arrayResult.current).toEqual(newArray);
  });

  it('should cleanup timeout on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });
    
    // Spy on clearTimeout
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    // Unmount should clear the timeout
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should handle empty string values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'search term' },
      }
    );

    rerender({ value: '' });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('');
  });

  // Practical use case: search input simulation
  it('should simulate search input debouncing', () => {
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebounce(searchTerm, 300),
      {
        initialProps: { searchTerm: '' },
      }
    );

    // User types "r"
    rerender({ searchTerm: 'r' });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // User types "re"
    rerender({ searchTerm: 're' });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // User types "rea"
    rerender({ searchTerm: 'rea' });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // User types "react"
    rerender({ searchTerm: 'react' });
    
    // Still showing initial value
    expect(result.current).toBe('');
    
    // After full delay, shows final value
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('react');
  });
});
