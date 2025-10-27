// Environment-specific configurations
interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEBUG_MODE: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Environment configurations
const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:5053', // Your local development server
    ENVIRONMENT: 'development',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_BASE_URL: 'https://staging.gurasuniverse.com', // Your staging server
    ENVIRONMENT: 'staging',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
  },
  production: {
    API_BASE_URL: 'https://staging.gurasuniverse.com', // Your production server (using staging for now)
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    LOG_LEVEL: 'warn',
  },
};

// Environment detection logic
const detectEnvironment = (): EnvironmentConfig => {
  // Method 1: Use __DEV__ flag (React Native built-in)
  if (__DEV__) {
    return ENVIRONMENTS.development;
  }

  // Default to staging for release builds (TestFlight, App Store)
  return ENVIRONMENTS.staging;
};

export const ENV_CONFIG = detectEnvironment();

// Helper function to get environment-specific config
export const getEnvironmentConfig = (): EnvironmentConfig => ENV_CONFIG;

// Helper function to check if we're in a specific environment
export const isDevelopment = (): boolean => ENV_CONFIG.ENVIRONMENT === 'development';
export const isStaging = (): boolean => ENV_CONFIG.ENVIRONMENT === 'staging';
export const isProduction = (): boolean => ENV_CONFIG.ENVIRONMENT === 'production';

// Log environment info (always log for debugging network issues)
console.log('🌍 Environment:', ENV_CONFIG.ENVIRONMENT);
console.log('🔗 API URL:', ENV_CONFIG.API_BASE_URL);
console.log('🐛 Debug Mode:', ENV_CONFIG.DEBUG_MODE);
console.log('📝 Log Level:', ENV_CONFIG.LOG_LEVEL);
console.log('🔍 __DEV__ flag:', __DEV__);