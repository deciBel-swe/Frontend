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
  urls: {
    domainName: string;
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
// CONFIGURATION OBJECT
// ================================
export const config: AppConfig = {
  env: process.env.NODE_ENV as AppConfig['env'],
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    useMock: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
  },

  urls: {
    domainName: process.env.NEXT_PUBLIC_TRACK_BASE_URL || 
                process.env.NEXT_PUBLIC_APP_URL || 
                'http://localhost:3000',
  },

  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
  },

  devTools: {
    reactQueryDevTools:
      process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === 'true',
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
