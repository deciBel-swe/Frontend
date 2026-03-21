/**
 * Application Configuration
 *
 * Centralized configuration for environment variables and app settings.
 * This file should be imported whenever you need to access environment variables.
 */

// ================================
// TYPE DEFINITIONS
// ================================

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
  api: {
    baseURL: string;
    wsURL: string;
    appUrl: string;
    useMock: boolean;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  devTools: {
    reactQueryDevTools: boolean;
  };
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Get environment variable value
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

/**
 * Get boolean environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
const getBoolEnv = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true';
};

/**
 * Get number environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// ================================
// CONFIGURATION OBJECT
// ================================

export const config: AppConfig = {
  // Environment
  env: getEnv('NODE_ENV', 'development') as AppConfig['env'],
  isDevelopment: getEnv('NODE_ENV') !== 'production',
  isProduction: getEnv('NODE_ENV') === 'production',

  // API Configuration
  api: {
    baseURL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:5000/api/v1'),
    wsURL: getEnv('NEXT_PUBLIC_WS_URL', 'ws://localhost:5000'),
    appUrl: getEnv('NEXT_PUBLIC_APP_URL', 'https://localhost:3000'),
    useMock: getBoolEnv('NEXT_PUBLIC_USE_MOCK', true),
  },
  // Pagination
  pagination: {
    defaultPageSize: getNumberEnv('NEXT_PUBLIC_DEFAULT_PAGE_SIZE', 20),
    maxPageSize: getNumberEnv('NEXT_PUBLIC_MAX_PAGE_SIZE', 100),
  },
  // Development Tools
  devTools: {
    reactQueryDevTools: getBoolEnv(
      'NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS',
      true
    ),
  },
};

// ================================
// VALIDATION
// ================================

/**
 * Validate required configuration values
 * This function should be called at app initialization
 */
export const validateConfig = (): void => {
  const errors: string[] = [];

  // Check required values
  if (!config.api.useMock && !config.api.baseURL) {
    errors.push('NEXT_PUBLIC_API_URL is required when not using mock API');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:');
    errors.forEach((error) => console.error(`  - ${error}`));

    if (config.isProduction) {
      throw new Error(
        'Invalid configuration. Please check environment variables.'
      );
    }
  }
};

// ================================
// EXPORTS
// ================================

export default config;
