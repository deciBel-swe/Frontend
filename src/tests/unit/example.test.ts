/**
 * Example Jest Test File
 * 
 * This file demonstrates various Jest testing patterns and best practices.
 * Use this as a reference for writing your own tests.
 */

// ============================================================================
// Basic Test Structure
// ============================================================================

describe('Basic Jest Syntax', () => {
  // Simple test using 'test' keyword
  test('should demonstrate a basic test', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  // Same as 'test', but using 'it' keyword (more BDD-style)
  it('should demonstrate an alternative syntax', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toBe('Hello, World!');
  });
});

// ============================================================================
// Matchers - Different ways to assert values
// ============================================================================

describe('Common Jest Matchers', () => {
  it('should test equality', () => {
    expect(2 + 2).toBe(4); // Exact equality (===)
    expect({ name: 'John' }).toEqual({ name: 'John' }); // Deep equality for objects
  });

  it('should test truthiness', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect('value').toBeDefined();
  });

  it('should test numbers', () => {
    expect(5).toBeGreaterThan(3);
    expect(5).toBeGreaterThanOrEqual(5);
    expect(3).toBeLessThan(5);
    expect(3).toBeLessThanOrEqual(3);
    expect(0.1 + 0.2).toBeCloseTo(0.3); // For floating point
  });

  it('should test strings', () => {
    expect('Hello World').toContain('World');
    expect('test@example.com').toMatch(/.*@.*\.com$/);
  });

  it('should test arrays', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toContain('banana');
    expect(fruits).toHaveLength(3);
    expect(fruits).toEqual(expect.arrayContaining(['apple', 'orange']));
  });

  it('should test objects', () => {
    const user = { id: 1, name: 'John', email: 'john@example.com' };
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email', 'john@example.com');
    expect(user).toMatchObject({ name: 'John' }); // Partial match
  });
});

// ============================================================================
// Nested Describes - Organizing tests
// ============================================================================

describe('Calculator', () => {
  describe('addition', () => {
    it('should add positive numbers', () => {
      expect(1 + 1).toBe(2);
    });

    it('should add negative numbers', () => {
      expect(-1 + -1).toBe(-2);
    });
  });

  describe('subtraction', () => {
    it('should subtract numbers', () => {
      expect(5 - 3).toBe(2);
    });
  });
});

// ============================================================================
// Setup and Teardown - beforeEach, afterEach, beforeAll, afterAll
// ============================================================================

describe('Setup and Teardown', () => {
  let counter: number;

  // Runs before each test in this describe block
  beforeEach(() => {
    counter = 0;
  });

  // Runs after each test in this describe block
  afterEach(() => {
    // Cleanup if needed
  });

  // Runs once before all tests in this describe block
  beforeAll(() => {
    // Setup expensive resources
  });

  // Runs once after all tests in this describe block
  afterAll(() => {
    // Cleanup expensive resources
  });

  it('should start with counter at 0', () => {
    expect(counter).toBe(0);
  });

  it('should increment counter', () => {
    counter++;
    expect(counter).toBe(1);
  });

  it('should reset counter for each test', () => {
    expect(counter).toBe(0); // Fresh counter due to beforeEach
  });
});

// ============================================================================
// Async Tests - Testing promises and async functions
// ============================================================================

describe('Async Operations', () => {
  // Test with promises
  it('should handle promises with .then', () => {
    const fetchData = () => Promise.resolve('data');
    
    return fetchData().then(data => {
      expect(data).toBe('data');
    });
  });

  // Test with async/await (preferred modern approach)
  it('should handle async/await', async () => {
    const fetchData = async () => 'data';
    
    const data = await fetchData();
    expect(data).toBe('data');
  });

  // Test rejected promises
  it('should handle rejected promises', async () => {
    const fetchError = async () => {
      throw new Error('Failed to fetch');
    };

    await expect(fetchError()).rejects.toThrow('Failed to fetch');
  });

  // Test with resolves matcher
  it('should use resolves matcher', async () => {
    const fetchData = async () => 'success';
    
    await expect(fetchData()).resolves.toBe('success');
  });
});

// ============================================================================
// Mocking - Creating mock functions
// ============================================================================

describe('Mocking Functions', () => {
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
    expect(mockFn()).toBe('default');
  });

  it('should mock implementations', () => {
    const mockFn = jest.fn((x: number) => x * 2);

    expect(mockFn(5)).toBe(10);
    expect(mockFn).toHaveBeenCalledWith(5);
  });
});

// ============================================================================
// Testing Exceptions
// ============================================================================

describe('Exception Handling', () => {
  it('should test if function throws', () => {
    const throwError = () => {
      throw new Error('Something went wrong');
    };

    expect(throwError).toThrow();
    expect(throwError).toThrow('Something went wrong');
    expect(throwError).toThrow(Error);
  });

  it('should test specific error types', () => {
    const throwTypeError = () => {
      throw new TypeError('Invalid type');
    };

    expect(throwTypeError).toThrow(TypeError);
    expect(throwTypeError).toThrow('Invalid type');
  });
});

// ============================================================================
// Testing with Test Data
// ============================================================================

describe('Testing with Different Inputs', () => {
  // Test.each for parameterized tests
  test.each([
    [1, 1, 2],
    [2, 2, 4],
    [3, 5, 8],
  ])('should add %i + %i to equal %i', (a, b, expected) => {
    expect(a + b).toBe(expected);
  });

  // Using objects for better readability
  test.each([
    { input: 'hello', expected: 5 },
    { input: 'world', expected: 5 },
    { input: 'test', expected: 4 },
  ])('should count characters in "$input"', ({ input, expected }) => {
    expect(input.length).toBe(expected);
  });
});

// ============================================================================
// Skip and Only - Controlling which tests run
// ============================================================================

describe('Test Control', () => {
  // This test will be skipped
  it.skip('should skip this test', () => {
    expect(true).toBe(false); // Won't run, so won't fail
  });

  // Normally you would use .only to run just one test during development
  // Commented out to avoid skipping other tests
  // it.only('should only run this test', () => {
  //   expect(true).toBe(true);
  // });

  it('should run normally', () => {
    expect(true).toBe(true);
  });

  it('should also run normally', () => {
    expect(true).toBe(true);
  });
});

// ============================================================================
// Timeout Configuration
// ============================================================================

describe('Timeout Configuration', () => {
  it('should complete within default timeout', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(true).toBe(true);
  });

  // Custom timeout for slow tests
  it('should handle longer operations', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(true).toBe(true);
  }, 2000); // 2 second timeout
});
