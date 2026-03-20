import type { Config } from 'jest';
import nextJest from 'next/jest';

/**
 * Create Jest configuration with Next.js defaults
 * This allows Jest to work with Next.js imports, SSR, and App Router
 */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

/**
 * Custom Jest configuration
 */
const customJestConfig: Config = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module paths
  moduleNameMapper: {
    // Handle path aliases (must match tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/tests/**',
    '!src/components/**', // Exclude pure UI components from coverage
    '!src/app/**', // Exclude Next.js pages from coverage (they're tested via E2E)
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Ignore placeholder scaffold tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '[\\\\/]src[\\\\/]tests[\\\\/]unit[\\\\/].*example\\.test\\.[jt]sx?$',
  ],

  // Transform files
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Ignore generated Next.js build output.
  modulePathIgnorePatterns: ['<rootDir>/.next/'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks
  restoreMocks: true,

  // Single worker avoids intermittent worker-shutdown warnings in this setup.
  maxWorkers: 1,
};

// Export Jest config
export default createJestConfig(customJestConfig);
